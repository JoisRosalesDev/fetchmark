import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticatedUser } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { parseJsonBody, getIdParam } from '../lib/http';

interface UpdateBookmarkBody {
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

  const id = getIdParam(req);
  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Identificador de marcador no proporcionado.' }));
    return;
  }

  if (req.method === 'GET') {
    try {
      const bookmark = await prisma.bookmark.findFirst({
        where: { id, userId: auth.userId },
      });
      if (!bookmark) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Marcador no encontrado.' }));
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(bookmark));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener marcador';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al consultar el marcador.', details: errorMessage }));
    }
    return;
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const existingBookmark = await prisma.bookmark.findFirst({
        where: { id, userId: auth.userId },
      });
      if (!existingBookmark) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Marcador no encontrado.' }));
        return;
      }

      const body = await parseJsonBody<UpdateBookmarkBody>(req);
      if (!body) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Cuerpo de la petición inválido.' }));
        return;
      }

      let url: string | undefined = undefined;
      if (body.url !== undefined) {
        const trimmedUrl = body.url ? body.url.trim() : '';
        if (!trimmedUrl || (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://'))) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'URL no válida. Debe comenzar con http:// o https://.' }));
          return;
        }
        try {
          new URL(trimmedUrl);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'URL no válida. Debe comenzar con http:// o https://.' }));
          return;
        }
        url = trimmedUrl;
      }

      let title: string | undefined = undefined;
      if (body.title !== undefined) {
        const trimmedTitle = body.title ? body.title.trim() : '';
        if (!trimmedTitle) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'El título del marcador no puede estar vacío.' }));
          return;
        }
        title = trimmedTitle;
      }

      let folderId: string | null | undefined = undefined;
      if (body.folderId !== undefined) {
        if (body.folderId && typeof body.folderId === 'string' && body.folderId.trim()) {
          const trimmedFolderId = body.folderId.trim();
          const folder = await prisma.folder.findFirst({
            where: { id: trimmedFolderId, userId: auth.userId },
          });
          if (!folder) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'La carpeta especificada no existe o no pertenece al usuario.' }));
            return;
          }
          folderId = trimmedFolderId;
        } else {
          folderId = null;
        }
      }

      const updatedBookmark = await prisma.bookmark.update({
        where: { id },
        data: {
          url,
          title,
          description: body.description !== undefined ? (body.description ? body.description.trim() : null) : undefined,
          ogImage: body.ogImage !== undefined ? (body.ogImage ? body.ogImage.trim() : null) : undefined,
          favicon: body.favicon !== undefined ? (body.favicon ? body.favicon.trim() : null) : undefined,
          folderId,
        },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(updatedBookmark));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el marcador';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al actualizar el marcador.', details: errorMessage }));
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const existingBookmark = await prisma.bookmark.findFirst({
        where: { id, userId: auth.userId },
      });
      if (!existingBookmark) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Marcador no encontrado.' }));
        return;
      }

      await prisma.bookmark.delete({
        where: { id },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ message: 'Marcador eliminado correctamente.' }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el marcador';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al eliminar el marcador.', details: errorMessage }));
    }
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Método no permitido.' }));
}
