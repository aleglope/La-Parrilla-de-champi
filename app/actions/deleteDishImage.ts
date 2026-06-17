'use server';

/**
 * Server Action para eliminar imagen de un plato
 * Útil para cleanup manual o cuando se elimina un plato
 */

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { IMAGE_CONFIG, ERROR_MESSAGES } from '@/utils/imageHelpers';

// ============ Tipos ============

interface DeleteResult {
  success: boolean;
  error?: string;
}

interface DeleteDishImageParams {
  dishId: string;
  imageUrl: string;
  updateDatabase?: boolean; // Si true, también limpia el campo image_url en DB
}

// ============ Funciones de Utilidad ============

/**
 * Extrae la ruta del archivo desde una URL de Supabase Storage
 */
function extractStoragePath(url: string): string | null {
  try {
    const match = url.match(/\/menu-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Verifica que la URL pertenece a nuestro bucket de Storage
 */
function isValidStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && 
           urlObj.pathname.includes('/menu-images/');
  } catch {
    return false;
  }
}

// ============ Server Action Principal ============

/**
 * Elimina una imagen de Storage y opcionalmente actualiza la DB
 */
export async function deleteDishImage(params: DeleteDishImageParams): Promise<DeleteResult> {
  const { dishId, imageUrl, updateDatabase = true } = params;
  
  try {
    // 1. Validar que la URL es de nuestro Storage
    if (!isValidStorageUrl(imageUrl)) {
      console.error('[Delete] URL inválida:', imageUrl);
      return {
        success: false,
        error: 'URL de imagen no válida',
      };
    }
    
    // 2. Extraer path del archivo
    const filePath = extractStoragePath(imageUrl);
    
    if (!filePath) {
      console.error('[Delete] No se pudo extraer path de:', imageUrl);
      return {
        success: false,
        error: 'No se pudo identificar el archivo',
      };
    }
    
    // 3. Eliminar de Storage
    const { error: storageError } = await getSupabaseAdmin().storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .remove([filePath]);
    
    if (storageError) {
      console.error('[Delete] Error eliminando de Storage:', storageError);
      return {
        success: false,
        error: ERROR_MESSAGES.DELETE_FAILED,
      };
    }
    
    console.log('[Delete] Imagen eliminada de Storage:', filePath);
    
    // 4. Actualizar base de datos si se solicita
    if (updateDatabase) {
      const { error: dbError } = await getSupabaseAdmin()
        .from('dishes')
        .update({
          image_url: null,
          image_uploaded_at: null,
          image_size_kb: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dishId);
      
      if (dbError) {
        console.error('[Delete] Error actualizando DB:', dbError);
        // La imagen ya se eliminó, reportar éxito parcial
        return {
          success: true, // Storage OK
          error: 'Imagen eliminada pero hubo un error actualizando la base de datos',
        };
      }
      
      console.log('[Delete] DB actualizada para plato:', dishId);
    }
    
    // 5. Revalidar cache
    revalidatePath('/menu');
    revalidatePath('/admin');
    
    return { success: true };
    
  } catch (error) {
    console.error('[Delete] Error inesperado:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.DELETE_FAILED,
    };
  }
}

/**
 * Elimina múltiples imágenes (útil para cleanup batch)
 */
export async function deleteDishImages(imageUrls: string[]): Promise<DeleteResult> {
  try {
    const filePaths = imageUrls
      .filter(isValidStorageUrl)
      .map(extractStoragePath)
      .filter((path): path is string => path !== null);
    
    if (filePaths.length === 0) {
      return { success: true }; // Nada que eliminar
    }
    
    const { error } = await getSupabaseAdmin().storage
      .from(IMAGE_CONFIG.BUCKET_NAME)
      .remove(filePaths);
    
    if (error) {
      console.error('[Delete Batch] Error:', error);
      return {
        success: false,
        error: 'Error eliminando algunas imágenes',
      };
    }
    
    console.log(`[Delete Batch] ${filePaths.length} imágenes eliminadas`);
    
    revalidatePath('/menu');
    revalidatePath('/admin');
    
    return { success: true };
    
  } catch (error) {
    console.error('[Delete Batch] Error inesperado:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.DELETE_FAILED,
    };
  }
}

