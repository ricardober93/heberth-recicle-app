import { NextRequest, NextResponse } from 'next/server';
import { SessionVerifier } from './SessionVerifier';
import { AdminGuard } from './AdminGuard';
import { MiddlewareLogger } from './MiddlewareLogger';
import { AuthError, AUTH_CONFIG } from './types';

export class AdminMiddlewareGuard {
  private sessionVerifier = new SessionVerifier();
  private adminGuard = new AdminGuard();
  private logger = new MiddlewareLogger();

  async protect(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    
    try {
      // Get session token from cookies
      const sessionToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;
      
      this.logger.logSessionCheck(pathname, !!sessionToken);
      
      if (!sessionToken) {
        this.logger.logNoToken();
        throw new AuthError('No session token', AUTH_CONFIG.ROUTES.SIGNIN);
      }

      // Verify session
      const sessionData = await this.sessionVerifier.verifySession(sessionToken, request);
      
      if (!sessionData?.user) {
        this.logger.logVerificationFailed();
        throw new AuthError('Session verification failed', AUTH_CONFIG.ROUTES.SIGNIN);
      }

      this.logger.logSessionData(sessionData);

      // Check admin permissions
      const isAdmin = await this.adminGuard.isAdmin(sessionData.user);
      
      if (!isAdmin) {
        this.logger.logUnauthorized();
        throw new AuthError('User is not admin', AUTH_CONFIG.ROUTES.UNAUTHORIZED);
      }

      this.logger.logRoleCheck(true);
      this.logger.logAdminAccess(sessionData.user.email, pathname);
      
      return NextResponse.next();
      
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.redirect(new URL(error.redirectTo, request.url));
      }
      
      this.logger.logError('Middleware error', error);
      return NextResponse.redirect(new URL(AUTH_CONFIG.ROUTES.SIGNIN, request.url));
    }
  }
}