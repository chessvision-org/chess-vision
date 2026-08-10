import { html, raw, escapeHtml } from '../../helpers/html';
import { Checkbox, ModalShell } from '../ui';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Clipboard,
  Copy,
  Database,
  Download,
  Eraser,
  FilledStar,
  Globe,
  History,
  Library,
  ListPlus,
  Plus,
  Redo2,
  Repeat2,
  RotateCcw,
  Share2,
  Star,
  Trash2,
  Undo2
} from '../icons';
import {
  buildDbUrl,
  pieceName,
  pieceSrc,
  type DatabaseProvider
} from './boardUtils';

export function renderBoard(): string {
  return html`<div class="board-wrap" data-board-wrap></div>`;
}

export function renderCommandBar(): string {
  return html`<div class="cmd-bar">
    <div class="cmd-bar-group">
      <button
        type="button"
        class="btn-icon"
        data-action="undo"
        disabled
        title="Undo (Ctrl+Z)"
        aria-label="Undo last change"
      >
        ${raw(Undo2('h-5 w-5'))}
      </button>
      <button
        type="button"
        class="btn-icon"
        data-action="redo"
        disabled
        title="Redo (Ctrl+Y)"
        aria-label="Redo last change"
      >
        ${raw(Redo2('h-5 w-5'))}
      </button>
      <span class="cmd-sep" aria-hidden="true"></span>
      <button
        type="button"
        class="btn-icon"
        data-action="flip"
        title="Flip board (F)"
        aria-label="Flip board orientation"
      >
        ${raw(Repeat2('h-5 w-5'))}
      </button>
    </div>
    <div class="cmd-bar-group">
      <button
        type="button"
        class="btn-icon"
        data-action="copy-fen"
        title="Copy image"
        aria-label="Copy board image to clipboard"
      >
        ${raw(Copy('h-5 w-5'))}
      </button>
      <button
        type="button"
        class="btn-icon"
        data-action="share"
        title="Share"
        aria-label="Share board"
      >
        ${raw(Share2('h-5 w-5'))}
      </button>
      <span class="cmd-sep" aria-hidden="true"></span>
      <a
        href="/export"
        class="btn-icon btn-icon-accent"
        title="Download / Export"
        aria-label="Download or export board"
        >${raw(Download('h-5 w-5'))}</a
      >
    </div>
  </div>`;
}

