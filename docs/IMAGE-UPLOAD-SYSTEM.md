# Sistema de Gestión de Imágenes para Platos

## 📋 Descripción General

Sistema completo end-to-end para gestionar imágenes de platos del restaurante "La Parrilla de Champi". Incluye compresión automática client-side, validaciones robustas y transacciones atómicas para garantizar la integridad de los datos.

## 🏗️ Arquitectura

```
app/
├── actions/
│   ├── index.ts                # Exportaciones centralizadas
│   ├── uploadDishImage.ts      # Server Action para crear
│   ├── updateDishImage.ts      # Server Action para editar
│   └── deleteDishImage.ts      # Server Action para eliminar
├── components/
│   └── admin/
│       ├── ImageUploadField.tsx    # Componente de upload con drag & drop
│       ├── ImagePreview.tsx        # Preview con estadísticas de compresión
│       ├── DishModal.tsx           # Modal integrado con upload
│       └── DishesManager.tsx       # Gestor de platos
├── menu/
│   └── DishCard.tsx            # Tarjeta optimizada para mostrar imágenes
└── utils/
    └── imageHelpers.ts         # Funciones de validación y compresión
```

## 🚀 Instalación

### 1. Dependencias

```bash
npm install browser-image-compression
```

### 2. Variables de Entorno

Asegúrate de tener configuradas en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Configuración de Supabase Storage

El bucket `menu-images` debe estar creado con las siguientes políticas RLS:

```sql
-- Lectura pública
CREATE POLICY "Lectura pública de imágenes"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Escritura solo autenticados
CREATE POLICY "Upload solo autenticados"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Eliminación solo autenticados
CREATE POLICY "Delete solo autenticados"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
```

### 4. Migración de Base de Datos

La migración ya se aplicó automáticamente. Columnas añadidas a `dishes`:

- `image_uploaded_at` (TIMESTAMP WITH TIME ZONE) - Fecha de subida
- `image_size_kb` (INTEGER) - Tamaño en KB para monitoreo

## 📖 Guía de Uso

### Para el Administrador del Restaurante

#### Subir imagen al crear un plato nuevo:

1. Ve al Dashboard de administración
2. Haz clic en "Crear Plato"
3. Completa los campos del formulario
4. En la sección "Imagen del plato":
   - Haz clic en la zona de drop o arrastra una imagen
   - Espera a que se comprima automáticamente
   - Verás el preview con las estadísticas de compresión
5. Haz clic en "Guardar"

#### Cambiar imagen de un plato existente:

1. En el listado de platos, haz clic en "Editar"
2. Verás la imagen actual si existe
3. Haz clic en "Cambiar imagen"
4. Selecciona la nueva imagen
5. La imagen anterior se eliminará automáticamente al guardar

#### Eliminar imagen de un plato:

1. Edita el plato
2. Haz clic en la X en la esquina de la imagen
3. Guarda los cambios

### Formatos Soportados

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)

### Límites

| Parámetro | Valor |
|-----------|-------|
| Tamaño máximo antes de comprimir | 10 MB |
| Tamaño máximo después de comprimir | 150 KB |
| Dimensiones mínimas | 400 × 300 px |
| Dimensiones máximas (resultado) | 800 × 600 px |
| Formato de salida | WebP |
| Calidad de compresión | 85% |

## 🔧 Troubleshooting

### Error: "Formato no soportado"

**Causa:** El archivo no es JPEG, PNG o WebP.

**Solución:** Convierte la imagen a uno de los formatos soportados antes de subirla.

### Error: "Imagen demasiado grande"

**Causa:** El archivo original supera los 10MB.

**Solución:** Reduce el tamaño de la imagen antes de subirla, o usa una imagen de menor resolución.

### Error: "Dimensiones inválidas"

**Causa:** La imagen es menor a 400×300 píxeles.

**Solución:** Usa una imagen de mayor resolución para garantizar calidad en el menú.

### Error: "Error al subir. Intenta nuevamente"

**Causas posibles:**
- Problema de conexión a internet
- El bucket de Supabase no está configurado correctamente
- Las políticas RLS no permiten la operación

