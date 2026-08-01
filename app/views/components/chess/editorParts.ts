import { html, raw, escapeHtml } from "../../helpers/html";
import { Checkbox, ModalShell } from "../ui";
import {
  ArrowUpRight,
  BookOpen,
  ChessKing,
  Clipboard,
  Copy,
  Database,
  Download,
  Eraser,
  Globe,
  History,
  Library,
  ListPlus,
  Plus,
  Redo2,
  Repeat2,
  RotateCcw,
  Search,
  Share2,
  Star,
  Undo2,
} from "../icons";
import { buildDbUrl, pieceName, pieceSrc, type DatabaseProvider } from "./boardUtils";

export function renderBoard(): string {
  return html`<div class="board-wrap" data-board-wrap></div>`;
}

export function renderCommandBar(): string {
  return html`<div class="cmd-bar">
    <button
      type="button"
      class="btn-icon"
      data-action="undo"
      disabled
      title="Undo (Ctrl+Z)"
      aria-label="Undo"
    >
      ${raw(Undo2("h-4 w-4"))}
    </button>
    <button
      type="button"
      class="btn-icon"
      data-action="redo"
      disabled
      title="Redo (Ctrl+Y)"
      aria-label="Redo"
    >
      ${raw(Redo2("h-4 w-4"))}
    </button>
    <span class="sep"></span>
    <button
      type="button"
      class="btn-icon"
      data-action="flip"
      title="Flip board (F)"
      aria-label="Flip board"
    >
      ${raw(Repeat2("h-4 w-4"))}
    </button>
    <span class="spacer"></span>
    <button
      type="button"
      class="btn-icon"
      data-action="remove"
      title="Remove selected piece"
      aria-label="Remove selected piece"
    >
      ${raw(Eraser("h-4 w-4"))}
    </button>
    <button
      type="button"
      class="btn-icon"
      data-action="copy-fen"
      title="Copy FEN"
      aria-label="Copy FEN"
    >
      ${raw(Copy("h-4 w-4"))}
    </button>
    <button
      type="button"
      class="btn-icon"
      data-action="share"
      title="Share position"
      aria-label="Share position"
    >
      ${raw(Share2("h-4 w-4"))}
    </button>
    <a
      href="/export"
      class="btn-icon btn-icon-accent"
      title="Download / Export"
      aria-label="Download or export"
      >${raw(Download("h-4 w-4"))}</a
    >
  </div>`;
}

export function renderFenToolbar(fen: string): string {
  return html`<div class="fen-toolbar">
    <div class="fen-header">
      <div class="fen-title">
        <h2 class="fen-label">FEN Notation</h2>
        <span class="fen-hint">Edit the position or click pieces on the board.</span>
      </div>
      <div class="fen-actions">
        <a href="/advanced-fen" class="btn btn-outline btn-sm" title="Advanced FEN Input"
          >${raw(Plus("h-3.5 w-3.5"))}<span class="hide-sm">Advanced</span></a
        >
        <a href="/fen-history" class="btn btn-outline btn-sm" title="FEN History"
          >${raw(History("h-3.5 w-3.5"))}<span class="hide-sm">History</span></a
        >
      </div>
    </div>
    <div class="fen-input-wrap" data-fen-wrap>
      <div class="fen-input-row">
        <button
          type="button"
          class="btn-icon"
          data-action="paste"
          title="Paste FEN from clipboard"
          aria-label="Paste FEN"
        >
          ${raw(Clipboard("h-4 w-4"))}
        </button>
        <span class="sep"></span>
        <button
          type="button"
          class="btn-icon"
          data-action="favorite"
          data-favorite-btn
          title="Save position to favorites"
          aria-label="Save position to favorites"
        >
          ${raw(Star("h-4 w-4"))}
        </button>
        <button
          type="button"
          class="btn-icon"
          data-action="batch"
          title="Add position to batch"
          aria-label="Add position to batch"
        >
          ${raw(ListPlus("h-4 w-4"))}
        </button>
        <span class="sep"></span>
        <button
          type="button"
          class="btn-icon"
          data-action="reset"
          title="Reset to starting position"
          aria-label="Reset to starting position"
        >
          ${raw(RotateCcw("h-4 w-4"))}
        </button>
        <button
          type="button"
          class="btn-icon"
          data-action="clear"
          title="Clear the board"
          aria-label="Clear the board"
        >
          ${raw(Eraser("h-4 w-4"))}
        </button>
      </div>
      <textarea
        id="fen-input"
        class="fen-textarea"
        rows="1"
        maxlength="80"
        spellcheck="false"
        autocomplete="off"
        placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        value="${escapeHtml(fen)}"
      ></textarea>
    </div>
    <div class="fen-error" id="fen-error" hidden></div>
  </div>`;
}

