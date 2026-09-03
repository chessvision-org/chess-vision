import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0';
import {
  getClientIp,
  hashIp,
  isFromTrustedProxy,
  markIpVerified
} from '../_shared/ipGate.ts';

// Constants
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Helpers
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

async function verifyTurnstileToken(
  token: string,
  ip: string | null
): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return false;
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('Turnstile siteverify request failed:', err);
    return false;
  }
}

// Handler
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }
  if (!isFromTrustedProxy(req)) {
    return json({ error: 'forbidden' }, 403);
  }

  let token = '';
  try {
    const body = await req.json();
    token = typeof body?.token === 'string' ? body.token : '';
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  if (!token) {
    return json({ error: 'missing_token' }, 400);
  }

  const ip = getClientIp(req);
  if (!ip) {
    return json({ verified: false, error: 'no_ip' }, 400);
  }

  const passed = await verifyTurnstileToken(token, ip);
  if (!passed) {
    return json({ verified: false, error: 'challenge_failed' }, 403);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  const ipHash = await hashIp(ip);
  await markIpVerified(supabase, ipHash, req.headers.get('user-agent'));

  return json({ verified: true });
});
