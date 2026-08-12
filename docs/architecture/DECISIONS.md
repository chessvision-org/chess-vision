# Architectural Decision Records

Records of key architectural and technical decisions made during ChessViewer's development.

---

## ADR-001: React as UI Framework

**Date:** 2025-12-27 | **Status:** Accepted

**Decision:** React 19.x with functional components and hooks only.

**Rationale:** Large ecosystem, strong TypeScript support, efficient updates via hooks and memoization. Team familiarity.

**Trade-offs:** Larger bundle than vanilla JS; runtime overhead compared to compiled frameworks (Svelte).

---

## ADR-002: HTML5 Canvas for Board Rendering

**Date:** 2025-12-28 | **Status:** Accepted

**Decision:** HTML5 Canvas API for both display rendering and image export.

**Rationale:** Direct pixel manipulation for high-resolution exports, GPU-accelerated drawing, consistent cross-browser `toBlob` / `toDataURL` API.

**Trade-offs:** Canvas content is inaccessible to screen readers. No built-in hover/click detection on pieces — requires manual coordinate math.

**Rejected alternatives:**

- SVG: harder to export as raster at large sizes; performance issues at ultra-high resolution
- DOM (div-based): poor export quality
- WebGL: overkill for 2D; compatibility concerns

---

## ADR-003: Supabase for Optional Backend

**Date:** 2026-05-23 | **Status:** Accepted (supersedes zero-backend ADR-003-original)

**Decision:** Supabase provides optional authentication, KV storage (`user_data` table), and RLS-enforced data access. Privacy is enforced by Row-Level Security: every row is owner-scoped — one account cannot read another's data. No client-side encryption.

**Rationale:** Users requested cross-device sync. Supabase was chosen for its Row-Level Security, built-in auth with TOTP MFA, and PostgreSQL RPC support (needed for the security gate pattern). Client-side E2EE was considered and rejected as overengineering — RLS owner-scoping provides the necessary privacy guarantee without key-management complexity.

**Constraints:**

- All Supabase access through the singleton at `supabaseClient.ts`. No second client.
- `syncStorage.ts` is the only approved interface for user KV data. Direct `from('user_data')` calls outside this file are forbidden.
- RLS must be ON for all tables. Default-deny.
- Privileged writes (e.g., updating `last_verified_at`) go through RPC only — direct UPDATE policy is disabled by design.

**Trade-offs:** App now requires a Supabase project for cloud sync features. Core functionality (rendering, export, local history) remains fully offline.

---

## ADR-004: Tailwind CSS for Styling

**Date:** 2025-12-28 | **Status:** Accepted (upgraded to Tailwind 4)

**Decision:** Tailwind 4 utility-first CSS. All theme colors are CSS variables defined in `src/index.css` (`--accent`, `--bg-primary`, etc.). No hardcoded hex values in JSX or Tailwind classes.

**Rationale:** Rapid UI development, consistent design system, small production bundle, built-in responsive and dark mode support.

**Trade-offs:** Verbose `className` attributes; custom overrides require CSS variable definitions rather than arbitrary values.

---

## ADR-005: Client-Side FEN Parsing

**Date:** 2025-12-28 | **Status:** Accepted

**Decision:** FEN parsing implemented in TypeScript on the client (`fenParser.ts`). `MAX_FEN_LENGTH = 93` enforced before any parse attempt.

**Rationale:** No server round-trip, instant validation feedback, works offline. Full FEN parser is lightweight (~2 KB). A full chess engine (chess.js: ~80 KB) is unnecessary since we only need position parsing, not move validation.

---

## ADR-006: localStorage for Local Persistence

**Date:** 2025-12-29 | **Status:** Accepted

**Decision:** Browser `localStorage` API for all local state persistence (history, settings, theme). All hydration uses `safeJSONParse` (prototype-pollution-safe).

**Rationale:** Synchronous API, available everywhere, sufficient for 5–10 MB of user data.

**Trade-offs:** Device-specific. Can be cleared by browser. No automatic backup (addressed by Data Management export/import feature).

---

## ADR-007: SVG Piece Sets from Lichess

**Date:** 2025-12-28 | **Status:** Accepted

**Decision:** SVG piece sets sourced from Lichess (MIT-licensed), stored in `/public/pieces/`, cached in memory via `pieceImageCache.ts` (keyed by SVG URL).

