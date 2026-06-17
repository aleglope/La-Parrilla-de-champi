-- =====================================================
-- Migración: Endurecimiento RLS (Nivel B)
-- La Parrilla de Champi
-- =====================================================
-- Cierra la fuga de PII de la tabla reservations (anon ya
-- no puede leer nombre/email/teléfono de clientes), endurece
-- las escrituras de la infraestructura de reservas
-- (time_slots, availability_settings, reservation_settings)
-- a service_role y convierte check_reservation_availability
-- en SECURITY DEFINER para que la disponibilidad pública
-- siga funcionando sin SELECT directo sobre reservations.
--
-- ORDEN DE DESPLIEGUE CRÍTICO: aplicar a producción SOLO
-- DESPUÉS de desplegar el código que mueve los handlers
-- admin a service_role. Con el código antiguo (anon) el
-- panel admin dejaría de funcionar tras esta migración.
-- Ver el playbook de aplicación (gate humano diferido).
--
-- Rollback manual (Supabase CLI no soporta down nativo):
--   20240101000010_rls_hardening.rollback.sql
-- =====================================================

BEGIN;

-- =====================================================
-- 1) RESERVATIONS — cerrar la fuga de PII
-- =====================================================
-- La política ALL permitía a anon leer/editar/borrar TODAS
-- las reservas; la SELECT pública exponía nombre, email y
-- teléfono de clientes a cualquiera con la anon key.
-- Resultado tras este bloque: anon solo puede INSERT.
-- El admin (service_role) bypasa RLS para list/status.

DROP POLICY IF EXISTS "Authenticated users full access to reservations" ON reservations;
DROP POLICY IF EXISTS "Public read access to reservations for availability" ON reservations;

-- Se mantiene el INSERT público, pero con WITH CHECK más
-- estricto: ambos flujos que usan /api/reservations/create con la
-- anon key insertan status='pending' — el formulario web con
-- source='web' (ReservationForm) y el alta manual del admin con
-- source='phone' (ManualReservationModal). Restringir a esos dos
-- valores evita que anon inserte reservas pre-confirmadas
-- (status != 'pending') sin romper ninguno de los dos flujos.
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
CREATE POLICY "Anyone can create reservations"
  ON reservations FOR INSERT
  TO anon
  WITH CHECK (status = 'pending' AND source IN ('web', 'phone'));

-- =====================================================
-- 2) FUNCIÓN: check_reservation_availability → SECURITY DEFINER
-- =====================================================
-- Cuerpo IDÉNTICO a la versión corregida de la baseline
-- (alias avs./ts./r. explícitos). Al pasar a SECURITY DEFINER
-- con search_path fijado, anon sigue obteniendo las cuentas
-- de disponibilidad agregadas aunque ya no tenga SELECT
-- sobre las filas de reservations.

CREATE OR REPLACE FUNCTION check_reservation_availability(
  p_date DATE,
  p_time TIME,
  p_guests INTEGER
)
RETURNS TABLE(
  available BOOLEAN,
  current_bookings INTEGER,
  max_capacity INTEGER,
  remaining_capacity INTEGER
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_capacity INTEGER;
  v_current_bookings INTEGER;
  v_is_open BOOLEAN;
  v_day_capacity INTEGER;
BEGIN
  -- Verificar si el día está abierto (con alias de tabla explícito)
  SELECT avs.is_open, avs.max_capacity INTO v_is_open, v_day_capacity
  FROM availability_settings avs
  WHERE avs.date = p_date;

  -- Si no hay configuración específica, asumimos que está abierto
  IF NOT FOUND THEN
    v_is_open := true;
    v_day_capacity := NULL;
  END IF;

  -- Si está cerrado, retornar no disponible
  IF v_is_open = false THEN
    RETURN QUERY SELECT false, 0, 0, 0;
    RETURN;
  END IF;

  -- Obtener capacidad máxima del time slot (con alias de tabla explícito)
  SELECT ts.max_capacity INTO v_max_capacity
  FROM time_slots ts
  WHERE ts.time = p_time AND ts.is_active = true;

  -- Si el slot no existe o no está activo
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 0;
    RETURN;
  END IF;

  -- Si hay capacidad específica para el día, usarla
  IF v_day_capacity IS NOT NULL AND v_day_capacity < v_max_capacity THEN
    v_max_capacity := v_day_capacity;
  END IF;

  -- Contar reservas confirmadas para ese slot (con alias de tabla explícito)
  SELECT COALESCE(SUM(r.guests_count), 0) INTO v_current_bookings
  FROM reservations r
  WHERE r.reservation_date = p_date
    AND r.time_slot = p_time
    AND r.status IN ('pending', 'confirmed');

  -- Retornar resultado
  RETURN QUERY SELECT
    (v_max_capacity - v_current_bookings) >= p_guests,
    v_current_bookings::INTEGER,
    v_max_capacity,
    (v_max_capacity - v_current_bookings)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3) TIME_SLOTS — escrituras solo service_role
