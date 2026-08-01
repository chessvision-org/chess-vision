import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[app:error]", err);
  res
    .status(500)
    .send(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>500 • ChessViewer</title></head><body><h1>500</h1><p>Something went wrong.</p><a href="/">Go home</a></body></html>',
    );
};
