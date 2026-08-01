import { html } from "../helpers/html";
import {
  renderBoard,
  renderBoardOptions,
  renderCommandBar,
  renderDbSearch,
  renderFenToolbar,
  renderPalette,
  renderShareDialog,
  renderTrashZone,
} from "../components/chess/editorParts";
import { isValidFen, MAX_FEN_LENGTH, STARTING_FEN } from "../components/chess/boardUtils";

export interface HomePageOptions {
  fen?: string | null;
  queryFen?: string | null;
}

const DEFAULT_PIECE_STYLE = "cburnett";

export function HomePage(options: HomePageOptions = {}): string {
  const queryFen =
    options.queryFen && options.queryFen.length > 0
      ? options.queryFen.slice(0, MAX_FEN_LENGTH)
      : null;
  const hasValidQuery = queryFen !== null && isValidFen(queryFen);
  const fen = hasValidQuery ? queryFen : STARTING_FEN;

  return html`
    <div class="editor-root" data-editor data-fen="${fen}">
      <h1 class="sr-only">Free Chess Diagram Generator — FEN to PNG, JPEG &amp; SVG</h1>

      <header class="editor-head">
        <h1 class="editor-title">Chess Diagram Generator</h1>
        <p class="editor-subtitle">
          Set up a position, then export it as a PNG, JPEG or SVG image.
        </p>
      </header>

      ${renderFenToolbar(fen)}

      <div class="workspace">
        <section class="editor-board-card card-elevated" aria-label="Board editor">
          ${renderCommandBar()} ${renderBoard()} ${renderBoardOptions()}
        </section>

        <aside class="editor-side">
          ${renderPalette(DEFAULT_PIECE_STYLE)} ${renderDbSearch(fen)} ${renderTrashZone()}
        </aside>
      </div>

      ${renderShareDialog()}
    </div>

    <script src="/compiled/chess-viewer.js"></script>
    <script src="/editor-state.js"></script>
  `;
}
