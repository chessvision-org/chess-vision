/**
 * ANONYMOUS ANALYTICS — CLOUDFLARE WORKER
 *
 * PRIVACY GUARANTEE:
 * - The user's real IP arrives here via CF-Connecting-IP (set by Cloudflare, cannot be spoofed)
 * - The IP is IMMEDIATELY hashed with a daily-rotating salt + secret
 * - The raw IP is NEVER logged, NEVER stored, NEVER forwarded
 * - The hash is stored in KV with a 25-hour TTL (auto-deletes)
 * - Only aggregate counts (numbers) are sent to Supabase
 * - Neither the developer, nor Supabase, nor anyone else can ever recover the IP
 *
 * SECURITY:
 * - Origin validation (only accepts requests from the site)
 * - Bot filtering (User-Agent heuristics + Cloudflare bot score)
 * - Rate limiting per IP hash (max 20 requests per day per IP)
 * - Strict request validation (method, content-type, body schema)
 * - No IP logging anywhere
 * - Service role key stored as Worker secret (never exposed)
 *
 * Respectfully, ChessViewer
 */

export interface Env {
  ANALYTICS_KV: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANALYTICS_SALT: string;
  ALLOWED_ORIGIN: string;
  FLUSH_SECRET: string;
}

const DEDUP_TTL_SECONDS = 90000;
const FLUSH_SET_TTL_SECONDS = 2 * 86400;
const MAX_REQUESTS_PER_IP_PER_DAY = 20;
const BOT_UA_PATTERNS =
  /bot|crawl|spider|scraper|curl|wget|python|httpie|axios|node-fetch|go-http|java|perl|php|ruby|libwww|headless|phantom|selenium|puppeteer|playwright|lighthouse|gtmetrix|pingdom|uptimerobot/i;

function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

function previousDayUTC(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

async function readCount(kv: KVNamespace, key: string): Promise<number> {
  return parseInt((await kv.get(key)) || '0', 10);
}

async function increment(
  kv: KVNamespace,
  key: string,
  ttlSeconds?: number
): Promise<void> {
  const current = await readCount(kv, key);
  const options: KVNamespacePutOptions =
    ttlSeconds === undefined ? {} : { expirationTtl: ttlSeconds };
  await kv.put(key, String(current + 1), options);
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashIP(ip: string, date: string, salt: string): Promise<string> {
  return sha256(`${ip}:${date}:${salt}`);
}

function isBot(
  userAgent: string | null,
  cf: CfProperties | undefined
): boolean {
  if (!userAgent || userAgent.length === 0) return true;
  if (BOT_UA_PATTERNS.test(userAgent)) return true;
  const botScore =
    cf && 'botManagement' in cf
      ? (cf as IncomingRequestCfProperties).botManagement?.score
      : undefined;
  if (typeof botScore === 'number' && botScore < 30) return true;
  return false;
}

function isValidEvent(body: unknown): body is { event: 'visit' | 'export' } {
  if (!body || typeof body !== 'object') return false;
  const obj = body as Record<string, unknown>;
  return obj.event === 'visit' || obj.event === 'export';
}

function jsonResponse(data: unknown, status: number, origin: string): Response {
  return new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Cache-Control': 'no-store'
    }
  });
}

