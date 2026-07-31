import { html } from "../helpers/html";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps = {}) {
  const cls = className ? `logo-img ${className}`.trim() : "logo-img";
  return html`<img src="/logo.png" alt="ChessViewer" class="${cls}" width="48" height="48" />`;
}
