-- =====================================================
-- ROLLBACK de 20240101000010_rls_hardening.sql
-- La Parrilla de Champi
-- =====================================================
-- Restaura el estado baseline (políticas permisivas +
-- función INVOKER). Supabase CLI no soporta down nativo;
-- ejecutar manualmente en transacción si el smoke test
-- post-apply falla.
--
-- ATENCIÓN: este archivo NO es una migración forward. Si en
-- el futuro se adopta `supabase db push`, este archivo debe
-- excluirse del directorio de migraciones (o marcarse con
-- `supabase migration repair`) para que el CLI no lo aplique
-- inmediatamente después del hardening y lo anule.
-- =====================================================

BEGIN;

-- =====================================================
-- 1) Eliminar las políticas nuevas del hardening
-- =====================================================

-- reservations (el INSERT endurecido se recrea permisivo abajo)
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;

-- time_slots
DROP POLICY IF EXISTS "time_slots_select_service_role" ON time_slots;
DROP POLICY IF EXISTS "time_slots_insert_service_role" ON time_slots;
DROP POLICY IF EXISTS "time_slots_update_service_role" ON time_slots;
DROP POLICY IF EXISTS "time_slots_delete_service_role" ON time_slots;

-- availability_settings
DROP POLICY IF EXISTS "availability_settings_insert_service_role" ON availability_settings;
DROP POLICY IF EXISTS "availability_settings_update_service_role" ON availability_settings;
DROP POLICY IF EXISTS "availability_settings_delete_service_role" ON availability_settings;

-- reservation_settings
DROP POLICY IF EXISTS "reservation_settings_insert_service_role" ON reservation_settings;
DROP POLICY IF EXISTS "reservation_settings_update_service_role" ON reservation_settings;

-- categories / dishes (desglose por verbo)
DROP POLICY IF EXISTS "categories_insert_public" ON categories;
DROP POLICY IF EXISTS "categories_update_public" ON categories;
DROP POLICY IF EXISTS "categories_delete_public" ON categories;
DROP POLICY IF EXISTS "dishes_insert_public" ON dishes;
DROP POLICY IF EXISTS "dishes_update_public" ON dishes;
DROP POLICY IF EXISTS "dishes_delete_public" ON dishes;

-- =====================================================
-- 2) Restaurar las políticas permisivas de la baseline
--    (copiadas verbatim de las migraciones 000000/000001/000003)
-- =====================================================

-- reservations: INSERT público sin restricciones
CREATE POLICY "Anyone can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);

-- reservations: lectura pública (reabre el SELECT de PII — estado baseline)
DROP POLICY IF EXISTS "Public read access to reservations for availability" ON reservations;
CREATE POLICY "Public read access to reservations for availability"
  ON reservations FOR SELECT
  USING (true);

-- reservations: acceso completo permisivo
DROP POLICY IF EXISTS "Authenticated users full access to reservations" ON reservations;
CREATE POLICY "Authenticated users full access to reservations"
  ON reservations FOR ALL
  USING (true)
  WITH CHECK (true);

-- time_slots: acceso completo permisivo
DROP POLICY IF EXISTS "Authenticated users full access to time_slots" ON time_slots;
CREATE POLICY "Authenticated users full access to time_slots"
  ON time_slots FOR ALL
  USING (true)
  WITH CHECK (true);

-- availability_settings: acceso completo permisivo
DROP POLICY IF EXISTS "Authenticated users full access to availability" ON availability_settings;
CREATE POLICY "Authenticated users full access to availability"
  ON availability_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- reservation_settings: UPDATE e INSERT permisivos
DROP POLICY IF EXISTS "Authenticated users can update reservation settings" ON reservation_settings;
CREATE POLICY "Authenticated users can update reservation settings"
  ON reservation_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can insert reservation settings" ON reservation_settings;
CREATE POLICY "Authenticated users can insert reservation settings"
  ON reservation_settings FOR INSERT
  WITH CHECK (true);

-- categories / dishes: FOR ALL permisivo
DROP POLICY IF EXISTS "Allow all operations on categories for authenticated users" ON categories;
CREATE POLICY "Allow all operations on categories for authenticated users"
  ON categories FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on dishes for authenticated users" ON dishes;
CREATE POLICY "Allow all operations on dishes for authenticated users"
  ON dishes FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3) Restaurar check_reservation_availability como INVOKER
--    (cuerpo verbatim de la migración 20240101000002; al
--    omitir SECURITY DEFINER, CREATE OR REPLACE vuelve al
--    comportamiento SECURITY INVOKER por defecto)
-- =====================================================

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

COMMIT;
