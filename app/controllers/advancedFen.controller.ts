import type { Request, Response } from "express";

import { renderPage } from "../views/render";
import { AdvancedFenPage } from "../views/templates/advanced-fen";
import { ADVANCED_FEN_BREADCRUMB_SCHEMA, SOFTWARE_APP_SCHEMA } from "../views/helpers/seo";

export function index(_req: Request, res: Response): void {
  res.send(
    renderPage({
      path: "/advanced-fen",
      schemas: [SOFTWARE_APP_SCHEMA, ADVANCED_FEN_BREADCRUMB_SCHEMA],
      children: AdvancedFenPage(),
    }),
  );
}
