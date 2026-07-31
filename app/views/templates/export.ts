import { html, raw } from '../helpers/html';
import { exportPageScript } from '../helpers/chessClient';
import { PageSidebarLayout } from '../components/PageSidebarLayout';
import { Checkbox, ModalShell } from '../components/ui';
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
  Pencil,
  Play,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
  XCircle
} from '../components/icons';

export interface ExportPageOptions {
  tab?: string;
  fen?: string;
}

const MAX_FEN_LENGTH = 80;

function sanitizeFenForExpr(fen: string): string {
  return fen.replace(/[^\s/0-9a-zA-Z-]/g, '');
}

function themeGrid(): string {
  return html`
    <div class="theme-picker">
      <div class="theme-picker-head">
        <span class="section-eyebrow">Board Theme</span>
        <div role="tablist" aria-label="Theme source" class="theme-tabs">
          <button
            type="button"
            role="tab"
            aria-selected="true"
            :aria-selected="themeTab === 'main' ? 'true' : 'false'"
            @click="themeTab = 'main'; closePicker()"
            :class="themeTab === 'main'
              ? 'theme-tab theme-tab-active'
              : 'theme-tab theme-tab-inactive'"
          >
            ${raw(Palette('theme-tab-icon'))} Presets
          </button>
          <span aria-hidden="true" class="theme-tabs-sep"></span>
          <button
            type="button"
            role="tab"
            :aria-selected="themeTab === 'custom' ? 'true' : 'false'"
            @click="openLivePicker()"
            :class="themeTab === 'custom'
              ? 'theme-tab theme-tab-active'
              : 'theme-tab theme-tab-inactive'"
          >
            ${raw(SlidersHorizontal('theme-tab-icon'))} Custom
          </button>
        </div>
      </div>

      <div x-show="themeTab === 'main'" x-cloak>
        <ul
          class="theme-grid"
          :style="'grid-template-columns: repeat(' + themeCols + ', minmax(0, 1fr))'"
          aria-label="Board themes"
        >
          <template x-for="tile in visibleThemes()" :key="tile.key">
            <li class="theme-tile">
              <button
                type="button"
                class="theme-swatch"
                :class="themeIsSelected(tile.light, tile.dark)
                  ? 'theme-swatch-selected'
                  : ''"
                @click="applyTheme(tile.light, tile.dark)"
                :title="tile.name"
                :aria-label="'Apply ' + tile.name + ' theme'"
                :aria-pressed="themeIsSelected(tile.light, tile.dark)"
              >
                <span
                  class="theme-swatch-half"
                  :style="'background-color:' + tile.light"
                ></span>
                <span
                  class="theme-swatch-half"
                  :style="'background-color:' + tile.dark"
                ></span>
                <span
                  x-show="themeIsSelected(tile.light, tile.dark)"
                  class="theme-swatch-check"
                  aria-hidden="true"
                >
                  ${raw(Check('theme-swatch-check-icon'))}
                </span>
              </button>
              <template x-if="tile.custom !== null">
                <div class="theme-tile-actions">
                  <button
                    type="button"
                    class="theme-action-btn"
                    @click="startEdit(tile)"
                    :aria-label="'Edit ' + tile.name"
                  >
                    ${raw(Pencil('theme-action-icon'))}
                  </button>
                  <button
                    type="button"
                    class="theme-action-btn theme-action-btn-danger"
                    @click="deleteTheme(tile.custom)"
                    :aria-label="'Delete ' + tile.name"
                  >
                    ${raw(Trash2('theme-action-icon'))}
                  </button>
                </div>
              </template>
              <span class="theme-tile-name" x-text="tile.name"></span>
            </li>
          </template>
          <li class="theme-tile" x-show="showThemeAdd">
            <button
              type="button"
              class="theme-add"
              @click="startAdd()"
              aria-label="Create a custom theme"
            >
              ${raw(Plus('theme-add-icon'))}
            </button>
            <span class="theme-tile-name">Add</span>
          </li>
        </ul>

        <div class="theme-pager" x-show="themePages > 1" x-cloak>
          <button
            type="button"
            class="pager-btn"
            @click="themePrev()"
            :disabled="themePage === 0"
            aria-label="Previous page"
          >
            ${raw(ChevronLeft('pager-icon'))}
          </button>
          <span
            class="pager-label"
            x-text="(themePage + 1) + ' / ' + themePages"
          ></span>
          <button
            type="button"
            class="pager-btn"
            @click="themeNext()"
            :disabled="themePage >= themePages - 1"
            aria-label="Next page"
          >
            ${raw(ChevronRight('pager-icon'))}
          </button>
        </div>
      </div>

      <div x-show="themeTab === 'custom'" x-cloak class="theme-custom">
        <div class="theme-custom-head">
          <span
            class="theme-custom-title"
            x-text="pickerId !== null ? 'Edit theme' : 'New theme'"
          ></span>
          <button
            type="button"
            class="theme-close-btn"
            @click="closePicker()"
            aria-label="Close and return to presets"
          >
            ${raw(X('theme-close-icon'))}
          </button>
        </div>

        <div class="square-grid">
          <button
            type="button"
            class="square-btn"
            :class="pickerActive === 'light'
              ? 'square-btn-active'
              : 'square-btn-inactive'"
            @click="pickerSetSide('light')"
          >
            <span
              class="square-color-preview"
              :style="'background-color:' + pickerLight"
            ></span>
            <span class="square-info">
              <span class="square-label">Light square</span>
              <span class="square-hex" x-text="pickerLight"></span>
            </span>
          </button>
          <button
            type="button"
            class="square-btn"
            :class="pickerActive === 'dark'
              ? 'square-btn-active'
              : 'square-btn-inactive'"
            @click="pickerSetSide('dark')"
          >
            <span
              class="square-color-preview"
              :style="'background-color:' + pickerDark"
            ></span>
            <span class="square-info">
              <span class="square-label">Dark square</span>
              <span class="square-hex" x-text="pickerDark"></span>
            </span>
          </button>
        </div>

        <span class="section-eyebrow">Color Picker</span>
        <div
          class="sat-field"
          x-ref="sat"
          role="slider"
          aria-label="Saturation and brightness"
          tabindex="0"
          :style="'background-color:' + pickerHueHex"
          @pointerdown="satDown($event)"
          @pointermove="satMove($event)"
          @pointerup="satUp($event)"
          @pointercancel="satUp($event)"
          @keydown="satKey($event)"
        >
          <span
            class="sat-cursor"
            :style="'left:' + (pickerS * 100) + '%;top:' + ((1 - pickerV) * 100) + '%'"
          ></span>
        </div>

        <div class="hue-container">
          <span class="section-eyebrow">Hue</span>
          <input
            type="range"
            min="0"
            max="360"
            :value="Math.round(pickerH * 360)"
            @input="hueInput($event)"
            aria-label="Hue"
            class="hue-input"
          />
        </div>

        <div class="picker-save">
          <input
            type="text"
            class="input-field"
            x-model="pickerName"
            maxlength="10"
            placeholder="Name (optional)"
            aria-label="Theme name"
          />
          <button
            type="button"
            class="btn btn-primary"
            @click="saveCustomTheme()"
          >
            Save
          </button>
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
        <select
          class="piece-sort"
          x-model="pieceSort"
          @change="piecePage = 0"
          aria-label="Sort piece sets"
        >
          <option value="popular">Popular</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      <div
        class="piece-grid"
        :style="'grid-template-columns: repeat(' + pieceCols + ', minmax(0, 1fr))'"
      >
        <template x-for="set in visiblePieceSets()" :key="set.id">
          <button
            type="button"
            class="piece-tile"
            :class="pieceStyle === set.id ? 'piece-tile-active' : ''"
            @click="setPieceStyle(set.id)"
            :aria-pressed="pieceStyle === set.id"
            :aria-label="set.name"
          >
            <img
              class="piece-tile-img"
              :src="'/piece/' + set.id + '/wN.svg'"
              :alt="set.name"
              width="44"
              height="44"
              loading="lazy"
            />
            <span class="piece-tile-name" x-text="set.name"></span>
          </button>
        </template>
      </div>

      <div class="piece-pager" x-show="piecePages > 1" x-cloak>
        <button
          type="button"
          class="pager-btn"
          @click="piecePrev()"
          :disabled="piecePage === 0"
          aria-label="Previous page"
        >
          ${raw(ChevronLeft('pager-icon'))}
        </button>
        <span
          class="pager-label"
          x-text="(piecePage + 1) + ' / ' + piecePages"
        ></span>
        <button
          type="button"
          class="pager-btn"
          @click="pieceNext()"
          :disabled="piecePage >= piecePages - 1"
          aria-label="Next page"
        >
          ${raw(ChevronRight('pager-icon'))}
        </button>
      </div>
    </div>
  `;
}

