import type { Request, Response } from 'express';

/**
 * ANONYMOUS ANALYTICS — PRIVACY-FIRST
 *
 * The client sends only `{ event }` — no identifiers, no hashes, no cookies.
 * In production the request is forwarded to the Cloudflare analytics worker,
 * which hashes the user's IP at the edge with a daily-rotating salt, dedups it
 * in KV, and never stores the raw IP. The raw IP is also never logged here.
 *
 * Without CLOUDFLARE_ANALYTICS_WORKER_URL the endpoint is a no-op (204),
 * matching the SPA behavior when no analytics endpoint is configured.
 */

const CLOUDFLARE_WORKER_URL = process.env['CLOUDFLARE_ANALYTICS_WORKER_URL'];
const VALID_EVENTS = new Set(['visit', 'export']);

export async function trackEvent(req: Request, res: Response): Promise<void> {
  const { event } = req.body ?? {};

  if (typeof event !== 'string' || !VALID_EVENTS.has(event)) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  if (!CLOUDFLARE_WORKER_URL) {
    res.status(204).end();
    return;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const userAgent = req.headers['user-agent'];
    if (typeof userAgent === 'string') headers['User-Agent'] = userAgent;

    const cfConnectingIp = req.headers['cf-connecting-ip'];
    if (typeof cfConnectingIp === 'string') {
      headers['CF-Connecting-IP'] = cfConnectingIp;
    }

    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/event`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event })
    });

    res.status(response.status).end();
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(204).end();
  }
}
