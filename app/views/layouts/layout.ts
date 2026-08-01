import { html, raw } from "../helpers/html";
import { Navbar } from "../components/Navbar";
import { NotificationContainer } from "../components/ui";
import { inlineStylesheet } from "../helpers/styles";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TITLE_SEPARATOR,
} from "../helpers/seo";

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

function serializeSchema(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export function Layout({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noindex = false,
  image,
  schemas = [],
  rightSlot = "",
  children,
}: LayoutProps) {
  const fullTitle = title ? `${SITE_NAME}${TITLE_SEPARATOR}${title}` : SITE_NAME;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const canonical = path !== undefined ? `${SITE_URL}${path === "/" ? "/" : path}` : undefined;

  return html`
    <!doctype html>
    <html lang="en" data-theme="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${fullTitle}</title>
        <meta name="description" content="${description}" />
        <meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}" />
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

        <style>${raw(inlineStylesheet())}</style>
        <link
          rel="preload"
          href="/fonts/inter/inter-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link rel="preload" as="image" href="/logo.png" fetchpriority="high" />
        <script src="/theme-init.js"></script>
        <script src="/init.js"></script>
      </head>
      <body>
        <div class="page-layout">
          <a href="#main-content" class="skiplink">Skip to main content</a>

          ${Navbar({ isAuthenticated: false, rightSlot })}

          <main id="main-content" tabindex="-1" class="main-content-offset main-region">
            ${children}
          </main>

          ${NotificationContainer()}
        </div>

        <script src="/layout-state.js"></script>
        <script src="/notifications.js"></script>
        <script src="/navbar-height.js" defer></script>
      </body>
    </html>
  `;
}
