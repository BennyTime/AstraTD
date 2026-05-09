/**
 * TowerShop – bottom-panel shop UI for selecting which tower to place.
 *
 * Shows one card per available tower type. Clicking a card selects that
 * tower for placement; clicking again (or pressing Escape) deselects.
 * Cards are dimmed when the player cannot afford them.
 *
 * Usage:
 *   const shop = new TowerShop(towerDefs, onSelect);
 *   shop.show();
 *   shop.updateStardust(amount);
 *
 * towerDefs: Array<{
 *   key: string,       // internal key, e.g. 'laser'
 *   name: string,      // display name
 *   cost: number,
 *   range: number | string,
 *   damage: number | string,
 *   fireRate: number | string,
 *   tag: string,       // short mechanic label, e.g. 'Single Target'
 *   color: string,     // CSS accent colour for the card border/title
 *   icon: string,      // Unicode/emoji icon shown on the card
 * }>
 *
 * onSelect: (key: string | null) => void
 *   Called whenever the selection changes.
 */
export class TowerShop {
  constructor(towerDefs, onSelect) {
    this._defs = towerDefs;
    this._onSelect = onSelect;
    this._selected = null;
    this._stardust = 0;
    this._panel = null;
    this._cards = {};

    this._injectCSS();
    this._buildDOM();

    // Escape key deselects
    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') this.deselect();
    });

    // Number hotkeys 1–4 cycle through towers
    window.addEventListener('keydown', e => {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < this._defs.length) {
        e.preventDefault();
        const def = this._defs[idx];
        this._toggle(def.key);
      }
    });
  }

  // ── Public API ───────────────────────────────────────────────────────────

  get selected() { return this._selected; }

  show() { this._panel.style.display = 'flex'; }
  hide() { this._panel.style.display = 'none'; }

  /** Update displayed stardust and dim unaffordable cards. */
  updateStardust(amount) {
    this._stardust = amount;
    this._refreshAffordability();
  }

  /** Programmatically deselect the current tower. */
  deselect() {
    if (this._selected === null) return;
    this._selected = null;
    this._onSelect(null);
    this._refreshSelected();
    this._updateCursor(false);
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  _toggle(key) {
    const def = this._defs.find(d => d.key === key);
    if (!def) return;
    if (this._stardust < def.cost) {
      const card = this._cards[key];
      if (card) {
        card.classList.add('ts-cant-afford');
        setTimeout(() => card.classList.remove('ts-cant-afford'), 500);
      }
      return;
    }

    this._selected = this._selected === key ? null : key;
    this._onSelect(this._selected);
    this._refreshSelected();
    this._updateCursor(this._selected !== null);
  }

  _buildDOM() {
    this._panel = document.createElement('div');
    this._panel.id = 'tower-shop';
    this._panel.style.display = 'none'; // hidden until show() is called

    // Header label
    const label = document.createElement('div');
    label.className = 'ts-label';
    label.textContent = 'TOWER SHOP';
    this._panel.appendChild(label);

    // Cards
    this._defs.forEach((def, i) => {
      const card = document.createElement('div');
      card.className = 'ts-card';
      card.dataset.key = def.key;
      card.title = def.description || def.name;
      card.style.setProperty('--ts-accent', def.color);
      card.innerHTML = `
        <div class="ts-card-top">
          <span class="ts-hotkey">${i + 1}</span>
          <span class="ts-icon">${def.icon}</span>
        </div>
        <div class="ts-name">${def.name}</div>
        <div class="ts-cost">◈ ${def.cost}</div>
        <div class="ts-stats">
          <span title="Range">↔ ${def.range}</span>
          <span title="Damage">⚡ ${def.damage}</span>
        </div>
        <div class="ts-tag">${def.tag}</div>
      `;
      card.addEventListener('click', () => this._toggle(def.key));
      this._panel.appendChild(card);
      this._cards[def.key] = card;
    });

    // Place-mode hint shown below the panel
    const hint = document.createElement('div');
    hint.id = 'ts-hint';
    hint.textContent = 'Click grid to place  •  ESC to cancel  •  1-4 hotkeys';
    this._panel.appendChild(hint);

    document.body.appendChild(this._panel);
  }

  _refreshSelected() {
    this._defs.forEach(def => {
      const card = this._cards[def.key];
      if (!card) return;
      card.classList.toggle('ts-selected', this._selected === def.key);
    });
  }

  _refreshAffordability() {
    this._defs.forEach(def => {
      const card = this._cards[def.key];
      if (!card) return;
      const canAfford = this._stardust >= def.cost;
      card.classList.toggle('ts-unaffordable', !canAfford);
      // Deselect if we can no longer afford the selected tower
      if (!canAfford && this._selected === def.key) {
        this.deselect();
      }
    });
  }

  _updateCursor(placing) {
    document.body.style.cursor = placing ? 'crosshair' : '';
  }

  // ── CSS ───────────────────────────────────────────────────────────────────

  _injectCSS() {
    if (document.getElementById('tower-shop-css')) return;
    const style = document.createElement('style');
    style.id = 'tower-shop-css';
    style.textContent = `
      #tower-shop {
        position: fixed;
        bottom: 18px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 30;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 10px;
        padding: 10px 16px 14px;
        background: rgba(4, 8, 20, 0.88);
        border: 1px solid rgba(70, 212, 255, 0.28);
        border-radius: 14px;
        backdrop-filter: blur(10px);
        pointer-events: auto;
        user-select: none;
      }

      .ts-label {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        transform: rotate(180deg);
        font-size: 9px;
        letter-spacing: 0.22em;
        color: rgba(70, 212, 255, 0.55);
        font-weight: 700;
        align-self: center;
        margin-right: 2px;
      }

      .ts-card {
        --ts-accent: #46d4ff;
        width: 110px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 10px;
        padding: 9px 10px 8px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, transform 0.12s, box-shadow 0.15s;
        position: relative;
        overflow: hidden;
      }
      .ts-card::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 10px;
        background: var(--ts-accent);
        opacity: 0;
        transition: opacity 0.15s;
      }
      .ts-card:hover:not(.ts-unaffordable)::before { opacity: 0.06; }
      .ts-card:hover:not(.ts-unaffordable) {
        border-color: rgba(255, 255, 255, 0.28);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      }
      .ts-card.ts-cant-afford {
        animation: ts-shake 0.4s ease;
        border-color: rgba(255, 80, 80, 0.7) !important;
      }
      @keyframes ts-shake {
        0%   { transform: translateX(0); }
        20%  { transform: translateX(-5px); }
        40%  { transform: translateX(5px); }
        60%  { transform: translateX(-4px); }
        80%  { transform: translateX(4px); }
        100% { transform: translateX(0); }
      }

      .ts-card.ts-selected {
        border-color: var(--ts-accent);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 16px color-mix(in srgb, var(--ts-accent) 50%, transparent);
        transform: translateY(-4px);
      }
      .ts-card.ts-selected::before { opacity: 0.10; }
      .ts-card.ts-unaffordable {
        opacity: 0.38;
        cursor: not-allowed;
        transform: none;
      }

      .ts-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .ts-hotkey {
        font-size: 10px;
        font-weight: 700;
        color: rgba(255,255,255,0.30);
        background: rgba(255,255,255,0.07);
        border-radius: 4px;
        padding: 1px 5px;
        letter-spacing: 0;
      }
      .ts-card.ts-selected .ts-hotkey {
        color: var(--ts-accent);
        background: color-mix(in srgb, var(--ts-accent) 20%, transparent);
      }
      .ts-icon {
        font-size: 22px;
        line-height: 1;
      }
      .ts-name {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.10em;
        color: var(--ts-accent);
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ts-cost {
        font-size: 12px;
        font-weight: 700;
        color: #12c9f7;
        margin-bottom: 4px;
      }
      .ts-stats {
        display: flex;
        gap: 6px;
        font-size: 9px;
        color: rgba(216, 241, 255, 0.55);
        margin-bottom: 4px;
      }
      .ts-tag {
        font-size: 9px;
        letter-spacing: 0.10em;
        color: var(--ts-accent);
        opacity: 0.65;
        text-transform: uppercase;
      }
      .ts-card.ts-selected .ts-tag { opacity: 1; }

      #ts-hint {
        position: fixed;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        letter-spacing: 0.12em;
        color: rgba(70, 212, 255, 0.38);
        white-space: nowrap;
        pointer-events: none;
        width: max-content;
        display: none;
      }
      #tower-shop.has-selection #ts-hint {
        display: block;
      }
    `;
    document.head.appendChild(style);
  }
}
