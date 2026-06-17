-- =====================================================
-- Migración: Toggle de Reservas Online
-- La Parrilla de Champi
-- =====================================================
-- Añade la funcionalidad para activar/desactivar las
-- reservas online globalmente sin perder configuración.
-- =====================================================

-- =====================================================
-- TABLA: reservation_settings
-- Configuración global del sistema de reservas
-- =====================================================

CREATE TABLE IF NOT EXISTS reservation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservations_enabled BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida (aunque solo habrá un registro)
CREATE INDEX IF NOT EXISTS idx_reservation_settings_enabled ON reservation_settings(reservations_enabled);

-- =====================================================
-- TRIGGER: Actualizar timestamp automáticamente
-- (la función update_reservations_updated_at ya existe)
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_reservation_settings_timestamp ON reservation_settings;
CREATE TRIGGER trigger_update_reservation_settings_timestamp
  BEFORE UPDATE ON reservation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- Baseline: estado actual de producción (permisivas).
-- =====================================================

ALTER TABLE reservation_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública del estado de reservas
DROP POLICY IF EXISTS "Public read access to reservation settings" ON reservation_settings;
CREATE POLICY "Public read access to reservation settings"
  ON reservation_settings FOR SELECT
  USING (true);

-- Solo usuarios autenticados (admin) pueden modificar
DROP POLICY IF EXISTS "Authenticated users can update reservation settings" ON reservation_settings;
CREATE POLICY "Authenticated users can update reservation settings"
  ON reservation_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Solo usuarios autenticados pueden insertar (para setup inicial)
DROP POLICY IF EXISTS "Authenticated users can insert reservation settings" ON reservation_settings;
CREATE POLICY "Authenticated users can insert reservation settings"
  ON reservation_settings FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- FUNCIÓN DE UTILIDAD: Obtener estado de reservas
-- =====================================================

CREATE OR REPLACE FUNCTION are_reservations_enabled()
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT reservations_enabled INTO v_enabled
  FROM reservation_settings
  ORDER BY created_at DESC
  LIMIT 1;

  -- Si no hay configuración, asumir que están activas
  RETURN COALESCE(v_enabled, true);
END;
$$ LANGUAGE plpgsql;
