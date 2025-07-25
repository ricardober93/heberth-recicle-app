export interface SessionData {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export class AuthError extends Error {
  constructor(message: string, public redirectTo: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_CONFIG = {
  SESSION_TIMEOUT: 5000,
  COOKIE_NAME: 'better-auth.session_token',
  ROUTES: {
    SIGNIN: '/auth/signin',
    UNAUTHORIZED: '/unauthorized'
  }
} as const;