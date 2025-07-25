export class MiddlewareLogger {
  logSessionCheck(pathname: string, hasToken: boolean): void {
    console.log('🔍 Middleware - Checking admin access for:', pathname);
    console.log('🍪 Session token exists:', hasToken);
  }

  logNoToken(): void {
    console.log('❌ No session token found, redirecting to signin');
  }

  logSessionRequest(url: string): void {
    console.log('🌐 Making session request to:', url);
  }

  logVerificationResult(method: 'API' | 'DB', success: boolean, status?: number): void {
    if (success) {
      console.log(`✅ Session verified via ${method}`);
    } else {
      const statusMsg = status ? ` (status: ${status})` : '';
      console.log(`⚠️ Session ${method} verification failed${statusMsg}`);
    }
  }

  logSessionData(sessionData: any): void {
    console.log('👤 Session data:', {
      hasSession: !!sessionData,
      hasUser: !!sessionData?.user,
      userEmail: sessionData?.user?.email,
      userRole: sessionData?.user?.role
    });
  }

  logRoleCheck(isAdmin: boolean, checkedInDB: boolean = false): void {
    if (isAdmin) {
      const source = checkedInDB ? 'database' : 'session';
      console.log(`✅ User has admin role in ${source}`);
    } else {
      console.log('⚠️ User role is not admin, checking database directly...');
    }
  }

  logAdminAccess(email: string, pathname: string): void {
    console.log(`✅ Admin access granted for ${email} to ${pathname}`);
  }

  logUnauthorized(): void {
    console.log('❌ User is not admin, redirecting to unauthorized');
  }

  logVerificationFailed(): void {
    console.log('❌ Session verification failed completely, redirecting to signin');
  }

  logError(context: string, error: any): void {
    console.error(`❌ ${context}:`, error);
  }
}