import { invokeProtected } from './protectedFunctions';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          execution?: 'render' | 'execute';
          appearance?: 'always' | 'execute' | 'interaction-only';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

// Constants
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit';
const CONTAINER_ID = 'cv-turnstile-container';

// State
let scriptPromise: Promise<void> | null = null;
let widgetId: string | null = null;
let pendingResolve: ((token: string | null) => void) | null = null;
let verifiedLocally = false;

// Helpers
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    window.onloadTurnstileCallback = () => resolve();
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function ensureContainer(): HTMLElement {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    el.style.position = 'fixed';
    el.style.bottom = '12px';
    el.style.left = '12px';
    el.style.zIndex = '2147483647';
    document.body.appendChild(el);
  }
  return el;
}

async function ensureWidget(): Promise<string> {
  await loadScript();
  if (widgetId) return widgetId;

  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!sitekey) throw new Error('Turnstile site key is not configured');

  widgetId = window.turnstile!.render(ensureContainer(), {
    sitekey,
    execution: 'execute',
    appearance: 'interaction-only',
    callback: (token) => {
      pendingResolve?.(token);
      pendingResolve = null;
    },
    'error-callback': () => {
      pendingResolve?.(null);
      pendingResolve = null;
    },
    'expired-callback': () => {
      pendingResolve?.(null);
      pendingResolve = null;
    }
  });
  return widgetId;
}

// Service
export async function verifyHuman(): Promise<boolean> {
  if (verifiedLocally) return true;

  try {
    const id = await ensureWidget();
    window.turnstile!.reset(id);

    const token = await new Promise<string | null>((resolve) => {
      pendingResolve = resolve;
      window.turnstile!.execute(id);
    });
    if (!token) return false;

    const { data, error } = await invokeProtected<{ verified: boolean }>(
      'verify-human',
      { token }
    );

    const ok = !error && data?.verified === true;
    if (ok) verifiedLocally = true;
    return ok;
  } catch {
    return false;
  }
}