**Solución:**
1. Verifica tu conexión a internet
2. Comprueba que el bucket `menu-images` existe en Supabase Storage
3. Revisa las políticas RLS del bucket

### Las imágenes no se muestran en el menú

**Causas posibles:**
- La URL de la imagen es incorrecta
- El bucket no tiene lectura pública habilitada
- La imagen fue eliminada de Storage

**Solución:**
1. Verifica que la columna `image_url` tenga una URL válida
2. Comprueba que el bucket tenga la política de lectura pública
3. Intenta subir la imagen nuevamente

### La compresión tarda mucho

**Causa:** Imagen muy grande o dispositivo con pocos recursos.

**Solución:** La compresión usa Web Workers para no bloquear la UI. En dispositivos lentos, considera usar imágenes más pequeñas.

## 🔒 Seguridad

### Validaciones Implementadas

#### Client-Side (UX):
- Tipo de archivo (MIME type)
- Tamaño máximo (10MB)
- Dimensiones mínimas (400×300px)

#### Server-Side (Seguridad):
- Re-validación de tipo MIME mediante magic bytes
- Re-validación de tamaño post-compresión
- Sanitización de nombres de archivo
- Rate limiting (10 uploads/minuto)
- Transacciones atómicas (rollback si falla DB)

### Prevención de Ataques

- **Path Traversal:** Nombres de archivo sanitizados, sin caracteres especiales
- **File Upload Attacks:** Validación de magic bytes, no solo extensión
- **DoS:** Rate limiting por usuario
- **Data Integrity:** Rollback automático si falla cualquier paso

## 📊 Monitoreo de Storage

Para monitorear el uso de storage:

```sql
-- Ver tamaño total de imágenes
SELECT 
  COUNT(*) as total_imagenes,
  SUM(image_size_kb) as total_kb,
  ROUND(SUM(image_size_kb) / 1024.0, 2) as total_mb
FROM dishes
WHERE image_url IS NOT NULL;

-- Ver platos sin imagen
SELECT name, created_at
FROM dishes
WHERE image_url IS NULL
ORDER BY created_at DESC;

-- Ver imágenes más grandes
SELECT name, image_size_kb, image_uploaded_at
FROM dishes
WHERE image_url IS NOT NULL
ORDER BY image_size_kb DESC
LIMIT 10;
```

## 🎯 Performance

### Optimizaciones Implementadas

1. **Compresión Client-Side:** Reduce transferencia 60-70%
2. **WebP Format:** Mejor compresión que JPEG/PNG
3. **Lazy Loading:** Imágenes fuera del viewport se cargan bajo demanda
4. **Priority Loading:** Primeras 6 imágenes se cargan con prioridad
5. **Cache Headers:** 1 año de cache en Storage
6. **Blur Placeholder:** Evita layout shift mientras carga

### Métricas Objetivo

| Métrica | Objetivo |
|---------|----------|
| Tamaño por imagen | ≤ 150 KB |
| Tiempo de carga (menú completo, 4G) | < 3 segundos |
| Preview de compresión | < 500 ms |

## 📝 Notas para Desarrolladores

### Extender para Múltiples Imágenes

El sistema está diseñado para ser extensible. Para soportar múltiples imágenes por plato:

1. Crear tabla `dish_images` con FK a `dishes`
2. Modificar `ImageUploadField` para manejar array de imágenes
3. Actualizar Server Actions para manejar batch uploads
4. Implementar galería en `DishCard`

### Testing

Para probar el sistema:

```bash
# Desarrollo
npm run dev

# Acceder al dashboard
http://localhost:3000/admin

# Probar upload de imagen
1. Crear nuevo plato
2. Subir imagen de prueba
3. Verificar compresión en preview
4. Guardar y verificar en menú público
```

### Logs

Los Server Actions incluyen logging detallado:

```
[Upload] Éxito: plato-chuleton-1234567890.webp (142.5KB) para plato abc-123
[Update] Imagen antigua eliminada: dishes/plato-viejo.webp
[Delete] Imagen eliminada de Storage: dishes/plato-xxx.webp
```

## 📄 Licencia

Parte del proyecto "La Parrilla de Champi" - Uso interno.

