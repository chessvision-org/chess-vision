import { html } from "../helpers/html";
import { Modal } from "../components/ui";

export function FenHistoryPage(): string {
  return html`
    <div class="history-root" data-history-root>
      <div class="history-header">
        <h1>FEN History</h1>
        <p class="subtitle">Your recent chess positions</p>
        <div class="history-tabs" role="tablist">
          <button type="button" role="tab" data-tab="active" class="active" aria-selected="true">
            Active
            <span class="tab-count" data-tab-count="active">0</span>
          </button>
          <button type="button" role="tab" data-tab="favorites" aria-selected="false">
            Favorites
            <span class="tab-count" data-tab-count="favorites">0</span>
          </button>
          <button type="button" role="tab" data-tab="archive" aria-selected="false">
            Archive
            <span class="tab-count" data-tab-count="archive">0</span>
          </button>
        </div>
        <div class="history-actions">
          <select data-sort class="select-sm" aria-label="Sort positions">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Alphabetical</option>
          </select>
          <button type="button" data-clear-all class="btn-sm btn-danger" hidden>Clear All</button>
        </div>
      </div>

      <div class="history-grid" data-history-grid hidden></div>

      <div class="history-empty" data-history-empty hidden>
        <div class="empty-icon">♔</div>
        <p data-empty-message></p>
        <a href="/" class="btn btn-primary">Go to Board Editor</a>
      </div>

      ${Modal({
        id: "delete-confirm-modal",
        type: "danger",
        title: "Confirm",
        children: html`<p data-delete-message></p>`,
      })}
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
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
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
      .mini-board:after {
        content: "";
        display: table;
        clear: both;
      }
    </style>

    <script src="/fen-history.js"></script>
  `;
}
