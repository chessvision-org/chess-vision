import express from 'express';

import { registerRoutes } from './routes';
import { PUBLIC_DIR } from './paths';
import { errorHandler, requestLogger } from './middleware/http';

export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(requestLogger);

  app.use(
    express.static(PUBLIC_DIR, {
      maxAge: '1h',
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    })
  );

  app.use(express.json({ limit: '1mb' }));

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}