function boardStyleStep(): string {
  return html`
    <div
      id="panel-board-style"
      role="tabpanel"
      class="export-step"
      x-show="tab === 'board-style'"
      x-cloak
    >
      <div class="board-style">
        <div class="board-style-board-col">
          <div class="board-preview">
            <div class="board-preview-frame">
              <img
                class="board-preview-img"
                :src="previewUrl"
                :class="previewLoading ? 'board-preview-img-loading' : ''"
                alt="Chess board preview"
                aria-label="Board preview"
              />
              <div
                class="board-preview-overlay"
                x-show="previewLoading"
                x-cloak
              >
                <div class="spinner" aria-hidden="true"></div>
              </div>
              <div
                class="board-preview-error"
                x-show="!previewLoading && previewError"
                x-cloak
              >
                <p>Invalid FEN</p>
              </div>
            </div>
          </div>

          <div class="display-options">
            <span class="section-eyebrow">Display Options</span>
            ${Checkbox({
              xModel: 'showCoords',
              onInput: 'setShowCoords($event.target.checked)',
              label: 'Show Coordinates'
            })}
            ${Checkbox({
              xModel: 'showThinFrame',
              onInput: 'setShowThinFrame($event.target.checked)',
              label: 'Board Frame'
            })}
          </div>
        </div>

        <div class="board-style-panel-col">
          <div class="board-style-panel">
            ${raw(themeGrid())} ${raw(pieceSetGrid())}
          </div>
        </div>
      </div>
    </div>
  `;
}

