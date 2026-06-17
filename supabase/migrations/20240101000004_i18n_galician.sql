-- =====================================================
-- Migración: soporte i18n para Gallego
-- La Parrilla de Champi
-- =====================================================
-- Añade columnas de traducción al gallego para el menú.
-- =====================================================

-- Añadir nombre en gallego a categorías
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS name_gl TEXT;

-- Añadir nombre y descripción en gallego a platos
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS name_gl TEXT,
ADD COLUMN IF NOT EXISTS description_gl TEXT;

-- NOTA: el script original incluía un backfill para entornos con
-- datos existentes (copiar el español como valor por defecto):
--   UPDATE categories SET name_gl = name WHERE name_gl IS NULL;
--   UPDATE dishes SET name_gl = name, description_gl = description WHERE name_gl IS NULL;
-- En un entorno fresco las tablas están vacías y el backfill no
-- aplica; el seed posterior puebla estos valores. Se conserva aquí
-- solo como documentación.
