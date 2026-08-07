import express, { Request, Response } from 'express';
import crypto from 'node:crypto';
import { parse, serialize } from 'cookie';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

const COOKIE_NAME = 'fetchmark_session';

interface AuthPayload {
  userId: string;
  email: string;
}

function signToken(payload: AuthPayload): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('La variable de entorno JWT_SECRET no está configurada.');
  }
  const expiresIn = process.env['JWT_EXPIRES_IN'] || '7d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

function verifyToken(token: string): AuthPayload | null {
  const secret = process.env['JWT_SECRET'];
  if (!secret) return null;
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

function parseCookies(req: Request): Record<string, string | undefined> {
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === 'string') {
    return parse(cookieHeader);
  }
  return {};
}

function getAuthenticatedUser(req: Request): AuthPayload | null {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

function createSessionCookie(token: string): string {
  const isProduction = process.env['NODE_ENV'] === 'production';
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

function createLogoutCookie(): string {
  const isProduction = process.env['NODE_ENV'] === 'production';
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

async function scrapeMetadata(targetUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const fallbackTitle = targetUrl.replace(/^https?:\/\//i, '').split('/')[0] || targetUrl;
  const fallbackResult = {
    title: fallbackTitle,
    description: null,
    ogImage: null,
    favicon: null,
  };

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallbackResult;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      fallbackTitle;

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      null;

    let ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      null;

    if (ogImage && !ogImage.startsWith('http://') && !ogImage.startsWith('https://')) {
      try {
        ogImage = new URL(ogImage, targetUrl).href;
      } catch {
        ogImage = null;
      }
    }

    let favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      null;

    if (favicon) {
      if (!favicon.startsWith('http://') && !favicon.startsWith('https://')) {
        try {
          favicon = new URL(favicon, targetUrl).href;
        } catch {
          favicon = null;
        }
      }
    } else {
      try {
        const parsedUrl = new URL(targetUrl);
        favicon = `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;
      } catch {
        favicon = null;
      }
    }

    return {
      title,
      description: description ? description.trim() : null,
      ogImage,
      favicon,
    };
  } catch {
    clearTimeout(timeoutId);
    return fallbackResult;
  }
}

app.get('/api/auth/google', (req: Request, res: Response) => {
  const clientId = process.env['GOOGLE_CLIENT_ID'];
  if (!clientId) {
    res.status(500).json({ error: 'La variable de entorno GOOGLE_CLIENT_ID no está configurada.' });
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
  res.redirect(googleAuthUrl);
});

app.get('/api/auth/callback', async (req: Request, res: Response) => {
  const host = req.headers.host || 'localhost:4200';
  const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = process.env['APP_URL'] || `${protocol}://${host}`;
  const redirectUri = process.env['GOOGLE_REDIRECT_URI'] || `${appUrl}/api/auth/callback`;

  const code = req.query['code'] as string | undefined;
  const state = req.query['state'] as string | undefined;
  const errorParam = req.query['error'] as string | undefined;

  if (errorParam) {
    res.redirect(`${appUrl}/login?error=${encodeURIComponent(errorParam)}`);
    return;
  }

  if (!code) {
    res.status(400).json({ error: 'Código de autorización no proporcionado.' });
    return;
  }

  const cookies = parseCookies(req);
  const savedState = cookies['fetchmark_oauth_state'];

  if (!savedState || !state || savedState !== state) {
    res.status(400).json({ error: 'Estado de OAuth2 inválido o no coincidente.' });
    return;
  }

  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'Configuración OAuth de Google incompleta en el servidor.' });
    return;
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
      res.status(400).json({ error: 'Fallo al intercambiar el código con Google.', details: errorText });
      return;
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      res.status(400).json({ error: 'Fallo al obtener información de usuario de Google.' });
      return;
    }

    const googleUser = (await userResponse.json()) as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    let user = await prisma.user.findUnique({ where: { googleId: googleUser.id } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: googleUser.email } });
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
    res.redirect(`${appUrl}/dashboard`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido de autenticación';
    res.status(500).json({ error: 'Error interno en la autenticación con Google.', details: message });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado o sesión inválida.' });
      return;
    }

    res.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar usuario';
    res.status(500).json({ error: 'Error interno del servidor.', details: message });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const logoutCookie = createLogoutCookie();
  res.setHeader('Set-Cookie', logoutCookie);
  res.json({ message: 'Sesión cerrada exitosamente.' });
});

app.get('/api/folders', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  try {
    const folders = await prisma.folder.findMany({
      where: { userId: auth.userId },
      orderBy: { name: 'asc' },
    });
    res.json(folders);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar carpetas';
    res.status(500).json({ error: 'Error al consultar las carpetas.', details: message });
  }
});

app.post('/api/folders', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const { name, color, icon, parentId } = req.body || {};
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'El nombre de la carpeta es obligatorio.' });
    return;
  }

  if (parentId) {
    const parentFolder = await prisma.folder.findFirst({
      where: { id: parentId, userId: auth.userId },
    });
    if (!parentFolder) {
      res.status(404).json({ error: 'La carpeta padre especificada no existe o no le pertenece.' });
      return;
    }
  }

  try {
    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        icon: icon || 'folder',
        parentId: parentId || null,
        userId: auth.userId,
      },
    });
    res.status(201).json(folder);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear carpeta';
    res.status(500).json({ error: 'Error al guardar la nueva carpeta.', details: message });
  }
});

app.get('/api/folders/:id', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const id = req.params['id'] || (req.query['id'] as string);
  const folder = await prisma.folder.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!folder) {
    res.status(404).json({ error: 'Carpeta no encontrada o no le pertenece.' });
    return;
  }

  res.json(folder);
});

