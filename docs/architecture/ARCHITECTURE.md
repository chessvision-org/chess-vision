# Architecture

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Path Aliases](#path-aliases)
- [Routing](#routing)
- [State Management](#state-management)
- [Canvas Rendering](#canvas-rendering)
- [Export System](#export-system)
- [Authentication and Cloud Sync](#authentication-and-cloud-sync)
- [SSR-Style Prerendering](#ssr-style-prerendering)
- [Content Security Policy](#content-security-policy)
- [Client Scripts](#client-scripts)

---

## Overview

ChessViewer is a **Single Page Application (SPA) with SSR-style prerendering for SEO**. It runs as a static site served by nginx, with pages pre-rendered via Puppeteer at build time. There is **no service worker** — this is deliberate (lila-style SSR; SW caused reload crashes). The `public/sw.js` file is a **kill-switch** that replaces any legacy PWA service worker, deletes its caches, then unregisters itself.

URL-based navigation is handled client-side by **wouter**; the server serves the same `index.html` for every path (SPA fallback), but static HTML files exist for each route thanks to prerendering.

It parses FEN notation, renders chess positions on an HTML5 Canvas, and exports high-resolution raster or vector images. Optional user authentication enables cloud sync via a custom Supabase client with row-level security.

**Core principles:**

- Feature-based component grouping under `src/components/features/`
- Functional components and React hooks only — no class components
- Canvas-based board rendering and image export
- All local state persisted to localStorage; cloud sync is opt-in
- All pages lazy-loaded with code splitting
- TypeScript 6 strict mode throughout
- **No inline scripts** — all client JS lives in external `public/*.js` files
- **Strict CSP** — no `'unsafe-eval'`, no `'unsafe-inline'` for scripts

---

## Technology Stack

| Category        | Library / Tool                                               | Version |
| --------------- | ------------------------------------------------------------ | ------- |
| UI framework    | Preact (via `@preact/preset-vite`)                           | 10.x    |
| Language        | TypeScript                                                   | 6.x     |
| Build tool      | Vite                                                         | 8.x     |
| Styling         | Tailwind CSS                                                 | 4.x     |
| Routing         | wouter                                                       | 3.x     |
| Drag and drop   | Custom hooks (`useDragDrop`) — no library                    | —       |
| Page animations | CSS keyframes + custom `usePageTransition`                   | —       |
| Icons           | Embedded Lucide SVG paths (`src/assets/icons/`) — no package | —       |
| ZIP export      | fflate                                                       | 0.8.x   |
| QR codes        | uqr                                                          | 0.1.x   |
| Fonts           | @fontsource-variable/inter                                   | 5.x     |
| Backend / Auth  | Custom Supabase client (`src/auth/core/Supabase.ts`)         | —       |
| Prerendering    | Puppeteer (`scripts/prerender.mjs`)                          | —       |
| Package manager | pnpm                                                         | 10.x    |

> **Preact instead of React** — `@preact/preset-vite` aliases `react` and `react-dom` to Preact at build time. All source code uses the React API; Preact provides it with a smaller runtime. `preact` and `@types/react` coexist in `package.json` for this reason.

> **Icon system — embedded SVG paths, not a package** — `lucide-react` is not installed. Instead, the SVG path data for only the icons we actually use is copied into `src/assets/icons/index.tsx`. The `createLucideIcon` helper in `src/assets/icons/createIcon.tsx` turns each path list into a React component with the same API as the original Lucide package. Attribution: icon paths originate from the [Lucide](https://lucide.dev) project (ISC License).

> **Supabase client — custom implementation, not `@supabase/supabase-js`** — `src/auth/core/Supabase.ts` contains a hand-written HTTP client that covers only the Supabase APIs we use: Auth (sign-in/sign-up/MFA/session management), PostgREST queries, and RPC calls. This avoids the full SDK bundle weight. The `supabase` singleton exported from that file is the only approved entry point for all Supabase access.

> **Page animations — custom CSS, not Framer Motion** — `framer-motion` is not installed. The enter/exit animation system works with CSS `@keyframes` defined in `src/styles/animations.css` and a `usePageTransition` hook that keeps both pages in the DOM simultaneously for 180 ms. The animation class names (`animate-page-enter`, `page-transition-exit`) intentionally mirror the naming style from Framer Motion's AnimatePresence for familiarity.

> **Chess domain logic — private package** — `@chessviewer-org/chess-viewer` provides `ChessBoard`, `PieceSymbol`, `validateFEN`, `parseFEN`, `boardToFEN`, and related types. It is a private package not published to npm.

> **NO Service Worker** — This is deliberate (lila-style SSR; SW caused reload crashes). `public/sw.js` is a **kill-switch** that replaces any legacy PWA service worker, deletes its caches, then unregisters itself — do NOT replace it with a real SW, do NOT delete it (legacy zombies from the old vite-PWA era still exist in users' browsers). `public/init.js` mirrors this: unregisters legacy SWs once per browser (`cv_sw_purged` localStorage marker) — never add reloads or `caches.delete` back to it (raced with the legacy SW and caused the "site goes and comes back" crash). `_headers` serves `/sw.js` with `Cache-Control: no-cache` so the update check always sees the kill-switch.

---

## Project Structure

```
src/
├── App.tsx                    # App root, routing, providers
├── index.tsx                  # Entry, SW kill-switch registration
├── auth/                      # Custom Supabase auth + sync
│   ├── core/                  # AuthProvider, useAuth, Supabase client
│   ├── storage/               # syncStorage, dataMigration
│   └── mfa/                   # TOTP / 2FA
├── components/
│   ├── features/              # Feature components (Export, History, etc.)
│   ├── interactions/          # Editor, DnD board, drag-drop
│   ├── layout/                # Navbar, Footer
│   └── ui/                    # Shared UI primitives (Modal, Button, Input, etc.)
├── pages/
│   ├── HomePage/              # Main board editor
│   ├── ExportPage/            # Multi-step export wizard
│   ├── SettingsPage/          # User settings
│   └── AuthPages/             # Login, register, MFA
├── shared/
│   ├── hooks/                 # useScrollLock, useFocusTrap, useLocalStorage, etc.
│   ├── utils/                 # fenParser, colorConversions, etc.
│   ├── styles/                # Tailwind 4 + SCSS modules (ui.module.scss)
│   ├── contexts/              # Theme, FENBatch, Modal
│   └── types/                 # Shared types
└── styles/                    # Global CSS (base, animations, components)
```

---

## Path Aliases

Defined in `tsconfig.json` and `vite.config.js`:

```
@/*           → src/*                (app structure — slash form)
@shared/*     → src/shared/*
@components/* → src/components/*
@pages/*      → src/pages/*
@hooks        → src/shared/hooks     (bare barrel form — shared layer)
@hooks/*      → src/shared/hooks/*
@utils        → src/shared/utils
@utils/*      → src/shared/utils/*
@contexts     → src/shared/contexts
@contexts/*   → src/shared/contexts/*
@constants    → src/shared/constants
@constants/*  → src/shared/constants/*
@app-types    → src/shared/types
@app-types/*  → src/shared/types/*
```

Convention: use `@/x` for app-structure paths (`@/components`, `@/auth`). Use bare form `@x` for shared-layer barrels (`@utils`, `@hooks`, `@constants`, `@app-types`).

---

## Routing

Routing is handled by **wouter** (not React Router). All routes are in `src/App.tsx`. Every page is `lazy()`-loaded in a `<Suspense>` boundary.

Page transitions use a custom `usePageTransition` hook — no Framer Motion. Both the entering and exiting pages are held in the DOM simultaneously for 180 ms while CSS animations run (`animate-page-enter` / `page-transition-exit`).

| Path        | Component                                |
| ----------- | ---------------------------------------- |
| `/`         | `HomePage`                               |
| `/export`   | `ExportPage`                             |
| `/settings` | `SettingsPage`                           |
| `/auth/*`   | Auth pages (sign-in, sign-up, MFA, etc.) |
| `*`         | `NotFoundPage`                           |

`usePrefetchRoute` prefetches a page chunk on link hover/focus, so click-time navigation is instant.

---

## State Management

| Layer            | Tool                   | Examples                                   |
| ---------------- | ---------------------- | ------------------------------------------ |
| Component state  | `useState`             | Modal open/close, form values              |
| Derived state    | `useMemo`              | Parsed FEN → board array                   |
| Cross-tree state | Context API            | FEN batch list, modal state                |
| Persistence      | localStorage           | FEN history, theme preferences, settings   |
| Drag state       | `useDragDrop` (custom) | Active piece, drag origin                  |
| Cloud sync       | Supabase               | KV via `syncStorage.ts` (RLS owner-scoped) |

Context providers persist to localStorage via `useEffect`. All hydration uses `safeJSONParse`.

Drag state lives exclusively in `useInteractiveBoard.ts` and the custom `useDragDrop` hook. It must not be mirrored into React state — doing so causes 64-square cascade re-renders through the memoized `DroppableSquare` grid.

---

## Canvas Rendering

### Display Board

The interactive board is rendered as a grid of `DroppableSquare` components, each containing a `DraggablePiece`. Squares use Tailwind CSS utilities backed by CSS custom properties. Piece images are loaded from Lichess CDN, rasterized to 256 px blob URLs, and passed down as a stable `Record<string, HTMLImageElement>`.

### Export Canvas

For export, `createUltraQualityCanvas()` in `canvasRenderer.ts` renders an off-screen `HTMLCanvasElement`:

- Square sizes computed from physical board size in cm: `pixels = round((cm / 2.54) × 300 × multiplier)`
- `getMaxCanvasSize()` caps at 16,384 px on Safari, 32,767 px on Chrome
- After every `canvas.toBlob()`: `canvas.width = 0; canvas.height = 0` — mandatory for Safari GPU memory release

---

## Export System

See [EXPORT_PIPELINE.md](../reference/EXPORT_PIPELINE.md) for the full technical reference.

**Flow:**

1. User opens ExportPage (full-screen studio) from the CommandBar download button
2. Configures format (PNG/JPEG/SVG), quality preset (1×–3×), board size (4/6/8 cm), and filename
3. `handleBatchExport` in `useHomeExport` triggers `canvasExporter.ts`
4. For PNG/JPEG: `createRasterBlob()` attempts the SVG→Worker path first; falls back to main-thread canvas if pieces are blob URLs
5. For SVG: `downloadSVG()` in `svgExporter.ts` embeds piece images as base64 data URLs
6. File downloaded via `<a download>`
7. Batch export iterates the FEN list and packages outputs via `archiveManager.ts` (fflate)

---

## Authentication and Cloud Sync

Authentication is entirely optional. The app is fully functional without an account.

All auth logic is in `src/auth/` — a self-contained module. Nothing outside this folder touches Supabase directly.

**Services:**

- `core/Supabase.ts` — singleton Supabase client
- `storage/syncStorage.ts` — the only approved KV interface for `user_data` table
- `core/profile.ts` — display name and supporter tier operations
- `storage/dataMigration.ts` — one-time localStorage → Supabase migration on first login
- `core/membership.ts` — supporter tier logic (`getMembershipTier`)
- `core/securityEvents.ts` — recent login event log
- `mfa/` — TOTP / 2FA setup and verification

**Security gate:** Fail-closed 90-day re-verification via `refresh_security_session` RPC. Defaults to locked; only unlocks on positive server confirmation.

**Cloud sync:** `syncStorage.set(key, value)` upserts into `user_data`. Each row is owner-scoped by Supabase RLS: `auth.uid() = user_id`. No user can read another user's rows. The local localStorage copy is the source of truth; cloud is best-effort sync on top.

**Accessibility preferences** (`useColorVision`, `useContrast`, `useReducedMotionPreference` — all in `useA11y.ts`) hydrate from cloud on an idle callback after first paint — they do not block initial render.

---

## SSR-Style Prerendering

ChessViewer uses **SSG/prerendering** for SEO, not a traditional PWA with service worker.

**How it works:**

1. Build produces `dist/` with SPA `index.html` + all JS/CSS chunks
2. `scripts/prerender.mjs` launches Puppeteer, visits each route, waits for network idle
3. Static HTML snapshots saved to `dist/<route>/index.html`
4. nginx serves static HTML when available; falls back to `index.html` for SPA routes

**Routes prerendered:** `/`, `/export`, `/settings`, `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/mfa`, `/about`, `/fen-history`, `/advanced-fen`

**Prerender config:** `scripts/prerender.mjs` — requires Chromium. Runs in CI after `pnpm build`.

**No service worker:** The old PWA approach (vite-plugin-pwa + Workbox) was removed because it caused reload crashes. The only SW is the kill-switch at `public/sw.js`.

---

## Content Security Policy

CSP is **strict (lila-style)** and defined in two places — both must stay in sync:

1. `app/middleware/security.ts` (nginx config generation)
2. `public/_headers` (Netlify-style headers for edge/CDN)

**Policy:**

```
script-src 'self' https://static.cloudflareinsights.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https://cdn.jsdelivr.net https://lichess1.org
font-src 'self' data: https://fonts.gstatic.com
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://static.cloudflareinsights.com
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Key constraints:**

- **NO `'unsafe-eval'`** — all code must be valid without eval
- **NO `'unsafe-inline'` for scripts** — no inline `<script>` blocks, no `onclick="..."`, no `javascript:` URLs
- `'unsafe-inline'` **allowed for styles only** — dynamic `style=""` attributes (board square colors, drag ghost, picker cursors) require it
- `<script type="application/ld+json">` schema blocks are NOT executed and are exempt from CSP — they may stay inline

---

## Client Scripts

**All client-side JavaScript lives in external files under `public/`** — never inline in HTML.

This is mandatory due to strict CSP. The following files exist:

| File                      | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `public/layout-state.js`  | Navbar mobile menu, theme toggle, scroll handling       |
| `public/editor-state.js`  | HomePage editor interactions (FEN input, board actions) |
| `public/export-page.js`   | ExportPage wizard steps, format selection               |
| `public/notifications.js` | Toast notification display                              |
| `public/fen-history.js`   | FEN history page filters, search, pagination            |
| `public/settings-page.js` | Settings tabs, form handling                            |
| `public/advanced-fen.js`  | Advanced FEN batch input                                |
| `public/donate-state.js`  | Donate modal state                                      |
| `public/init.js`          | Legacy SW unregistration (kill-switch mirror)           |
| `public/sw.js`            | Service worker kill-switch                              |

**Adding a new vanilla component:**

1. Create `public/<feature>.js`
2. Register delegated event handlers (event delegation on `document`)
3. Reference with `<script src="/<feature>.js">` in the page HTML
4. Never use inline `<script>` blocks

**Historical note:** The share modal / navbar "stuck" bugs were caused by CSP blocking inline scripts. Never reintroduce them.

---

_Last updated: August 2026_
