import type { Request, Response } from "express";

import { renderPage } from "../views/render";
import { HomePage } from "../views/templates/home";
import {
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
  SOFTWARE_APP_SCHEMA,
  HOME_FAQ_SCHEMA,
} from "../views/helpers/seo";

export function index(req: Request, res: Response): void {
  const q = req.query["fen"];
  const fenParam = typeof q === "string" ? q : undefined;

  res.send(
    renderPage({
      path: "/",
      schemas: [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA, SOFTWARE_APP_SCHEMA, HOME_FAQ_SCHEMA],
      children: HomePage({
        fen: fenParam ?? null,
        queryFen: fenParam ?? null,
      }),
    }),
  );
}
