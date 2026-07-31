import type { Fen } from '@chess-viewer/core';
import { isValidFen } from '@chess-viewer/core';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export function parseFen(fen: Fen): boolean {
  return isValidFen(fen);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
