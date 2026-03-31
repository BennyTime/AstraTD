/**
 * HUD – updates DOM elements based on GameState.
 * The HUD HTML is injected into `#hud` in index.html.
 */
export class HUD {
  /** @param {HTMLElement} root */
  constructor(root) {
    this.root = root;
    this._buildDOM();
  }

  _buildDOM() {
    this.root.innerHTML = `
      <div class="hud-inner">
        <div class="hud-row hud-title">ASTRA TD</div>

        <div class="hud-row">
          <span class="hud-icon hud-hp-icon">♥</span>
          <span class="hud-label">NEXUS</span>
          <div class="hud-bar-wrap">
            <div class="hud-bar hud-hp-bar" id="hud-hp-bar"></div>
          </div>
          <span class="hud-val" id="hud-hp-val">200</span>
        </div>

        <div class="hud-row">
          <span class="hud-icon" style="color:#ffcc00">◈</span>
          <span class="hud-label">GOLD</span>
          <span class="hud-val hud-gold" id="hud-gold">150</span>
        </div>

        <div class="hud-row">
          <span class="hud-icon" style="color:#46d4ff">⚡</span>
          <span class="hud-label">WAVE</span>
          <span class="hud-val" id="hud-wave">—</span>
        </div>

        <div class="hud-row">
          <span class="hud-icon" style="color:#ff2060">◉</span>
          <span class="hud-label">ENEMIES</span>
          <span class="hud-val" id="hud-enemies">—</span>
        </div>

        <div class="hud-row" id="hud-action-row">
          <button class="hud-btn" id="hud-wave-btn">START WAVE</button>
        </div>

        <div class="hud-msg" id="hud-msg"></div>
      </div>
    `;

    this._hpBar   = document.getElementById('hud-hp-bar');
    this._hpVal   = document.getElementById('hud-hp-val');
    this._gold    = document.getElementById('hud-gold');
    this._wave    = document.getElementById('hud-wave');
    this._enemies = document.getElementById('hud-enemies');
    this._waveBtn = document.getElementById('hud-wave-btn');
    this._msg     = document.getElementById('hud-msg');
  }

  /** @param {import('../core/GameState.js').GameState} state */
  bind(state, onWaveStart) {
    this._maxHP = state.config.nexusMaxHP;
    this._sync(state);

    state.on('nexusDamaged', () => this._sync(state));
    state.on('goldChanged',  () => this._syncGold(state));
    state.on('waveStarted',  () => { this._syncWave(state); this._syncEnemies(state); });
    state.on('enemyKilled',  () => this._syncEnemies(state));
    state.on('waveCleared',  () => {
      this._waveBtn.disabled = false;
      this._waveBtn.textContent = 'START WAVE';
      this.showMsg('Wave Cleared!', 2500);
    });
    state.on('gameover',     () => { this._msg.textContent = '— NEXUS DESTROYED —'; this._msg.style.color = '#ff2060'; this._waveBtn.disabled = true; });

    this._waveBtn.addEventListener('click', () => {
      if (state.phase === 'build' || state.phase === 'menu') {
        this._waveBtn.disabled = true;
        this._waveBtn.textContent = 'IN COMBAT…';
        onWaveStart();
      }
    });
  }

  _sync(state) {
    const pct = Math.max(0, state.hp / this._maxHP);
    this._hpBar.style.width  = `${pct * 100}%`;
    this._hpBar.style.background = pct > 0.5
      ? '#46d4ff'
      : pct > 0.25 ? '#ffaa00' : '#ff2060';
    this._hpVal.textContent  = state.hp;
    this._syncGold(state);
    this._syncWave(state);
    this._syncEnemies(state);
  }

  _syncGold(state)    { this._gold.textContent    = state.gold; }
  _syncWave(state)    { this._wave.textContent    = state.wave || '—'; }
  _syncEnemies(state) { this._enemies.textContent = state.phase === 'combat' ? state.enemiesLeft : '—'; }

  showMsg(text, duration = 2000) {
    this._msg.textContent = text;
    this._msg.style.color = '#46d4ff';
    if (this._msgTimeout) clearTimeout(this._msgTimeout);
    this._msgTimeout = setTimeout(() => { this._msg.textContent = ''; }, duration);
  }
}

// ── inject HUD CSS ──────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  #hud {
    position: absolute;
    top: 14px; left: 14px;
    z-index: 20;
    min-width: 20px;
    pointer-events: none;
  }
  .hud-inner {
    background: rgba(6,10,22,0.82);
    border: 1px solid rgba(70,212,255,0.4);
    border-radius: 10px;
    backdrop-filter: blur(6px);
    padding: 10px 14px 10px;
    min-width: 210px;
    pointer-events: auto;
  }
  .hud-title {
    font-size: 11px;
    letter-spacing: 0.25em;
    color: #46d4ff;
    font-weight: 700;
    margin-bottom: 8px;
    text-align: center;
  }
  .hud-row {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 5px 0;
    font-size: 12px;
    color: #d8f1ff;
  }
  .hud-icon   { font-size: 14px; width: 16px; text-align: center; }
  .hud-label  { font-size: 10px; letter-spacing: 0.1em; color: #7ab8d8; min-width: 50px; }
  .hud-val    { font-size: 13px; font-weight: 600; color: #d8f1ff; margin-left: auto; }
  .hud-gold   { color: #ffcc00; }
  .hud-bar-wrap {
    flex: 1;
    height: 8px;
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
    overflow: hidden;
  }
  .hud-bar {
    height: 100%;
    border-radius: 4px;
    background: #46d4ff;
    transition: width 0.3s ease, background 0.4s ease;
    width: 100%;
  }
  .hud-btn {
    margin-top: 6px;
    width: 100%;
    padding: 6px 0;
    font-size: 11px;
    letter-spacing: 0.15em;
    font-weight: 700;
    color: #050913;
    background: #46d4ff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, opacity 0.2s;
  }
  .hud-btn:hover:not(:disabled) { background: #88e8ff; }
  .hud-btn:disabled { opacity: 0.4; cursor: default; }
  .hud-msg {
    margin-top: 6px;
    font-size: 11px;
    min-height: 16px;
    text-align: center;
    letter-spacing: 0.05em;
    color: #46d4ff;
  }
`;
document.head.appendChild(style);
