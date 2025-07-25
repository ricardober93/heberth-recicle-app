import { NextRequest, NextResponse } from 'next/server';
import { AdminMiddlewareGuard } from './utils/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const guard = new AdminMiddlewareGuard();
    return await guard.protect(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};