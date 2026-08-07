import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';
import type { IncomingMessage } from 'node:http';

export interface AuthPayload {
  userId: string;
  email: string;
}

export const COOKIE_NAME = 'fetchmark_session';

export function signToken(payload: AuthPayload): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('La variable de entorno JWT_SECRET no está configurada.');
  }
  const expiresIn = process.env['JWT_EXPIRES_IN'] || '7d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): AuthPayload | null {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    if (decoded && decoded.userId && decoded.email) {
      return { userId: decoded.userId, email: decoded.email };
    }
    return null;
  } catch {
    return null;
  }
}

export function parseCookies(req: IncomingMessage | { headers: Record<string, string | string[] | undefined> }): Record<string, string | undefined> {
  const cookieHeader = req.headers.cookie || req.headers['cookie'];
  if (typeof cookieHeader === 'string') {
    return parse(cookieHeader);
  }
  return {};
}

export function authenticatedUser(req: IncomingMessage | { headers: Record<string, string | string[] | undefined> }): AuthPayload | null {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function createSessionCookie(token: string): string {
  const isProduction = process.env['NODE_ENV'] === 'production';
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function createLogoutCookie(): string {
  const isProduction = process.env['NODE_ENV'] === 'production';
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
