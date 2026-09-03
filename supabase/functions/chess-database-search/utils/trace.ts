const DEBUG = (Deno.env.get('DB_SEARCH_DEBUG') ?? '') === '1';

export function trace(scope: string, ...parts: unknown[]): void {
  if (!DEBUG) return;
  const msg = parts
    .map((p) => (typeof p === 'object' ? JSON.stringify(p) : String(p)))
    .join(' ');
  console.log(`[DBSEARCH:${scope}] ${msg}`);
}
