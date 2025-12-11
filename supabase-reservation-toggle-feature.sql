-- =====================================================
-- Script de Configuración: Toggle de Reservas Online
-- La Parrilla de Champi
-- =====================================================
-- Este script añade la funcionalidad para activar/desactivar
-- las reservas online globalmente sin perder configuración
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
CREATE INDEX idx_reservation_settings_enabled ON reservation_settings(reservations_enabled);

-- =====================================================
-- TRIGGER: Actualizar timestamp automáticamente
-- =====================================================

CREATE TRIGGER trigger_update_reservation_settings_timestamp
  BEFORE UPDATE ON reservation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

ALTER TABLE reservation_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública del estado de reservas
-- Cualquier usuario puede verificar si las reservas están activas
CREATE POLICY "Public read access to reservation settings"
  ON reservation_settings FOR SELECT
  USING (true);

-- Solo usuarios autenticados (admin) pueden modificar
CREATE POLICY "Authenticated users can update reservation settings"
  ON reservation_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Solo usuarios autenticados pueden insertar (para setup inicial)
CREATE POLICY "Authenticated users can insert reservation settings"
  ON reservation_settings FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- DATOS INICIALES
-- Crear registro único con reservas activas por defecto
-- =====================================================

INSERT INTO reservation_settings (reservations_enabled, notes)
VALUES (true, 'Configuración inicial - Reservas activas')
ON CONFLICT (id) DO NOTHING;

-- Si ya existen registros, asegurarnos de que solo haya uno
-- (esto es útil si se ejecuta el script múltiples veces)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM reservation_settings;
  
  IF v_count = 0 THEN
    -- Si no hay registros, insertar uno
    INSERT INTO reservation_settings (reservations_enabled, notes)
    VALUES (true, 'Configuración inicial - Reservas activas');
  ELSIF v_count > 1 THEN
    -- Si hay múltiples registros, mantener solo el más reciente
    DELETE FROM reservation_settings
    WHERE id NOT IN (
      SELECT id FROM reservation_settings
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;
END $$;

-- =====================================================
-- FUNCIÓN DE UTILIDAD: Obtener estado de reservas
-- Esta función es optional pero útil para consultas
-- =====================================================

CREATE OR REPLACE FUNCTION are_reservations_enabled()
RETURNS BOOLEAN AS $$
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

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

SELECT 'Sistema de Toggle de Reservas - Setup Completado' as status;

-- Verificar tabla creada
SELECT 'Tabla reservation_settings creada:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'reservation_settings';

-- Verificar configuración inicial
SELECT 'Estado inicial de reservas:' as info;
SELECT reservations_enabled, notes, created_at 
FROM reservation_settings;