**Rationale:** Excellent quality at any export size, open-source, community-maintained, small per-piece file size (~2–5 KB each).

---

## ADR-008: Vite as Build Tool

**Date:** 2025-12-28 | **Status:** Accepted (upgraded to Vite 8)

**Decision:** Vite with manual chunk splitting: `vendor-react`, `vendor-icons`, `vendor-motion`, `vendor-dnd`, `vendor-virtualization`.

**Rationale:** Fast HMR, native ES modules in dev, optimized production builds, built-in TypeScript support.

**Constraints:** `assetsInlineLimit: 4096` — SVG chess pieces must remain HTTP-cacheable. Chunk size warning threshold: 500 KB.

---

## ADR-009: @dnd-kit for Board Editing

**Date:** 2025-12-28 | **Status:** Accepted (migrated from `react-dnd`)

**Decision:** `@dnd-kit/core` with Pointer and Touch sensors. DnD state lives exclusively in `useInteractiveBoard.ts` — never mirrored into React board state.

**Rationale:** Mirroring drag state into React state causes 64-square cascade re-renders on every drag event. `@dnd-kit` sensor events provide efficient, targeted subscriptions without polluting the board matrix. `@dnd-kit` is also better maintained and has first-class TypeScript support compared to `react-dnd`.

**Constraints:** `BoardSquare`, `DraggablePiece`, `DroppableSquare` must stay `memo()`'d. A new prop on any of these must be referentially stable (`useMemo`/`useCallback`) or it re-renders all 64 squares.

---

## ADR-010: TypeScript 6 Strict Mode

**Date:** 2026-05-23 | **Status:** Accepted

**Decision:** Full TypeScript 6 strict mode: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitAny`. Zero `any`, `@ts-ignore`, or non-null assertions (`!`) in the codebase.

**Rationale:** Prevents entire classes of runtime bugs. TypeScript 6 catches issues that TypeScript 4/5 permitted.

**Constraints:** All canonical types live in `src/shared/types/` and are imported via the `@app-types` alias. No local type redeclarations that duplicate these.

---

## ADR-011: Web Workers for Large Exports

**Date:** 2026-04-17 | **Status:** Accepted

**Decision:** SVG-to-raster conversion for exports above 4,000 px routes through `svgRasterWorker.ts` via `OffscreenCanvas`. Never call `canvasRenderer` synchronously on the main thread for export-size operations.

**Rationale:** Prevents main thread blocking during large canvas operations. `OffscreenCanvas` in a Worker avoids UI freezes and Safari OOM patterns.

**Constraints:** After every `HTMLCanvasElement` blob generation: `canvas.width = 0; canvas.height = 0`. Safari does not GC canvas GPU memory on reference drop — this disposal is mandatory.

---

## ADR-012: No Analytics or Tracking

**Date:** 2025-12-28 | **Status:** Accepted

**Decision:** No analytics, tracking, or telemetry of any kind.

**Rationale:** Privacy-first design. No GDPR/CCPA compliance overhead. Faster page load. Issues are reported through GitHub, not discovered through analytics.

---

## ADR-013: nginx (Docker) for Hosting

**Date:** 2025-12-28 | **Updated:** 2026-06-08 | **Status:** Accepted

**Decision:** Serve the static `dist/` build from nginx in a Docker container at `chessvision.org`. SPA routing, caching, and all security headers + CSP live in `nginx.conf`.

**Rationale:** Full control over the served headers/CSP, vendor-neutral and portable, no platform lock-in, and the app is a static bundle that runs anywhere.

**Note:** The app is a static site (`dist/` folder) that can be self-hosted on any host or static CDN. Superseded the earlier Vercel-based hosting (`vercel.json` removed; its headers were ported into `nginx.conf`).

---

## ADR-014: No versioned releases

**Date:** 2025-12-28 | **Updated:** 2026-07-01 | **Status:** Superseded

**Original decision:** SemVer 2.0.0 with semantic-release automation.

**Superseded by:** ChessViewer ships as a web app with no npm publish or extension store submission. Automated tagging added noise without value — a patch commit every few hours would produce a new tag with no meaningful signal. The project now follows a rolling-release model: `master` is always production, changes are documented in `CHANGELOG.md` by month, and GitHub milestones group open work by theme rather than version.

---

## ADR-015: SSR-Style Prerendering over PWA

**Date:** 2026-08-11 | **Status:** Accepted (supersedes PWA approach)

**Decision:** Use static site generation (SSG) via Puppeteer prerendering for SEO instead of a Progressive Web App with service worker. Build produces static HTML snapshots for each route; nginx serves them directly with SPA fallback.

**Rationale:** PWA service worker caused reload crashes and complex cache invalidation issues. Prerendering provides SEO benefits without runtime SW complexity. The app is a static bundle — no server runtime needed.

**Constraints:**

- `scripts/prerender.mjs` runs in CI after `pnpm build`
- Requires Chromium in CI environment
- All routes must be known at build time for prerendering
- SPA fallback (`index.html`) still served for unprerendered routes

**Trade-offs:** No offline support (intentional — core features work offline via localStorage anyway). Prerender adds ~30s to CI. Dynamic content (auth state) still hydrates client-side.

---

## ADR-016: No Service Worker — Kill-Switch Only

**Date:** 2026-08-11 | **Status:** Accepted

**Decision:** No service worker for caching/offline. `public/sw.js` exists solely as a kill-switch: it replaces any legacy PWA service worker, deletes its caches, then unregisters itself. `public/init.js` mirrors this for browsers that already have the legacy SW registered.

**Rationale:** The previous vite-plugin-pwa + Workbox setup caused "site goes and comes back" reload crashes due to race conditions between the legacy SW and new deployments. A kill-switch is safer than trying to maintain a working SW.

**Constraints:**

- `_headers` serves `/sw.js` with `Cache-Control: no-cache` so the update check always sees the kill-switch
- `cv_sw_purged` localStorage marker prevents repeated unregistration attempts
- Never add reloads or `caches.delete` back to `init.js` — raced with legacy SW and caused crashes
- Do NOT replace kill-switch with a real SW, do NOT delete it (legacy zombies still exist in users' browsers)

---

## ADR-017: Strict CSP with External Client Scripts

**Date:** 2026-08-11 | **Status:** Accepted

**Decision:** Content Security Policy is strict (lila-style): `script-src 'self' https://static.cloudflareinsights.com` — NO `'unsafe-eval'`, NO `'unsafe-inline'` for scripts. All client-side JavaScript lives in external files under `public/*.js` (delegated event handlers). Inline `<script>` blocks are forbidden.

