-- =====================================================
-- Script de Setup para Supabase
-- La Parrilla de Champi
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para ordenación
CREATE INDEX idx_categories_order ON categories(order_index);

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
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
CREATE INDEX idx_dishes_order ON dishes(order_index);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- Configuración de permisos
-- =====================================================

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (menú digital)
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to dishes"
  ON dishes FOR SELECT
  USING (true);

-- Para modificaciones, necesitarías autenticación con Supabase Auth
-- Por ahora, permitimos todas las operaciones para el admin
-- (En producción, configura correctamente el rol de admin)

CREATE POLICY "Allow all operations on categories for authenticated users"
  ON categories FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on dishes for authenticated users"
  ON dishes FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- DATOS DE EJEMPLO
-- Categorías y platos iniciales
-- =====================================================

-- Insertar categorías
INSERT INTO categories (name, order_index) VALUES
  ('Entrantes', 0),
  ('Carnes a la Brasa', 1),
  ('Pescados', 2),
  ('Ensaladas', 3),
  ('Postres', 4),
  ('Bebidas', 5)
ON CONFLICT DO NOTHING;

-- Variable para almacenar IDs (necesitarás ajustar según tus UUIDs reales)
-- Estos son datos de ejemplo

-- Entrantes
INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Patatas Bravas',
  'Patatas fritas con salsa brava casera y alioli',
  6.50,
  true,
  0
FROM categories WHERE name = 'Entrantes';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Pimientos de Padrón',
  'Pimientos verdes fritos con sal gorda',
  7.00,
  true,
  1
FROM categories WHERE name = 'Entrantes';

-- Carnes a la Brasa
INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Chuletón de Buey (1kg)',
  'Madurado 45 días, cocinado a la brasa con carbón de encina',
  45.00,
  true,
  0
FROM categories WHERE name = 'Carnes a la Brasa';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Costillas de Cerdo',
  'Costillas ibéricas marinadas 24h, ahumadas al carbón',
  18.50,
  true,
  1
FROM categories WHERE name = 'Carnes a la Brasa';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Pollo a la Brasa',
  'Pollo entero cocinado lentamente con especias secretas',
  15.00,
  true,
  2
FROM categories WHERE name = 'Carnes a la Brasa';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Secreto Ibérico',
  'Corte premium de cerdo ibérico, jugoso y tierno',
  22.00,
  true,
  3
FROM categories WHERE name = 'Carnes a la Brasa';

-- Pescados
INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Dorada a la Brasa',
  'Dorada fresca del día con aceite de oliva virgen extra',
  19.50,
  true,
  0
FROM categories WHERE name = 'Pescados';

-- Ensaladas
INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Ensalada Champi',
  'Mix de lechugas, tomate, cebolla caramelizada, queso de cabra y nueces',
  9.50,
  true,
  0
FROM categories WHERE name = 'Ensaladas';

-- Postres
INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Tarta de Queso Casera',
  'Cremosa tarta de queso con mermelada de frutos rojos',
  6.00,
  true,
  0
FROM categories WHERE name = 'Postres';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Brownie con Helado',
  'Brownie de chocolate caliente con helado de vainilla',
  6.50,
  true,
  1
FROM categories WHERE name = 'Postres';

-- Bebidas
INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Agua Mineral',
  'Agua mineral natural o con gas',
  2.00,
  true,
  0
FROM categories WHERE name = 'Bebidas';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Cerveza Artesanal',
  'Selección de cervezas artesanales locales',
  3.50,
  true,
  1
FROM categories WHERE name = 'Bebidas';

INSERT INTO dishes (category_id, name, description, price, is_available, order_index)
SELECT 
  id,
  'Vino de la Casa (Copa)',
  'Tinto, blanco o rosado',
  3.00,
  true,
  2
FROM categories WHERE name = 'Bebidas';

-- =====================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en dishes
CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Ver datos creados
SELECT 'Categorías creadas:' as info;
SELECT * FROM categories ORDER BY order_index;

SELECT 'Platos creados:' as info;
SELECT 
  d.name,
  c.name as category,
  d.price,
  d.is_available
FROM dishes d
JOIN categories c ON d.category_id = c.id
ORDER BY c.order_index, d.order_index;

