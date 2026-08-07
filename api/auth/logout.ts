import type { IncomingMessage, ServerResponse } from 'node:http';
import { createLogoutCookie } from '../lib/auth';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }

  const logoutCookie = createLogoutCookie();
  res.setHeader('Set-Cookie', logoutCookie);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ message: 'Sesión cerrada exitosamente.' }));
}
