-- =====================================================
-- SEED: datos iniciales de demostración
-- La Parrilla de Champi
-- =====================================================
-- ⚠ SEED first-run ONLY — NO aplicar a producción (ya está
-- poblada). Los inserts de categories/dishes NO son
-- idempotentes (no hay UNIQUE en name); re-ejecutar este
-- archivo duplicaría datos. Los de time_slots sí lo son
-- (ON CONFLICT (time) DO NOTHING).
-- =====================================================

-- =====================================================
-- Categorías de ejemplo
-- =====================================================

INSERT INTO categories (name, order_index) VALUES
  ('Entrantes', 0),
  ('Carnes a la Brasa', 1),
  ('Pescados', 2),
  ('Ensaladas', 3),
  ('Postres', 4),
  ('Bebidas', 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Platos de ejemplo
-- =====================================================

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

-- Backfill i18n para los datos demo (copia del español como
-- valor por defecto, igual que el script i18n original)
UPDATE categories SET name_gl = name WHERE name_gl IS NULL;
UPDATE dishes SET name_gl = name, description_gl = description WHERE name_gl IS NULL;

-- =====================================================
-- Time Slots por defecto (idempotente)
-- =====================================================

-- COMIDAS (13:00 - 15:30, cada 30 minutos)
INSERT INTO time_slots (time, max_capacity, is_active) VALUES
  ('13:00', 40, true),
  ('13:30', 40, true),
  ('14:00', 40, true),
  ('14:30', 40, true),
  ('15:00', 40, true),
  ('15:30', 40, true)
ON CONFLICT (time) DO NOTHING;

-- CENAS (20:00 - 22:30, cada 30 minutos)
INSERT INTO time_slots (time, max_capacity, is_active) VALUES
  ('20:00', 40, true),
  ('20:30', 40, true),
  ('21:00', 40, true),
  ('21:30', 40, true),
  ('22:00', 40, true),
  ('22:30', 40, true)
ON CONFLICT (time) DO NOTHING;

-- =====================================================
-- Configuración inicial del toggle de reservas
-- =====================================================

INSERT INTO reservation_settings (reservations_enabled, notes)
SELECT true, 'Configuración inicial - Reservas activas'
WHERE NOT EXISTS (SELECT 1 FROM reservation_settings);
