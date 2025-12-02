/**
 * Utilidades para gestión de imágenes de platos
 * Incluye validaciones, compresión y generación de nombres
 */

import imageCompression from 'browser-image-compression';

// ============ Constantes de Configuración ============

export const IMAGE_CONFIG = {
  // Tipos MIME permitidos
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  
  // Extensiones permitidas
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
  
  // Tamaños en bytes
  MAX_SIZE_BEFORE_COMPRESSION: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_AFTER_COMPRESSION: 200 * 1024, // 200KB (margen de seguridad)
  TARGET_SIZE_KB: 150, // 150KB objetivo
  
  // Dimensiones
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  MIN_WIDTH: 400,
  MIN_HEIGHT: 300,
  
  // Calidad de compresión
  QUALITY: 0.85,
  
  // Bucket de Supabase Storage
  BUCKET_NAME: 'menu-images',
  
  // Cache control (1 año)
  CACHE_CONTROL: '31536000',
} as const;

// ============ Tipos ============

export type AllowedMimeType = typeof IMAGE_CONFIG.ALLOWED_TYPES[number];

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: 'INVALID_TYPE' | 'TOO_LARGE' | 'TOO_SMALL' | 'INVALID_DIMENSIONS';
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressedImageResult {
  file: File;
  sizeKB: number;
  dimensions: ImageDimensions;
  originalSizeKB: number;
  compressionRatio: number;
}

// ============ Mensajes de Error en Español ============

export const ERROR_MESSAGES = {
  INVALID_TYPE: 'Formato no soportado. Usa JPG, PNG o WebP',
  TOO_LARGE: `Imagen demasiado grande (máx ${IMAGE_CONFIG.MAX_SIZE_BEFORE_COMPRESSION / 1024 / 1024}MB)`,
  TOO_SMALL: `Imagen demasiado pequeña (mín ${IMAGE_CONFIG.MIN_WIDTH}x${IMAGE_CONFIG.MIN_HEIGHT}px)`,
  INVALID_DIMENSIONS: `Dimensiones inválidas. Mínimo ${IMAGE_CONFIG.MIN_WIDTH}x${IMAGE_CONFIG.MIN_HEIGHT}px`,
  COMPRESSION_FAILED: 'Error al comprimir la imagen. Intenta con otra imagen',
  UPLOAD_FAILED: 'Error al subir la imagen. Intenta nuevamente',
  DELETE_FAILED: 'Error al eliminar la imagen',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  UNAUTHORIZED: 'Sesión expirada. Inicia sesión nuevamente',
} as const;

// ============ Funciones de Validación ============

/**
 * Valida el tipo MIME del archivo
 */
export function validateMimeType(file: File): boolean {
  return IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type as AllowedMimeType);
}

/**
 * Valida el tamaño del archivo antes de comprimir
 */
export function validateFileSize(file: File): boolean {
  return file.size <= IMAGE_CONFIG.MAX_SIZE_BEFORE_COMPRESSION;
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen'));
    };
    
    img.src = url;
  });
}

/**
 * Valida las dimensiones mínimas de una imagen
 */
export function validateDimensions(dimensions: ImageDimensions): boolean {
  return (
    dimensions.width >= IMAGE_CONFIG.MIN_WIDTH &&
    dimensions.height >= IMAGE_CONFIG.MIN_HEIGHT
  );
}

/**
 * Validación completa de imagen (client-side)
 */
export async function validateImage(file: File): Promise<ImageValidationResult> {
  // Validar tipo MIME
  if (!validateMimeType(file)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_TYPE,
      errorCode: 'INVALID_TYPE',
    };
  }
  
  // Validar tamaño
  if (!validateFileSize(file)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.TOO_LARGE,
      errorCode: 'TOO_LARGE',
    };
  }
  
  // Validar dimensiones
  try {
    const dimensions = await getImageDimensions(file);
    if (!validateDimensions(dimensions)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.INVALID_DIMENSIONS,
        errorCode: 'INVALID_DIMENSIONS',
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'No se pudo verificar la imagen',
      errorCode: 'INVALID_TYPE',
    };
  }
  
  return { isValid: true };
}

// ============ Funciones de Compresión ============

/**
 * Comprime una imagen usando browser-image-compression
 * Convierte a WebP y optimiza para el tamaño objetivo
 */
export async function compressImage(file: File): Promise<CompressedImageResult> {
  const originalSizeKB = file.size / 1024;
  
  // Opciones de compresión optimizadas
  const options = {
    maxSizeMB: IMAGE_CONFIG.TARGET_SIZE_KB / 1024, // 0.15MB = 150KB
    maxWidthOrHeight: IMAGE_CONFIG.MAX_WIDTH,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    initialQuality: IMAGE_CONFIG.QUALITY,
    alwaysKeepResolution: false,
    preserveExif: false,
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    
    // Obtener dimensiones del archivo comprimido
    const dimensions = await getImageDimensions(compressedFile);
    const sizeKB = compressedFile.size / 1024;
    const compressionRatio = ((originalSizeKB - sizeKB) / originalSizeKB) * 100;
    
    return {
      file: compressedFile,
      sizeKB: Math.round(sizeKB * 100) / 100,
      dimensions,
      originalSizeKB: Math.round(originalSizeKB * 100) / 100,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
    };
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    throw new Error(ERROR_MESSAGES.COMPRESSION_FAILED);
  }
}

// ============ Funciones de Generación de Nombres ============

/**
 * Sanitiza un string para usar en nombres de archivo
 * Elimina caracteres especiales y espacios
 */
export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales por guiones
    .replace(/-+/g, '-') // Eliminar guiones múltiples
    .replace(/^-|-$/g, '') // Eliminar guiones al inicio/final
    .slice(0, 50); // Limitar longitud
}

/**
 * Genera un nombre único para la imagen del plato
 * Formato: plato-{nombre-sanitizado}-{timestamp}.webp
 */
export function generateImageFileName(dishName: string): string {
  const sanitizedName = sanitizeFileName(dishName);
  const timestamp = Date.now();
  return `plato-${sanitizedName}-${timestamp}.webp`;
}

/**
 * Genera la ruta completa en el bucket de Storage
 */
export function generateStoragePath(fileName: string): string {
  return `dishes/${fileName}`;
}

/**
 * Extrae el nombre del archivo de una URL de Supabase Storage
 */
export function extractFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * Extrae la ruta completa del archivo desde una URL de Storage
 */
export function extractStoragePathFromUrl(url: string): string | null {
  try {
    // URL típica: https://xxx.supabase.co/storage/v1/object/public/menu-images/dishes/plato-xxx.webp
    const match = url.match(/\/menu-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ============ Funciones de Utilidad ============

/**
 * Crea un blob URL para preview de imagen
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoca un blob URL para liberar memoria
 */
export function revokePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Formatea el tamaño de archivo para mostrar al usuario
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

/**
 * Genera un placeholder blur data URL para next/image
 * Placeholder simple de color sólido para evitar layout shift
 */
export function generateBlurPlaceholder(): string {
  // Placeholder gris oscuro que combina con el tema del restaurante
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * URL de imagen por defecto cuando no hay imagen
 */
export const DEFAULT_DISH_IMAGE = '/images/default-dish.webp';

/**
 * Verifica si una URL es válida de Supabase Storage
 */
export function isValidSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && 
           urlObj.pathname.includes('/storage/');
  } catch {
    return false;
  }
}

