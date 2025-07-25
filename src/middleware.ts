import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    try {
      // Get session token from cookies
      const sessionToken = request.cookies.get('better-auth.session_token')?.value;
      
      if (!sessionToken) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // Verify session by calling the API route
      const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
      const sessionResponse = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: {
          'Cookie': `better-auth.session_token=${sessionToken}`,
        },
      });

      if (!sessionResponse.ok) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      const session = await sessionResponse.json();
      
      if (!session || !session.user) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // Check if user has admin role (now handled by Better Auth admin plugin)
      if (session.user.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};