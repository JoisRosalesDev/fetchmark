import type { IncomingMessage, ServerResponse } from 'node:http';
import { authenticatedUser } from '../lib/auth';
import { parseJsonBody } from '../lib/http';
import { scrapeMetadata } from '../lib/scraper';

interface ScrapeRequestBody {
  url?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }

  const auth = authenticatedUser(req);
  if (!auth) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'No autenticado. Por favor inicie sesión.' }));
    return;
  }

  try {
    const body = await parseJsonBody<ScrapeRequestBody>(req);
    const targetUrl = body?.url?.trim();

    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Se requiere una URL válida con protocolo HTTP o HTTPS.' }));
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Se requiere una URL válida con protocolo HTTP o HTTPS.' }));
      return;
    }

    const metadata = await scrapeMetadata(targetUrl);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(metadata));
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error al extraer metadatos de la URL';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Error interno al procesar el enlace.', details: errorMessage }));
  }
}
