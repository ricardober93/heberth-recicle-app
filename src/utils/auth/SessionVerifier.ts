import { neon } from '@neondatabase/serverless';
import { SessionData, AUTH_CONFIG } from './types';

export class SessionVerifier {
  private sql = neon(process.env.DATABASE_URL!);

  async verifySession(token: string, request: Request): Promise<SessionData | null> {
    // Try API verification first
    const apiResult = await this.verifyViaAPI(token, request);
    if (apiResult) {
      return apiResult;
    }

    // Fallback to direct DB verification
    return await this.verifyViaDB(token);
  }

  private async verifyViaAPI(token: string, request: Request): Promise<SessionData | null> {
    try {
      const protocol = request.headers.get('x-forwarded-proto') || 
                      (request.headers.get('host')?.includes('localhost') ? 'http' : 'https');
      const host = request.headers.get('host') || 'localhost:3000';
      const baseURL = `${protocol}://${host}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AUTH_CONFIG.SESSION_TIMEOUT);
      
      const response = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: {
          'Cookie': `${AUTH_CONFIG.COOKIE_NAME}=${token}`,
          'User-Agent': 'Middleware/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async verifyViaDB(token: string): Promise<SessionData | null> {
    try {
      const sessionResult = await this.sql`
        SELECT s.id, s."userId", u.email, u.role, s."expiresAt"
        FROM session s
        JOIN "user" u ON s."userId" = u.id
        WHERE s.token = ${token}
        AND s."expiresAt" > NOW()
      `;
      
      if (sessionResult.length > 0) {
        const dbSession = sessionResult[0];
        return {
          user: {
            id: dbSession.userId,
            email: dbSession.email,
            role: dbSession.role
          }
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}