app.put('/api/folders/:id', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const id = req.params['id'] || (req.query['id'] as string);
  const { name, color, icon, parentId } = req.body || {};

  const existingFolder = await prisma.folder.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existingFolder) {
    res.status(404).json({ error: 'Carpeta no encontrada o no le pertenece.' });
    return;
  }

  if (parentId) {
    if (parentId === id) {
      res.status(400).json({ error: 'Una carpeta no puede ser padre de sí misma.' });
      return;
    }
    const parentFolder = await prisma.folder.findFirst({
      where: { id: parentId, userId: auth.userId },
    });
    if (!parentFolder) {
      res.status(404).json({ error: 'La carpeta padre especificada no existe o no le pertenece.' });
      return;
    }
  }

  try {
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingFolder.name,
        color: color !== undefined ? color : existingFolder.color,
        icon: icon !== undefined ? icon : existingFolder.icon,
        parentId: parentId !== undefined ? parentId : existingFolder.parentId,
      },
    });
    res.json(updatedFolder);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar carpeta';
    res.status(500).json({ error: 'Error al actualizar la carpeta.', details: message });
  }
});

app.delete('/api/folders/:id', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const id = req.params['id'] || (req.query['id'] as string);
  const existingFolder = await prisma.folder.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existingFolder) {
    res.status(404).json({ error: 'Carpeta no encontrada o no le pertenece.' });
    return;
  }

  try {
    await prisma.folder.delete({ where: { id } });
    res.json({ message: 'Carpeta eliminada exitosamente.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar carpeta';
    res.status(500).json({ error: 'Error al eliminar la carpeta.', details: message });
  }
});

app.post('/api/bookmarks/scrape', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const { url } = req.body || {};
  if (!url) {
    res.status(400).json({ error: 'La URL a extraer es obligatoria.' });
    return;
  }

  try {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const metadata = await scrapeMetadata(formattedUrl);
    res.json(metadata);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en scraping';
    res.status(500).json({ error: 'Fallo al extraer metadatos de la URL.', details: message });
  }
});

app.get('/api/bookmarks', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const folderId = req.query['folderId'] as string | undefined;
  const query = req.query['query'] as string | undefined;

  const whereCondition: Record<string, unknown> = {
    userId: auth.userId,
  };

  if (folderId) {
    whereCondition['folderId'] = folderId === 'null' ? null : folderId;
  }

  if (query && query.trim()) {
    const q = query.trim();
    whereCondition['OR'] = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { url: { contains: q, mode: 'insensitive' } },
    ];
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookmarks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar marcadores';
    res.status(500).json({ error: 'Error al consultar los marcadores.', details: message });
  }
});

app.post('/api/bookmarks', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const { title, url, description, ogImage, favicon, folderId } = req.body || {};
  if (!url || !title) {
    res.status(400).json({ error: 'El título y la URL del marcador son obligatorios.' });
    return;
  }

  let validUrl = url.trim();
  if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
    validUrl = `https://${validUrl}`;
  }

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: auth.userId },
    });
    if (!folder) {
      res.status(404).json({ error: 'La carpeta especificada no existe o no le pertenece.' });
      return;
    }
  }

  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        title: title.trim(),
        url: validUrl,
        description: description || null,
        ogImage: ogImage || null,
        favicon: favicon || null,
        folderId: folderId || null,
        userId: auth.userId,
      },
    });
    res.status(201).json(bookmark);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear marcador';
    res.status(500).json({ error: 'Error al guardar el nuevo marcador.', details: message });
  }
});

app.get('/api/bookmarks/:id', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const id = req.params['id'] || (req.query['id'] as string);
  const bookmark = await prisma.bookmark.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!bookmark) {
    res.status(404).json({ error: 'Marcador no encontrado o no le pertenece.' });
    return;
  }

  res.json(bookmark);
});

app.put('/api/bookmarks/:id', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const id = req.params['id'] || (req.query['id'] as string);
  const { title, url, description, ogImage, favicon, folderId } = req.body || {};

  const existingBookmark = await prisma.bookmark.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existingBookmark) {
    res.status(404).json({ error: 'Marcador no encontrado o no le pertenece.' });
    return;
  }

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: auth.userId },
    });
    if (!folder) {
      res.status(404).json({ error: 'La carpeta especificada no existe o no le pertenece.' });
      return;
    }
  }

  try {
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingBookmark.title,
        url: url !== undefined ? url.trim() : existingBookmark.url,
        description: description !== undefined ? description : existingBookmark.description,
        ogImage: ogImage !== undefined ? ogImage : existingBookmark.ogImage,
        favicon: favicon !== undefined ? favicon : existingBookmark.favicon,
        folderId: folderId !== undefined ? folderId : existingBookmark.folderId,
      },
    });
    res.json(updatedBookmark);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar marcador';
    res.status(500).json({ error: 'Error al actualizar el marcador.', details: message });
  }
});

app.delete('/api/bookmarks/:id', async (req: Request, res: Response) => {
  const auth = getAuthenticatedUser(req);
  if (!auth) {
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    return;
  }

  const id = req.params['id'] || (req.query['id'] as string);
  const existingBookmark = await prisma.bookmark.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!existingBookmark) {
    res.status(404).json({ error: 'Marcador no encontrado o no le pertenece.' });
    return;
  }

  try {
    await prisma.bookmark.delete({ where: { id } });
    res.json({ message: 'Marcador eliminado exitosamente.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar marcador';
    res.status(500).json({ error: 'Error al eliminar el marcador.', details: message });
  }
});

export default app;
