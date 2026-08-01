import type { RequestHandler } from "express";

const SLOW_MS = 500;

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.on("finish", () => {
    const ms = Math.round(performance.now() - start);
    if (res.statusCode < 400 && ms < SLOW_MS) return;
    const color =
      res.statusCode < 400 ? "\x1b[90m" : res.statusCode < 500 ? "\x1b[33m" : "\x1b[31m";
    console.log(`${color}${req.method} ${req.originalUrl} ${res.statusCode}\x1b[0m ${ms}ms`);
  });
  next();
};
