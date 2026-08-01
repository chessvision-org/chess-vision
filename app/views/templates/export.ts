import { html, raw, escapeHtml } from "../helpers/html";
import { PageSidebarLayout } from "../components/PageSidebarLayout";
import { Checkbox, ModalShell } from "../components/ui";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileImage,
  LayoutGrid,
  Palette,
  Pause,
  Play,
  SlidersHorizontal,
  X,
  XCircle,
} from "../components/icons";

export interface ExportPageOptions {
  tab?: string;
  fen?: string;
}

const MAX_FEN_LENGTH = 80;

function themeGrid(): string {
  return html`
    <div class="theme-picker">
      <div class="theme-picker-head">
        <span class="section-eyebrow">Board Theme</span>
        <div role="tablist" aria-label="Theme source" class="theme-tabs">
          <button
            type="button"
            role="tab"
            data-theme-tab="main"
            class="theme-tab theme-tab-active"
            aria-selected="true"
          >
            ${raw(Palette("theme-tab-icon"))} Presets
          </button>
          <span aria-hidden="true" class="theme-tabs-sep"></span>
          <button
            type="button"
            role="tab"
            data-theme-tab="custom"
            class="theme-tab theme-tab-inactive"
            aria-selected="false"
          >
            ${raw(SlidersHorizontal("theme-tab-icon"))} Custom
          </button>
        </div>
      </div>

      <div data-theme-panel="main">
        <ul class="theme-grid" data-theme-grid aria-label="Board themes"></ul>

        <div class="theme-pager" data-theme-pager hidden>
          <button type="button" class="pager-btn" data-theme-prev aria-label="Previous page">
            ${raw(ChevronLeft("pager-icon"))}
          </button>
          <span class="pager-label" data-theme-page-label></span>
          <button type="button" class="pager-btn" data-theme-next aria-label="Next page">
            ${raw(ChevronRight("pager-icon"))}
          </button>
        </div>
      </div>

      <div data-theme-panel="custom" class="theme-custom" hidden>
        <div class="theme-custom-head">
          <span class="theme-custom-title" data-picker-title>New theme</span>
          <button
            type="button"
            class="theme-close-btn"
            data-picker-close
            aria-label="Close and return to presets"
          >
            ${raw(X("theme-close-icon"))}
          </button>
        </div>

        <div class="square-grid">
          <button type="button" class="square-btn square-btn-active" data-picker-side="light">
            <span
              class="square-color-preview"
              data-picker-light-preview
              style="background-color: #f0d9b5"
            ></span>
            <span class="square-info">
              <span class="square-label">Light square</span>
              <span class="square-hex" data-picker-light></span>
            </span>
          </button>
          <button type="button" class="square-btn square-btn-inactive" data-picker-side="dark">
            <span
              class="square-color-preview"
              data-picker-dark-preview
              style="background-color: #b58863"
            ></span>
            <span class="square-info">
              <span class="square-label">Dark square</span>
              <span class="square-hex" data-picker-dark></span>
            </span>
          </button>
        </div>

        <span class="section-eyebrow">Color Picker</span>
        <div
          class="sat-field"
          data-sat-field
          role="slider"
          aria-label="Saturation and brightness"
          tabindex="0"
        >
          <span class="sat-cursor" data-sat-cursor></span>
        </div>

        <div class="hue-container">
          <span class="section-eyebrow">Hue</span>
          <input type="range" min="0" max="360" data-hue-input aria-label="Hue" class="hue-input" />
        </div>

        <div class="picker-save">
          <input
            type="text"
            class="input-field"
            data-picker-name
            maxlength="10"
            placeholder="Name (optional)"
            aria-label="Theme name"
          />
          <button type="button" class="btn btn-primary" data-save-theme>Save</button>
        </div>
      </div>
    </div>
  `;
}

function pieceSetGrid(): string {
  return html`
    <div class="piece-set">
      <div class="piece-set-head">
        <span class="section-eyebrow">Piece set</span>
        <select class="piece-sort" data-piece-sort aria-label="Sort piece sets">
          <option value="popular">Popular</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      <div class="piece-grid" data-piece-grid></div>

      <div class="piece-pager" data-piece-pager hidden>
        <button type="button" class="pager-btn" data-piece-prev aria-label="Previous page">
          ${raw(ChevronLeft("pager-icon"))}
        </button>
        <span class="pager-label" data-piece-page-label></span>
        <button type="button" class="pager-btn" data-piece-next aria-label="Next page">
          ${raw(ChevronRight("pager-icon"))}
        </button>
      </div>
    </div>
  `;
}