export function renderFenToolbar(fen: string): string {
  return html`<div class="fen-toolbar">
    <div class="fen-toolbar-inner">
      <div class="fen-toolbar-header">
        <label class="fen-toolbar-label">FEN Notation</label>
        <div class="fen-toolbar-actions">
          <a href="/advanced-fen" class="action-btn" title="Advanced FEN Input">
            ${raw(ListPlus('action-btn-icon'))}<span class="action-btn-label"
              >Advanced</span
            ></a
          >
          <a href="/fen-history" class="action-btn" title="FEN History">
            ${raw(History('action-btn-icon'))}<span class="action-btn-label"
              >History</span
            ></a
          >
        </div>
      </div>
      <div class="fen-input-container">
        <div class="fen-input-wrapper" data-fen-wrap>
          <div class="fen-input-toolbar">
            <div class="btn-group">
              <button
                type="button"
                class="toolbar-btn toolbar-btn-neutral"
                data-action="paste"
                title="Paste FEN from clipboard"
                aria-label="Paste FEN from clipboard"
              >
                ${raw(Clipboard('toolbar-btn-icon'))}
                <span class="sr-only">Paste</span>
              </button>
            </div>
            <span class="group-divider" aria-hidden="true"></span>
            <div class="btn-group">
              <button
                type="button"
                class="toolbar-btn toolbar-btn-neutral"
                data-action="batch"
                title="Add to batch (no redirect)"
                aria-label="Add to batch"
              >
                ${raw(Plus('toolbar-btn-icon'))}<span>Add</span>
              </button>
              <button
                type="button"
                class="toolbar-btn toolbar-btn-neutral"
                data-action="favorite"
                data-favorite-btn
                title="Add to favorites"
                aria-label="Add to favorites"
                aria-pressed="false"
              >
                ${raw(Star('toolbar-btn-icon fen-star-outline'))}
                ${raw(FilledStar('toolbar-btn-icon fen-star-filled'))}
                <span class="hidden sm-inline" data-fav-label>Save</span>
              </button>
            </div>
            <span class="group-divider" aria-hidden="true"></span>
            <div class="btn-group">
              <button
                type="button"
                class="toolbar-btn toolbar-btn-neutral"
                data-action="reset"
                title="Load the starting position"
                aria-label="Load starting position"
              >
                ${raw(RotateCcw('toolbar-btn-icon'))}<span>Reset</span>
              </button>
              <button
                type="button"
                class="toolbar-btn toolbar-btn-clear"
                data-action="clear"
                title="Clear the board (empty position)"
                aria-label="Clear board"
              >
                ${raw(Eraser('toolbar-btn-icon'))}<span>Clear</span>
              </button>
            </div>
          </div>
          <div class="fen-textarea-wrap">
            <textarea
              id="fen-input"
              class="fen-textarea"
              rows="1"
              maxlength="80"
              wrap="off"
              spellcheck="false"
              autocomplete="off"
              aria-label="FEN notation input"
              aria-describedby="fen-error"
              aria-invalid="false"
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              value="${escapeHtml(fen)}"
            ></textarea>
          </div>
        </div>
        <div class="fen-error" id="fen-error" role="alert">
          <div class="fen-error-inner">
            <div class="fen-error-content">
              ${raw(AlertCircle('fen-error-icon'))}
              <span data-fen-error-text></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

const WHITE_KEYS = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'];
const BLACK_KEYS = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];

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
              <img
                src="${pieceSrc(key, style)}"
                alt=""
                class="palette-piece"
                draggable="false"
              />
            </button>`
        )
        .join('')}
    </div>
  </div>`;
}

export function renderPalette(pieceStyle: string): string {
  return html`<section class="palette-card" aria-label="Piece palette">
    <div class="palette-groups">
      ${paletteGroup(WHITE_KEYS, 'White', pieceStyle)}
      ${paletteGroup(BLACK_KEYS, 'Black', pieceStyle)}
    </div>
    <p class="palette-hint" id="palette-hint" hidden></p>
  </section>`;
}

const DB_PROVIDERS: {
  id: DatabaseProvider;
  label: string;
  icon: (c?: string, h?: boolean) => string;
}[] = [
  { id: 'lichess', label: 'Lichess', icon: Globe },
  { id: 'chessdb', label: 'ChessDB', icon: Database },
  { id: 'pdb', label: 'PDB', icon: Library },
  { id: 'yacpdb', label: 'YACPDB', icon: BookOpen }
];

export function renderDbSearch(fen: string): string {
  return html`<section class="db-card" aria-label="Position databases">
    <span class="db-title">Database Search</span>
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
            <span class="db-icon">${raw(p.icon('h-4 w-4'))}</span>
            <span class="db-label">${p.label}</span>
            <span class="db-chip"
              >Open ${raw(ArrowUpRight('h-3.5 w-3.5'))}</span
            >
          </a>`
      ).join('')}
    </div>
  </section>`;
}

export function renderTrashZone(): string {
  return html`<div class="trash-zone" id="trash-zone" aria-hidden="true">
    ${raw(Trash2('h-5 w-5'))}
    <span data-trash-empty>Drop to remove</span>
    <span data-trash-held hidden>Release to remove</span>
  </div>`;
}

export function renderBoardOptions(): string {
  return html`<div class="board-options">
    ${Checkbox({ label: 'Show Coordinates', dataOption: 'showCoords' })}
    ${Checkbox({ label: 'Board Frame', dataOption: 'showThinFrame' })}
  </div>`;
}

export function renderShareDialog(): string {
  return ModalShell({
    id: 'share-dialog',
    title: 'Share position',
    icon: Share2,
    children: html`<p class="text-sm text-text-secondary mb-3">
        Anyone with this link can open the same position.
      </p>
      <div class="share-row">
        <input type="text" readonly class="input-field" id="share-url" />
        <button type="button" class="btn btn-primary" id="share-copy">
          Copy link
        </button>
      </div>`
  });
}