function exportSettingsStep(): string {
  const formatBtn = (
    format: 'jpeg' | 'png' | 'svg',
    label: string
  ): string => html`
    <button
      type="button"
      @click="toggleFormat('${format}')"
      :class="selectedFormats.includes('${format}')
          ? 'format-option format-option-active'
          : 'format-option'"
      class="format-option"
      :aria-pressed="selectedFormats.includes('${format}')"
    >
      <span
        class="format-check"
        :class="selectedFormats.includes('${format}')
            ? 'format-check-active'
            : ''"
      >
        <span x-show="selectedFormats.includes('${format}')" x-cloak>
          ${raw(Check('format-check-icon'))}
        </span>
      </span>
      ${label}
    </button>
  `;

  const resolutionBtn = (r: number): string => html`
    <button
      type="button"
      @click="setResolutionValue(${r})"
      :class="exportQuality === ${r}
          ? 'settings-btn settings-btn-active'
          : 'settings-btn settings-btn-inactive'"
    >
      <span x-text="'${r}×'"></span>
    </button>
  `;

  const boardSizeBtn = (preset: number): string => html`
    <button
      type="button"
      @click="selectBoardSizePreset(${preset})"
      :class="boardSizePreset === ${preset}
          ? 'settings-btn settings-btn-active'
          : 'settings-btn settings-btn-inactive'"
    >
      ${preset} cm
    </button>
  `;

  return html`
    <div
      id="panel-export-settings"
      role="tabpanel"
      class="export-step export-settings"
      x-show="tab === 'export-settings'"
      x-cloak
    >
      <div class="settings-section">
        <span class="section-eyebrow">Format</span>
        <div class="format-options">
          ${formatBtn('jpeg', 'JPEG')} ${formatBtn('png', 'PNG')}
          ${formatBtn('svg', 'SVG')}
        </div>
      </div>

      <div class="settings-section">
        <span class="section-eyebrow">Quality</span>
        <div class="settings-btn-row">
          ${resolutionBtn(1)} ${resolutionBtn(2)} ${resolutionBtn(3)}
          ${resolutionBtn(4)}
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
            :value="customBoardSizeInput"
            @focus="selectBoardSizePreset('custom')"
            @input="updateCustomBoardSize($event)"
            placeholder="cm"
            aria-label="Custom board size in centimetres (4 to 8)"
            :aria-invalid="customBoardSizeError ? 'true' : 'false'"
            :class="boardSizePreset === 'custom'
              ? 'board-size-input board-size-input-active'
              : 'board-size-input'"
          />
        </div>
        <p class="field-error" x-show="customBoardSizeError" x-cloak>
          <span x-text="customBoardSizeError"></span>
        </p>
      </div>

      <div class="settings-section">
        <span class="section-eyebrow">File Name</span>
        <input
          type="text"
          class="input-field"
          :value="fileNamesInput"
          @input="updateFileNames($event)"
          placeholder="e.g. Position1, Tactic2"
          :aria-invalid="fileNameError ? 'true' : 'false'"
        />
        <p class="field-error" x-show="fileNameError" x-cloak>
          <span x-text="fileNameError"></span>
        </p>
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
        <button
          type="button"
          @click="download()"
          :disabled="selectedFormats.length === 0"
          class="btn btn-primary download-btn"
        >
          ${raw(Download('download-btn-icon'))} Download
        </button>
      </div>
    </div>
  `;
}

