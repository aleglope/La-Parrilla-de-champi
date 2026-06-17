-- ============================================================
-- Migración: Sistema de Gestión de Imágenes para Platos
-- La Parrilla de Champi
-- ============================================================
-- Agrega columnas de metadatos de imagen a la tabla dishes.
-- ============================================================

-- 1. Agregar columnas de metadatos de imagen
ALTER TABLE public.dishes
ADD COLUMN IF NOT EXISTS image_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS image_size_kb INTEGER;

-- 2. Crear índice en image_url para queries rápidas
CREATE INDEX IF NOT EXISTS idx_dishes_image_url ON public.dishes(image_url);

-- 3. Comentarios descriptivos para documentación
COMMENT ON COLUMN public.dishes.image_uploaded_at IS 'Timestamp de cuando se subió la imagen del plato';
COMMENT ON COLUMN public.dishes.image_size_kb IS 'Tamaño de la imagen en kilobytes para monitoreo de storage';

-- ============================================================
-- CONFIGURACIÓN DE STORAGE BUCKET (solo documentación)
-- ============================================================
-- Las storage policies del bucket 'menu-images' se gestionan en
-- el Dashboard de Supabase; se reproducen aquí solo como
-- documentación de referencia, NO como DDL ejecutable.

-- El bucket 'menu-images' debe existir con las siguientes políticas:

-- Política de lectura pública (SELECT)
-- CREATE POLICY "Lectura pública de imágenes del menú"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'menu-images');

-- Política de inserción para usuarios autenticados (INSERT)
-- CREATE POLICY "Upload de imágenes solo autenticados"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'menu-images');

-- Política de eliminación para usuarios autenticados (DELETE)
-- CREATE POLICY "Eliminación de imágenes solo autenticados"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'menu-images');
