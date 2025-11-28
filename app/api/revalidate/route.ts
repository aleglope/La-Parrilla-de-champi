import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * API Route para revalidar el cache (ISR)
 * Se llama cuando se actualiza el menú desde el admin
 */
export async function POST(request: NextRequest) {
  try {
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

