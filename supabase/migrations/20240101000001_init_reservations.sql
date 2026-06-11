-- =====================================================
-- Migración baseline: sistema de reservas
-- La Parrilla de Champi
-- =====================================================
-- Reproduce el esquema vivo de producción: time_slots,
-- availability_settings, reservations, índices, trigger de
-- updated_at, get_reservation_stats y las políticas RLS
-- actuales (permisivas). El endurecimiento RLS se aplica en
-- una migración posterior.
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

-- Índices para búsquedas por tiempo
CREATE INDEX IF NOT EXISTS idx_time_slots_time ON time_slots(time);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots(is_active);

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

-- Índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability_settings(date);
CREATE INDEX IF NOT EXISTS idx_availability_open ON availability_settings(is_open);

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

  -- La capacidad por slot se controla en la aplicación
  CONSTRAINT valid_email CHECK (guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_source ON reservations(source);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(guest_email);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at DESC);

-- Índice compuesto parcial para consultas de disponibilidad
CREATE INDEX IF NOT EXISTS idx_reservations_availability ON reservations(reservation_date, time_slot, status)
  WHERE status NOT IN ('cancelled', 'no_show');

-- =====================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_reservations_timestamp ON reservations;
CREATE TRIGGER trigger_update_reservations_timestamp
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

DROP TRIGGER IF EXISTS trigger_update_availability_timestamp ON availability_settings;
CREATE TRIGGER trigger_update_availability_timestamp
  BEFORE UPDATE ON availability_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

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
)
SET search_path = public
AS $$
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
-- POLÍTICAS RLS (Row Level Security)
-- Baseline: estado actual de producción (permisivas).
-- =====================================================

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Lectura pública de time slots activos
DROP POLICY IF EXISTS "Public read access to active time slots" ON time_slots;
CREATE POLICY "Public read access to active time slots"
  ON time_slots FOR SELECT
  USING (is_active = true);

-- Lectura pública de disponibilidad
DROP POLICY IF EXISTS "Public read access to availability" ON availability_settings;
CREATE POLICY "Public read access to availability"
  ON availability_settings FOR SELECT
  USING (true);

-- Cualquiera puede crear una reserva (web)
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
CREATE POLICY "Anyone can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);

-- Lectura pública de reservas (solo para verificar disponibilidad)
DROP POLICY IF EXISTS "Public read access to reservations for availability" ON reservations;
CREATE POLICY "Public read access to reservations for availability"
  ON reservations FOR SELECT
  USING (true);

-- Acceso completo para usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users full access to time_slots" ON time_slots;
CREATE POLICY "Authenticated users full access to time_slots"
  ON time_slots FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to availability" ON availability_settings;
CREATE POLICY "Authenticated users full access to availability"
  ON availability_settings FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to reservations" ON reservations;
CREATE POLICY "Authenticated users full access to reservations"
  ON reservations FOR ALL
  USING (true)
  WITH CHECK (true);
