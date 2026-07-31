import { html } from "../helpers/html";

export function FenHistoryPage(): string {
  return html`
    <div class="history-root" x-data="fenHistory()" x-init="load()">
      <div class="history-header">
        <h1>FEN History</h1>
        <p class="subtitle">Your recent chess positions</p>
        <div class="history-tabs" role="tablist">
          <button
            role="tab"
            :class="{ active: activeTab === 'active' }"
            @click="activeTab = 'active'; load()"
            :aria-selected="activeTab === 'active'"
          >
            Active
            <span class="tab-count" x-text="activeCount"></span>
          </button>
          <button
            role="tab"
            :class="{ active: activeTab === 'favorites' }"
            @click="activeTab = 'favorites'; load()"
            :aria-selected="activeTab === 'favorites'"
          >
            Favorites
            <span class="tab-count" x-text="favCount"></span>
          </button>
          <button
            role="tab"
            :class="{ active: activeTab === 'archive' }"
            @click="activeTab = 'archive'; load()"
            :aria-selected="activeTab === 'archive'"
          >
            Archive
            <span class="tab-count" x-text="archiveCount"></span>
          </button>
        </div>
        <div class="history-actions">
          <select x-model="sort" @change="load()" class="select-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Alphabetical</option>
          </select>
          <button
            @click="clearAll()"
            class="btn-sm btn-danger"
            x-show="filteredItems.length > 0"
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="history-grid" x-show="filteredItems.length > 0">
        <template x-for="item in filteredItems" :key="item.id">
          <div class="history-card" :class="{ favorite: item.isFavorite }">
            <a :href="'/?fen=' + encodeURIComponent(item.fen)" class="history-card-link">
              <div class="history-board">
                <div class="mini-board" x-data="miniBoard()" x-init="render($el, item.fen, lightSquare, darkSquare, pieceStyle)">
                </div>
              </div>
              <div class="history-meta">
                <div class="history-info">
                  <code class="history-fen" x-text="item.fen.split(' ')[0]"></code>
                  <div class="history-timestamp" x-text="formatDateTime(item.timestamp)"></div>
                  <div class="history-source" x-show="item.source" x-text="'Source: ' + item.source"></div>
                </div>
                <div class="history-actions-cell">
                  <button
                    @click.prevent="toggleFavorite(item.id)"
                    class="btn-icon-sm fav-btn"
                    :class="{ active: item.isFavorite }"
                    :title="item.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                  <button
                    @click.prevent="copyFen(item.fen)"
                    class="btn-icon-sm"
                    title="Copy FEN"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <template x-if="activeTab === 'archive'">
                    <button
                      @click.prevent="reactivate(item.id)"
                      class="btn-icon-sm"
                      title="Reactivate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        <polyline points="23 4 23 10 17 10"></polyline>
                      </svg>
                    </button>
                    <button
                      @click.prevent="deleteWithConfirm(item.id)"
                      class="btn-icon-sm btn-danger"
                      title="Delete permanently"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </template>
                  <template x-if="activeTab !== 'archive'">
                    <button
                      @click.prevent="deleteWithConfirm(item.id)"
                      class="btn-icon-sm btn-danger"
                      title="Move to archive"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                        <polyline points="23 4 23 10 17 10"></polyline>
                      </svg>
                    </button>
                  </template>
                </div>
              </div>
            </a>
          </div>
        </template>
      </div>

      <div class="history-empty" x-show="filteredItems.length === 0">
        <div class="empty-icon">♔</div>
        <p x-text="emptyMessage"></p>
        <a href="/" class="btn btn-primary">Go to Board Editor</a>
      </div>

      <div class="modal-overlay" x-show="showDeleteConfirm" @click.self="cancelDelete" x-transition>
        <div class="modal" x-transition>
          <h3>Confirm</h3>
          <p x-text="deleteConfirmMessage"></p>
          <div class="modal-actions">
            <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
            <button @click="confirmDelete" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .history-root {
        max-width: 960px;
        margin: 0 auto;
        padding: 1rem;
      }
      .history-header {
        margin-bottom: 1.25rem;
      }
      .history-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgb(236 237 242);
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: rgb(130 133 148);
        font-size: 0.9375rem;
      }
      .history-tabs {
        display: flex;
        gap: 0.25rem;
        margin-top: 0.75rem;
        border-bottom: 1px solid rgb(48 50 60);
        padding-bottom: 0.5rem;
      }
      .history-tabs button {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.875rem;
        border: none;
        background: transparent;
        color: rgb(130 133 148);
        font-size: 0.8125rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .history-tabs button:hover {
        color: rgb(236 237 242);
        background: rgb(31 33 42);
      }
      .history-tabs button.active {
        color: rgb(59 130 246);
        background: rgb(59 130 246 / 0.1);
      }
      .tab-count {
        background: rgb(31 33 42);
        color: rgb(130 133 148);
        font-size: 0.625rem;
        font-weight: 700;
        padding: 0.125rem 0.375rem;
        border-radius: 999px;
      }
      .history-tabs button.active .tab-count {
        background: rgb(59 130 246);
        color: white;
      }
      .history-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
      }
      .select-sm {
        background: rgb(24 25 32);
        color: rgb(236 237 242);
        border: 1px solid rgb(48 50 60);
        border-radius: 8px;
        padding: 0.375rem 0.625rem;
        font-size: 0.8125rem;
      }
      .btn-sm {
        padding: 0.375rem 0.75rem;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
      }
      .btn-danger {
        background: rgb(239 68 68 / 0.12);
        color: rgb(239 68 68);
      }
      .btn-danger:hover {
        background: rgb(239 68 68 / 0.2);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        border-radius: 10px;
        font-size: 0.9375rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        text-decoration: none;
      }
      .btn-primary {
        background: rgb(59 130 246);
        color: #fff;
      }
      .btn-primary:hover {
        background: rgb(37 99 235);
      }
      .btn-secondary {
        background: rgb(31 33 42);
        color: rgb(236 237 242);
        border: 1px solid rgb(48 50 60);
      }
      .btn-secondary:hover {
        background: rgb(38 41 50);
      }

      .history-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.75rem;
      }
      .history-card {
        background: rgb(24 25 32);
        border: 1px solid rgb(48 50 60);
        border-radius: 10px;
        overflow: hidden;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .history-card:hover {
        border-color: rgb(59 130 246 / 0.5);
        box-shadow: 0 4px 12px rgb(0 0 0 / 0.3);
      }
      .history-card.favorite {
        border-color: rgb(245 158 11 / 0.5);
      }
      .history-card-link {
        display: block;
        text-decoration: none;
        color: inherit;
      }
      .history-board {
        aspect-ratio: 1;
        background: rgb(15 15 20);
        padding: 0.5rem;
      }
      .mini-board {
        width: 100%;
        height: 100%;
      }
      .history-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.625rem;
        font-size: 0.75rem;
      }
      .history-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
      }
      .history-fen {
        font-family: monospace;
        font-size: 0.625rem;
        color: rgb(130 133 148);
        word-break: break-all;
        line-height: 1.4;
      }
      .history-timestamp {
        color: rgb(100 103 118);
        font-size: 0.625rem;
      }
      .history-source {
        color: rgb(59 130 246);
        font-size: 0.5625rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .history-actions-cell {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-wrap: wrap;
      }
      .btn-icon-sm {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        border: none;
        background: none;
        color: rgb(130 133 148);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
      }
      .btn-icon-sm:hover {
        background: rgb(38 41 50);
        color: rgb(236 237 242);
      }
      .btn-icon-sm.fav-btn.active {
        color: rgb(245 158 11);
      }
      .btn-icon-sm.fav-btn.active:hover {
        background: rgb(245 158 11 / 0.15);
      }
      .btn-icon-sm.btn-danger:hover {
        color: rgb(239 68 68);
        background: rgb(239 68 68 / 0.1);
      }

      .history-empty {
        text-align: center;
        padding: 3rem 1rem;
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 0.75rem;
        color: rgb(48 50 60);
      }
      .history-empty p {
        color: rgb(130 133 148);
        margin-bottom: 1rem;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgb(0 0 0 / 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }
      .modal {
        background: rgb(24 25 32);
        border: 1px solid rgb(48 50 60);
        border-radius: 12px;
        padding: 1.25rem;
        max-width: 320px;
        width: 90%;
        box-shadow: 0 20px 40px rgb(0 0 0 / 0.4);
      }
      .modal h3 {
        font-size: 1rem;
        font-weight: 700;
        color: rgb(236 237 242);
        margin-bottom: 0.5rem;
      }
      .modal p {
        color: rgb(130 133 148);
        margin-bottom: 1rem;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .mini-square {
        width: 12.5%;
        height: 12.5%;
        float: left;
        position: relative;
      }
      .mini-square img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
      }
      .mini-board {
        width: 100%;
        height: 100%;
      }
      .mini-board:after {
        content: "";
        display: table;
        clear: both;
      }
    </style>

    <script>
      document.addEventListener('alpine:init', () => {
        Alpine.data('miniBoard', () => ({
          render(el, fen, lightSquare, darkSquare, pieceStyle) {
            const placement = (fen || '').trim().split(/\\s+/)[0] || '';
            if (!placement) return;
            const ranks = placement.split('/');
            const board = [];
            for (const rank of ranks) {
              const row = [];
              for (const ch of rank) {
                if (ch >= '1' && ch <= '8') {
                  for (let k = 0; k < parseInt(ch); k++) row.push('');
                } else {
                  row.push(ch);
                }
              }
              while (row.length < 8) row.push('');
              board.push(row.slice(0, 8));
            }
            const flipped = false;
            const viewRows = flipped ? board.slice().reverse().map(r => r.slice().reverse()) : board;
            let html = '';
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                const cell = viewRows[r][c];
                const isLight = (r + c) % 2 === 0;
                const bg = isLight ? lightSquare : darkSquare;
                let pieceHtml = '';
                if (cell) {
                  const key = (cell === cell.toUpperCase() ? 'w' : 'b') + cell.toUpperCase();
                  pieceHtml = '<img src="/piece/' + pieceStyle + '/' + key + '.svg" alt="" />';
                }
                html += '<div class="mini-square" style="background:' + bg + '">' + pieceHtml + '</div>';
              }
            }
            el.innerHTML = html;
          }
        }));

        Alpine.data('fenHistory', () => ({
          activeTab: 'active',
          sort: 'newest',
          showDeleteConfirm: false,
          deleteTargetId: null,
          history: [],
          archive: [],
          favorites: {},
          lightSquare: '#f0d9b5',
          darkSquare: '#b58863',
          pieceStyle: 'cburnett',

          get activeCount() {
            return this.history.length;
          },
          get favCount() {
            return Object.keys(this.favorites).length;
          },
          get archiveCount() {
            return this.archive.length;
          },
          get filteredItems() {
            let items = [];
            if (this.activeTab === 'active') {
              items = this.history;
            } else if (this.activeTab === 'favorites') {
              const favFens = Object.keys(this.favorites);
              items = this.history.filter(h => favFens.includes(h.fen));
            } else {
              items = this.archive;
            }
            if (this.sort === 'name') {
              items = items.slice().sort((a, b) => a.fen.localeCompare(b.fen));
            } else if (this.sort === 'oldest') {
              items = items.slice().reverse();
            }
            return items;
          },
          get emptyMessage() {
            if (this.activeTab === 'active') return 'No positions saved yet.';
            if (this.activeTab === 'favorites') return 'No favorite positions.';
            return 'Archive is empty.';
          },
          get deleteConfirmMessage() {
            if (this.activeTab === 'archive') {
              return 'Permanently delete this position? This cannot be undone.';
            }
            return 'Move this position to the archive?';
          },

          load() {
            try {
              const rawHist = localStorage.getItem('fen-history');
              this.history = rawHist ? JSON.parse(rawHist) : [];
            } catch { this.history = []; }
            try {
              const rawArch = localStorage.getItem('fen-archive');
              this.archive = rawArch ? JSON.parse(rawArch) : [];
            } catch { this.archive = []; }
            try {
              const rawFav = localStorage.getItem('favoriteFens');
              this.favorites = rawFav ? JSON.parse(rawFav) : {};
            } catch { this.favorites = {}; }
            try {
              this.lightSquare = localStorage.getItem('chess-light-square') || '#f0d9b5';
              this.darkSquare = localStorage.getItem('chess-dark-square') || '#b58863';
              this.pieceStyle = localStorage.getItem('chess-piece-style') || 'cburnett';
            } catch {}
          },

          saveHistory() {
            try {
              localStorage.setItem('fen-history', JSON.stringify(this.history));
            } catch (e) {}
          },
          saveArchive() {
            try {
              localStorage.setItem('fen-archive', JSON.stringify(this.archive));
            } catch (e) {}
          },
          saveFavorites() {
            try {
              localStorage.setItem('favoriteFens', JSON.stringify(this.favorites));
            } catch (e) {}
          },

          formatDateTime(ts) {
            if (!ts) return '';
            const d = new Date(ts);
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
              ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
          },

          toggleFavorite(id) {
            const entry = this.history.find(h => h.id === id);
            if (!entry) return;
            const fen = entry.fen;
            if (this.favorites[fen]) {
              delete this.favorites[fen];
              entry.isFavorite = false;
            } else {
              this.favorites[fen] = true;
              entry.isFavorite = true;
            }
            this.saveFavorites();
            this.saveHistory();
          },

          copyFen(fen) {
            navigator.clipboard.writeText(fen).then(() => {
              this.$store.notifications.push({ type: 'success', message: 'FEN copied to clipboard' });
            }).catch(() => {
              this.$store.notifications.push({ type: 'error', message: 'Could not copy FEN' });
            });
          },

          deleteWithConfirm(id) {
            this.deleteTargetId = id;
            this.showDeleteConfirm = true;
          },
          cancelDelete() {
            this.deleteTargetId = null;
            this.showDeleteConfirm = false;
          },
          confirmDelete() {
            if (this.deleteTargetId === null) return;
            if (this.activeTab === 'archive') {
              this.archive = this.archive.filter(h => h.id !== this.deleteTargetId);
              this.saveArchive();
            } else {
              const entry = this.history.find(h => h.id === this.deleteTargetId);
              if (entry) {
                if (!entry.isFavorite) {
                  this.archive.unshift({
                    ...entry,
                    archivedAt: Date.now(),
                    timestamp: entry.createdAt || entry.lastActiveAt
                  });
                  this.saveArchive();
                }
                this.history = this.history.filter(h => h.id !== this.deleteTargetId);
                this.saveHistory();
              }
            }
            this.cancelDelete();
          },

          reactivate(id) {
            const idx = this.archive.findIndex(h => h.id === id);
            if (idx === -1) return;
            const entry = this.archive[idx];
            this.archive.splice(idx, 1);
            entry.archivedAt = undefined;
            entry.lastActiveAt = Date.now();
            this.history.unshift(entry);
            this.saveArchive();
            this.saveHistory();
          },

          clearAll() {
            if (!confirm('Delete all saved positions in this view?')) return;
            if (this.activeTab === 'archive') {
              this.archive = [];
              this.saveArchive();
            } else if (this.activeTab === 'favorites') {
              for (const entry of this.history) {
                if (entry.isFavorite) {
                  entry.isFavorite = false;
                }
              }
              this.favorites = {};
              this.saveFavorites();
              this.saveHistory();
            } else {
              this.history = [];
              this.saveHistory();
            }
          }
        }));
      });
    </script>
  `;
}
