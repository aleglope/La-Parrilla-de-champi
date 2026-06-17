-- =====================================================
-- Migración baseline: menú (categories + dishes)
-- La Parrilla de Champi
-- =====================================================
-- Reproduce el esquema vivo de producción para las tablas
-- del menú: extensión uuid-ossp, categories, dishes, índices,
-- RLS con las políticas actuales y trigger de updated_at.
-- Las columnas i18n (name_gl/description_gl) y los metadatos
-- de imagen se añaden en migraciones posteriores, siguiendo
-- el orden de evolución real del esquema.
-- =====================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: categories
-- Categorías del menú (Entrantes, Carnes, Postres, etc)
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para ordenación
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- =====================================================
-- TABLA: dishes
-- Platos del menú
-- =====================================================

CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category_id);
CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(is_available);
CREATE INDEX IF NOT EXISTS idx_dishes_order ON dishes(order_index);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- Baseline: estado actual de producción (permisivas).
-- El endurecimiento se aplica en una migración posterior.
-- =====================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to dishes" ON dishes;
CREATE POLICY "Allow public read access to dishes"
  ON dishes FOR SELECT
  USING (true);

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
-- FUNCIÓN: Actualizar timestamp automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en dishes
DROP TRIGGER IF EXISTS update_dishes_updated_at ON dishes;
CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
