import type { Request, Response } from "express";

import { renderPage } from "../views/render";

export function notFoundPage(_req: Request, res: Response): void {
  res.status(404).send(
    renderPage({
      path: "/404",
      noindex: true,
      children: `
        <div class="not-found-page">
          <div class="not-found-card">
            <h1 class="not-found-code">404</h1>
            <p class="not-found-text">Page not found</p>
            <a class="btn btn-primary" href="/">Go home</a>
          </div>
        </div>
      `,
    }),
  );
}