function boardStyleStep(): string {
  return html`
    <div id="panel-board-style" role="tabpanel" class="export-step" data-step="board-style">
      <div class="board-style">
        <div class="board-style-board-col">
          <div class="board-preview">
            <div class="board-preview-frame">
              <img
                class="board-preview-img board-preview-img-loading"
                data-preview-img
                alt="Chess board preview"
                aria-label="Board preview"
              />
              <div class="board-preview-overlay" data-preview-loading hidden>
                <div class="spinner" aria-hidden="true"></div>
              </div>
              <div class="board-preview-error" data-preview-error hidden>
                <p>Invalid FEN</p>
              </div>
            </div>
          </div>

          <div class="display-options">
            <span class="section-eyebrow">Display Options</span>
            ${Checkbox({ dataOption: "showCoords", label: "Show Coordinates" })}
            ${Checkbox({ dataOption: "showThinFrame", label: "Board Frame" })}
          </div>
        </div>

        <div class="board-style-panel-col">
          <div class="board-style-panel">${raw(themeGrid())} ${raw(pieceSetGrid())}</div>
        </div>
      </div>
    </div>
  `;
}

function exportSettingsStep(): string {
  const formatBtn = (format: "jpeg" | "png" | "svg", label: string): string => html`
    <button
      type="button"
      class="format-option ${format === "jpeg" ? "format-option-active" : ""}"
      data-format="${format}"
      aria-pressed="${format === "jpeg" ? "true" : "false"}"
    >
      <span
        class="format-check ${format === "jpeg" ? "format-check-active" : ""}"
        data-format-check
      >
        <span class="format-check-icon-wrap" data-format-check-icon hidden>
          ${raw(Check("format-check-icon"))}
        </span>
      </span>
      ${label}
    </button>
  `;

  const resolutionBtn = (r: number): string => html`
    <button
      type="button"
      data-quality="${r}"
      class="settings-btn ${r === 2 ? "settings-btn-active" : "settings-btn-inactive"}"
    >
      ${r}×
    </button>
  `;

  const boardSizeBtn = (preset: number): string => html`
    <button
      type="button"
      data-size="${preset}"
      class="settings-btn ${preset === 8 ? "settings-btn-active" : "settings-btn-inactive"}"
    >
      ${preset} cm
    </button>
  `;

  return html`
    <div
      id="panel-export-settings"
      role="tabpanel"
      class="export-step export-settings"
      data-step="export-settings"
      hidden
    >
      <div class="settings-section">
        <span class="section-eyebrow">Format</span>
        <div class="format-options">
          ${formatBtn("jpeg", "JPEG")} ${formatBtn("png", "PNG")} ${formatBtn("svg", "SVG")}
        </div>
      </div>

      <div class="settings-section">
        <span class="section-eyebrow">Quality</span>
        <div class="settings-btn-row">
          ${resolutionBtn(1)} ${resolutionBtn(2)} ${resolutionBtn(3)} ${resolutionBtn(4)}
        </div>
      </div>

      <div class="settings-section">
        <span class="section-eyebrow">Board Size</span>
        <div class="settings-btn-row">
          ${boardSizeBtn(4)} ${boardSizeBtn(6)} ${boardSizeBtn(8)}
          <span aria-hidden="true" class="settings-sep"></span>
          <input
            type="number"
            inputmode="decimal"
            min="4"
            max="8"
            step="0.5"
            data-size-custom
            value="8"
            placeholder="cm"
            aria-label="Custom board size in centimetres (4 to 8)"
            class="board-size-input"
          />
        </div>
        <p class="field-error" data-custom-size-error hidden></p>
      </div>

      <div class="settings-section">
        <span class="section-eyebrow">File Name</span>
        <input
          type="text"
          class="input-field"
          data-file-names
          placeholder="e.g. Position1, Tactic2"
          aria-label="File names for downloads"
        />
        <p class="field-error" data-file-name-error hidden></p>
        <div class="pro-tips">
          <span class="pro-tips-title">Pro Tips</span>
          <ul class="pro-tips-list">
            <li>
              Use commas to name multiple formats sequentially (e.g.,
              <code>image1, vector1</code> for PNG and SVG).
            </li>
            <li>
              Empty slots will automatically default to
              <strong>chess-position</strong>.
            </li>
          </ul>
        </div>
      </div>

      <div class="download-row">
        <button type="button" data-download class="btn btn-primary download-btn">
          ${raw(Download("download-btn-icon"))} Download
        </button>
      </div>
    </div>
  `;
}

