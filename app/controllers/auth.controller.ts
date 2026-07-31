import type { Request, Response } from 'express';

import { renderPage } from '../views/render';

type AuthPageName = 'sign-in' | 'sign-up' | 'forgot-password' | 'mfa';

const PAGE_TITLES: Record<AuthPageName, { path: string; title: string }> = {
  'sign-in': { path: '/auth/sign-in', title: 'Sign In' },
  'sign-up': { path: '/auth/sign-up', title: 'Create Account' },
  'forgot-password': { path: '/auth/forgot-password', title: 'Reset Password' },
  mfa: { path: '/auth/mfa', title: 'Two-Factor Auth' }
};

function authPage(page: AuthPageName): string {
  const { path, title } = PAGE_TITLES[page];
  return renderPage({
    path,
    noindex: true,
    children: `
      <div class="auth-page">
        <div class="card-elevated auth-card">
          <h1 class="auth-heading">${title}</h1>
          <p class="auth-subtitle">Coming soon — auth pages are being migrated.</p>
          <a class="btn btn-primary" href="/">Back to board</a>
        </div>
      </div>
    `
  });
}

export function signInPage(_req: Request, res: Response): void {
  res.send(authPage('sign-in'));
}

export function signUpPage(_req: Request, res: Response): void {
  res.send(authPage('sign-up'));
}

export function forgotPasswordPage(_req: Request, res: Response): void {
  res.send(authPage('forgot-password'));
}

export function mfaPage(_req: Request, res: Response): void {
  res.send(authPage('mfa'));
}
