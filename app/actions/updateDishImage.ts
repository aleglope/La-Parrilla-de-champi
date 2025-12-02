'use server';

/**
 * Server Action para actualizar/reemplazar imagen de plato existente
 * Elimina la imagen antigua automáticamente para evitar archivos huérfanos
 */

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { IMAGE_CONFIG, ERROR_MESSAGES } from '@/utils/imageHelpers';

// ============ Tipos ============

interface UpdateResult {
  success: boolean;
  imageUrl?: string;
  imageSizeKb?: number;
  error?: string;
}

interface UpdateDishImageParams {
  dishId: string;
  dishName: string;
  imageData: string; // Base64 encoded image
  imageSizeKb: number;
  oldImageUrl?: string | null; // URL de la imagen anterior para eliminar
}

// ============ Rate Limiting ============

const updateAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userAttempts = updateAttempts.get(userId);
  
  if (!userAttempts || now > userAttempts.resetTime) {
    updateAttempts.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userAttempts.count >= RATE_LIMIT) {
    return false;
  }
  
  userAttempts.count++;
  return true;
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
 * Valida el tipo MIME verificando magic bytes
 */
function validateServerMimeType(base64Data: string): boolean {
  const binaryString = Buffer.from(base64Data.split(',')[1] || base64Data, 'base64');
  const bytes = Array.from(binaryString.slice(0, 12));
  
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
 */
export async function updateDishImage(params: UpdateDishImageParams): Promise<UpdateResult> {
  const { dishId, dishName, imageData, imageSizeKb, oldImageUrl } = params;
  
  let newFilePath: string | null = null;
  let oldFilePath: string | null = null;
  
  try {
    // 1. Rate limiting
    const userId = 'admin';
    if (!checkRateLimit(userId)) {
      return {
        success: false,
        error: 'Demasiados cambios. Espera un minuto e intenta de nuevo.',
      };
    }
    
    // 2. Validar tipo MIME
    if (!validateServerMimeType(imageData)) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_TYPE,
      };
    }
    
    // 3. Validar tamaño
    const base64Data = imageData.split(',')[1] || imageData;
    const binarySize = Buffer.from(base64Data, 'base64').length;
    const actualSizeKb = binarySize / 1024;
    
    if (actualSizeKb > IMAGE_CONFIG.MAX_SIZE_AFTER_COMPRESSION / 1024) {
      return {
        success: false,
        error: `Imagen muy grande (${actualSizeKb.toFixed(0)}KB). Máximo: ${IMAGE_CONFIG.MAX_SIZE_AFTER_COMPRESSION / 1024}KB`,
      };
    }
    
    // 4. Extraer path de imagen antigua si existe
    if (oldImageUrl) {
      oldFilePath = extractStoragePath(oldImageUrl);
    }
    
    // 5. Generar nombre para nueva imagen
    const fileName = generateFileName(dishName);
    newFilePath = `dishes/${fileName}`;
    
    // 6. Convertir base64 a Buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // 7. Subir nueva imagen a Storage
    const { error: uploadError } = await supabaseAdmin.storage
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
    const { data: urlData } = supabaseAdmin.storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(newFilePath);
    
    const newImageUrl = urlData.publicUrl;
    
    // 9. Actualizar base de datos
    const { error: dbError } = await supabaseAdmin
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
      await supabaseAdmin.storage
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
      const { error: deleteError } = await supabaseAdmin.storage
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
    
    console.log(`[Update] Éxito: ${fileName} (${actualSizeKb.toFixed(2)}KB) para plato ${dishId}`);
    
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
        await supabaseAdmin.storage
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

