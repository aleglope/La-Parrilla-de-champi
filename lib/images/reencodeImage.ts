/**
 * Reencodado de imágenes en servidor con sharp.
 *
 * El límite de tamaño de las imágenes de plato dejó de ser un muro de entrada
 * (rechazar lo que el navegador del cliente no supo comprimir) para pasar a ser
 * una garantía de salida: aquí se normaliza cualquier JPEG/PNG/WebP a WebP de
 * como mucho MAX_DIMENSION px y del peso máximo que pida quien llame.
 */

import sharp from 'sharp';

// ============ Constantes ============

/**
 * Techo del buffer de entrada antes de invocar a sharp: evita que una imagen
 * enorme agote la memoria de la función serverless. Por encima de esto ni se
 * intenta decodificar.
 *
 * Debe quedar POR ENCIMA del techo de transporte del cliente (4.2MB, ver
 * TRANSPORT_MAX_SIZE_BYTES en utils/imageHelpers.ts). Si quedara por debajo,
 * rechazaría con "la foto pesa demasiado" envíos que el cliente considera
 * válidos — el mismo diagnóstico falso que se está corrigiendo aguas arriba.
 */
export const MAX_INPUT_SIZE_BYTES = 4.5 * 1024 * 1024; // 4,5MB

/** Lado máximo de la imagen resultante (se respeta la relación de aspecto). */
const MAX_DIMENSION = 800;

/**
 * Escalera de calidad descendente. Se prueba de mayor a menor y se devuelve
 * el primer resultado que quepa en el límite pedido.
 */
const QUALITY_STEPS = [82, 75, 68, 60, 50] as const;

// ============ Tipos ============

export type ReencodeFailureReason =
  | 'input-too-large'
  | 'decode-failed'
  | 'too-large-at-min-quality';

export type ReencodeResult =
  | { success: true; buffer: Buffer; sizeKb: number; quality: number }
  | { success: false; reason: ReencodeFailureReason; sizeKb: number };

// ============ API ============

/**
 * Convierte un buffer de imagen a WebP dentro del límite de bytes indicado.
 *
 * Aplica la orientación EXIF antes de redimensionar y descarta los metadatos
 * (sharp no los copia salvo que se pida), así que la foto sube sin GPS.
 *
 * @param input Buffer original (JPEG, PNG o WebP ya validado por magic bytes).
 * @param maxBytes Peso máximo admitido para el resultado.
 */
export async function reencodeToWebp(
  input: Buffer,
  maxBytes: number
): Promise<ReencodeResult> {
  if (input.length > MAX_INPUT_SIZE_BYTES) {
    return {
      success: false,
      reason: 'input-too-large',
      sizeKb: input.length / 1024,
    };
  }

  // failOn: 'none' porque las fotos hechas con el móvil llegan a veces con
  // avisos del decodificador (perfiles ICC raros, ficheros truncados al final)
  // que no impiden reencodarlas. El formato ya se validó con magic bytes.
  const pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });

  let last: { buffer: Buffer; quality: number } | null = null;

  for (const quality of QUALITY_STEPS) {
    let buffer: Buffer;
    try {
      buffer = await pipeline.clone().webp({ quality }).toBuffer();
    } catch (error) {
      console.error('[Reencode] sharp no pudo decodificar la imagen:', error);
      return { success: false, reason: 'decode-failed', sizeKb: input.length / 1024 };
    }

    last = { buffer, quality };

    if (buffer.length <= maxBytes) {
      return {
        success: true,
        buffer,
        sizeKb: buffer.length / 1024,
        quality,
      };
    }
  }

  // Ni con la calidad mínima cabe: aquí sí es un error legítimo.
  return {
    success: false,
    reason: 'too-large-at-min-quality',
    sizeKb: last ? last.buffer.length / 1024 : input.length / 1024,
  };
}

/**
 * Traduce el motivo del fallo de reencodado al mensaje que ve el admin.
 */
export function reencodeErrorMessage(reason: ReencodeFailureReason): string {
  switch (reason) {
    case 'input-too-large':
      return `La foto pesa demasiado (máximo ${MAX_INPUT_SIZE_BYTES / (1024 * 1024)}MB). Redúcela antes de subirla.`;
    case 'decode-failed':
      return 'No se pudo leer la imagen. Prueba con otra foto o guárdala como JPG.';
    case 'too-large-at-min-quality':
      return 'No se pudo optimizar la imagen por debajo del límite. Prueba con una foto menos detallada.';
  }
}