-- =====================================================
-- Se mantiene "Public read access to active time slots"
-- (SELECT is_active = true): el formulario de reservas la usa.
-- Los handlers admin de slots pasan a service_role.

DROP POLICY IF EXISTS "Authenticated users full access to time_slots" ON time_slots;

-- El admin necesita ver TODOS los slots (incluidos inactivos);
-- complementa el SELECT público de activos.
DROP POLICY IF EXISTS "time_slots_select_service_role" ON time_slots;
CREATE POLICY "time_slots_select_service_role"
  ON time_slots FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "time_slots_insert_service_role" ON time_slots;
CREATE POLICY "time_slots_insert_service_role"
  ON time_slots FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "time_slots_update_service_role" ON time_slots;
CREATE POLICY "time_slots_update_service_role"
  ON time_slots FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "time_slots_delete_service_role" ON time_slots;
CREATE POLICY "time_slots_delete_service_role"
  ON time_slots FOR DELETE
  USING (auth.role() = 'service_role');

-- =====================================================
-- 4) AVAILABILITY_SETTINGS — escrituras solo service_role
-- =====================================================
-- Se mantiene "Public read access to availability"
-- (SELECT USING true): la disponibilidad pública la lee anon.

DROP POLICY IF EXISTS "Authenticated users full access to availability" ON availability_settings;

DROP POLICY IF EXISTS "availability_settings_insert_service_role" ON availability_settings;
CREATE POLICY "availability_settings_insert_service_role"
  ON availability_settings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "availability_settings_update_service_role" ON availability_settings;
CREATE POLICY "availability_settings_update_service_role"
  ON availability_settings FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "availability_settings_delete_service_role" ON availability_settings;
CREATE POLICY "availability_settings_delete_service_role"
  ON availability_settings FOR DELETE
  USING (auth.role() = 'service_role');

-- =====================================================
-- 5) RESERVATION_SETTINGS — escrituras solo service_role
-- =====================================================
-- Se mantiene "Public read access to reservation settings"
-- (SELECT USING true): el formulario consulta si las reservas
-- están activas.

DROP POLICY IF EXISTS "Authenticated users can update reservation settings" ON reservation_settings;
DROP POLICY IF EXISTS "Authenticated users can insert reservation settings" ON reservation_settings;

DROP POLICY IF EXISTS "reservation_settings_insert_service_role" ON reservation_settings;
CREATE POLICY "reservation_settings_insert_service_role"
  ON reservation_settings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "reservation_settings_update_service_role" ON reservation_settings;
CREATE POLICY "reservation_settings_update_service_role"
  ON reservation_settings FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 6) CATEGORIES / DISHES — desglose por verbo (sigue permisivo)
-- =====================================================
-- NIVEL B: el CRUD del menú es client-side anon (getSupabase
-- en el navegador). Estas políticas siguen siendo permisivas
-- anon-write; restringirlas a service_role requiere refactor
-- del admin-UI a server-side y es un FOLLOW-UP fuera de
-- alcance de DB-02. El desglose por verbo deja explícito el
-- estado actual y prepara el endurecimiento futuro.
-- Se mantienen los SELECT públicos
-- ("Allow public read access to categories/dishes").

DROP POLICY IF EXISTS "Allow all operations on categories for authenticated users" ON categories;

DROP POLICY IF EXISTS "categories_insert_public" ON categories;
CREATE POLICY "categories_insert_public"
  ON categories FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "categories_update_public" ON categories;
CREATE POLICY "categories_update_public"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "categories_delete_public" ON categories;
CREATE POLICY "categories_delete_public"
  ON categories FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow all operations on dishes for authenticated users" ON dishes;

DROP POLICY IF EXISTS "dishes_insert_public" ON dishes;
CREATE POLICY "dishes_insert_public"
  ON dishes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "dishes_update_public" ON dishes;
CREATE POLICY "dishes_update_public"
  ON dishes FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "dishes_delete_public" ON dishes;
CREATE POLICY "dishes_delete_public"
  ON dishes FOR DELETE
  USING (true);

COMMIT;
