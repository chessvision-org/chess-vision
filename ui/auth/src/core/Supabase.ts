/* eslint-disable @typescript-eslint/no-unused-vars */
import { logger } from '@utils';

{
  /* env check kept for init-time validation */
  const url: string = process.env['VITE_SUPABASE_URL'] || '';
  const key: string = process.env['VITE_SUPABASE_ANON_KEY'] || 'placeholder';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    logger.warn(
      'VITE_SUPABASE_URL is missing or invalid. Falling back to a placeholder URL.'
    );
  }
  void key;
}

type QuerySingleResult<T> = Promise<{
  data: T | null;
  error: { code?: string; message: string } | null;
}>;
type QueryVoidResult = Promise<{
  error: { code?: string; message: string } | null;
}>;

interface FilterBuilder {
  select: (_columns?: string) => FilterBuilder;
  eq: (_column: string, _value: string) => FilterBuilder;
  single: <T>() => QuerySingleResult<T>;
  returns: <T>() => FilterBuilder;
  delete: () => FilterBuilder;
  insert: (_data: unknown | unknown[]) => QueryVoidResult;
  upsert: (_data: unknown, _opts?: unknown) => QueryVoidResult;
  then: <T>(
    _resolve: (value: {
      data: T | null;
      error: { code?: string; message: string } | null;
    }) => void
  ) => void;
}

function filterBuilder(): FilterBuilder {
  const self = {} as FilterBuilder;
  self.select = () => self;
  self.eq = () => self;
  self.single = async () => ({ data: null, error: null });
  self.returns = () => self;
  self.delete = () => self;
  self.insert = async () => ({ error: null });
  self.upsert = async () => ({ error: null });
  self.then = (resolve: (v: unknown) => void) => {
    resolve({ data: null, error: null });
  };
  return self;
}

export const supabase = {
  auth: {
    getSession: async (): Promise<{
      data: { session: { user: { id: string } } | null };
      error: null;
    }> => ({
      data: { session: null },
      error: null
    }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signInWithPassword: async () => ({
      data: null,
      error: new Error('Not configured')
    }),
    signUp: async () => ({ data: null, error: new Error('Not configured') }),
    signOut: async () => ({ error: null })
  },
  functions: {
    invoke: async <T>(
      _name: string,
      _opts?: { body: unknown }
    ): Promise<{
      error: { code?: string; message: string } | null;
      data: T | null;
    }> => ({
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase not configured' }
    })
  },
  from: (_table: string): FilterBuilder => filterBuilder()
};

export function getAuthErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred';
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: string }).message);
  }
  return String(err);
}
