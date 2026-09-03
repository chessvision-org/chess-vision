export type Provider = 'lichess' | 'chessdb';

export interface SearchResponse {
  found: boolean;
  database: string | null;
  url: string | null;
}

export interface ProviderHit {
  found: boolean;
  url: string;
}

export type ProviderMap = Record<Provider, ProviderHit>;
