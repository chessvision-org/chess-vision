import { html } from '../helpers/html';

export function SettingsPage(): string {
  return html`
    <div class="settings-root" x-data="settingsPage()">
      <h1>Settings</h1>
      <p class="subtitle">Customize your ChessViewer experience.</p>

      <!-- Display -->
      <section class="setting-section">
        <h2>Display</h2>
        <div class="setting-card">
          <label class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Show Coordinates</span
              ><span class="setting-desc"
                >Display rank and file labels around the board</span
              >
            </div>
            <input type="checkbox" x-model="showCoords" class="toggle" />
          </label>
          <label class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Board Frame</span
              ><span class="setting-desc"
                >Add a thin decorative border around the board</span
              >
            </div>
            <input type="checkbox" x-model="showFrame" class="toggle" />
          </label>
        </div>
      </section>

      <!-- Board size -->
      <section class="setting-section">
        <h2>Board Size</h2>
        <div class="setting-card">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-name">Physical Size</span
              ><span class="setting-desc"
                >Board size in centimeters for export</span
              >
            </div>
            <div class="setting-control">
              <input
                type="range"
                min="3"
                max="30"
                x-model="boardSize"
                class="range"
              />
              <span class="range-val" x-text="boardSize + ' cm'"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Board Colors -->
      <section class="setting-section">
        <h2>Board Colors</h2>
        <div class="setting-card">
          <div class="color-grid">
            ${[
              ['#F0D9B5', '#B58863', 'Classic'],
              ['#EEEED2', '#769656', 'Green'],
              ['#DEB887', '#8B4513', 'Wood'],
              ['#E8E8E8', '#A0A0A0', 'Gray'],
              ['#C8C8C8', '#606060', 'Dark'],
              ['#FFCF9A', '#D08A4E', 'Warm']
            ]
              .map(
                ([light, dark, name]) => `
            <button class="theme-preset" @click="setColors('${light}', '${dark}')"
              :class="{ active: lightSquare === '${light}' }" title="${name}">
              <span class="theme-swatch" style="background:linear-gradient(135deg,${light} 50%,${dark} 50%)"></span>
              <span class="theme-name">${name}</span>
            </button>`
              )
              .join('')}
          </div>
          <div class="color-custom">
            <label class="color-pick"
              ><span>Light</span
              ><input type="color" x-model="lightSquare" class="color-input"
            /></label>
            <label class="color-pick"
              ><span>Dark</span
              ><input type="color" x-model="darkSquare" class="color-input"
            /></label>
          </div>
        </div>
      </section>
    </div>

    <style>
      .settings-root {
        max-width: 640px;
        margin: 0 auto;
        padding: 1rem;
      }
      .settings-root h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgb(236 237 242);
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: rgb(130 133 148);
        margin-bottom: 1.5rem;
        font-size: 0.9375rem;
      }
      .setting-section {
        margin-bottom: 1.25rem;
      }
      .setting-section h2 {
        font-size: 0.9375rem;
        font-weight: 600;
        color: rgb(236 237 242);
        margin-bottom: 0.5rem;
      }
      .setting-card {
        background: rgb(24 25 32);
        border: 1px solid rgb(48 50 60);
        border-radius: 12px;
        padding: 0.75rem 1rem;
      }
      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
        cursor: pointer;
      }
      .setting-row + .setting-row {
        border-top: 1px solid rgb(48 50 60);
      }
      .setting-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .setting-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: rgb(236 237 242);
      }
      .setting-desc {
        font-size: 0.75rem;
        color: rgb(130 133 148);
      }
      .setting-control {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }
      .toggle {
        width: 2.75rem;
        height: 1.5rem;
        appearance: none;
        background: rgb(48 50 60);
        border-radius: 999px;
        cursor: pointer;
        position: relative;
        transition: background 0.2s;
      }
      .toggle:checked {
        background: rgb(59 130 246);
      }
      .toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 1.25rem;
        height: 1.25rem;
        background: #fff;
        border-radius: 50%;
        transition: transform 0.2s;
      }
      .toggle:checked::after {
        transform: translateX(1.25rem);
      }
      .range {
        width: 80px;
        accent-color: rgb(59 130 246);
      }
      .range-val {
        font-size: 0.8125rem;
        font-weight: 600;
        color: rgb(236 237 242);
        min-width: 3rem;
        text-align: right;
      }

      .color-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .theme-preset {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem;
        border: 2px solid transparent;
        border-radius: 10px;
        background: rgb(15 15 20);
        cursor: pointer;
        transition: all 0.15s;
      }
      .theme-preset:hover {
        border-color: rgb(48 50 60);
      }
      .theme-preset.active {
        border-color: rgb(59 130 246);
      }
      .theme-swatch {
        width: 100%;
        height: 2rem;
        border-radius: 6px;
      }
      .theme-name {
        font-size: 0.6875rem;
        color: rgb(130 133 148);
      }
      .color-custom {
        display: flex;
        gap: 0.5rem;
      }
      .color-pick {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex: 1;
        font-size: 0.75rem;
        color: rgb(130 133 148);
      }
      .color-input {
        width: 2rem;
        height: 2rem;
        border: none;
        cursor: pointer;
        border-radius: 6px;
        background: transparent;
      }
    </style>

    <script>
      document.addEventListener('alpine:init', () => {
        Alpine.data('settingsPage', () => ({
          showCoords: true,
          showFrame: false,
          boardSize: 10,
          lightSquare: '#F0D9B5',
          darkSquare: '#B58863',
          setColors(l: string, d: string) { this.lightSquare = l; this.darkSquare = d; },
        }));
      });
    </script>
  `;
}
