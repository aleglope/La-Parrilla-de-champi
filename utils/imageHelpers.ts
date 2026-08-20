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

  // Tamaño máximo del fichero que el admin puede elegir
  MAX_SIZE_BEFORE_COMPRESSION: 10 * 1024 * 1024, // 10MB

  // ---- TRANSPORTE (navegador) ----
  // El navegador NO decide la calidad final: solo encoge lo justo para que el
  // payload quepa en el envío a la server action, conservando resolución. Quien
  // comprime de verdad es el servidor (lib/images/reencodeImage.ts) con sharp.
  //
  // Lado máximo antes de enviar: el doble del lado de salida (800px) para que al
  // servidor le sobren píxeles y no tenga que ampliar (usa withoutEnlargement).
  TRANSPORT_MAX_DIMENSION: 1600,
  // OBJETIVO de peso del envío: a lo que apunta la compresión del navegador. No
  // confundir con el techo de abajo, que es la línea a partir de la cual el
  // envío falla. Subir el objetivo solo gastaría más datos móviles para una foto
  // que el servidor va a reencodar a 800px y 200KB de todos modos.
  TRANSPORT_TARGET_MB: 2.5,
  // TECHO del envío. La foto viaja en binario dentro de un FormData, así que el
  // límite es directamente el bodySizeLimit de las server actions, y por encima
  // de él el techo duro de la infraestructura: 4.5MB, que NO es configurable.
  // Invariante de la cadena, que debe seguir siendo creciente:
  //   4.2MB (transporte) < 4.4MB (bodySizeLimit, next.config.mjs) < 4.5MB (Vercel)
  // y el guard de memoria de sharp (MAX_INPUT_SIZE_BYTES) nunca por debajo del
  // techo de transporte, o rechazaría por peso envíos que el cliente da por
  // válidos.
  TRANSPORT_MAX_SIZE_BYTES: 4.2 * 1024 * 1024,
  // Calidad alta a propósito: cualquier pérdida aquí es pérdida que el servidor
  // ya no puede recuperar.
  TRANSPORT_QUALITY: 0.9,

  // ---- SALIDA (servidor) ----
  // Lo que acaba en Storage. `reencodeToWebp` recibe este límite de peso y aplica
  // su propio MAX_DIMENSION = 800, que debe ir a la par con MAX_WIDTH de aquí.
  MAX_SIZE_AFTER_COMPRESSION: 200 * 1024, // 200KB (margen de seguridad)
  TARGET_SIZE_KB: 150, // 150KB objetivo
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,

  // ---- Validación de la imagen de origen ----
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
  TRANSPORT_ENCODE_MISMATCH:
    'Tu navegador no ha podido convertir la foto al formato de envío. Guárdala como JPG e inténtalo de nuevo',
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

// ============ Formato de Transporte ============

/**
 * Resultado cacheado de la sonda de codificación WebP.
 * `null` = todavía sin sondear; `true`/`false` = respuesta ya conocida.
 */
let canvasWebpEncodeSupport: boolean | null = null;

/**
 * Sonda si el canvas de ESTE navegador sabe CODIFICAR WebP (no solo mostrarlo).
 *
 * Safari decodifica WebP pero no lo codifica por canvas, y `toDataURL` no lanza
 * cuando no conoce el tipo pedido: según la especificación cae en silencio a
 * PNG. Por eso la sonda comprueba el prefijo real del data URL devuelto — que
 * la llamada no falle no demuestra absolutamente nada.
 *
 * El resultado se cachea: es una propiedad del navegador, no de la foto.
 */
export function canvasCanEncodeWebp(): boolean {
  if (canvasWebpEncodeSupport !== null) {
    return canvasWebpEncodeSupport;
  }

  // Este módulo también se carga en el bundle de servidor.
  if (typeof document === 'undefined') {
    canvasWebpEncodeSupport = false;
    return canvasWebpEncodeSupport;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvasWebpEncodeSupport = canvas
      .toDataURL('image/webp')
      .startsWith('data:image/webp');
  } catch {
    canvasWebpEncodeSupport = false;
  }

  return canvasWebpEncodeSupport;
}

/**
 * MIME con el que la foto viaja al servidor.
 *
 * Es indiferente para el resultado final (el servidor reencoda a WebP con
 * sharp): lo único que se le exige es que el navegador sepa producirlo de
 * verdad.
 */
export function getTransportMimeType(): 'image/webp' | 'image/jpeg' {
  return canvasCanEncodeWebp() ? 'image/webp' : 'image/jpeg';
}

// ============ Funciones de Compresión ============

/**
 * Encoge la imagen en el navegador SOLO para que quepa en el envío.
 *
 * No es la compresión final: el servidor reencoda con sharp y es quien decide
 * calidad y lado de salida. Por eso `alwaysKeepResolution: true` — si bajar la
 * calidad no basta para llegar al objetivo, `browser-image-compression` recorta
 * resolución, y esos píxeles el servidor ya no los puede recuperar
 * (`withoutEnlargement: true`). Antes pasaba: una foto acababa en 380×475 y
 * 15KB, muy por debajo del objetivo de 150KB, habiendo tirado resolución a
 * cambio de nada.
 *
 * `maxWidthOrHeight` sí se sigue aplicando con `alwaysKeepResolution: true`:
 * la librería lo resuelve antes del bucle de calidad.
 *
 * El formato de transporte se ELIGE, no se impone: hay navegadores (Safari) cuyo
 * canvas decodifica WebP pero no lo codifica, y en ellos pedir WebP devuelve un
 * PNG en silencio — enorme, insensible al bucle de calidad y, con la resolución
 * bloqueada, imposible de encoger. Da igual qué formato viaje: el servidor
 * reencoda con sharp de todos modos.
 */
export async function compressImage(file: File): Promise<CompressedImageResult> {
  const originalSizeKB = file.size / 1024;
  const transportMimeType = getTransportMimeType();

  // Opciones de TRANSPORTE, no de salida
  const options = {
    maxSizeMB: IMAGE_CONFIG.TRANSPORT_TARGET_MB,
    maxWidthOrHeight: IMAGE_CONFIG.TRANSPORT_MAX_DIMENSION,
    useWebWorker: true,
    fileType: transportMimeType,
    initialQuality: IMAGE_CONFIG.TRANSPORT_QUALITY,
    alwaysKeepResolution: true,
    preserveExif: false,
  };

  let compressedFile: File;
  try {
    compressedFile = await imageCompression(file, options);
  } catch (error) {
    console.error('Error comprimiendo imagen:', error);
    throw new Error(ERROR_MESSAGES.COMPRESSION_FAILED);
  }

  // Fuera del `try` a propósito: su `catch` reescribiría este diagnóstico como
  // "error al comprimir", que es justo la mentira que se está corrigiendo. El
  // MIME del fichero devuelto se parsea de la cabecera del data URL, así que
  // refleja el formato REALMENTE codificado.
  if (compressedFile.type !== transportMimeType) {
    console.error(
      `Formato de transporte inesperado: se pidió ${transportMimeType} y el navegador devolvió ${compressedFile.type}`
    );
    throw new Error(ERROR_MESSAGES.TRANSPORT_ENCODE_MISMATCH);
  }

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

