import type { NextFunction, Request, RequestHandler, Response } from "express";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>404 • ChessViewer</title>
        <link rel="stylesheet" href="/styles/main.css" />
      </head>
      <body>
        <div class="page-layout not-found-page">
          <div class="not-found-card">
            <h1 class="not-found-code">404</h1>
            <p class="not-found-text">Page not found</p>
            <a class="btn btn-primary" href="/">Go home</a>
          </div>
        </div>
      </body>
    </html>
  `);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("[app:error]", err);
  res
    .status(500)
    .send(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>500 • ChessViewer</title><link rel="stylesheet" href="/styles/main.css" /></head><body><div class="page-layout not-found-page"><div class="not-found-card"><h1 class="not-found-code">500</h1><p class="not-found-text">Something went wrong</p><a class="btn btn-primary" href="/">Go home</a></div></div></body></html>',
    );
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();
  res.on("finish", () => {
    const ms = Math.round(performance.now() - start);
    const status = String(res.statusCode);
    const color = status.startsWith("2")
      ? "\x1b[32m"
      : status.startsWith("3")
        ? "\x1b[36m"
        : status.startsWith("4")
          ? "\x1b[33m"
          : "\x1b[31m";
    console.log(`\x1b[90m${req.method}\x1b[0m ${req.originalUrl} ${color}${status}\x1b[0m ${ms}ms`);
  });
  next();
}

export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
};
