import { html, raw } from '../../helpers/html';
import type { IconFn } from '../../components/Icon';
import { ChevronDown } from '../../components/icons';

// ===== Constants =====
export const CONTACT_EMAIL = 'contact@chessvision.org';
export const REPO_URL = 'https://github.com/chessviewer-org/chess-viewer';
export const REPO_ISSUES_URL = `${REPO_URL}/issues`;
export const REPO_DISCUSSIONS_URL = `${REPO_URL}/discussions`;
export const REPO_DOCS_URL = `${REPO_URL}/tree/master/docs`;
export const REPO_LICENSE_URL = `${REPO_URL}/blob/master/LICENSE`;
export const REPO_CONTRIBUTING_URL = `${REPO_URL}/blob/master/CONTRIBUTING.md`;
export const REPO_CHANGELOG_URL = `${REPO_URL}/blob/master/CHANGELOG.md`;
export const REPO_COMMITS_URL = `${REPO_URL}/commits`;

export const CRYPTO_WALLET_ADDRESS =
  '0x31eB555dAAC8253FF9835448bFA1542BFA969aDb';

export const LICENSE_NAME = 'GNU AGPL-3.0';

// ===== Parts =====
export function SectionHeading({
  icon: Icon,
  title
}: {
  icon: IconFn;
  title: string;
}): string {
  return html`<h2 class="about-heading">
    ${raw(Icon('about-heading-icon'))} ${title}
  </h2>`;
}

export function Lead({ children }: { children: string }): string {
  return html`<p class="about-lead">${raw(children)}</p>`;
}

export function InfoCard({
  title,
  children
}: {
  title: string;
  children: string;
}): string {
  return html`<section class="about-info-card">
    <h3 class="about-info-card-title">${title}</h3>
    <div class="about-info-card-body">${raw(children)}</div>
  </section>`;
}

export function Callout({ children }: { children: string }): string {
  return html`<section class="about-callout">${raw(children)}</section>`;
}

export function FactRow({
  icon: Icon,
  label,
  value
}: {
  icon: IconFn;
  label: string;
  value: string;
}): string {
  return html`<div class="fact-row fact-list-divider">
    <span class="fact-label"> ${raw(Icon('fact-icon'))} ${label} </span>
    <span class="fact-value">${raw(value)}</span>
  </div>`;
}

export function FactList({ children }: { children: string }): string {
  return html`<section class="fact-list">${raw(children)}</section>`;
}

export function ExternalLinkButton({
  href,
  icon: Icon,
  children,
  variant = 'neutral',
  className = ''
}: {
  href: string;
  icon: IconFn;
  children: string;
  variant?: 'primary' | 'neutral';
  className?: string;
}): string {
  const variantClass =
    variant === 'primary' ? 'about-btn-primary' : 'about-btn-neutral';
  return html`<a
    href="${href}"
    target="_blank"
    rel="noopener noreferrer"
    class="about-btn ${variantClass} ${className}"
  >
    ${raw(Icon())} ${children}
  </a>`;
}

export function MailButton({
  email,
  subject,
  icon: Icon,
  children,
  className = ''
}: {
  email: string;
  subject?: string;
  icon: IconFn;
  children: string;
  className?: string;
}): string {
  const href = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
  return html`<a
    href="${href}"
    class="about-btn about-btn-neutral ${className}"
  >
    ${raw(Icon())} ${children}
  </a>`;
}

export function FAQItem({ q, a }: { q: string; a: string }): string {
  return html`<div class="faq-item">
    <button
      type="button"
      data-faq-toggle
      aria-expanded="false"
      class="faq-button"
    >
      <span class="faq-text">${q}</span>
      <span class="faq-icon">${raw(ChevronDown(''))}</span>
    </button>
    <div data-faq-body hidden>
      <div class="faq-body-text">${raw(a)}</div>
    </div>
  </div>`;
}
