import express from "express";
import { sep } from "node:path";

import { registerRoutes } from "./routes";
import { PUBLIC_DIR } from "./config";
import { securityHeaders } from "./middleware/security";
import { pageCache } from "./middleware/page-cache";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";

const PIECE_DIR = `${PUBLIC_DIR}${sep}piece${sep}`;
const FONTS_DIR = `${PUBLIC_DIR}${sep}fonts${sep}`;
const COMPILED_DIR = `${PUBLIC_DIR}${sep}compiled${sep}`;

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", true);

  app.use(securityHeaders);
  app.use(requestLogger);

  app.use(
    express.static(PUBLIC_DIR, {
      maxAge: "1h",
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (
          filePath.startsWith(PIECE_DIR) ||
          filePath.startsWith(FONTS_DIR) ||
          filePath.startsWith(COMPILED_DIR)
        ) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  app.use(express.json({ limit: "1mb" }));

  app.use(pageCache);

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}
