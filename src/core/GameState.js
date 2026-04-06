// GameState – single source of truth for live game data
export class GameState {
  constructor(config) {
    this.config = config;
    this.reset();
  }

  reset() {
    const c = this.config;
    this.hp = c.nexusMaxHP;
    this.gold = c.startingGold;
    this.wave = 0;
    this.enemiesLeft = 0;
    this.phase = 'menu';   // 'menu' | 'build' | 'combat' | 'gameover' | 'victory'
    this.score = 0;
    this._listeners = {};
  }

  on(event, fn) {
    (this._listeners[event] ||= []).push(fn);
  }

  emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  }

  damageNexus(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.emit('nexusDamaged', { hp: this.hp, amount });
    if (this.hp <= 0) {
      this.phase = 'gameover';
      this.emit('gameover', {});
    }
  }

  addGold(amount) {
    this.gold += amount;
    this.emit('goldChanged', { gold: this.gold });
  }

  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    this.emit('goldChanged', { gold: this.gold });
    return true;
  }

  enemyKilled() {
    this.score += 10;
    this.addGold(this.config.killReward);
    this.enemiesLeft = Math.max(0, this.enemiesLeft - 1);
    this.emit('enemyKilled', { enemiesLeft: this.enemiesLeft });
    if (this.enemiesLeft <= 0 && this.phase === 'combat') {
      if (this.wave >= this.config.totalWaves) {
        this.phase = 'victory';
        this.emit('victory', { wave: this.wave, score: this.score });
      } else {
        this.phase = 'build';
        this.emit('waveCleared', { wave: this.wave });
      }
    }
  }

  enemyReachedEnd() {
    // Enemy dealt damage — no gold or score reward
    this.enemiesLeft = Math.max(0, this.enemiesLeft - 1);
    this.emit('enemyKilled', { enemiesLeft: this.enemiesLeft });
    if (this.enemiesLeft <= 0 && this.phase === 'combat') {
      if (this.wave >= this.config.totalWaves) {
        this.phase = 'victory';
        this.emit('victory', { wave: this.wave, score: this.score });
      } else {
        this.phase = 'build';
        this.emit('waveCleared', { wave: this.wave });
      }
    }
  }

  startWave() {
    const c = this.config;
    this.wave++;
    this.enemiesLeft = c.enemiesPerWave + (this.wave - 1) * c.enemiesPerWaveGrow;
    this.phase = 'combat';
    this.emit('waveStarted', { wave: this.wave, total: this.enemiesLeft });
  }
}
