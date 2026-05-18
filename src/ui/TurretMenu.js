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

  show(tower, { onSell, onTargetChange, onUpgrade }) {
    this._tower = tower;
    this._callbacks = { onSell, onTargetChange, onUpgrade };
    this._render();
    this._panel.style.display = 'block';
  }

  refresh() {
    if (this._tower) this._render();
  }

  hide() {
    this._panel.style.display = 'none';
    this._tower = null;
  }

  get isOpen() { return this._panel.style.display !== 'none'; }
  get activeTower() { return this._tower; }


  _render() {
    const t = this._tower;
    const sellValue = Math.floor((t.totalSpent ?? t.cost) * 0.5);

    const upg = (t.upgrades || [])[t.level];
    const maxLevel = t.level >= 3;

    function deltaBadge(multiplier, label) {
      if (!multiplier || multiplier === 1.0) return '';
      const pct = Math.round((multiplier - 1) * 100);
      return `<span class="tm-delta tm-delta-pos">${label} +${pct}%</span>`;
    }

    const upgradeHTML = maxLevel
      ? `<div class="tm-upg-block tm-upg-max"><span class="tm-upg-maxlabel">★ MAX LEVEL</span></div>`
      : `<div class="tm-upg-block">
           <div class="tm-upg-header">
             <div>
               <div class="tm-upg-name">${upg.label}</div>
               <div class="tm-upg-deltas">
                 ${deltaBadge(upg.damageMultiplier,  'DMG')}
                 ${deltaBadge(upg.rangeMultiplier,   'RNG')}
                 ${deltaBadge(upg.fireRateMultiplier,'RATE')}
               </div>
             </div>
             <span class="tm-upg-cost">◈ ${upg.cost}</span>
           </div>
           <button class="tm-upgrade" id="tm-upgrade">UPGRADE TO LVL ${t.level + 1}</button>
         </div>`;

    const levelPips = [1,2,3].map(i =>
      `<span class="tm-pip${t.level >= i ? ' tm-pip-on' : ''}"></span>`
    ).join('');

    this._panel.innerHTML = `
      <div class="tm-header">
        <span class="tm-title">${t.name}</span>
        <div class="tm-level-row">${levelPips}</div>
        <button class="tm-close" id="tm-close">✕</button>
      </div>

      <div class="tm-stats">
        <div class="tm-stat">
          <span class="tm-slabel">RANGE</span>
          <span class="tm-sval">${t.range.toFixed(1)}</span>
        </div>
        <div class="tm-stat">
          <span class="tm-slabel">DAMAGE</span>
          <span class="tm-sval">${t.damage.toFixed(1)}</span>
        </div>
        <div class="tm-stat">
          <span class="tm-slabel">FIRE RATE</span>
          <span class="tm-sval">${t.fireRate.toFixed(2)}/s</span>
        </div>
      </div>

      <div class="tm-section-label">TARGETING</div>
      <div class="tm-targeting">
        <button class="tm-target-btn${t.targeting === 'closest' ? ' tm-active' : ''}" id="tm-closest">CLOSEST</button>
        <button class="tm-target-btn${t.targeting === 'first'   ? ' tm-active' : ''}" id="tm-first">FIRST</button>
      </div>

      <div class="tm-section-label">UPGRADE</div>
      ${upgradeHTML}

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

    const upgBtn = document.getElementById('tm-upgrade');
    if (upgBtn) {
      upgBtn.onclick = () => {
        this._callbacks.onUpgrade?.(t);
      };
    }

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
        bottom: 120px;
        left: 18px;
        z-index: 100;
        background: rgba(6,10,22,0.95);
        border: 1px solid rgba(70,212,255,0.5);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        padding: 14px 16px 14px;
        width: 240px;
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

      .tm-level-row {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .tm-pip {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .tm-pip.tm-pip-on {
        background: #46d4ff;
        border-color: #46d4ff;
        box-shadow: 0 0 6px #46d4ff;
      }

      .tm-upgrade {
        width: 100%;
        background: rgba(80,255,160,0.10);
        border: 1px solid rgba(80,255,160,0.45);
        border-radius: 6px;
        color: #80ffb0;
        font-size: 11px;
        letter-spacing: 0.10em;
        font-weight: 700;
        padding: 7px 10px;
        cursor: pointer;
        margin-top: 8px;
        transition: background 0.15s, border-color 0.15s;
      }
      .tm-upgrade:hover {
        background: rgba(80,255,160,0.22);
        border-color: #80ffb0;
      }

      .tm-upg-block {
        background: rgba(80,255,160,0.04);
        border: 1px solid rgba(80,255,160,0.25);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 8px;
      }
      .tm-upg-max {
        border-color: rgba(255,255,255,0.12);
        background: none;
        text-align: center;
      }
      .tm-upg-maxlabel {
        font-size: 11px;
        letter-spacing: 0.15em;
        color: rgba(255,255,255,0.30);
      }
      .tm-upg-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .tm-upg-name {
        font-size: 12px;
        font-weight: 700;
        color: #a0ffcc;
        letter-spacing: 0.05em;
        margin-bottom: 5px;
      }
      .tm-upg-cost {
        font-size: 13px;
        font-weight: 700;
        color: #12c9f7;
        white-space: nowrap;
        margin-left: 8px;
        margin-top: 1px;
      }
      .tm-upg-deltas {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .tm-delta {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .tm-delta-pos {
        background: rgba(80,255,160,0.15);
        color: #80ffb0;
        border: 1px solid rgba(80,255,160,0.35);
      }
    `;
    document.head.appendChild(style);
  }
}
