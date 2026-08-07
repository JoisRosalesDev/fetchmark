import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticatedUser } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { parseJsonBody, getIdParam } from '../lib/http';

interface UpdateFolderBody {
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

  const id = getIdParam(req);
  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Identificador de carpeta no proporcionado.' }));
    return;
  }

  if (req.method === 'GET') {
    try {
      const folder = await prisma.folder.findFirst({
        where: { id, userId: auth.userId },
        include: { children: true },
      });
      if (!folder) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Carpeta no encontrada.' }));
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(folder));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la carpeta';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al consultar la carpeta.', details: errorMessage }));
    }
    return;
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const existingFolder = await prisma.folder.findFirst({
        where: { id, userId: auth.userId },
      });
      if (!existingFolder) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Carpeta no encontrada.' }));
        return;
      }

      const body = await parseJsonBody<UpdateFolderBody>(req);
      if (!body) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Cuerpo de la petición inválido.' }));
        return;
      }

      if (body.name !== undefined && (!body.name || typeof body.name !== 'string' || !body.name.trim())) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'El nombre de la carpeta no puede estar vacío.' }));
        return;
      }

      let parentId: string | null | undefined = undefined;
      if (body.parentId !== undefined) {
        if (body.parentId && typeof body.parentId === 'string' && body.parentId.trim()) {
          const trimmedParentId = body.parentId.trim();
          if (trimmedParentId === id) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Una carpeta no puede ser su propia carpeta padre.' }));
            return;
          }
          const parentFolder = await prisma.folder.findFirst({
            where: { id: trimmedParentId, userId: auth.userId },
          });
          if (!parentFolder) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'La carpeta padre especificada no existe o no pertenece al usuario.' }));
            return;
          }
          parentId = trimmedParentId;
        } else {
          parentId = null;
        }
      }

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: {
          name: body.name !== undefined ? body.name.trim() : undefined,
          color: body.color !== undefined ? (body.color ? body.color.trim() : null) : undefined,
          icon: body.icon !== undefined ? (body.icon ? body.icon.trim() : null) : undefined,
          parentId,
        },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(updatedFolder));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la carpeta';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al actualizar la carpeta.', details: errorMessage }));
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const existingFolder = await prisma.folder.findFirst({
        where: { id, userId: auth.userId },
      });
      if (!existingFolder) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Carpeta no encontrada.' }));
        return;
      }

      await prisma.folder.delete({
        where: { id },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ message: 'Carpeta eliminada correctamente.' }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la carpeta';
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Error interno al eliminar la carpeta.', details: errorMessage }));
    }
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Método no permitido.' }));
}