**Rationale:** Security-first posture. CSP prevents XSS via script injection. External scripts are cacheable and auditable. The lila.org chess server uses this pattern successfully.

**Constraints:**

- `style-src 'self' 'unsafe-inline'` remains — dynamic `style=""` attributes (board square colors, drag ghost, picker cursors) require it
- `<script type="application/ld+json">` schema blocks are exempt (not executed)
- Adding a new vanilla component: create `public/<feature>.js`, register delegated handlers on `document`, reference via `<script src="/<feature>.js">`
- Never reintroduce inline scripts — share modal / navbar "stuck" bugs were caused by CSP blocking them
- CSP defined in TWO places: `app/middleware/security.ts` AND `public/_headers` — keep both in sync

---

## ADR-018: Tailwind 4 + SCSS Modules with @reference Pattern

**Date:** 2026-08-11 | **Status:** Accepted

**Decision:** Tailwind 4 (CSS-first) with SCSS modules for components needing complex styling. SCSS modules use `@reference "../../index.css"` to access theme tokens via `@apply` — no hardcoded hex colors in JSX.

**Rationale:** Tailwind 4's CSS-first architecture works natively with CSS variables. SCSS modules provide encapsulation for complex components (Modal, ShareDialog) while `@reference` gives access to the design token system without duplicating values.

**Constraints:**

- Design tokens in `src/styles/theme.css` (CSS variables)
- Theme init in `src/theme-init.js` (preload, prevents FOUC)
- `@reference` import path must be correct relative to SCSS file
- No hardcoded hex colors in JSX — use `text-text-primary`, `bg-surface`, etc.
- Two modal patterns exist (Inline Tailwind preferred, SCSS Module) — don't mix them

---

## Proposing a New Decision

1. Open a GitHub Discussion with your proposal.
2. Reference the existing ADR you are challenging, if any.
3. Provide rationale and evidence.
4. Discuss trade-offs before implementing.
5. Update this file if the decision is accepted.

---

_Last updated: August 2026_  
_Maintainer: [Khatai Huseynzada](https://github.com/BilgeGates)_
