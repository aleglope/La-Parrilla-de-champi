-- =====================================================
-- Función: check_reservation_availability
-- La Parrilla de Champi
-- =====================================================
-- Versión CORREGIDA con alias de tabla explícitos
-- (avs./ts./r.) que evita el error de columna ambigua
-- "max_capacity". Es la versión vigente en producción.
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
