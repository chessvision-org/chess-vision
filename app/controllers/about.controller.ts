import type { Request, Response } from "express";

import { renderPage } from "../views/render";
import { AboutPage, DEFAULT_TAB, VALID_TAB_IDS } from "../views/templates/about";
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from "../views/helpers/seo";

export function index(req: Request, res: Response): void {
  const requestedTab = String(req.query["tab"] ?? "");
  const activeTab = VALID_TAB_IDS.includes(requestedTab) ? requestedTab : DEFAULT_TAB;

  const requestedYear = String(req.query["year"] ?? "");
  const year =
    activeTab === "changelog" && /^\d{4}$/.test(requestedYear) ? requestedYear : undefined;

  res.send(
    renderPage({
      path: "/about",
      schemas: [WEBSITE_SCHEMA, ORGANIZATION_SCHEMA],
      children: AboutPage(activeTab, year),
    }),
  );
}
