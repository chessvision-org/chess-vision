import { html, raw } from '../helpers/html';
import { Navbar } from '../components/Navbar';
import { NotificationContainer, notificationsScript } from '../components/ui';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TITLE_SEPARATOR
} from '../helpers/seo';

interface LayoutProps {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  image?: string;
  schemas?: Record<string, unknown>[];
  rightSlot?: string;
  children: string;
}

const ALPINE_CDN =
  'https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js';

function serializeSchema(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export function Layout({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noindex = false,
  image,
  schemas = [],
  rightSlot = '',
  children
}: LayoutProps) {
  const fullTitle = title
    ? `${SITE_NAME}${TITLE_SEPARATOR}${title}`
    : SITE_NAME;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const canonical =
    path !== undefined ? `${SITE_URL}${path === '/' ? '/' : path}` : undefined;

  return html`<!doctype html>
    <html lang="en" data-theme="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${fullTitle}</title>
        <meta name="description" content="${description}" />
        <meta
          name="robots"
          content="${noindex ? 'noindex, nofollow' : 'index, follow'}"
        />
        ${canonical !== undefined
          ? html`<link rel="canonical" href="${canonical}" />`
          : ''}

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="${SITE_NAME}" />
        <meta property="og:title" content="${fullTitle}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${ogImage}" />
        ${canonical !== undefined
          ? html`<meta property="og:url" content="${canonical}" />`
          : ''}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${fullTitle}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImage}" />

        ${schemas
          .map(
            (s) =>
              html`<script type="application/ld+json">
                ${raw(serializeSchema(s))}
              </script>`
          )
          .join('')}

        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="stylesheet" href="/styles/main.css" />
        <link
          rel="preload"
          href="/fonts/inter/inter-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <script src="/theme-init.js"></script>
        <script defer src="${ALPINE_CDN}"></script>
      </head>
      <body>
        <div
          class="page-layout"
          x-data="layoutState()"
          @keydown.escape.window="closeAll()"
        >
          <a href="#main-content" class="skiplink">Skip to main content</a>

          ${Navbar({ isAuthenticated: false, rightSlot })}

          <main
            id="main-content"
            tabindex="-1"
            class="main-content-offset main-region"
          >
            ${children}
          </main>

          ${NotificationContainer()}
        </div>

        <script>
          document.addEventListener('alpine:init', () => {
            Alpine.data('layoutState', () => ({
              isMobileMenuOpen: false,
              isDesktopDropdownOpen: false,
              toggleMobile() {
                this.isMobileMenuOpen = !this.isMobileMenuOpen;
                this.isDesktopDropdownOpen = false;
              },
              toggleDesktop() {
                this.isDesktopDropdownOpen = !this.isDesktopDropdownOpen;
              },
              closeAll() {
                this.isMobileMenuOpen = false;
                this.isDesktopDropdownOpen = false;
              },
              async signOut() {
                try {
                  await fetch('/auth/sign-out', { method: 'POST' });
                } catch {}
                window.location.reload();
              }
            }));
          });
        </script>

        ${raw(notificationsScript())}
      </body>
    </html>`;
}
