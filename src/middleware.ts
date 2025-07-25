import { NextRequest, NextResponse } from 'next/server';
import { db } from './utils/db';
import { user } from './models/schema';
import { eq } from 'drizzle-orm';

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

      // Query database directly for user role as fallback
      let userRole = session.user.role;
      
      if (!userRole && session.user.id) {
        try {
          const dbUser = await db.select({ role: user.role })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);
          
          userRole = dbUser[0]?.role || 'user';
        } catch (dbError) {
          console.error('Database query error:', dbError);
          userRole = 'user'; // Default to user role
        }
      }

      // Check if user has admin role
      if (userRole !== 'admin') {
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