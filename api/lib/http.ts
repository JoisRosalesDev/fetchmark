import type { IncomingMessage } from 'node:http';

export async function parseJsonBody<T>(req: IncomingMessage): Promise<T | null> {
  const reqRecord = req as Record<string, unknown>;
  if (reqRecord['body'] !== undefined && reqRecord['body'] !== null) {
    const body = reqRecord['body'];
    if (typeof body === 'object') {
      return body as T;
    }
    if (typeof body === 'string') {
      try {
        return JSON.parse(body) as T;
      } catch {
        return null;
      }
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer | string) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data.trim()) {
        return resolve(null);
      }
      try {
        resolve(JSON.parse(data) as T);
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

export function getIdParam(req: IncomingMessage): string | null {
  const reqRecord = req as Record<string, unknown>;
  if (reqRecord['query'] && typeof reqRecord['query'] === 'object') {
    const query = reqRecord['query'] as Record<string, string | string[]>;
    if (query['id']) {
      return Array.isArray(query['id']) ? query['id'][0] : query['id'];
    }
  }
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '', `http://${host}`);
  const segments = url.pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && lastSegment !== 'folders' && lastSegment !== 'bookmarks') {
    return lastSegment;
  }
  return null;
}

export function getQueryParam(req: IncomingMessage, paramName: string): string | null {
  const reqRecord = req as Record<string, unknown>;
  if (reqRecord['query'] && typeof reqRecord['query'] === 'object') {
    const query = reqRecord['query'] as Record<string, string | string[]>;
    const val = query[paramName];
    if (val !== undefined) {
      return Array.isArray(val) ? val[0] : val;
    }
  }
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '', `http://${host}`);
  return url.searchParams.get(paramName);
}
