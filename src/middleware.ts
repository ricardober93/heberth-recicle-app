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

      // Try to verify session via API first, with fallback to direct DB check
      let sessionData = null;
      let sessionVerified = false;
      
      try {
        // Determine the correct protocol and host for production
        const protocol = request.headers.get('x-forwarded-proto') || 
                        (request.headers.get('host')?.includes('localhost') ? 'http' : 'https');
        const host = request.headers.get('host') || 'localhost:3000';
        const baseURL = `${protocol}://${host}`;
        
        console.log('🌐 Making session request to:', `${baseURL}/api/auth/get-session`);
        
        // Add timeout and better error handling for production
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const sessionResponse = await fetch(`${baseURL}/api/auth/get-session`, {
          headers: {
            'Cookie': `better-auth.session_token=${sessionToken}`,
            'User-Agent': 'Middleware/1.0',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('📡 Session response status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
          sessionData = await sessionResponse.json();
          sessionVerified = true;
          console.log('✅ Session verified via API');
        } else {
          console.log('⚠️ Session API returned non-OK status:', sessionResponse.status);
        }
      } catch (apiError ) {
        console.log('⚠️ Session API call failed, will try direct DB verification:', apiError?.message as string || 'Unknown error');
      }
      
      // If API verification failed, try direct database verification
      if (!sessionVerified) {
        console.log('🔄 Attempting direct database session verification...');
        try {
          const sql = neon(process.env.DATABASE_URL!);
          
          // Verify session token directly in database
          const sessionResult = await sql`
            SELECT s.id, s."userId", u.email, u.role, s."expiresAt"
            FROM session s
            JOIN "user" u ON s."userId" = u.id
            WHERE s.token = ${sessionToken}
            AND s."expiresAt" > NOW()
          `;
          
          if (sessionResult.length > 0) {
            const dbSession = sessionResult[0];
            sessionData = {
              user: {
                id: dbSession.userId,
                email: dbSession.email,
                role: dbSession.role
              }
            };
            sessionVerified = true;
            console.log('✅ Session verified via direct DB check');
          } else {
            console.log('❌ Session not found or expired in database');
          }
        } catch (dbError) {
          console.error('❌ Direct database session verification failed:', dbError);
        }
      }
      
      // If neither API nor DB verification worked, redirect to signin
      if (!sessionVerified || !sessionData?.user) {
        console.log('❌ Session verification failed completely, redirecting to signin');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      console.log('👤 Session data:', {
        hasSession: !!sessionData,
        hasUser: !!sessionData?.user,
        userEmail: sessionData?.user?.email,
        userRole: sessionData?.user?.role
      });

      // Verify admin role
      if (sessionData.user.role !== 'admin') {
        console.log('⚠️  User role is not admin, checking database directly...');
        
        try {
          const sql = neon(process.env.DATABASE_URL!);
          const userResult = await sql`SELECT role FROM "user" WHERE id = ${sessionData.user.id}`;
          
          if (userResult.length > 0 && userResult[0].role === 'admin') {
            console.log('✅ User is admin in database, allowing access');
          } else {
            console.log('❌ User is not admin in database, redirecting to unauthorized');
            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }
        } catch (dbError) {
          console.error('❌ Database role check failed:', dbError);
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } else {
        console.log('✅ User has admin role in session');
      }

      console.log(`✅ Admin access granted for ${sessionData.user.email} to ${pathname}`);
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