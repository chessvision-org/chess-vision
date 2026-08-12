import { html } from '../../helpers/html';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps): string {
  return html`<img src="/logo.png" alt="ChessViewer" class="${className}" />`;
}
