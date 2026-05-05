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
          <span class="hud-icon" style="color:#12c9f7">✶</span>
          <span class="hud-label">STARDUST</span>
          <span class="hud-val hud-stardust" id="hud-stardust">150</span>
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

    // Standalone centred nexus HP bar at the top
    const nexusBar = document.createElement('div');
    nexusBar.id = 'hud-nexus-bar';
    nexusBar.innerHTML = `
      <span class="nexus-bar-icon">♥</span>
      <span class="nexus-bar-label">NEXUS</span>
      <div class="nexus-bar-track">
        <div class="nexus-bar-fill" id="hud-hp-bar"></div>
      </div>
      <span class="nexus-bar-val" id="hud-hp-val">200</span>
    `;
    document.getElementById('app').appendChild(nexusBar);

    // Boss HP bar (hidden by default)
    const bossBar = document.createElement('div');
    bossBar.id = 'hud-boss-bar';
    bossBar.classList.add('hud-boss-hidden');
    bossBar.innerHTML = `
      <span class="boss-bar-icon">☠</span>
      <span class="boss-bar-label">EXIMUS</span>
      <div class="boss-bar-track">
        <div class="boss-bar-fill" id="hud-boss-fill"></div>
      </div>
      <span class="boss-bar-val" id="hud-boss-val"></span>
    `;
    document.getElementById('app').appendChild(bossBar);
    this._bossBarEl = bossBar;
    this._bossFill = null; 
    this._bossValEl = null;

    // Separate top-right menu button (outside the HUD panel)
    const menuBtn = document.createElement('button');
    menuBtn.id = 'hud-menu-btn';
    menuBtn.textContent = 'MAIN MENU';
    document.getElementById('app').appendChild(menuBtn);

    this._hpBar = document.getElementById('hud-hp-bar');
    this._hpVal = document.getElementById('hud-hp-val');
    this._stardust = document.getElementById('hud-stardust');
    this._wave = document.getElementById('hud-wave');
    this._enemies = document.getElementById('hud-enemies');
    this._waveBtn = document.getElementById('hud-wave-btn');
    this._menuBtn = document.getElementById('hud-menu-btn');
    this._msg = document.getElementById('hud-msg');
  }

  /** @param {import('../core/GameState.js').GameState} state */
  bind(state, onWaveStart, onMainMenu) {
    this._maxHP = state.config.nexusMaxHP;
    this._sync(state);

    state.on('nexusDamaged', () => this._sync(state));
    state.on('stardustChanged', () => this._syncStardust(state));
    state.on('waveStarted', () => { this._syncWave(state); this._syncEnemies(state); });
    state.on('enemyKilled', () => this._syncEnemies(state));
    state.on('waveCleared', () => {
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

    this._menuBtn.addEventListener('click', () => {
      if (onMainMenu) onMainMenu();
    });
  }

  _sync(state) {
    const pct = Math.max(0, state.hp / this._maxHP);
    this._hpBar.style.width  = `${pct * 100}%`;
    this._hpBar.style.background = pct > 0.5
      ? '#46d4ff'
      : pct > 0.25 ? '#ffaa00' : '#ff2060';
    this._hpVal.textContent  = state.hp;
    this._syncStardust(state);
    this._syncWave(state);
    this._syncEnemies(state);
  }

  _syncStardust(state)    { this._stardust.textContent    = state.stardust; }
  _syncWave(state)    { this._wave.textContent    = state.wave || '—'; }
  _syncEnemies(state) { this._enemies.textContent = state.phase === 'combat' ? state.enemiesLeft : '—'; }

  /** Show the boss bar and set max HP */
  showBossBar(maxHp, type = 'boss') {
    this._bossFill = document.getElementById('hud-boss-fill');
    this._bossValEl = document.getElementById('hud-boss-val');
    this._bossMaxHp = maxHp;
    const label = this._bossBarEl.querySelector('.boss-bar-label');
    label.textContent = 'EXIMUS';
    this._bossBarEl.classList.remove('hud-boss-hidden');
    this.updateBossBar(maxHp);
  }

  /** Update boss bar with current HP */
  updateBossBar(hp) {
    if (!this._bossFill) return;
    const pct = Math.max(0, hp / this._bossMaxHp);
    this._bossFill.style.width = `${pct * 100}%`;
    this._bossFill.style.background = pct > 0.5 ? '#cc44ff' : pct > 0.25 ? '#ffaa00' : '#ff2060';
    this._bossValEl.textContent = Math.ceil(hp);
  }

  /** Hide the boss bar */
  hideBossBar() {
    this._bossBarEl.classList.add('hud-boss-hidden');
  }

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
  .hud-stardust   { color: #12c9f7; }
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
  #hud-menu-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 20;
    padding: 8px 16px;
    font-size: 11px;
    letter-spacing: 0.15em;
    font-weight: 700;
    color: #d8f1ff;
    background: rgba(6,10,22,0.82);
    border: 1px solid rgba(70,212,255,0.4);
    border-radius: 8px;
    backdrop-filter: blur(6px);
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
  }
  #hud-menu-btn:hover { background: rgba(70,212,255,0.18); box-shadow: 0 0 12px rgba(70,212,255,0.3); }
  #hud-nexus-bar {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(6,10,22,0.82);
    border: 1px solid rgba(70,212,255,0.4);
    border-radius: 8px;
    backdrop-filter: blur(6px);
    padding: 7px 16px;
    pointer-events: none;
  }
  .nexus-bar-icon { font-size: 18px; color: #ff2060; }
  .nexus-bar-label { font-size: 13px; letter-spacing: 0.15em; color: #7ab8d8; font-weight: 700; }
  .nexus-bar-track {
    width: 1000px;
    height: 12px;
    background: rgba(255,255,255,0.08);
    border-radius: 6px;
    overflow: hidden;
  }
  .nexus-bar-fill {
    height: 100%;
    border-radius: 6px;
    background: #46d4ff;
    transition: width 0.3s ease, background 0.4s ease;
    width: 100%;
  }
  .nexus-bar-val { font-size: 16px; font-weight: 700; color: #d8f1ff; min-width: 36px; text-align: right; }
  #hud-boss-bar {
    position: absolute;
    top: 68px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(6,10,22,0.82);
    border: 1px solid rgba(180,60,255,0.5);
    border-radius: 8px;
    backdrop-filter: blur(6px);
    padding: 7px 16px;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  .hud-boss-hidden { opacity: 0 !important; pointer-events: none !important; }
  .boss-bar-icon  { font-size: 18px; color: #cc44ff; }
  .boss-bar-label { font-size: 13px; letter-spacing: 0.15em; color: #c07ad8; font-weight: 700; }
  .boss-bar-track {
    width: 1000px;
    height: 12px;
    background: rgba(255,255,255,0.08);
    border-radius: 6px;
    overflow: hidden;
  }
  .boss-bar-fill {
    height: 100%;
    border-radius: 6px;
    background: #cc44ff;
    transition: width 0.2s ease, background 0.4s ease;
    width: 100%;
  }
  .boss-bar-val { font-size: 16px; font-weight: 700; color: #d8f1ff; min-width: 36px; text-align: right; }
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
