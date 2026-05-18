export class GameState {
  constructor(config) {
    this.config = config;
    this.reset();
  }

  reset() {
    const c = this.config;
    this.hp = c.nexusMaxHP;
    this.stardust = c.startingStardust;
    this.wave = 0;
    this.enemiesLeft = 0;
    this.phase = 'menu';
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

  addStardust(amount) {
    this.stardust += amount;
    this.emit('stardustChanged', { stardust: this.stardust });
  }

  spendStardust(amount) {
    if (this.stardust < amount) return false;
    this.stardust -= amount;
    this.emit('stardustChanged', { stardust: this.stardust });
    return true;
  }

  enemyKilled(reward = 0) {
    this.score += 10;
    if (reward > 0) this.addStardust(reward);
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

  startWave(enemyCount) {
    const c = this.config;
    this.wave++;
    this.enemiesLeft = enemyCount;
    this.phase = 'combat';
    this.emit('waveStarted', { wave: this.wave, total: this.enemiesLeft });
  }
}
