// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for edge-compatible JWT verification

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret'; // ¡Usa una variable de entorno en producción!
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas que comienzan con /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redirigir a login si no hay token
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verificar el token JWT
      await jwtVerify(token, secret);
      // Si el token es válido, permitir el acceso
      return NextResponse.next();
    } catch (error) {
      // Si el token no es válido o ha expirado, redirigir a login
      console.error('JWT Verification Error:', error);
      const loginUrl = new URL('/login', request.url);
      // Opcional: eliminar la cookie inválida
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Permitir el acceso a otras rutas
  return NextResponse.next();
}

// Configuración del matcher para aplicar el middleware solo a ciertas rutas
export const config = {
  matcher: ['/admin/:path*'], // Aplica a todas las subrutas de /admin
};