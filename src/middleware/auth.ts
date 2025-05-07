import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

export function authMiddleware(handler: (req) => Promise<NextResponse>) {
  return async (req) => {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return handler(req);
    } catch (err) {
      console.error(err);
      return new NextResponse('Token inválido', { status: 403 });
      
    }
  };
}