import type { Request, Response } from 'express';

import { renderPage } from '../views/render';
import { SettingsPage } from '../views/templates/settings';

export function index(_req: Request, res: Response): void {
  res.send(renderPage({ path: '/settings', children: SettingsPage() }));
}
