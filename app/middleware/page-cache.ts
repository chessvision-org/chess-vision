import type { NextFunction, Request, Response } from 'express';

const TTL_MS = 10_000;
const MAX_ENTRIES = 64;

interface CacheEntry {
  html: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function shouldCache(req: Request): boolean {
  if (req.method !== 'GET') return false;
  if (req.path === '/health') return false;
  if (req.path.startsWith('/auth')) return false;
  if (req.headers.cookie) return false;
  if (req.path.includes('.')) return false;
  return true;
}

export const pageCache: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = (req, res, next) => {
  if (!shouldCache(req)) return next();

  const key = req.originalUrl;

  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    res.set('Cache-Control', 'no-cache');
    res.set('X-Cache', 'hit');
    res.type('html').send(hit.html);
    return;
  }

  const originalSend = res.send.bind(res);
  let buffered = false;
  let buffer = '';

  res.send = ((body: unknown): Response => {
    if (
      res.statusCode === 200 &&
      typeof body === 'string' &&
      !req.headers.cookie
    ) {
      buffer = body;
      buffered = true;
    }
    return originalSend(body);
  }) as Response['send'];

  res.on('finish', () => {
    if (buffered && res.statusCode === 200) {
      if (cache.size >= MAX_ENTRIES) {
        const now = Date.now();
        for (const [k, v] of cache) {
          if (v.expiresAt < now) cache.delete(k);
        }
        if (cache.size >= MAX_ENTRIES) {
          let removed = 0;
          for (const k of cache.keys()) {
            if (removed++ >= 8) break;
            cache.delete(k);
          }
        }
      }
      cache.set(key, { html: buffer, expiresAt: Date.now() + TTL_MS });
    }
  });

  next();
};
