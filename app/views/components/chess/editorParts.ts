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
import { buildDbUrl, FILES, pieceName, pieceSrc, type DatabaseProvider } from "./boardUtils";

interface BoardCoords {
  ranks: string[];
  files: string[];
}

const DEFAULT_COORDS: BoardCoords = {
  ranks: ["8", "7", "6", "5", "4", "3", "2", "1"],
  files: FILES.split(""),
};

function renderCoords(): string {
  const { ranks, files } = DEFAULT_COORDS;
  return html`<div class="coords-ranks" x-show="showCoords">
      ${ranks
        .map((n, i) => html`<div class="coord-rank" x-text="flipped ? ${i + 1} : ${n}">${n}</div>`)
        .join("")}
    </div>
    <div class="coords-files" x-show="showCoords">
      ${files
        .map(
          (l, i) =>
            html`<div class="coord-file" x-text="flipped ? '${files[7 - i]}' : '${l}'">${l}</div>`,
        )
        .join("")}
    </div>`;
}

export function renderBoard(): string {
  return html`<div class="board-wrap" :class="{ 'board-frame-on': showThinFrame }">
    <div
      class="board-grid"
      role="grid"
      tabindex="0"
      aria-label="Chess board editor"
      @keydown="onKeydown($event)"
      @pointermove="setDragTarget($event)"
      @pointerleave="dragOverId = null"
    >
      <template x-for="(row, ri) in viewRows" :key="'row-' + ri">
        <template x-for="(cell, ci) in row" :key="'cell-' + ci">
          <button
            type="button"
            role="gridcell"
            class="board-square"
            :style="'background-color:' + squareColor(ri, ci)"
            :class="squareClasses(ri, ci)"
            :aria-label="squareLabel(ri, ci)"
            :aria-selected="isSelected(ri, ci)"
            @click="clickSquare(ri, ci)"
            @pointerdown="startDragBoard(ri, ci, $event)"
          >
            <img
              x-show="cell"
              :src="pieceSrc(cell)"
              :alt="pieceAlt(cell)"
              class="board-piece"
              draggable="false"
            />
          </button>
        </template>
      </template>
    </div>
    ${renderCoords()}
  </div>`;
}

export function renderCommandBar(): string {
  return html`<div class="cmd-bar">
    <button
      type="button"
      class="btn-icon"
      :disabled="!canUndo"
      @click="undo()"
      title="Undo (Ctrl+Z)"
      aria-label="Undo"
    >
      ${raw(Undo2("h-4 w-4"))}
    </button>
    <button
      type="button"
      class="btn-icon"
      :disabled="!canRedo"
      @click="redo()"
      title="Redo (Ctrl+Y)"
      aria-label="Redo"
    >
      ${raw(Redo2("h-4 w-4"))}
    </button>
    <span class="sep"></span>
    <button
      type="button"
      class="btn-icon"
      @click="flip()"
      title="Flip board (F)"
      aria-label="Flip board"
    >
      ${raw(Repeat2("h-4 w-4"))}
    </button>
    <span class="spacer"></span>
    <button
      type="button"
      class="btn-icon"
      @click="removeHeld()"
      title="Remove selected piece"
      aria-label="Remove selected piece"
    >
      ${raw(Eraser("h-4 w-4"))}
    </button>
    <button
      type="button"
      class="btn-icon"
      @click="copyFen()"
      title="Copy FEN"
      aria-label="Copy FEN"
    >
      ${raw(Copy("h-4 w-4"))}
    </button>
    <button
      type="button"
      class="btn-icon"
      @click="share()"
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
    <div class="fen-input-wrap" :class="{ 'fen-input-error': error }">
      <div class="fen-input-row">
        <button
          type="button"
          class="btn-icon"
          @click="paste()"
          title="Paste FEN from clipboard"
          aria-label="Paste FEN"
        >
          ${raw(Clipboard("h-4 w-4"))}
        </button>
        <span class="sep"></span>
        <button
          type="button"
          class="btn-icon"
          :class="{ 'btn-icon-active': isFavorite }"
          @click="toggleFavorite()"
          title="Save position to favorites"
          aria-label="Save position to favorites"
        >
          ${raw(Star("h-4 w-4"))}
        </button>
        <button
          type="button"
          class="btn-icon"
          @click="addToBatch()"
          title="Add position to batch"
          aria-label="Add position to batch"
        >
          ${raw(ListPlus("h-4 w-4"))}
        </button>
        <span class="sep"></span>
        <button
          type="button"
          class="btn-icon"
          @click="reset()"
          title="Reset to starting position"
          aria-label="Reset to starting position"
        >
          ${raw(RotateCcw("h-4 w-4"))}
        </button>
        <button
          type="button"
          class="btn-icon"
          @click="clearBoard()"
          title="Clear the board"
          aria-label="Clear the board"
        >
          ${raw(Eraser("h-4 w-4"))}
        </button>
      </div>
      <textarea
        class="fen-textarea"
        x-model="fen"
        @input="onFenInput($event)"
        rows="1"
        maxlength="80"
        spellcheck="false"
        autocomplete="off"
        placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        value="${escapeHtml(fen)}"
      ></textarea>
    </div>
    <div class="fen-error" x-show="error" x-text="error"></div>
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
              :class="{ 'palette-btn-active': palettePiece === '${key}' }"
              @click="selectPalette('${key}')"
              @pointerdown="startDragPalette('${key}', $event)"
              :aria-pressed="palettePiece === '${key}'"
              title="${pieceName(key)}"
              aria-label="${pieceName(key)}"
            >
              <img
                :src="pieceSrcForKey('${key}')"
                src="${pieceSrc(key, style)}"
                alt=""
                class="palette-piece"
                draggable="false"
              />
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
    <p class="palette-hint" x-show="palettePiece" x-text="'Placing: ' + palettePieceName()"></p>
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
            :href="dbUrl('${p.id}')"
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
  return html`<div
    class="trash-zone"
    :class="{ 'trash-zone-active': held, 'drag-over': dragOverId === 'trash' }"
    @click="removeHeld()"
    @pointerenter="dragOverId = 'trash'"
    @pointerleave="dragOverId = null"
  >
    <span x-show="!held">Click to remove a selected piece</span>
    <span x-show="held">Remove selected piece</span>
  </div>`;
}

export function renderBoardOptions(): string {
  return html`<div class="board-options">
    ${Checkbox({
      label: "Coordinates",
      xModel: "showCoords",
      onInput: "persistOptions()",
    })}
    ${Checkbox({
      label: "Thin frame",
      xModel: "showThinFrame",
      onInput: "persistOptions()",
    })}
  </div>`;
}

export function renderShareDialog(): string {
  return ModalShell({
    isOpenExpr: "shareOpen",
    onCloseExpr: "shareOpen = false",
    title: "Share position",
    icon: Share2,
    children: html`<p class="text-sm text-text-secondary mb-3">
        Anyone with this link can open the same position.
      </p>
      <div class="share-row">
        <input type="text" readonly class="input-field" x-model="shareUrl" />
        <button type="button" class="btn btn-primary" @click="copyShareUrl()">Copy link</button>
      </div>`,
  });
}
