import { html } from '../helpers/html';

export function AdvancedFenPage(): string {
  return html`
    <div class="adv-root" x-data="advancedFen()">
      <h1>Advanced FEN Input</h1>
      <p class="subtitle">
        Add multiple positions for batch processing and export.
      </p>

      <div class="adv-layout">
        <div class="adv-input-area">
          <textarea
            x-model="text"
            @input="parseFens()"
            class="adv-textarea"
            placeholder="Paste multiple FEN strings, one per line...&#10;&#10;rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1&#10;r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
            spellcheck="false"
          ></textarea>
        </div>

        <div class="adv-sidebar">
          <div class="adv-stats">
            <div class="stat">
              <span class="stat-val" x-text="positions.length"></span>
              <span class="stat-label">positions</span>
            </div>
            <div class="stat">
              <span class="stat-val" x-text="validCount"></span>
              <span class="stat-label">valid</span>
            </div>
            <div class="stat" x-show="invalidCount > 0">
              <span class="stat-val text-error" x-text="invalidCount"></span>
              <span class="stat-label">invalid</span>
            </div>
          </div>

          <label class="adv-file-label" for="adv-file-name">File name</label>
          <input
            id="adv-file-name"
            type="text"
            class="adv-file-input"
            x-model="fileName"
            spellcheck="false"
          />
          <p class="adv-file-hint">
            Auto-appends
            <span x-text="validCount > 0 ? '-1, -2…' : ''"></span> per position.
            Use <code>name[2-4]</code> for explicit ranges.
          </p>

          <div class="adv-progress" x-show="exporting">
            <div class="adv-progress-bar">
              <div
                class="adv-progress-fill"
                :style="'width: ' + exportProgress + '%'"
              ></div>
            </div>
            <span
              class="adv-progress-text"
              x-text="exportProgress + '%'"
            ></span>
          </div>

          <button
            @click="exportAll()"
            class="btn btn-primary btn-full"
            :disabled="validCount === 0 || exporting"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 15V3" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
            Export All (<span x-text="validCount"></span>)
          </button>
          <button
            @click="clearAll()"
            class="btn btn-secondary btn-full"
            :disabled="positions.length === 0"
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="adv-list" x-show="positions.length > 0">
        <template x-for="(pos, i) in positions" :key="i">
          <div class="adv-item" :class="{ invalid: !pos.valid }">
            <span class="adv-index" x-text="i + 1"></span>
            <span class="adv-fen" x-text="pos.fen"></span>
            <span
              class="adv-status"
              x-show="!pos.valid"
              x-text="pos.error"
            ></span>
            <button @click="remove(i)" class="btn-icon-sm">&times;</button>
          </div>
        </template>
      </div>
    </div>

    <style>
      .adv-root {
        max-width: 960px;
        margin: 0 auto;
        padding: 1rem;
      }
      .adv-root h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgb(236 237 242);
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: rgb(130 133 148);
        margin-bottom: 1rem;
        font-size: 0.9375rem;
      }

      .adv-layout {
        display: flex;
        gap: 0.875rem;
        flex-direction: column;
      }
      @media (min-width: 640px) {
        .adv-layout {
          flex-direction: row;
        }
      }
      .adv-input-area {
        flex: 1;
      }
      .adv-textarea {
        width: 100%;
        min-height: 220px;
        background: rgb(24 25 32);
        color: rgb(236 237 242);
        font-family: monospace;
        font-size: 0.875rem;
        padding: 0.875rem;
        border: 1px solid rgb(48 50 60);
        border-radius: 12px;
        resize: vertical;
        line-height: 1.5;
        outline: none;
      }
      .adv-textarea:focus {
        border-color: rgb(59 130 246 / 0.5);
      }

      .adv-sidebar {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      @media (min-width: 640px) {
        .adv-sidebar {
          width: 180px;
          flex-shrink: 0;
        }
      }
      .adv-stats {
        display: flex;
        gap: 0.5rem;
      }
      @media (min-width: 640px) {
        .adv-stats {
          flex-direction: column;
        }
      }
      .stat {
        background: rgb(24 25 32);
        border: 1px solid rgb(48 50 60);
        border-radius: 10px;
        padding: 0.625rem;
        text-align: center;
        flex: 1;
      }
      .stat-val {
        font-size: 1.375rem;
        font-weight: 700;
        color: rgb(236 237 242);
        display: block;
      }
      .text-error {
        color: rgb(239 68 68);
      }
      .stat-label {
        font-size: 0.6875rem;
        color: rgb(130 133 148);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        border-radius: 10px;
        font-size: 0.875rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .btn-full {
        width: 100%;
      }
      .btn-primary {
        background: rgb(59 130 246);
        color: #fff;
      }
      .btn-primary:hover:not(:disabled) {
        background: rgb(37 99 235);
      }
      .btn-secondary {
        background: rgb(31 33 42);
        color: rgb(236 237 242);
        border: 1px solid rgb(48 50 60);
      }
      .btn-secondary:hover:not(:disabled) {
        background: rgb(38 41 50);
      }

      .adv-list {
        margin-top: 0.875rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }
      .adv-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgb(24 25 32);
        border: 1px solid rgb(48 50 60);
        border-radius: 8px;
        font-size: 0.8125rem;
      }
      .adv-item.invalid {
        border-color: rgb(239 68 68 / 0.4);
        background: rgb(239 68 68 / 0.04);
      }
      .adv-index {
        font-weight: 600;
        color: rgb(130 133 148);
        min-width: 1.5rem;
      }
      .adv-fen {
        font-family: monospace;
        color: rgb(236 237 242);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .adv-status {
        color: rgb(239 68 68);
        font-size: 0.75rem;
      }
      .btn-icon-sm {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border: none;
        background: none;
        color: rgb(130 133 148);
        font-size: 1.25rem;
        cursor: pointer;
        border-radius: 6px;
      }
      .btn-icon-sm:hover {
        color: rgb(239 68 68);
        background: rgb(239 68 68 / 0.1);
      }
      .adv-file-label {
        font-size: 0.6875rem;
        color: rgb(130 133 148);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-top: 0.25rem;
      }
      .adv-file-input {
        width: 100%;
        background: rgb(24 25 32);
        color: rgb(236 237 242);
        font-size: 0.8125rem;
        padding: 0.5rem 0.625rem;
        border: 1px solid rgb(48 50 60);
        border-radius: 8px;
        outline: none;
      }
      .adv-file-input:focus {
        border-color: rgb(59 130 246 / 0.5);
      }
      .adv-file-hint {
        font-size: 0.6875rem;
        color: rgb(130 133 148);
        line-height: 1.4;
      }
      .adv-file-hint code {
        color: rgb(148 163 184);
        background: rgb(31 33 42);
        padding: 0 0.25rem;
        border-radius: 4px;
      }
      .adv-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .adv-progress-bar {
        flex: 1;
        height: 6px;
        background: rgb(31 33 42);
        border-radius: 999px;
        overflow: hidden;
      }
      .adv-progress-fill {
        height: 100%;
        background: rgb(59 130 246);
        border-radius: 999px;
        transition: width 0.15s;
      }
      .adv-progress-text {
        font-size: 0.6875rem;
        color: rgb(130 133 148);
        min-width: 2.25rem;
        text-align: right;
      }
    </style>

    <script>
      (function () {
        'use strict';

        function sanitizeFileName(name) {
          return (
            String(name || 'chessboard')
              .trim()
              .replace(/[^a-z0-9._-]+/gi, '-')
              .replace(/-{2,}/g, '-')
              .replace(/^[.-]+|[.-]+$/g, '')
              .slice(0, 80) || 'chessboard'
          );
        }

        function parseSmartNaming(input, totalCount) {
          var names = [];
          for (var i = 0; i < totalCount; i++) names.push('');
          if (!input || !input.trim()) return names;
          var tokens = input.split(',').map(function (t) {
            return t.trim();
          });
          var lastRangeBaseName = '';
          var hasRangeToken = false;
          for (var ti = 0; ti < tokens.length; ti++) {
            var token = tokens[ti];
            var open = token.lastIndexOf('[');
            var close = token.lastIndexOf(']');
            if (open <= 0 || close !== token.length - 1) continue;
            var rangePart = token.slice(open + 1, close);
            var dash = rangePart.indexOf('-');
            if (dash <= 0 || dash >= rangePart.length - 1) continue;
            var baseName = token.slice(0, open).trim();
            if (baseName) lastRangeBaseName = baseName;
            var startNum = Number(rangePart.slice(0, dash));
            var endNum = Number(rangePart.slice(dash + 1));
            if (!isFinite(startNum) || !isFinite(endNum)) continue;
            hasRangeToken = true;
            var start = Math.min(startNum, endNum);
            var end = Math.max(startNum, endNum);
            var counter = 1;
            for (var i2 = start; i2 <= end && i2 <= totalCount; i2++) {
              if (i2 < 1) continue;
              names[i2 - 1] = baseName + '-' + counter;
              counter++;
            }
          }
          if (!hasRangeToken) {
            var base = input.trim();
            for (var j = 0; j < totalCount; j++)
              names[j] = base + '-' + (j + 1);
            return names;
          }
          var fallback = lastRangeBaseName || 'Position';
          for (var k = 0; k < totalCount; k++) {
            if (!names[k]) names[k] = fallback + '-' + (k + 1);
          }
          return names;
        }

        function svgUrl(cfg) {
          var params = {
            fen: cfg.fen,
            style: cfg.pieceStyle,
            light: cfg.lightSquare,
            dark: cfg.darkSquare,
            coords: cfg.showCoords ? '1' : '0',
            border: cfg.showCoordinateBorder ? '1' : '0',
            frame: cfg.showThinFrame ? '1' : '0',
            flipped: cfg.flipped ? '1' : '0',
            size: String(cfg.boardSize || 8),
            quality: String(cfg.exportQuality || 2)
          };
          var parts = [];
          for (var p in params) {
            if (Object.prototype.hasOwnProperty.call(params, p)) {
              parts.push(p + '=' + encodeURIComponent(params[p]));
            }
          }
          return '/export/svg?' + parts.join('&');
        }

        function saveBlob(blob, fileName, extension) {
          var safeName = sanitizeFileName(fileName);
          var safeExt = String(extension || '')
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase();
          var url = URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.href = url;
          link.download = safeExt ? safeName + '.' + safeExt : safeName;
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(function () {
            URL.revokeObjectURL(url);
          }, 100);
        }

        function parseFenLine(line) {
          var fen = line.trim();
          var parts = fen.split(' ').filter(Boolean);
          var board = parts[0] || '';
          if (board.indexOf('/') === -1 || board.length > 80) {
            return { fen: fen, valid: false, error: 'Invalid FEN' };
          }
          var ranks = board.split('/');
          if (ranks.length !== 8) {
            return { fen: fen, valid: false, error: 'Need 8 ranks' };
          }
          for (var r = 0; r < ranks.length; r++) {
            var rank = ranks[r];
            var count = 0;
            for (var c = 0; c < rank.length; c++) {
              var ch = rank[c];
              if (ch >= '1' && ch <= '8') count += Number(ch);
              else if (/[kqrbnpKQRBNP]/.test(ch)) count++;
              else return { fen: fen, valid: false, error: 'Invalid piece' };
            }
            if (count !== 8) {
              return { fen: fen, valid: false, error: 'Rank width ≠ 8' };
            }
          }
          return { fen: fen, valid: true };
        }

        document.addEventListener('alpine:init', function () {
          Alpine.data('advancedFen', function () {
            return {
              text: '',
              positions: [],
              fileName: 'chessboard',
              exporting: false,
              exportProgress: 0,

              get validCount() {
                return this.positions.filter(function (p) {
                  return p.valid;
                }).length;
              },
              get invalidCount() {
                return this.positions.filter(function (p) {
                  return !p.valid;
                }).length;
              },

              parseFens: function () {
                var self = this;
                this.positions = this.text
                  .split('\\n')
                  .filter(function (line) {
                    return line.trim();
                  })
                  .map(parseFenLine);
              },

              remove: function (i) {
                this.positions.splice(i, 1);
              },
              clearAll: function () {
                this.text = '';
                this.positions = [];
                this.exportProgress = 0;
              },

              exportAll: function () {
                var self = this;
                if (this.exporting) return;
                var valid = this.positions.filter(function (p) {
                  return p.valid;
                });
                if (valid.length === 0) return;
                var names = parseSmartNaming(this.fileName, valid.length);
                this.exporting = true;
                this.exportProgress = 0;

                var i = 0;
                function runNext() {
                  if (i >= valid.length) {
                    self.exporting = false;
                    self.exportProgress = 100;
                    self.notify('success', valid.length + ' SVGs exported');
                    return;
                  }
                  var pos = valid[i];
                  var cfg = {
                    fen: pos.fen,
                    pieceStyle: 'cburnett',
                    lightSquare: '#f0d9b5',
                    darkSquare: '#b58863',
                    showCoords: true,
                    showCoordinateBorder: true,
                    showThinFrame: false,
                    flipped: false,
                    boardSize: 8,
                    exportQuality: 2
                  };
                  fetch(svgUrl(cfg), { cache: 'no-store' })
                    .then(function (res) {
                      if (!res.ok) {
                        return res.text().then(function (t) {
                          throw new Error(t || 'SVG fetch failed');
                        });
                      }
                      return res.text();
                    })
                    .then(function (svgString) {
                      var blob = new Blob([svgString], {
                        type: 'image/svg+xml;charset=utf-8'
                      });
                      saveBlob(
                        blob,
                        names[i] || 'chessboard-' + (i + 1),
                        'svg'
                      );
                      i += 1;
                      self.exportProgress = Math.round(
                        (i / valid.length) * 100
                      );
                      runNext();
                    })
                    .catch(function () {
                      i += 1;
                      runNext();
                    });
                }
                runNext();
              },

              notify: function (type, message) {
                if (this.$store && this.$store.notifications) {
                  this.$store.notifications.push({
                    type: type,
                    message: message
                  });
                }
              }
            };
          });
        });
      })();
    </script>
  `;
}