const WHITE_KEYS = ["wK", "wQ", "wR", "wB", "wN", "wP"];
const BLACK_KEYS = ["bK", "bQ", "bR", "bB", "bN", "bP"];

function paletteGroup(keys: string[], label: string, style: string): string {
  return html`<div class="palette-group">
    <div class="palette-label">${label}</div>
    <div class="palette-row">
      ${keys
        .map(
          (key) =>
            html`<button
              type="button"
              class="palette-btn"
              data-palette="${key}"
              aria-pressed="false"
              title="${pieceName(key)}"
              aria-label="${pieceName(key)}"
            >
              <img src="${pieceSrc(key, style)}" alt="" class="palette-piece" draggable="false" />
            </button>`,
        )
        .join("")}
    </div>
  </div>`;
}

export function renderPalette(pieceStyle: string): string {
  return html`<section class="card palette-card" aria-label="Piece palette">
    <h3 class="card-title">${raw(ChessKing("h-4 w-4"))} Pieces</h3>
    ${paletteGroup(WHITE_KEYS, "White", pieceStyle)}
    ${paletteGroup(BLACK_KEYS, "Black", pieceStyle)}
    <p class="palette-hint" id="palette-hint" hidden></p>
  </section>`;
}

const DB_PROVIDERS: {
  id: DatabaseProvider;
  label: string;
  icon: (c?: string, h?: boolean) => string;
}[] = [
  { id: "lichess", label: "Lichess", icon: Globe },
  { id: "chessdb", label: "ChessDB", icon: Database },
  { id: "pdb", label: "PDB", icon: Library },
  { id: "yacpdb", label: "YACPDB", icon: BookOpen },
];

export function renderDbSearch(fen: string): string {
  return html`<section class="card db-card" aria-label="Position databases">
    <h3 class="card-title">${raw(Search("h-4 w-4"))} Database Search</h3>
    <p class="db-hint">Open this position in an external database.</p>
    <div class="db-grid">
      ${DB_PROVIDERS.map(
        (p) =>
          html`<a
            class="db-row"
            data-provider="${p.id}"
            href="${escapeHtml(buildDbUrl(p.id, fen))}"
            target="_blank"
            rel="noopener"
            title="${p.label}"
          >
            <span class="db-icon">${raw(p.icon("h-4 w-4"))}</span>
            <span class="db-label">${p.label}</span>
            <span class="db-open">${raw(ArrowUpRight("h-3.5 w-3.5"))}</span>
          </a>`,
      ).join("")}
    </div>
  </section>`;
}

export function renderTrashZone(): string {
  return html`<div class="trash-zone" id="trash-zone">
    <span data-trash-empty>Click to remove a selected piece</span>
    <span data-trash-held hidden>Remove selected piece</span>
  </div>`;
}

export function renderBoardOptions(): string {
  return html`<div class="board-options">
    ${Checkbox({ label: "Coordinates", dataOption: "showCoords" })}
    ${Checkbox({ label: "Thin frame", dataOption: "showThinFrame" })}
  </div>`;
}

export function renderShareDialog(): string {
  return ModalShell({
    id: "share-dialog",
    title: "Share position",
    icon: Share2,
    children: html`<p class="text-sm text-text-secondary mb-3">
        Anyone with this link can open the same position.
      </p>
      <div class="share-row">
        <input type="text" readonly class="input-field" id="share-url" />
        <button type="button" class="btn btn-primary" id="share-copy">Copy link</button>
      </div>`,
  });
}
