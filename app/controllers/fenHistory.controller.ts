import type { Request, Response } from 'express';

import { renderPage } from '../views/render';
import { FenHistoryPage } from '../views/templates/fen-history';
import { SOFTWARE_APP_SCHEMA } from '../views/helpers/seo';

export function index(_req: Request, res: Response): void {
  res.send(
    renderPage({
      path: '/fen-history',
      schemas: [SOFTWARE_APP_SCHEMA],
      children: FenHistoryPage()
    })
  );
}
