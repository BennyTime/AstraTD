/**
 * NavigationMenu – full-screen start/pause/gameover overlay.
 * Injects its own DOM + CSS; controlled via show(screen) / hide().
 */
export class NavigationMenu {
  /** @param {HTMLElement} mountEl  the #app div */
  constructor(mountEl) {
    this._mount = mountEl;
    this._callbacks = {};
    this._buildDOM();
  }

  _buildDOM() {
    const overlay = document.createElement('div');
    overlay.id = 'nav-overlay';
    overlay.innerHTML = `
      <!-- ── MAIN MENU ── -->
      <div class="nav-screen" id="nav-main">
        <div class="nav-logo">
          <div class="nav-logo-glow"></div>
          <h1 class="nav-title">ASTRA TD</h1>
          <p class="nav-sub">TOWER DEFENSE IN SPACE</p>
        </div>
        <div class="nav-buttons">
          <button class="nav-btn nav-btn-primary" id="btn-start">START GAME</button>
          <button class="nav-btn" id="btn-how">HOW TO PLAY</button>
        </div>
        <div class="nav-footer">ICG 2025/2026 · Bernardo Borges</div>
      </div>

      <!-- ── HOW TO PLAY ── -->
      <div class="nav-screen nav-hidden" id="nav-how">
        <h2 class="nav-section-title">HOW TO PLAY</h2>
        <div class="nav-rules">
          <p><span class="key">SPACE</span> Start next wave</p>
          <p><span class="key">CLICK</span> Place laser turret on board</p>
          <p>Clicking the turret opens a menu to change targeting or sell it.</p>
          <p>Enemies follow the <span class="hl"> path</span> to the <span class="hl">Nexus</span>.</p>
          <p>Each enemy that reaches the Nexus deals damage.</p>
          <p>Kill enemies to earn <span class="hl stardust">stardust</span> and buy more towers.</p>
        </div>
        <button class="nav-btn nav-btn-primary" id="btn-how-back">BACK</button>
      </div>

      <!-- ── GAME OVER ── -->
      <div class="nav-screen nav-hidden" id="nav-gameover">
        <div class="nav-logo">
          <h1 class="nav-title gameover-title">NEXUS</h1>
          <h1 class="nav-title gameover-title">DESTROYED</h1>
          <p class="nav-sub">The enemy has breached your defenses.</p>
        </div>
        <div class="gameover-score">
          <span class="score-label">SCORE</span>
          <span class="score-val" id="go-score">0</span>
        </div>
        <div class="nav-buttons">
          <button class="nav-btn nav-btn-primary" id="btn-restart">PLAY AGAIN</button>
          <button class="nav-btn" id="btn-go-menu">MAIN MENU</button>
        </div>
      </div>

      <!-- ── WAVE CLEAR ── -->
      <div class="nav-screen nav-hidden" id="nav-waveclear">
        <h2 class="nav-section-title waveclear-wave" id="wc-wave-label">WAVE CLEARED</h2>
        <p class="nav-sub">Prepare your defenses for the next assault.</p>
        <div class="nav-buttons" style="margin-top:24px">
          <button class="nav-btn nav-btn-primary" id="btn-next-wave">NEXT WAVE</button>
        </div>
      </div>

      <!-- ── VICTORY ── -->
      <div class="nav-screen nav-hidden" id="nav-victory">
        <div class="nav-logo">
          <h1 class="nav-title victory-title">VICTORY</h1>
          <p class="nav-sub">All waves repelled. The Nexus stands, for now...</p>
        </div>
        <div class="gameover-score">
          <span class="score-label">FINAL SCORE</span>
          <span class="score-val" id="vc-score">0</span>
        </div>
        <div class="nav-buttons">
          <button class="nav-btn nav-btn-primary" id="btn-victory-restart">PLAY AGAIN</button>
          <button class="nav-btn" id="btn-victory-menu">MAIN MENU</button>
        </div>
      </div>
    `;
    this._mount.appendChild(overlay);
    this._overlay = overlay;

    // Wire events
    document.getElementById('btn-start').addEventListener('click', () => {
      this.hide();
      this._emit('start');
    });
    document.getElementById('btn-how').addEventListener('click', () => {
      this._show('nav-how');
    });
    document.getElementById('btn-how-back').addEventListener('click', () => {
      this._show('nav-main');
    });
    document.getElementById('btn-restart').addEventListener('click', () => {
      this.hide();
      this._emit('restart');
    });
    document.getElementById('btn-go-menu').addEventListener('click', () => {
      this._show('nav-main');
      this._emit('mainmenu');
    });
    document.getElementById('btn-next-wave').addEventListener('click', () => {
      this.hide();
      this._emit('nextwave');
    });
    document.getElementById('btn-victory-restart').addEventListener('click', () => {
      this.hide();
      this._emit('restart');
    });
    document.getElementById('btn-victory-menu').addEventListener('click', () => {
      this._show('nav-main');
      this._emit('mainmenu');
    });
  }

  on(event, fn) { (this._callbacks[event] ||= []).push(fn); }
  _emit(event, data) { (this._callbacks[event] || []).forEach(f => f(data)); }