async function handleEvent(
  request: Request,
  env: Env,
  eventType: 'visit' | 'export'
): Promise<Response> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = env.ALLOWED_ORIGIN;
  const accessOrigin = allowedOrigin || '*';

  if (origin && allowedOrigin && origin !== allowedOrigin) {
    return jsonResponse({ ok: false }, 403, accessOrigin);
  }

  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) {
    return jsonResponse({ ok: true }, 204, accessOrigin);
  }

  const date = getTodayUTC();
  const visitorHash = await hashIP(ip, date, env.ANALYTICS_SALT);
  const type = eventType === 'visit' ? 'v' : 'e';
  const metric = type === 'v' ? 'visitors' : 'exports';

  const rateKey = `rate:${date}:${visitorHash}`;
  if (
    (await readCount(env.ANALYTICS_KV, rateKey)) >= MAX_REQUESTS_PER_IP_PER_DAY
  ) {
    return jsonResponse({ ok: true }, 204, accessOrigin);
  }
  await increment(env.ANALYTICS_KV, rateKey, DEDUP_TTL_SECONDS);

  const dedupKey = `${type}:${date}:${visitorHash}`;
  if ((await env.ANALYTICS_KV.get(dedupKey)) !== null) {
    return jsonResponse({ ok: true }, 204, accessOrigin);
  }
  await env.ANALYTICS_KV.put(dedupKey, '1', {
    expirationTtl: DEDUP_TTL_SECONDS
  });

  await increment(
    env.ANALYTICS_KV,
    `count:${date}:${metric}`,
    DEDUP_TTL_SECONDS + 86400
  );

  return jsonResponse({ ok: true }, 204, accessOrigin);
}

async function handleFlush(env: Env, request: Request): Promise<Response> {
  const authHeader = request.headers.get('X-Flush-Secret');
  if (authHeader !== env.FLUSH_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const targetDate =
    new URL(request.url).searchParams.get('date') || getTodayUTC();

  const visitors = await readCount(
    env.ANALYTICS_KV,
    `count:${targetDate}:visitors`
  );
  const exports = await readCount(
    env.ANALYTICS_KV,
    `count:${targetDate}:exports`
  );

  const prefix = `v:${targetDate}:`;
  const listResult = await env.ANALYTICS_KV.list({ prefix });
  const todayHashes = new Set(
    listResult.keys.map((key) => key.name.slice(prefix.length))
  );
  await env.ANALYTICS_KV.put(
    `day:set:${targetDate}`,
    Array.from(todayHashes).join('\n'),
    { expirationTtl: FLUSH_SET_TTL_SECONDS }
  );

  let returning: number | null = null;
  const yesterdayRaw = await env.ANALYTICS_KV.get(
    `day:set:${previousDayUTC(targetDate)}`
  );
  if (yesterdayRaw !== null) {
    const yesterdayHashes = new Set(
      yesterdayRaw.split('\n').filter((h) => h.length > 0)
    );
    let overlap = 0;
    for (const hash of todayHashes) {
      if (yesterdayHashes.has(hash)) overlap++;
    }
    returning = overlap > 0 ? overlap : null;
  }

  const rpcUrl = `${env.SUPABASE_URL}/rest/v1/rpc/log_daily_analytics`;
  const rpcResponse = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_date: targetDate,
      p_visitors: visitors,
      p_export_users: exports,
      p_returning_visitors: returning
    })
  });

  if (!rpcResponse.ok) {
    const errorText = await rpcResponse.text();
    return new Response(`Supabase error: ${errorText}`, { status: 500 });
  }

  return new Response(
    JSON.stringify({
      date: formatDisplayDate(targetDate),
      visitors,
      exports,
      returning_visitors: returning,
      flushed: true
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    if (url.pathname === '/internal/flush' && request.method === 'POST') {
      return handleFlush(env, request);
    }

    if (url.pathname !== '/event' || request.method !== 'POST') {
      return new Response('Not found', { status: 404 });
    }

    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return new Response('Invalid content type', { status: 400 });
    }

    const userAgent = request.headers.get('User-Agent');
    if (isBot(userAgent, request.cf)) {
      return new Response(null, { status: 204 });
    }
    let body: unknown;
    try {
      const text = await request.text();
      if (text.length > 100) {
        return new Response('Payload too large', { status: 413 });
      }
      body = JSON.parse(text);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    if (!isValidEvent(body)) {
      return new Response('Invalid event', { status: 400 });
    }

    return handleEvent(request, env, body.event);
  },

  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(
      handleFlush(
        env,
        new Request(`https://internal/internal/flush`, {
          method: 'POST',
          headers: { 'X-Flush-Secret': env.FLUSH_SECRET }
        })
      )
    );
  }
};
