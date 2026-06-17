import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

/**
 * Comparación de tiempo constante entre el secreto recibido y el esperado.
 * Guard de longitud previo: timingSafeEqual lanza con buffers de distinto
 * tamaño, así que si las longitudes difieren se rechaza sin comparar.
 */
function isValidSecret(provided: string | null, expected: string): boolean {
  if (!provided) {
    return false;
  }
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/**
 * API Route para revalidar el cache (ISR)
 * Gateada con el header x-revalidate-secret comparado contra REVALIDATE_SECRET
 * (fail-closed: sin secreto configurado responde 401 y no revalida).
 * Se mantiene para integraciones externas; el panel admin revalida vía Server Action.
 */
export async function POST(request: NextRequest) {
  try {
    const provided = request.headers.get('x-revalidate-secret');
    const expected = process.env.REVALIDATE_SECRET;

    if (!expected || !isValidSecret(provided, expected)) {
      return NextResponse.json({ revalidated: false }, { status: 401 });
    }

    const { path } = await request.json();

    // Revalidar la página especificada
    revalidatePath(path || '/menu');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: path || '/menu'
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { revalidated: false, error: 'Error al revalidar' },
      { status: 500 }
    );
  }
}