  _show(screenId) {
    this._overlay.querySelectorAll('.nav-screen').forEach(s => s.classList.add('nav-hidden'));
    document.getElementById(screenId).classList.remove('nav-hidden');
    this._overlay.classList.remove('nav-hidden');
  }

  show(screen = 'main', extra = {}) {
    this._overlay.classList.remove('nav-hidden');
    if (screen === 'main')      { this._show('nav-main'); }
    else if (screen === 'gameover') {
      document.getElementById('go-score').textContent = extra.score ?? 0;
      this._show('nav-gameover');
    }
    else if (screen === 'waveclear') {
      document.getElementById('wc-wave-label').textContent = `WAVE ${extra.wave ?? '?'} CLEARED`;
      this._show('nav-waveclear');
    }
    else if (screen === 'victory') {
      document.getElementById('vc-score').textContent = extra.score ?? 0;
      this._show('nav-victory');
    }
  }

  hide() { this._overlay.classList.add('nav-hidden'); }
}

// ── Inject CSS ──────────────────────────────────────────────────────────────
const css = document.createElement('style');
css.textContent = `
  #nav-overlay {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse at 50% 40%, rgba(8,18,52,0.55) 0%, rgba(2,4,12,0.75) 100%),
      url('src/backgrounds/spaaaaaace.gif') center/cover no-repeat;
    transition: opacity .25s;
  }
  #nav-overlay.nav-hidden { display: none; }

  .nav-screen  { text-align: center; max-width: 460px; width: 90%; }
  .nav-hidden  { display: none !important; }

  .nav-logo    { position: relative; margin-bottom: 32px; }
  .nav-logo-glow {
    position: absolute;
    top: 50%; left: 50%;
    width: 320px; height: 120px;
    transform: translate(-50%, -60%);
    background: radial-gradient(ellipse, rgba(70,212,255,0.25) 0%, transparent 70%);
    pointer-events: none;
  }
  .nav-title {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    font-size: clamp(38px, 8vw, 72px);
    font-weight: 900;
    letter-spacing: 0.25em;
    color: #fff;
    text-shadow: 0 0 30px #46d4ff, 0 0 60px rgba(70,212,255,0.4);
    margin: 0;
  }
  .gameover-title { color: #ff2060; text-shadow: 0 0 30px #ff2060, 0 0 60px rgba(255,32,96,0.4); }
  .victory-title  { color: #46d4ff; text-shadow: 0 0 30px #46d4ff, 0 0 60px rgba(70,212,255,0.4); }
  .nav-sub {
    font-size: 13px;
    letter-spacing: 0.2em;
    color: #7ab8d8;
    margin: 6px 0 0;
  }

  .nav-section-title {
    font-size: 22px;
    letter-spacing: 0.18em;
    color: #46d4ff;
    margin-bottom: 20px;
    font-weight: 700;
  }
  .waveclear-wave { color: #ffcc00; text-shadow: 0 0 20px rgba(255,200,0,0.5); }

  .nav-buttons { display: flex; flex-direction: column; gap: 12px; align-items: center; }
  .nav-btn {
    width: 220px;
    padding: 13px 0;
    font-size: 13px;
    letter-spacing: 0.18em;
    font-weight: 700;
    border-radius: 8px;
    border: 1px solid rgba(70,212,255,0.5);
    background: rgba(70,212,255,0.08);
    color: #d8f1ff;
    cursor: pointer;
    transition: background .2s, box-shadow .2s, transform .1s;
  }
  .nav-btn:hover { background: rgba(70,212,255,0.18); box-shadow: 0 0 16px rgba(70,212,255,0.3); transform: translateY(-1px); }
  .nav-btn:active { transform: translateY(0); }
  .nav-btn-primary {
    background: #46d4ff;
    color: #050913;
    border-color: #46d4ff;
    box-shadow: 0 0 20px rgba(70,212,255,0.35);
  }
  .nav-btn-primary:hover { background: #88e8ff; box-shadow: 0 0 28px rgba(70,212,255,0.5); }

  .nav-footer { margin-top: 36px; font-size: 11px; color: rgba(120,170,200,0.45); letter-spacing: 0.05em; }

  .nav-rules { text-align: left; margin: 0 auto 24px; max-width: 320px; }
  .nav-rules p { margin: 10px 0; font-size: 13px; color: #d8f1ff; font-family: 'Segoe UI', sans-serif; }
  .key {
    display: inline-block;
    background: rgba(70,212,255,0.15);
    border: 1px solid rgba(70,212,255,0.4);
    border-radius: 4px;
    padding: 1px 7px;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #46d4ff;
    font-weight: 700;
  }
  .hl   { color: #ff8840; font-weight: 600; }
  .stardust { color: #12c9f7 !important; }

  .gameover-score { margin: 20px auto; }
  .score-label { display: block; font-size: 11px; letter-spacing: 0.2em; color: #7ab8d8; margin-bottom: 6px; }
  .score-val {
    display: block;
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 0 20px #46d4ff;
    letter-spacing: 0.05em;
  }
`;
document.head.appendChild(css);
