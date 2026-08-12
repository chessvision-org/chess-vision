import type { Request, Response } from 'express';

import { renderPage } from '../views/render';
import { SettingsPage } from '../views/templates/settings';

const SUPABASE_URL =
  process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'] ?? '';
const SUPABASE_ANON_KEY =
  process.env['SUPABASE_ANON_KEY'] ??
  process.env['VITE_SUPABASE_ANON_KEY'] ??
  '';

export function index(req: Request, res: Response): void {
  const q = req.query['tab'];
  const tab = typeof q === 'string' ? q : null;

  res.send(
    renderPage({
      path: '/settings',
      noindex: true,
      children: SettingsPage({
        tab,
        supabaseUrl: SUPABASE_URL,
        supabaseAnonKey: SUPABASE_ANON_KEY
      })
    })
  );
}