function exportProgressModal(): string {
  return ModalShell({
    id: "export-progress",
    title: "Export Progress",
    icon: FileImage,
    iconColor: "var(--color-text-secondary)",
    maxWidth: "28rem",
    showCloseButton: false,
    disableBackdropClick: true,
    children: html`
      <div class="space-y-5">
        <p class="text-sm text-text-secondary" data-export-status>Creating image...</p>
        <div class="progress-info">
          <span>Format:</span>
          <strong data-export-format></strong>
        </div>
        <div class="space-y-3">
          <div
            class="progress-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
            data-progress-bar
          >
            <div class="progress-bar-fill" data-progress-fill style="width: 0%"></div>
          </div>
          <p class="progress-percent" data-progress-percent>0% complete</p>
        </div>
        <div class="progress-actions">
          <button
            type="button"
            class="btn btn-secondary progress-btn"
            data-pause-btn
            aria-label="Pause export"
          >
            <span class="progress-btn-inner" data-pause-state>
              ${raw(Pause("progress-btn-icon"))} <span>Pause</span>
            </span>
            <span class="progress-btn-inner" data-resume-state hidden>
              ${raw(Play("progress-btn-icon"))} <span>Resume</span>
            </span>
          </button>
          <button type="button" class="btn btn-danger progress-btn" data-cancel-export>
            ${raw(XCircle("progress-btn-icon"))} <span>Cancel</span>
          </button>
        </div>
      </div>
    `,
  });
}

export function ExportPage(options: ExportPageOptions = {}): string {
  const fen = options.fen ? options.fen.trim().slice(0, MAX_FEN_LENGTH) : "";

  const tabs = html`
    <nav aria-label="Export Studio sections" class="tabs-nav">
      <div
        role="tablist"
        aria-label="Export Studio sections"
        aria-orientation="vertical"
        class="tabs-list"
      >
        <div class="tabs-group tabs-group-first">
          <div class="group-items">
            <button
              type="button"
              role="tab"
              aria-controls="panel-board-style"
              data-tab-btn="board-style"
              aria-selected="true"
              class="tab-btn tab-btn-normal tab-btn-active"
            >
              <span aria-hidden="true" class="tab-indicator tab-indicator-active"></span>
              ${raw(LayoutGrid("tab-icon"))} Board Style
            </button>
            <button
              type="button"
              role="tab"
              aria-controls="panel-export-settings"
              data-tab-btn="export-settings"
              aria-selected="false"
              class="tab-btn tab-btn-normal tab-btn-inactive"
            >
              <span aria-hidden="true" class="tab-indicator tab-indicator-inactive"></span>
              ${raw(Download("tab-icon"))} Export Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  const sidebar = PageSidebarLayout({
    sidebar: tabs,
    contentLabel: "Export Studio",
    children: html`${boardStyleStep()}${exportSettingsStep()}`,
  });

  return html`
    <div class="export-root" data-export-page data-fen="${escapeHtml(fen)}">
      <h1 class="sr-only">Export Chess Diagram</h1>

      <div class="export-empty" data-export-empty hidden>
        <div class="export-empty-icon">${raw(Download("export-empty-icon-img"))}</div>
        <p class="export-empty-title">No board loaded</p>
        <p class="export-empty-text">
          Open a position from the editor to export it as a high-resolution image.
        </p>
        <a href="/" class="btn btn-primary export-empty-link">
          ${raw(ArrowLeft("export-empty-link-icon"))} Back to Editor
        </a>
      </div>

      <div data-export-content>${sidebar} ${exportProgressModal()}</div>
    </div>

    <script src="/export-page.js"></script>
  `;
}
