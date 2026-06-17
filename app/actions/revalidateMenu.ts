'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server Action que revalida la página pública del menú.
 *
 * Revalida directamente con revalidatePath: no necesita secreto alguno
 * (el gate por secreto compartido aplica solo al endpoint /api/revalidate,
 * pensado para integraciones externas).
 *
 * Nota: el endpoint revalidaba el literal '/menu', que nunca correspondió a
 * una ruta real (las páginas viven bajo el segmento dinámico /[lang]/menu y
 * la frescura la garantizaba el ISR de 60s). Revalidar '/[lang]/menu' con
 * type 'page' invalida ambas locales (/es/menu y /gl/menu) en una sola
 * llamada: mismo comportamiento observable del botón, pero ahora efectivo.
 */
export async function revalidateMenu(): Promise<void> {
  revalidatePath('/[lang]/menu', 'page');
}
