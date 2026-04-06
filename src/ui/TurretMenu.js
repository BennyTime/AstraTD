/**
 * TurretMenu – contextual popup shown when the player clicks a placed turret.
 *
 * Displays turret stats, lets the player switch targeting mode (closest / first)
 * and sell the turret for 50 % of its purchase cost.
 */
export class TurretMenu {
  constructor() {
    this._panel = document.createElement('div');
    this._panel.id = 'turret-menu';
    this._panel.style.display = 'none';
    document.body.appendChild(this._panel);

    this._tower = null;
    this._callbacks = {};

    this._injectCSS();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  show(tower, screenX, screenY, { onSell, onTargetChange }) {
    this._tower = tower;
    this._callbacks = { onSell, onTargetChange };
    this._render();

    // Make visible first so we can read its dimensions
    this._panel.style.display = 'block';
    const w = this._panel.offsetWidth || 200;
    const h = this._panel.offsetHeight || 200;

    // Position to the right/below click, clamped inside viewport
    const px = Math.min(screenX + 12, window.innerWidth - w - 10);
    const py = Math.min(screenY - 10, window.innerHeight - h - 10);
    this._panel.style.left = Math.max(8, px) + 'px';
    this._panel.style.top  = Math.max(8, py) + 'px';
  }

  hide() {
    this._panel.style.display = 'none';
    this._tower = null;
  }

  get isOpen() { return this._panel.style.display !== 'none'; }
  get activeTower() { return this._tower; }

  // ── Internal ──────────────────────────────────────────────────────────────

  _render() {
    const t = this._tower;
    const sellValue = Math.floor(t.cost * 0.5);

    this._panel.innerHTML = `
      <div class="tm-header">
        <span class="tm-title">${t.name}</span>
        <button class="tm-close" id="tm-close">✕</button>
      </div>

      <div class="tm-stats">
        <div class="tm-stat">
          <span class="tm-slabel">RANGE</span>
          <span class="tm-sval">${t.range}</span>
        </div>
        <div class="tm-stat">
          <span class="tm-slabel">DAMAGE</span>
          <span class="tm-sval">${t.damage}</span>
        </div>
        <div class="tm-stat">
          <span class="tm-slabel">FIRE RATE</span>
          <span class="tm-sval">${t.fireRate}/s</span>
        </div>
      </div>

      <div class="tm-section-label">TARGETING</div>
      <div class="tm-targeting">
        <button class="tm-target-btn${t.targeting === 'closest' ? ' tm-active' : ''}" id="tm-closest">CLOSEST</button>
        <button class="tm-target-btn${t.targeting === 'first'   ? ' tm-active' : ''}" id="tm-first">FIRST</button>
      </div>

      <button class="tm-sell" id="tm-sell">SELL  +◈ ${sellValue}</button>
    `;

    document.getElementById('tm-close').onclick = () => this.hide();

    document.getElementById('tm-closest').onclick = () => {
      this._callbacks.onTargetChange(t, 'closest');
      this._render();
    };

    document.getElementById('tm-first').onclick = () => {
      this._callbacks.onTargetChange(t, 'first');
      this._render();
    };

    document.getElementById('tm-sell').onclick = () => {
      this._callbacks.onSell(t);
      this.hide();
    };
  }

  _injectCSS() {
    if (document.getElementById('turret-menu-css')) return;
    const style = document.createElement('style');
    style.id = 'turret-menu-css';
    style.textContent = `
      #turret-menu {
        position: fixed;
        z-index: 100;
        background: rgba(6,10,22,0.93);
        border: 1px solid rgba(70,212,255,0.5);
        border-radius: 10px;
        backdrop-filter: blur(8px);
        padding: 10px 14px 12px;
        min-width: 180px;
        font-family: inherit;
        color: #d8f1ff;
        pointer-events: auto;
        user-select: none;
      }

      .tm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .tm-title {
        font-size: 11px;
        letter-spacing: 0.2em;
        color: #46d4ff;
        font-weight: 700;
      }
      .tm-close {
        background: none;
        border: none;
        color: #7ab8d8;
        font-size: 13px;
        cursor: pointer;
        padding: 0 2px;
        line-height: 1;
      }
      .tm-close:hover { color: #ff2060; }

      .tm-stats { margin-bottom: 8px; }
      .tm-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        margin: 3px 0;
      }
      .tm-slabel { color: #7ab8d8; font-size: 10px; letter-spacing: 0.1em; }
      .tm-sval   { font-weight: 600; }

      .tm-section-label {
        font-size: 9px;
        letter-spacing: 0.2em;
        color: #7ab8d8;
        margin: 6px 0 5px;
      }

      .tm-targeting {
        display: flex;
        gap: 6px;
        margin-bottom: 10px;
      }
      .tm-target-btn {
        flex: 1;
        background: rgba(70,212,255,0.07);
        border: 1px solid rgba(70,212,255,0.28);
        border-radius: 6px;
        color: #7ab8d8;
        font-size: 10px;
        letter-spacing: 0.1em;
        padding: 5px 4px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .tm-target-btn:hover {
        background: rgba(70,212,255,0.18);
        color: #d8f1ff;
        border-color: rgba(70,212,255,0.6);
      }
      .tm-target-btn.tm-active {
        background: rgba(70,212,255,0.22);
        border-color: #46d4ff;
        color: #46d4ff;
        font-weight: 700;
      }

      .tm-sell {
        width: 100%;
        background: rgba(255,170,0,0.08);
        border: 1px solid rgba(255,170,0,0.35);
        border-radius: 6px;
        color: #ffcc00;
        font-size: 11px;
        letter-spacing: 0.1em;
        padding: 6px 8px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .tm-sell:hover {
        background: rgba(255,170,0,0.2);
        border-color: #ffcc00;
      }
    `;
    document.head.appendChild(style);
  }
}
