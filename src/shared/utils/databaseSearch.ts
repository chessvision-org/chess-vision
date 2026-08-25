import { supabase } from '@/auth';

import { validateFEN } from '@chessviewer-org/chess-viewer';

// Types
export type DatabaseProvider = 'yacpdb' | 'lichess' | 'chessdb';

export const PROVIDER_LABEL: Record<DatabaseProvider, string> = {
  yacpdb: 'YACPDB',
  lichess: 'Lichess',
  chessdb: 'ChessDB'
};

interface DatabaseHit {
  found: boolean;
  url: string;
}

export type DatabaseSearchResult = Record<DatabaseProvider, DatabaseHit>;

interface EdgeProviderHit {
  found: boolean;
  url: string;
}

type EdgeSearchResponse = Record<DatabaseProvider, EdgeProviderHit>;

const PROVIDERS: readonly DatabaseProvider[] = ['lichess', 'chessdb', 'yacpdb'];

// Helpers
function isEdgeProviderHit(value: unknown): value is EdgeProviderHit {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v['found'] === 'boolean' && typeof v['url'] === 'string';
}

function isEdgeSearchResponse(value: unknown): value is EdgeSearchResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return PROVIDERS.every((p) => isEdgeProviderHit(v[p]));
}

function boardField(fen: string): string {
  return fen.trim().split(/\s+/)[0] ?? '';
}

const YAC_TEXT_FIELDS = 14;
const YAC_CHECKBOX_DEFAULTS = ['1', '1', '1', '0'];

function yacEscapeAndJoin(parts: string[]): string {
  return parts
    .map((p) => p.replace(/\\/g, '\\\\').replace(/\//g, '\\/'))
    .join('/');
}

function yacB64(s: string): string {
  const bytes = unescape(encodeURIComponent(s));
  return btoa(bytes).replace(/\//g, '*');
}

function buildYacpdbUrl(fen: string): string {
  const parts = new Array<string>(YAC_TEXT_FIELDS).fill('');
  parts[0] = boardField(fen);
  const encoded = yacB64(
    yacEscapeAndJoin([...parts, ...YAC_CHECKBOX_DEFAULTS])
  );
  return `https://www.yacpdb.org/#search/${encoded}/1`;
}

function buildLichessUrl(fen: string): string {
  const path = fen
    .trim()
    .split(' ')
    .map((seg) => seg.split('/').map(encodeURIComponent).join('/'))
    .join('_');
  return `https://lichess.org/analysis/standard/${path}`;
}

function buildChessdbUrl(fen: string): string {
  const query = fen.trim().replace(/ /g, '_');
  return `https://www.chessdb.cn/queryc_en/?${query}`;
}

function notFound(fen: string): DatabaseSearchResult {
  return {
    lichess: { found: false, url: buildLichessUrl(fen) },
    chessdb: { found: false, url: buildChessdbUrl(fen) },
    yacpdb: { found: false, url: buildYacpdbUrl(fen) }
  };
}

// Service
export async function searchPositionDatabases(
  fen: string,
  signal?: AbortSignal
): Promise<DatabaseSearchResult> {
  if (!fen || !validateFEN(fen)) return notFound(fen);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  try {
    const res = await supabase.functions.invoke<EdgeSearchResponse>(
      'chess-database-search',
      { body: { fen } }
    );

    if (res.error || !isEdgeSearchResponse(res.data)) {
      return notFound(fen);
    }

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const result = notFound(fen);
    for (const p of PROVIDERS) {
      const hit = res.data[p];
      if (hit.url.startsWith('https://')) {
        result[p] = { found: hit.found, url: hit.url };
      }
    }
    return result;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return notFound(fen);
  }
}
