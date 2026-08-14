// @vitest-environment node

/**
 * El límite de 200KB de las imágenes de plato es una garantía de salida.
 * Este test pasa una imagen densa real del repo por el mismo reencodado que
 * usan las Server Actions y comprueba que sale WebP de verdad y dentro del
 * límite: si alguien afloja la escalera de calidad, esto se pone rojo.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { MAX_INPUT_SIZE_BYTES, reencodeToWebp } from '@/lib/images/reencodeImage';
import { IMAGE_CONFIG } from '@/utils/imageHelpers';

const MAX_BYTES = IMAGE_CONFIG.MAX_SIZE_AFTER_COMPRESSION;

function leerImagen(relativa: string): Buffer {
  return readFileSync(path.resolve(process.cwd(), relativa));
}

/** Cabecera RIFF....WEBP: descarta un JPEG/PNG renombrado */
function esWebpReal(buffer: Buffer): boolean {
  return buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';
}

describe('reencodeToWebp', () => {
  it('deja un PNG denso en WebP real por debajo del límite', async () => {
    const original = leerImagen('public/Champi Logo.png');
    expect(original.length).toBeGreaterThan(MAX_BYTES);

    const resultado = await reencodeToWebp(original, MAX_BYTES);

    expect(resultado.success).toBe(true);
    if (!resultado.success) return;

    expect(esWebpReal(resultado.buffer)).toBe(true);
    expect(resultado.buffer.length).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('deja un JPEG denso en WebP real por debajo del límite', async () => {
    const original = leerImagen('public/feria/cartel-feria-2026.jpg');
    expect(original.length).toBeGreaterThan(MAX_BYTES);

    const resultado = await reencodeToWebp(original, MAX_BYTES);

    expect(resultado.success).toBe(true);
    if (!resultado.success) return;

    expect(esWebpReal(resultado.buffer)).toBe(true);
    expect(resultado.buffer.length).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('no redimensiona por encima de 800px de lado', async () => {
    const original = leerImagen('public/feria/cartel-feria-2026.jpg');
    const resultado = await reencodeToWebp(original, MAX_BYTES);

    expect(resultado.success).toBe(true);
    if (!resultado.success) return;

    const sharp = (await import('sharp')).default;
    const { width = 0, height = 0 } = await sharp(resultado.buffer).metadata();
    expect(Math.max(width, height)).toBeLessThanOrEqual(800);
  });

  it('rechaza buffers por encima del techo de entrada sin invocar a sharp', async () => {
    const gigante = Buffer.alloc(MAX_INPUT_SIZE_BYTES + 1);

    const resultado = await reencodeToWebp(gigante, MAX_BYTES);

    expect(resultado.success).toBe(false);
    if (resultado.success) return;
    expect(resultado.reason).toBe('input-too-large');
  });

  it('informa del fallo cuando el buffer no es una imagen', async () => {
    const basura = Buffer.from('esto no es una imagen', 'utf-8');

    const resultado = await reencodeToWebp(basura, MAX_BYTES);

    expect(resultado.success).toBe(false);
    if (resultado.success) return;
    expect(resultado.reason).toBe('decode-failed');
  });
});
