'use server';

/**
 * Server Action para actualizar/reemplazar imagen de plato existente
 * Elimina la imagen antigua automáticamente para evitar archivos huérfanos
 */

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/ratelimit';
import { isAdminRequest } from '@/lib/auth/requireAdmin';
import { IMAGE_CONFIG, ERROR_MESSAGES } from '@/utils/imageHelpers';
import { reencodeToWebp, reencodeErrorMessage } from '@/lib/images/reencodeImage';

// ============ Tipos ============

interface UpdateResult {
  success: boolean;
  imageUrl?: string;
  imageSizeKb?: number;
  error?: string;
}

// ============ Funciones de Utilidad ============

/**
 * Extrae la ruta del archivo desde una URL de Supabase Storage
 */
function extractStoragePath(url: string): string | null {
  try {
    // URL típica: https://xxx.supabase.co/storage/v1/object/public/menu-images/dishes/plato-xxx.webp
    const match = url.match(/\/menu-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Valida el tipo MIME verificando magic bytes del buffer recibido
 * Nunca el tipo que declara el cliente: `Blob.type` lo fija el navegador
 */
function validateServerMimeType(buffer: Buffer): boolean {
  const bytes = Array.from(buffer.subarray(0, 12));
  
  // JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }
  
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }
  
  // WebP (RIFF....WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return true;
  }
  
  return false;
}

/**
 * Sanitiza nombre de archivo
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\.\./g, '')
    .slice(0, 50);
}

/**
 * Genera nombre único
 */
function generateFileName(dishName: string): string {
  const sanitized = sanitizeFileName(dishName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `plato-${sanitized}-${timestamp}-${random}.webp`;
}

// ============ Server Action Principal ============

/**
 * Actualiza la imagen de un plato existente
 * Elimina la imagen anterior para evitar archivos huérfanos
 *
 * La foto llega en BINARIO dentro del FormData, no en base64: la codificación
 * inflaba el envío un ~33% contra un techo de cuerpo (4.5MB en Vercel) que es
 * infraestructura y no se puede subir.
 */
export async function updateDishImage(payload: FormData): Promise<UpdateResult> {
  let newFilePath: string | null = null;
  let oldFilePath: string | null = null;
  
  try {
    // 0. Exigir sesión admin ANTES del rate limit: sin este gate, un anónimo
    // agota la cuota de la clave global 'upload:admin' y deja fuera al admin real
    if (!(await isAdminRequest())) {
      return { success: false, error: 'No autorizado' };
    }

    // 1. Rate limiting distribuido (SEC-04): 10 req/60s, key global por panel
    // admin (la auth admin es una sola cuenta). Fail-open si el RPC no existe.
    if (!(await checkRateLimit(getSupabaseAdmin(), 'upload:admin', { max: 10, windowSeconds: 60 }))) {
      return {
        success: false,
        error: 'Demasiados cambios. Espera un minuto e intenta de nuevo.',
      };
    }
    
    // 1.5. Leer el cuerpo SOLO después de los gates: hacerlo antes le daría a
    // un anónimo una vía para hacer trabajo en el servidor sin estar autorizado.
    const dishId = String(payload.get('dishId') ?? '');
    const dishName = String(payload.get('dishName') ?? 'plato');
    const image = payload.get('image');
    // La imagen anterior es opcional: si no viene, no hay nada que borrar.
    const oldImageUrlField = payload.get('oldImageUrl');
    const oldImageUrl =
      typeof oldImageUrlField === 'string' && oldImageUrlField.length > 0
        ? oldImageUrlField
        : null;

    if (!dishId) {
      console.error('[Update] FormData sin identificador de plato');
      return { success: false, error: ERROR_MESSAGES.UPLOAD_FAILED };
    }

    // `File` extiende `Blob`, así que comprobar `Blob` cubre los dos casos y no
    // depende de qué clase concreta construya el runtime.
    if (!(image instanceof Blob) || image.size === 0) {
      console.error('[Update] FormData sin imagen utilizable');
      return { success: false, error: ERROR_MESSAGES.INVALID_TYPE };
    }

    // Un solo buffer para todo: se valida y se reencoda el MISMO binario.
    const originalBuffer = Buffer.from(await image.arrayBuffer());

    // 2. Validar tipo MIME
    if (!validateServerMimeType(originalBuffer)) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_TYPE,
      };
    }

    // 3. Reencodar en servidor con sharp: el límite de 200KB es una garantía
    // de salida, no un muro de entrada. Lo que el navegador del cliente no
    // consiguió comprimir se arregla aquí en vez de rechazarse.
    const reencoded = await reencodeToWebp(
      originalBuffer,
      IMAGE_CONFIG.MAX_SIZE_AFTER_COMPRESSION
    );

    if (!reencoded.success) {
      console.error(
        `[Update] Reencodado fallido (${reencoded.reason}): ${reencoded.sizeKb.toFixed(2)}KB`
      );
      return {
        success: false,
        error: reencodeErrorMessage(reencoded.reason),
      };
    }

    const actualSizeKb = reencoded.sizeKb;
    
    // 4. Extraer path de imagen antigua si existe
    if (oldImageUrl) {
      oldFilePath = extractStoragePath(oldImageUrl);
    }
    
    // 5. Generar nombre para nueva imagen
    const fileName = generateFileName(dishName);
    newFilePath = `dishes/${fileName}`;
    
    // 6. El buffer reencodado es WebP de verdad, no un JPEG etiquetado como tal
    const fileBuffer = reencoded.buffer;
    
    // 7. Subir nueva imagen a Storage
    const { error: uploadError } = await getSupabaseAdmin().storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .upload(newFilePath, fileBuffer, {
        contentType: 'image/webp',
        cacheControl: IMAGE_CONFIG.CACHE_CONTROL,
        upsert: false,
      });
    
    if (uploadError) {
      console.error('[Update] Error subiendo nueva imagen:', uploadError);
      return {
        success: false,
        error: ERROR_MESSAGES.UPLOAD_FAILED,
      };
    }
    
    // 8. Obtener URL pública de la nueva imagen
    const { data: urlData } = getSupabaseAdmin().storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(newFilePath);
    
    const newImageUrl = urlData.publicUrl;
    
    // 9. Actualizar base de datos
    const { error: dbError } = await getSupabaseAdmin()
      .from('dishes')
      .update({
        image_url: newImageUrl,
        image_uploaded_at: new Date().toISOString(),
        image_size_kb: Math.round(actualSizeKb),
        updated_at: new Date().toISOString(),
      })
      .eq('id', dishId);
    
    if (dbError) {
      console.error('[Update] Error actualizando DB:', dbError);
      
      // ROLLBACK: Eliminar nueva imagen si falla DB
      await getSupabaseAdmin().storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .remove([newFilePath]);
      
      console.log('[Update] Rollback: Nueva imagen eliminada');
      
      return {
        success: false,
        error: 'Error al guardar. Los cambios fueron revertidos.',
      };
    }
    
    // 10. Eliminar imagen antigua SOLO después de confirmar que todo está OK
    if (oldFilePath) {
      const { error: deleteError } = await getSupabaseAdmin().storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .remove([oldFilePath]);
      
      if (deleteError) {
        // Log pero no fallar - la nueva imagen ya está guardada
        console.warn('[Update] No se pudo eliminar imagen antigua:', deleteError);
      } else {
        console.log('[Update] Imagen antigua eliminada:', oldFilePath);
      }
    }
    
    // 11. Revalidar cache
    revalidatePath('/menu');
    revalidatePath('/admin');
    
    console.log(
      `[Update] Éxito: ${fileName} (${actualSizeKb.toFixed(2)}KB, calidad ${reencoded.quality}) para plato ${dishId}`
    );
    
    return {
      success: true,
      imageUrl: newImageUrl,
      imageSizeKb: Math.round(actualSizeKb),
    };
    
  } catch (error) {
    console.error('[Update] Error inesperado:', error);
    
    // Cleanup de nueva imagen si se subió
    if (newFilePath) {
      try {
        await getSupabaseAdmin().storage
          .from(IMAGE_CONFIG.BUCKET_NAME)
          .remove([newFilePath]);
      } catch (cleanupError) {
        console.error('[Update] Error en cleanup:', cleanupError);
      }
    }
    
    return {
      success: false,
      error: ERROR_MESSAGES.UPLOAD_FAILED,
    };
  }
}

