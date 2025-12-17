-- Ejecuta esto en el Editor SQL de Supabase para añadir soporte para Gallego

-- Añadir nombre en gallego a categorías
ALTER TABLE categories
ADD COLUMN name_gl TEXT;

-- Añadir nombre y descripción en gallego a platos
ALTER TABLE dishes
ADD COLUMN name_gl TEXT,
ADD COLUMN description_gl TEXT;

-- (Opcional) Actualizar datos existentes con valores por defecto (copia del español)
UPDATE categories SET name_gl = name WHERE name_gl IS NULL;
UPDATE dishes SET name_gl = name, description_gl = description WHERE name_gl IS NULL;























