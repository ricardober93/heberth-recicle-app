import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    try {
      // Get session token from cookies
      const sessionToken = request.cookies.get('better-auth.session_token')?.value;
      
      console.log('🔍 Middleware - Checking admin access for:', pathname);
      console.log('🍪 Session token exists:', !!sessionToken);
      
      if (!sessionToken) {
        console.log('❌ No session token found, redirecting to signin');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // Verify session by calling the API route with full URL
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const baseURL = `${protocol}://${host}`;
      
      console.log('🌐 Making session request to:', `${baseURL}/api/auth/get-session`);
      
      const sessionResponse = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: {
          'Cookie': `better-auth.session_token=${sessionToken}`,
          'User-Agent': 'Middleware/1.0',
        },
      });

      console.log('📡 Session response status:', sessionResponse.status);
      
      if (!sessionResponse.ok) {
        console.log('❌ Session response not ok, redirecting to signin');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      const session = await sessionResponse.json();
      console.log('👤 Session data:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        userRole: session?.user?.role
      });
      
      if (!session || !session.user) {
        console.log('❌ No session or user data, redirecting to signin');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // If role is not set or not admin, check database directly
      if (session.user.role !== 'admin') {
        console.log('⚠️  User role is not admin, checking database directly...');
        
        try {
          const sql = neon(process.env.DATABASE_URL!);
          const userResult = await sql`SELECT role FROM "user" WHERE id = ${session.user.id}`;
          
          if (userResult.length > 0 && userResult[0].role === 'admin') {
            console.log('✅ User is admin in database, allowing access');
          } else {
            console.log('❌ User is not admin in database, redirecting to unauthorized');
            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }
        } catch (dbError) {
          console.error('❌ Database check failed:', dbError);
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } else {
        console.log('✅ User has admin role in session');
      }

      console.log(`✅ Admin access granted for ${session.user.email} to ${pathname}`);
    } catch (error) {
      console.error('❌ Middleware error:', error);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};