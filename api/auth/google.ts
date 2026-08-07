import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import { serialize } from 'cookie';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }

  const clientId = process.env['GOOGLE_CLIENT_ID'];
  if (!clientId) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'La variable de entorno GOOGLE_CLIENT_ID no está configurada.' }));
    return;
  }

  const host = req.headers.host || 'localhost:4200';
  const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = process.env['APP_URL'] || `${protocol}://${host}`;
  const redirectUri = process.env['GOOGLE_REDIRECT_URI'] || `${appUrl}/api/auth/callback`;

  const state = crypto.randomBytes(16).toString('hex');

  const stateCookie = serialize('fetchmark_oauth_state', state, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
    prompt: 'select_account',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.setHeader('Set-Cookie', stateCookie);
  res.writeHead(302, { Location: googleAuthUrl });
  res.end();
}
