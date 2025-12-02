-- ============================================================
-- MIGRACIÓN: Sistema de Gestión de Imágenes para Platos
-- Fecha: 2024
-- Descripción: Agrega columnas de metadatos de imagen a la tabla dishes
-- ============================================================

-- NOTA: Esta migración ya fue aplicada automáticamente.
-- Este archivo es solo para documentación y referencia.

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
-- CONFIGURACIÓN DE STORAGE BUCKET (ejecutar en Supabase Dashboard)
-- ============================================================

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

-- ============================================================
-- QUERIES ÚTILES PARA MONITOREO
-- ============================================================

-- Ver estadísticas de uso de imágenes
-- SELECT 
--   COUNT(*) as total_platos,
--   COUNT(image_url) as platos_con_imagen,
--   COUNT(*) - COUNT(image_url) as platos_sin_imagen,
--   COALESCE(SUM(image_size_kb), 0) as total_kb,
--   ROUND(COALESCE(SUM(image_size_kb), 0) / 1024.0, 2) as total_mb,
--   ROUND(COALESCE(AVG(image_size_kb), 0), 2) as promedio_kb
-- FROM dishes;

-- Ver platos ordenados por tamaño de imagen
-- SELECT 
--   name,
--   image_size_kb,
--   image_uploaded_at,
--   image_url
-- FROM dishes
-- WHERE image_url IS NOT NULL
-- ORDER BY image_size_kb DESC;

-- Buscar imágenes huérfanas (archivos en storage sin referencia en DB)
-- Esto requiere comparar con la lista de archivos en el bucket
-- SELECT name FROM storage.objects WHERE bucket_id = 'menu-images'
-- EXCEPT
-- SELECT SUBSTRING(image_url FROM '/menu-images/(.*)$') FROM dishes WHERE image_url IS NOT NULL;

