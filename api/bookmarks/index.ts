import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticatedUser } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { parseJsonBody, getQueryParam } from '../lib/http';

interface CreateBookmarkBody {
  title?: string;
  url?: string;
  description?: string | null;
  ogImage?: string | null;
  favicon?: string | null;
  folderId?: string | null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const auth = authenticatedUser(req);
  if (!auth) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'No autenticado. Por favor inicie sesión.' }));
    return;
  }

  if (req.method === 'GET') {
    try {
      const rawFolderId = getQueryParam(req, 'folderId');
      const searchQuery = getQueryParam(req, 'query')?.trim();

      let folderIdFilter: { folderId?: string | null } = {};
      if (rawFolderId !== null && rawFolderId !== undefined) {
        if (rawFolderId === 'null' || rawFolderId === 'root' || rawFolderId === 'uncategorized' || rawFolderId === '') {
          folderIdFilter = { folderId: null };
        } else {
          folderIdFilter = { folderId: rawFolderId };
        }
      }

      const bookmarks = await prisma.bookmark.findMany({
        where: {
          userId: auth.userId,
          ...folderIdFilter,
          ...(searchQuery
            ? {
                OR: [
                  { title: { contains: searchQuery, mode: 'insensitive' } },
                  { description: { contains: searchQuery, mode: 'insensitive' } },
                  { url: { contains: searchQuery, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(bookmarks));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener marcadores';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al consultar los marcadores.', details: errorMessage }));
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody<CreateBookmarkBody>(req);
      if (!body) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Cuerpo de la petición inválido.' }));
        return;
      }

      const url = body.url?.trim();
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'URL no válida. Debe comenzar con http:// o https://.' }));
        return;
      }

      try {
        new URL(url);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'URL no válida. Debe comenzar con http:// o https://.' }));
        return;
      }

      const title = body.title?.trim();
      if (!title) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'El título del marcador es obligatorio.' }));
        return;
      }

      const folderId = body.folderId && typeof body.folderId === 'string' && body.folderId.trim() ? body.folderId.trim() : null;

      if (folderId) {
        const folder = await prisma.folder.findFirst({
          where: { id: folderId, userId: auth.userId },
        });
        if (!folder) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'La carpeta especificada no existe o no pertenece al usuario.' }));
          return;
        }
      }

      const bookmark = await prisma.bookmark.create({
        data: {
          title,
          url,
          description: body.description && typeof body.description === 'string' ? body.description.trim() : null,
          ogImage: body.ogImage && typeof body.ogImage === 'string' ? body.ogImage.trim() : null,
          favicon: body.favicon && typeof body.favicon === 'string' ? body.favicon.trim() : null,
          folderId,
          userId: auth.userId,
        },
      });

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(bookmark));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear marcador';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al crear el marcador.', details: errorMessage }));
    }
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Método no permitido.' }));
}
