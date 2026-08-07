import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticatedUser } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { parseJsonBody } from '../lib/http';

interface CreateFolderBody {
  name?: string;
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
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
      const folders = await prisma.folder.findMany({
        where: { userId: auth.userId },
        orderBy: { name: 'asc' },
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(folders));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener las carpetas';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al consultar las carpetas.', details: errorMessage }));
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody<CreateFolderBody>(req);
      if (!body || !body.name || typeof body.name !== 'string' || !body.name.trim()) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'El nombre de la carpeta es obligatorio.' }));
        return;
      }

      const parentId = body.parentId && typeof body.parentId === 'string' && body.parentId.trim() ? body.parentId.trim() : null;

      if (parentId) {
        const parentFolder = await prisma.folder.findFirst({
          where: { id: parentId, userId: auth.userId },
        });
        if (!parentFolder) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'La carpeta padre especificada no existe o no pertenece al usuario.' }));
          return;
        }
      }

      const folder = await prisma.folder.create({
        data: {
          name: body.name.trim(),
          color: body.color && typeof body.color === 'string' ? body.color.trim() : null,
          icon: body.icon && typeof body.icon === 'string' ? body.icon.trim() : null,
          parentId,
          userId: auth.userId,
        },
      });

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(folder));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la carpeta';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al crear la carpeta.', details: errorMessage }));
    }
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Método no permitido.' }));
}
