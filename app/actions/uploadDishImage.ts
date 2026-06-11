'use server';

/**
 * Server Action para subir imagen de plato nuevo
 * Maneja la validación server-side, upload a Storage y actualización de DB
 */

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/ratelimit';
import { IMAGE_CONFIG, ERROR_MESSAGES } from '@/utils/imageHelpers';

// ============ Tipos ============

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  imageSizeKb?: number;
  error?: string;
}

interface UploadDishImageParams {
  dishId: string;
  dishName: string;
  imageData: string; // Base64 encoded image
  imageSizeKb: number;
}

// ============ Funciones de Validación Server-Side ============

/**
 * Valida el tipo MIME del archivo en el servidor
 * No confía en la extensión, verifica los magic bytes
 */
function validateServerMimeType(base64Data: string): { isValid: boolean; detectedType: string } {
  // Extraer los primeros bytes del base64 para detectar el tipo real
  const binaryString = Buffer.from(base64Data.split(',')[1] || base64Data, 'base64');
  
  // Magic bytes para cada formato
  const magicBytes = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
  };
  
  const bytes = Array.from(binaryString.slice(0, 12));
  
  // Verificar JPEG
  if (bytes[0] === magicBytes.jpeg[0] && 
      bytes[1] === magicBytes.jpeg[1] && 
      bytes[2] === magicBytes.jpeg[2]) {
    return { isValid: true, detectedType: 'image/jpeg' };
  }
  
  // Verificar PNG
  if (bytes[0] === magicBytes.png[0] && 
      bytes[1] === magicBytes.png[1] && 
      bytes[2] === magicBytes.png[2] && 
      bytes[3] === magicBytes.png[3]) {
    return { isValid: true, detectedType: 'image/png' };
  }
  
  // Verificar WebP (RIFF....WEBP)
  if (bytes[0] === magicBytes.webp[0] && 
      bytes[1] === magicBytes.webp[1] && 
      bytes[2] === magicBytes.webp[2] && 
      bytes[3] === magicBytes.webp[3] &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { isValid: true, detectedType: 'image/webp' };
  }
  
  return { isValid: false, detectedType: 'unknown' };
}

/**
 * Sanitiza el nombre del archivo para prevenir path traversal
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\.\./g, '') // Prevenir path traversal
    .slice(0, 50);
}

/**
 * Genera nombre único para el archivo
 */
function generateFileName(dishName: string): string {
  const sanitized = sanitizeFileName(dishName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `plato-${sanitized}-${timestamp}-${random}.webp`;
}

// ============ Server Action Principal ============

/**
 * Sube una imagen para un plato nuevo o existente
 * Incluye validaciones server-side y transacciones atómicas
 */
export async function uploadDishImage(params: UploadDishImageParams): Promise<UploadResult> {
  const { dishId, dishName, imageData, imageSizeKb } = params;
  
  let uploadedFilePath: string | null = null;
  
  try {
    // 1. Rate limiting distribuido (SEC-04): 10 req/60s, key global por panel
    // admin (la auth admin es una sola cuenta). Fail-open si el RPC no existe.
    if (!(await checkRateLimit(supabaseAdmin, 'upload:admin', { max: 10, windowSeconds: 60 }))) {
      return {
        success: false,
        error: 'Demasiados uploads. Espera un minuto e intenta de nuevo.',
      };
    }

    // 3. Validar tipo MIME en servidor
    const mimeValidation = validateServerMimeType(imageData);
    if (!mimeValidation.isValid) {
      console.error(`[Upload] Tipo MIME inválido detectado: ${mimeValidation.detectedType}`);
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_TYPE,
      };
    }
    
    // 4. Validar tamaño post-compresión
    const base64Data = imageData.split(',')[1] || imageData;
    const binarySize = Buffer.from(base64Data, 'base64').length;
    const actualSizeKb = binarySize / 1024;
    
    if (actualSizeKb > IMAGE_CONFIG.MAX_SIZE_AFTER_COMPRESSION / 1024) {
      console.error(`[Upload] Imagen muy grande: ${actualSizeKb.toFixed(2)}KB`);
      return {
        success: false,
        error: `Imagen comprimida muy grande (${actualSizeKb.toFixed(0)}KB). Máximo permitido: ${IMAGE_CONFIG.MAX_SIZE_AFTER_COMPRESSION / 1024}KB`,
      };
    }
    
    // 5. Generar nombre de archivo único
    const fileName = generateFileName(dishName);
    const filePath = `dishes/${fileName}`;
    uploadedFilePath = filePath;
    
    // 6. Convertir base64 a Buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // 7. Subir a Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: 'image/webp',
        cacheControl: IMAGE_CONFIG.CACHE_CONTROL,
        upsert: false, // No sobrescribir si existe
      });
    
    if (uploadError) {
      console.error('[Upload] Error subiendo a Storage:', uploadError);
      uploadedFilePath = null; // No hay archivo que limpiar
      return {
        success: false,
        error: ERROR_MESSAGES.UPLOAD_FAILED,
      };
    }
    
    // 8. Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    const imageUrl = urlData.publicUrl;
    
    // 9. Actualizar registro en la base de datos (transacción atómica)
    const { error: dbError } = await supabaseAdmin
      .from('dishes')
      .update({
        image_url: imageUrl,
        image_uploaded_at: new Date().toISOString(),
        image_size_kb: Math.round(actualSizeKb),
        updated_at: new Date().toISOString(),
      })
      .eq('id', dishId);
    
    if (dbError) {
      console.error('[Upload] Error actualizando DB:', dbError);
      
      // ROLLBACK: Eliminar imagen de Storage si falla la DB
      await supabaseAdmin.storage
        .from(IMAGE_CONFIG.BUCKET_NAME)
        .remove([filePath]);
      
      console.log('[Upload] Rollback: Imagen eliminada de Storage');
      
      return {
        success: false,
        error: 'Error al guardar en base de datos. La imagen fue eliminada.',
      };
    }
    
    // 10. Revalidar cache de Next.js
    revalidatePath('/menu');
    revalidatePath('/admin');
    
    console.log(`[Upload] Éxito: ${fileName} (${actualSizeKb.toFixed(2)}KB) para plato ${dishId}`);
    
    return {
      success: true,
      imageUrl,
      imageSizeKb: Math.round(actualSizeKb),
    };
    
  } catch (error) {
    console.error('[Upload] Error inesperado:', error);
    
    // Intentar cleanup si hay archivo subido
    if (uploadedFilePath) {
      try {
        await supabaseAdmin.storage
          .from(IMAGE_CONFIG.BUCKET_NAME)
          .remove([uploadedFilePath]);
        console.log('[Upload] Cleanup: Imagen eliminada tras error');
      } catch (cleanupError) {
        console.error('[Upload] Error en cleanup:', cleanupError);
      }
    }
    
    return {
      success: false,
      error: ERROR_MESSAGES.UPLOAD_FAILED,
    };
  }
}

