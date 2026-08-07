import type { IncomingMessage, ServerResponse } from 'node:http';
import { parse, serialize } from 'cookie';
import { prisma } from '../lib/prisma';
import { signToken, createSessionCookie } from '../lib/auth';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }

  const host = req.headers.host || 'localhost:4200';
  const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = process.env['APP_URL'] || `${protocol}://${host}`;
  const redirectUri = process.env['GOOGLE_REDIRECT_URI'] || `${appUrl}/api/auth/callback`;

  const reqUrl = new URL(req.url || '', `${protocol}://${host}`);
  const code = reqUrl.searchParams.get('code');
  const state = reqUrl.searchParams.get('state');
  const errorParam = reqUrl.searchParams.get('error');

  if (errorParam) {
    res.writeHead(302, { Location: `${appUrl}/login?error=${encodeURIComponent(errorParam)}` });
    res.end();
    return;
  }

  if (!code) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Código de autorización no proporcionado.' }));
    return;
  }

  const cookieHeader = req.headers.cookie || '';
  const cookies = parse(cookieHeader);
  const savedState = cookies['fetchmark_oauth_state'];

  if (!savedState || !state || savedState !== state) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Estado de OAuth2 inválido o no coincidente.' }));
    return;
  }

  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Configuración OAuth de Google incompleta en el servidor.' }));
    return;
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Fallo al intercambiar el código con Google.', details: errorText }));
      return;
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Fallo al obtener información de usuario de Google.' }));
      return;
    }

    const googleUser = (await userResponse.json()) as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            name: googleUser.name || user.name,
            avatarUrl: googleUser.picture || user.avatarUrl,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            avatarUrl: googleUser.picture || null,
          },
        });
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: googleUser.email,
          name: googleUser.name || user.name,
          avatarUrl: googleUser.picture || user.avatarUrl,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });
    const sessionCookie = createSessionCookie(token);

    const clearStateCookie = serialize('fetchmark_oauth_state', '', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    res.setHeader('Set-Cookie', [sessionCookie, clearStateCookie]);
    res.writeHead(302, { Location: `${appUrl}/dashboard` });
    res.end();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido de autenticación';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Error interno en la autenticación con Google.', details: errorMessage }));
  }
}
