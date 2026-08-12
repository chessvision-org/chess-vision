import { html } from '../helpers/html';
import {
  renderBoard,
  renderBoardOptions,
  renderCommandBar,
  renderDbSearch,
  renderFenToolbar,
  renderPalette,
  renderShareDialog,
  renderTrashZone
} from '../components/chess/editorParts';
import {
  isValidFen,
  MAX_FEN_LENGTH,
  STARTING_FEN
} from '../components/chess/boardUtils';

export interface HomePageOptions {
  fen?: string | null;
  queryFen?: string | null;
}

const DEFAULT_PIECE_STYLE = 'cburnett';

export function HomePage(options: HomePageOptions = {}): string {
  const queryFen =
    options.queryFen && options.queryFen.length > 0
      ? options.queryFen.slice(0, MAX_FEN_LENGTH)
      : null;
  const hasValidQuery = queryFen !== null && isValidFen(queryFen);
  const fen = hasValidQuery ? queryFen : STARTING_FEN;

  return html`
    <div class="editor-root" data-editor data-fen="${fen}">
      <h1 class="sr-only">
        Free Chess Diagram Generator — FEN to PNG, JPEG & SVG
      </h1>

      ${renderFenToolbar(fen)}

      <div class="workspace">
        <div class="workspace-inner">
          <div class="editor-cmdbar-top">${renderCommandBar()}</div>

          <div class="editor-main-row">
            <section class="editor-board-col" aria-label="Board editor">
              <div class="editor-board-wrap">
                <div class="editor-board-inner">${renderBoard()}</div>
              </div>
            </section>

            <aside class="editor-panel">
              <div class="editor-cmdbar">${renderCommandBar()}</div>
              <div class="editor-palette-card">
                ${renderPalette(DEFAULT_PIECE_STYLE)}
              </div>
              <div class="editor-display-opts">${renderBoardOptions()}</div>
              <div class="editor-db-search">${renderDbSearch(fen)}</div>
              <div class="editor-trash">${renderTrashZone()}</div>
            </aside>
          </div>

          <div class="editor-db-row">${renderDbSearch(fen)}</div>
        </div>
      </div>

      ${renderShareDialog()}
    </div>

    <script src="/compiled/chess-viewer.js"></script>
    <script src="/editor-state.js"></script>
  `;
}
