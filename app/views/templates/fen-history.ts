import { html } from '../helpers/html';

export function FenHistoryPage(): string {
  return html`
    <div class="history-root" x-data="fenHistory()" x-init="load()">
      <div class="history-header">
        <h1>FEN History</h1>
        <p class="subtitle">Your recent chess positions</p>
        <div class="history-actions">
          <select x-model="sort" @change="load()" class="select-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Alphabetical</option>
          </select>
          <button
            @click="clearAll()"
            class="btn-sm btn-danger"
            x-show="items.length > 0"
          >
            Clear All
          </button>
        </div>
      </div>

      <div class="history-grid" x-show="items.length > 0">
        <template x-for="item in items" :key="item.id">
          <a
            :href="'/?fen=' + encodeURIComponent(item.fen)"
            class="history-card"
          >
            <div class="history-board">
              <span class="fen-preview" x-text="item.fen.split(' ')[0]"></span>
            </div>
            <div class="history-meta">
              <span class="history-date" x-text="item.date"></span>
              <button
                @click.prevent="remove(item.id)"
                class="btn-icon-sm"
                title="Remove"
              >
                &times;
              </button>
            </div>
          </a>
        </template>
      </div>

      <div class="history-empty" x-show="items.length === 0">
        <div class="empty-icon">♔</div>
        <p>No positions saved yet.</p>
        <a href="/" class="btn btn-primary">Go to Board Editor</a>
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

      .history-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 0.75rem;
      }
      .history-card {
        background: rgb(24 25 32);
        border: 1px solid rgb(48 50 60);
        border-radius: 10px;
        overflow: hidden;
        text-decoration: none;
        transition: border-color 0.15s;
      }
      .history-card:hover {
        border-color: rgb(59 130 246 / 0.5);
        text-decoration: none;
      }
      .history-board {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgb(15 15 20);
        padding: 0.5rem;
      }
      .fen-preview {
        font-family: monospace;
        font-size: 0.625rem;
        color: rgb(130 133 148);
        word-break: break-all;
        text-align: center;
        line-height: 1.3;
      }
      .history-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.625rem;
        font-size: 0.75rem;
        color: rgb(130 133 148);
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
        font-size: 1.125rem;
        cursor: pointer;
        border-radius: 6px;
      }
      .btn-icon-sm:hover {
        background: rgb(38 41 50);
        color: rgb(239 68 68);
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
    </style>

    <script>
      document.addEventListener('alpine:init', () => {
        Alpine.data('fenHistory', () => ({
          items: [] as { id: number; fen: string; date: string }[],
          sort: 'newest',
          load() {
            try {
              this.items = JSON.parse(localStorage.getItem('cv-fen-history') || '[]');
              if (this.sort === 'name') this.items.sort((a, b) => a.fen.localeCompare(b.fen));
              else if (this.sort === 'oldest') this.items.reverse();
            } catch { this.items = []; }
          },
          remove(id: number) {
            this.items = this.items.filter(i => i.id !== id);
            localStorage.setItem('cv-fen-history', JSON.stringify(this.items));
          },
          clearAll() {
            if (confirm('Delete all saved positions?')) {
              this.items = [];
              localStorage.removeItem('cv-fen-history');
            }
          },
        }));
      });
    </script>
  `;
}
