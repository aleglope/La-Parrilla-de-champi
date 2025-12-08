-- =====================================================
-- Script de Configuración: Sistema de Reservas
-- La Parrilla de Champi
-- =====================================================

-- =====================================================
-- TABLA: time_slots
-- Define las franjas horarias disponibles para reservas
-- =====================================================

CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time TIME NOT NULL UNIQUE,
  max_capacity INTEGER NOT NULL DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por tiempo
CREATE INDEX idx_time_slots_time ON time_slots(time);
CREATE INDEX idx_time_slots_active ON time_slots(is_active);

-- =====================================================
-- TABLA: availability_settings
-- Control de apertura/cierre por día específico
-- =====================================================

CREATE TABLE IF NOT EXISTS availability_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  is_open BOOLEAN DEFAULT true,
  max_capacity INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por fecha
CREATE INDEX idx_availability_date ON availability_settings(date);
CREATE INDEX idx_availability_open ON availability_settings(is_open);

-- =====================================================
-- TABLA: reservations
-- Almacena todas las reservas (web y telefónicas)
-- =====================================================

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información del cliente
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  
  -- Detalles de la reserva
  reservation_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count > 0 AND guests_count <= 20),
  special_requests TEXT,
  
  -- Metadatos
  source TEXT NOT NULL CHECK (source IN ('web', 'phone')) DEFAULT 'web',
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no_show', 'completed')) DEFAULT 'pending',
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único para prevenir doble reserva
  -- Permite múltiples reservas en el mismo slot, pero controlaremos la capacidad en la aplicación
  CONSTRAINT valid_email CHECK (guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para optimizar consultas
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, time_slot);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_source ON reservations(source);
CREATE INDEX idx_reservations_email ON reservations(guest_email);
CREATE INDEX idx_reservations_created ON reservations(created_at DESC);

-- Índice compuesto para consultas de disponibilidad
CREATE INDEX idx_reservations_availability ON reservations(reservation_date, time_slot, status) 
  WHERE status NOT IN ('cancelled', 'no_show');

-- =====================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_update_reservations_timestamp
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

CREATE TRIGGER trigger_update_availability_timestamp
  BEFORE UPDATE ON availability_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

-- =====================================================
-- FUNCIÓN: Verificar disponibilidad
-- Verifica si hay capacidad disponible para una fecha/hora
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
) AS $$
DECLARE
  v_max_capacity INTEGER;
  v_current_bookings INTEGER;
  v_is_open BOOLEAN;
  v_day_capacity INTEGER;
BEGIN
  -- Verificar si el día está abierto
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
  
  -- Obtener capacidad máxima del time slot
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
  
  -- Contar reservas confirmadas para ese slot
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
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de time slots activos
CREATE POLICY "Public read access to active time slots"
  ON time_slots FOR SELECT
  USING (is_active = true);

-- Lectura pública de disponibilidad
CREATE POLICY "Public read access to availability"
  ON availability_settings FOR SELECT
  USING (true);

-- Cualquiera puede crear una reserva (web)
CREATE POLICY "Anyone can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);

-- Lectura pública de reservas (limitada - solo para verificar disponibilidad)
-- En producción, considera exponer esto solo a través de la función check_reservation_availability
CREATE POLICY "Public read access to reservations for availability"
  ON reservations FOR SELECT
  USING (true);

-- Admin puede hacer todo (configurar según tu sistema de autenticación)
-- Por ahora, permitimos todo para usuarios autenticados
CREATE POLICY "Authenticated users full access to time_slots"
  ON time_slots FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access to availability"
  ON availability_settings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users full access to reservations"
  ON reservations FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- DATOS INICIALES: Time Slots
-- Configuración por defecto de horarios
-- =====================================================

-- COMIDAS (13:00 - 16:00, cada 30 minutos)
INSERT INTO time_slots (time, max_capacity, is_active) VALUES
  ('13:00', 40, true),
  ('13:30', 40, true),
  ('14:00', 40, true),
  ('14:30', 40, true),
  ('15:00', 40, true),
  ('15:30', 40, true)
ON CONFLICT (time) DO NOTHING;

-- CENAS (20:00 - 23:00, cada 30 minutos)
INSERT INTO time_slots (time, max_capacity, is_active) VALUES
  ('20:00', 40, true),
  ('20:30', 40, true),
  ('21:00', 40, true),
  ('21:30', 40, true),
  ('22:00', 40, true),
  ('22:30', 40, true)
ON CONFLICT (time) DO NOTHING;

-- =====================================================
-- FUNCIÓN DE UTILIDAD: Obtener estadísticas
-- =====================================================

CREATE OR REPLACE FUNCTION get_reservation_stats(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_reservations BIGINT,
  total_guests BIGINT,
  by_source JSONB,
  by_status JSONB,
  avg_party_size NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_reservations,
    SUM(guests_count)::BIGINT as total_guests,
    jsonb_object_agg(source, count) as by_source,
    jsonb_object_agg(status, count) as by_status,
    ROUND(AVG(guests_count), 2) as avg_party_size
  FROM (
    SELECT 
      source,
      status,
      guests_count,
      COUNT(*) OVER (PARTITION BY source) as count
    FROM reservations
    WHERE reservation_date BETWEEN p_start_date AND p_end_date
  ) subquery;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

SELECT 'Sistema de Reservas - Setup Completado' as status;

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('reservations', 'time_slots', 'availability_settings')
ORDER BY table_name;

-- Verificar time slots iniciales
SELECT 'Time Slots configurados:' as info;
SELECT time, max_capacity, is_active 
FROM time_slots 
ORDER BY time;
