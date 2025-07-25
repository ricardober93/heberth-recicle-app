import { NextRequest, NextResponse } from "next/server";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";

/**
 * Middleware optimizado con verificación de sesiones en 3 niveles:
 * 1. Cookie Cache (más rápido) - datos firmados del usuario
 * 2. Session Token (fallback) - verificación de existencia del token
 * 3. Validación completa (en páginas) - verificación segura en cada página
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware - Checking admin access for: ${pathname}`);
  
  // Solo aplicar middleware a rutas admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }


  try {
    const sessionData = await getCookieCache(request);
    
    if (sessionData?.user) {
      console.log(`✅ Cookie cache found for user: ${sessionData.user.email}`);
      
      // Verificar rol de admin desde el cookie cache
      if (sessionData.user.role === 'admin') {
        console.log(`🔑 Admin access granted via cookie cache`);
        return NextResponse.next();
      } else {
        console.log(`❌ User role '${sessionData.user.role}' is not admin`);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  } catch (error) {
    console.log('⚠️ Cookie cache not available, using fallback verification');
  }

  // Nivel 2: Verificación de token (fallback)
  // Verifica solo la existencia del token de sesión
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "better-auth"
  });

  console.log(`🍪 Session token exists: ${!!sessionCookie}`);

  if (!sessionCookie) {
    console.log(`❌ No session token found, redirecting to signin`);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Si hay token pero no cookie cache, permitir acceso optimista
  // La validación completa se hará en cada página admin
  console.log(`⚡ Optimistic access granted - full validation in page`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};