function exportProgressModal(): string {
  return html`
    ${ModalShell({
      isOpenExpr: 'isExporting',
      onCloseExpr: 'void 0',
      title: 'Export Progress',
      icon: FileImage,
      iconColor: 'var(--color-text-secondary)',
      maxWidth: '28rem',
      showCloseButton: false,
      disableBackdropClick: true,
      children: html`
        <div class="space-y-5">
          <p class="text-sm text-text-secondary">
            <span x-text="isPaused ? 'Paused' : 'Creating image...'"></span>
          </p>
          <div class="progress-info">
            <span>Format:</span>
            <strong x-text="String(currentFormat || '').toUpperCase()"></strong>
          </div>
          <div class="space-y-3">
            <div
              class="progress-bar"
              role="progressbar"
              :aria-valuenow="displayProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                class="progress-bar-fill"
                :style="'width:' + displayProgress + '%'"
              ></div>
            </div>
            <p
              class="progress-percent"
              x-text="Math.round(displayProgress) + '% complete'"
            ></p>
          </div>
          <div class="progress-actions">
            <button
              type="button"
              class="btn btn-secondary progress-btn"
              @click="isPaused ? resumeExport() : pauseExport()"
              :aria-label="isPaused ? 'Resume export' : 'Pause export'"
            >
              <span x-show="isPaused" x-cloak class="progress-btn-inner">
                ${raw(Play('progress-btn-icon'))} <span>Resume</span>
              </span>
              <span x-show="!isPaused" x-cloak class="progress-btn-inner">
                ${raw(Pause('progress-btn-icon'))} <span>Pause</span>
              </span>
            </button>
            <button
              type="button"
              class="btn btn-danger progress-btn"
              @click="cancelExport()"
            >
              ${raw(XCircle('progress-btn-icon'))} <span>Cancel</span>
            </button>
          </div>
        </div>
      `
    })}
  `;
}

export function ExportPage(options: ExportPageOptions = {}): string {
  const tab =
    options.tab === 'export-settings' ? 'export-settings' : 'board-style';
  const rawFen =
    options.fen && options.fen.trim().length > 0
      ? options.fen.trim().slice(0, MAX_FEN_LENGTH)
      : '';
  const fenExpr = rawFen ? `'${sanitizeFenForExpr(rawFen)}'` : 'null';
  const dataExpr = `exportPage({ tab: '${tab}', fen: ${fenExpr} })`;

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
              :aria-selected="tab === 'board-style' ? 'true' : 'false'"
              @click="setTab('board-style')"
              :class="tab === 'board-style'
                ? 'tab-btn tab-btn-normal tab-btn-active'
                : 'tab-btn tab-btn-normal tab-btn-inactive'"
            >
              <span
                aria-hidden="true"
                class="tab-indicator"
                :class="tab === 'board-style'
                  ? 'tab-indicator-active'
                  : 'tab-indicator-inactive'"
              ></span>
              ${raw(LayoutGrid('tab-icon'))} Board Style
            </button>
            <button
              type="button"
              role="tab"
              aria-controls="panel-export-settings"
              :aria-selected="tab === 'export-settings' ? 'true' : 'false'"
              @click="setTab('export-settings')"
              :class="tab === 'export-settings'
                ? 'tab-btn tab-btn-normal tab-btn-active'
                : 'tab-btn tab-btn-normal tab-btn-inactive'"
            >
              <span
                aria-hidden="true"
                class="tab-indicator"
                :class="tab === 'export-settings'
                  ? 'tab-indicator-active'
                  : 'tab-indicator-inactive'"
              ></span>
              ${raw(Download('tab-icon'))} Export Settings
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  const sidebar = PageSidebarLayout({
    sidebar: tabs,
    contentLabel: 'Export Studio',
    children: html`${boardStyleStep()}${exportSettingsStep()}`
  });

  return html`
    <div class="export-root" x-data="${dataExpr}">
      <h1 class="sr-only">Export Chess Diagram</h1>

      <div class="export-empty" x-show="!hasConfig" x-cloak>
        <div class="export-empty-icon">
          ${raw(Download('export-empty-icon-img'))}
        </div>
        <p class="export-empty-title">No board loaded</p>
        <p class="export-empty-text">
          Open a position from the editor to export it as a high-resolution
          image.
        </p>
        <a href="/" class="btn btn-primary export-empty-link">
          ${raw(ArrowLeft('export-empty-link-icon'))} Back to Editor
        </a>
      </div>

      <div x-show="hasConfig" x-cloak>${sidebar} ${exportProgressModal()}</div>
    </div>

    ${raw(exportPageScript())}
  `;
}
