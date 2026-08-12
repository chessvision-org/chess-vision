import type { Express } from 'express';

import * as homeController from './controllers/home.controller';
import * as aboutController from './controllers/about.controller';
import * as exportController from './controllers/export.controller';
import * as settingsController from './controllers/settings.controller';
import * as fenHistoryController from './controllers/fenHistory.controller';
import * as advancedFenController from './controllers/advancedFen.controller';
import * as authController from './controllers/auth.controller';
import * as analyticsController from './controllers/analytics.controller';
import * as healthController from './controllers/health.controller';
import * as notFoundController from './controllers/notFound.controller';

export function registerRoutes(app: Express): void {
  app.get('/health', healthController.health);

  app.post('/api/analytics/track', analyticsController.trackEvent);

  app.get('/', homeController.index);
  app.get('/about', aboutController.index);
  app.get('/export', exportController.index);
  app.get('/export/svg', exportController.svg);
  app.get('/settings', settingsController.index);
  app.get('/fen-history', fenHistoryController.index);
  app.get('/advanced-fen', advancedFenController.index);

  app.get('/auth/sign-in', authController.signInPage);
  app.get('/auth/sign-up', authController.signUpPage);
  app.get('/auth/forgot-password', authController.forgotPasswordPage);
  app.get('/auth/mfa', authController.mfaPage);

  app.use(notFoundController.notFoundPage);
}
