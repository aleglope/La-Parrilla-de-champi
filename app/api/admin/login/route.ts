import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route para login del admin
 * Autenticación simple con variables de entorno
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Credenciales desde variables de entorno (o defaults)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@laparrilla.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    // Verificar credenciales
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Establecer cookie de autenticación
      const cookieStore = await cookies();
      cookieStore.set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Credenciales incorrectas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

