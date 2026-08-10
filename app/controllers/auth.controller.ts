import type { Request, Response } from 'express';

import { renderPage } from '../views/render';
import {
  ForgotPasswordPage,
  MfaChallengePage,
  SignInPage,
  SignUpPage
} from '../views/templates/auth';

type AuthPageName = 'sign-in' | 'sign-up' | 'forgot-password' | 'mfa';

const SUPABASE_URL =
  process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'] ?? '';
const SUPABASE_ANON_KEY =
  process.env['SUPABASE_ANON_KEY'] ??
  process.env['VITE_SUPABASE_ANON_KEY'] ??
  '';

function authPage(pageName: AuthPageName): string {
  const path = `/auth/${pageName}`;
  const render = {
    'sign-in': SignInPage,
    'sign-up': SignUpPage,
    'forgot-password': ForgotPasswordPage,
    mfa: MfaChallengePage
  }[pageName];

  const children = [
    `<div class="auth-root" data-auth-root data-supabase-url="${SUPABASE_URL}" data-supabase-anon-key="${SUPABASE_ANON_KEY}">`,
    render(path),
    '</div>',
    '<script src="/auth.js"></script>'
  ].join('');

  return renderPage({
    path,
    noindex: true,
    children
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
