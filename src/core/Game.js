import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.js';
import { WaveConfig } from '../config/WaveConfig.js';
import { GameState } from './GameState.js';
import { HUD } from '../ui/HUD.js';
import { NavigationMenu } from '../ui/NavigationMenu.js';
import { createBoard } from '../models/board/Board.js';
import { createNexus } from '../models/misc/Nexus.js';
import { createCargoShip } from '../models/misc/CargoShip.js';
import { createCrystalCluster, createFloatingCrystal } from '../models/misc/FloatingCrystal.js';
import { createStarField } from '../models/misc/StarField.js';
import { createSun } from '../models/misc/Sun.js';
import { createStandardEnemy, StandardEnemyStats } from '../models/enemies/StandardEnemy.js';
import { createFastEnemy, FastEnemyStats } from '../models/enemies/FastEnemy.js';
import { createTankEnemy, TankEnemyStats } from '../models/enemies/TankEnemy.js';
import { createHealerEnemy, HealerEnemyStats } from '../models/enemies/HealerEnemy.js';
import { createDisruptorEnemy, DisruptorEnemyStats } from '../models/enemies/DisruptorEnemy.js';
import { createEximusEnemy, EximusEnemyStats } from '../models/enemies/EximusEnemy.js';
import { createDuckEnemy, DuckEnemyStats } from '../models/enemies/DuckEnemy.js';
import { createBossEnemy, BossEnemyStats } from '../models/enemies/BossEnemy.js';
import { createLaserTurret, LaserTurretStats } from '../models/towers/LaserTurret.js';
import { TurretMenu } from '../ui/TurretMenu.js';

// Lookup table: type string → { create, stats }
const ENEMY_FACTORIES = {
  standard: { create: createStandardEnemy, stats: StandardEnemyStats },
  fast: { create: createFastEnemy, stats: FastEnemyStats },
  tank: { create: createTankEnemy, stats: TankEnemyStats },
  healer: { create: createHealerEnemy, stats: HealerEnemyStats },
  disruptor: { create: createDisruptorEnemy, stats: DisruptorEnemyStats },
  eximus: { create: createEximusEnemy, stats: EximusEnemyStats },
  duck: { create: createDuckEnemy, stats: DuckEnemyStats },
  boss: { create: createBossEnemy, stats: BossEnemyStats },
};

export class Game {
  constructor({ mountElement, hudElement }) {
    this._mount = mountElement;
    this._hudEl = hudElement;
    this._config = GameConfig;
    this._state = new GameState(GameConfig);
    this._animFns = [];
    this._enemies = [];
    this._towers = [];
    this._clock = new THREE.Clock(false);
    this._spawnQueue = 0;
    this._spawnAccum = 0;
    this._spawnTypeQueue = [];   // ordered list of type strings for current wave
    this._spawnInterval = 1200; // ms; overridden per wave
    this._deferredSpawns = [];   // { type, pathT } queued mid-frame (eximus children)
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────

  start() {
    this._initRenderer();
    this._initScene();
    this._initLights();
    this._buildWorld();
    this._initCamera();
    this._initInteraction();
    this._initUI();
    this._clock.start();
    this._loop();
  }

  _initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    this._mount.appendChild(renderer.domElement);
    this._renderer = renderer;
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
    });
  }

  _initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x0a1a2e, 0.008);
    this._scene = scene;
  }

  _initLights() {
    // Ambient — warm-toned so the organic board colours read correctly
    const ambient = new THREE.AmbientLight(0x8cb8d8, 2.2);
    this._scene.add(ambient);

    // Hemisphere: warm sky above, green-earth below — gives the "daylit greenhouse" feel
    const hemi = new THREE.HemisphereLight(0xfff4cc, 0x3a6e28, 1.6);
    this._scene.add(hemi);

    // Key / shadow light is owned by the Sun object — added in _buildWorld.

    // Fill light (cool blue from left)
    const fill = new THREE.DirectionalLight(0x6080d0, 1.0);
    fill.position.set(-10, 8, -5);
    this._scene.add(fill);

    // Rim light (magenta accent from behind)
    const rim = new THREE.DirectionalLight(0x9030d0, 0.55);
    rim.position.set(0, 5, -20);
    this._scene.add(rim);
  }

  _initCamera() {
    const cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 800);
    cam.position.set(0, 12, 18);
    cam.lookAt(0, 0, 0);
    this._camera = cam;
  }

  _buildWorld() {
    const sc = this._scene;
    const wp = this._config.pathWaypoints;

    // ── Starfield ──
    const stars = createStarField();
    sc.add(stars.mesh);
    this._animFns.push(stars);

    // ── Sun (visual + main shadow-casting key light) ──
    // Placed far away so it reads as a distant star but stays roughly
    // upper-right in the camera's field of view.
    const sunPos = new THREE.Vector3(120, 80, -100);
    const sun = createSun();
    sun.mesh.position.copy(sunPos);
    sc.add(sun.mesh);
    sun.light.position.copy(sunPos); // light shines from sun toward (0,0,0)
    sc.add(sun.light);
    sc.add(sun.light.target); // target stays at default (0,0,0)
    this._animFns.push(sun);

    // ── Board ──
    const board = createBoard(wp);
    board.mesh.position.y = this._config.boardY;
    sc.add(board.mesh);
    this._animFns.push(board);
    this._board = board;

    // ── Path curve (for enemy movement) ──
    // Use a CurvePath of straight LineCurve3 segments so enemies follow
    // the exact axis-aligned polyline that is drawn on the board.
    const yOff = this._config.boardY + 0.6;
    const pts = wp.map(([x, y, z]) => new THREE.Vector3(x, yOff, z));
    const curvePath = new THREE.CurvePath();
    for (let i = 0; i < pts.length - 1; i++) {
      curvePath.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    }
    this._pathCurve = curvePath;

    // ── Nexus ──
    const nexus = createNexus();
    nexus.mesh.position.set(12, this._config.boardY + 0.3, 5);
    sc.add(nexus.mesh);
    this._animFns.push(nexus);
    this._nexus = nexus;

    this._state.on('nexusDamaged', ({ hp }) => {
      nexus.triggerHit();
      if (hp <= 0) {
        nexus.triggerExplode(() => {});
      }
    });

    // ── Cargo Ship ──
    const ship = createCargoShip();
    ship.mesh.position.set(-11, 0.0, 0.0);
    ship.mesh.rotation.y = -Math.PI / 2;
    ship.setBaseY(this._config.boardY + 4);
    sc.add(ship.mesh);
    this._animFns.push(ship);
    this._cargoShip = ship;

    // ── Floating crystals ──────────────────────────────────────────────
    const crystalDefs = [
      { x: -13, z: 7, scale: 0.9, color: 0xcc44aa, orbitY: 3.5, phase: 0 },
      { x: -13, z: -7, scale: 0.7, color: 0x8844ff, orbitY: 3.0, phase: 1 },
      { x: 13, z: 7, scale: 0.8, color: 0x44aaff, orbitY: 4.0, phase: 2 },
      { x: 13, z: -7, scale: 0.6, color: 0xee66cc, orbitY: 2.8, phase: 3 },
      { x: 0, z: 11, scale: 1.0, color: 0xaa44ff, orbitY: 3.2, phase: 4 },
      { x: 0, z: -11, scale: 0.75, color: 0x44aaff, orbitY: 3.8, phase: 5 },
      { x: -22, z: 13, scale: 1.4, color: 0xcc44aa, orbitY: 5.0, phase: 6 },
      { x: -20, z: -14, scale: 1.2, color: 0x8844ff, orbitY: 5.5, phase: 7 },
      { x: 21, z: 13, scale: 1.3, color: 0xee66cc, orbitY: 4.8, phase: 8 },
      { x: 23, z: -11, scale: 1.5, color: 0x44aaff, orbitY: 6.0, phase: 9 },
      { x: -5, z: 17, scale: 1.1, color: 0x8844ff, orbitY: 4.4, phase: 10 },
      { x: 7, z: -17, scale: 1.3, color: 0xcc44aa, orbitY: 5.2, phase: 11 },
      { x: -18, z: 1, scale: 1.0, color: 0xee66cc, orbitY: 4.0, phase: 12 },
      { x: 17, z: 2, scale: 1.2, color: 0x44aaff, orbitY: 4.6, phase: 13 },
    ];
    crystalDefs.forEach(({ x, z, scale, color, orbitY, phase }) => {
      const c = createFloatingCrystal({ color, scale, orbitR: 0, orbitY: this._config.boardY + orbitY, phase });
      c.mesh.position.set(x, 0, z);
      sc.add(c.mesh);
      this._animFns.push(c);
    });

    // Clusters – several grouped formations scattered around the scene
    const clusterDefs = [
      { x: 12, z: -3, y: 1, orbitY: 2.5 },
      { x: -16, z: 0, y: 1, orbitY: 2.8 },
      { x: 6, z: -15, y: 1.5, orbitY: 3.0 },
      { x: -10, z: 14, y: 1.5, orbitY: 3.2 },
    ];
    clusterDefs.forEach(({ x, z, y, orbitY }) => {
      const cl = createCrystalCluster({ orbitY });
      cl.mesh.position.set(x, this._config.boardY + y, z);
      sc.add(cl.mesh);
      this._animFns.push(cl);
    });
  }

  _initInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const boardY = this._config.boardY + 0.3;
    const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), -boardY);

    // Turret context menu
    this._turretMenu = new TurretMenu();

    this._renderer.domElement.addEventListener('click', e => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this._camera);

      // ── Check if clicking an existing tower (works in build + combat) ──
      if (this._state.phase === 'build' || this._state.phase === 'combat') {
        const towerMeshes = this._towers.map(t => t.mesh);
        const hits = raycaster.intersectObjects(towerMeshes, true);
        if (hits.length > 0) {
          // Walk up to find the root tower mesh
          let obj = hits[0].object;
          while (obj.parent && !towerMeshes.includes(obj)) obj = obj.parent;
          const tower = this._towers.find(t => t.mesh === obj);
          if (tower) {
            this._turretMenu.show(tower, e.clientX, e.clientY, {
              onTargetChange: (t, mode) => { t.targeting = mode; },
              onSell: (t) => { this._sellTower(t); },
            });
            return;
          }
        }
      }

      // Close the menu when clicking on empty space
      if (this._turretMenu.isOpen) { this._turretMenu.hide(); return; }

      // ── Tower placement (build phase only) ──
      if (this._state.phase !== 'build') return;

      const hit = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(planeY, hit)) return;

      // Snap to grid
      const gx = Math.round(hit.x);
      const gz = Math.round(hit.z);

      // Must be on board
      if (Math.abs(gx) > 11 || Math.abs(gz) > 7) return;

      // Can't place on path (rough check)
      if (this._isOnPath(gx, gz)) return;

      // Can't overlap another tower
      if (this._towers.some(t => Math.abs(t.gx - gx) < 1 && Math.abs(t.gz - gz) < 1)) return;

      // Cost
      if (!this._state.spendStardust(LaserTurretStats.cost)) {
        this._hud.showMsg(`Need ${LaserTurretStats.cost} stardust!`);
        return;
      }

      this._placeTower(gx, boardY, gz);
    });

    // Space bar = start wave
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this._state.phase === 'build') this._startWave();
      }
    });
  }

  _isOnPath(gx, gz) {
    const wp = this._config.pathWaypoints;
    for (let i = 0; i < wp.length - 1; i++) {
      const ax = wp[i][0], az = wp[i][2];
      const bx = wp[i+1][0], bz = wp[i+1][2];
      const dx = bx - ax, dz = bz - az;
      const lenSq = dx*dx + dz*dz;
      if (lenSq === 0) continue;
      const t = Math.max(0, Math.min(1, ((gx-ax)*dx + (gz-az)*dz) / lenSq));
      const cx = ax + t*dx, cz = az + t*dz;
      if (Math.abs(gx - cx) < 1.8 && Math.abs(gz - cz) < 1.8) return true;
    }
    return false;
  }

  _placeTower(gx, boardY, gz) {
    const turret = createLaserTurret();
    turret.mesh.position.set(gx, boardY, gz);
    this._scene.add(turret.mesh);
    this._animFns.push(turret);
    const towerData = {
      mesh: turret.mesh,
      update: turret.update,
      triggerSpawn: turret.triggerSpawn,
      triggerShoot: turret.triggerShoot,
      trackTarget: turret.trackTarget,
      _animRef: turret,
      gx, gz,
      fireTimer: 0,
      fireRate: LaserTurretStats.fireRate,
      range: LaserTurretStats.range,
      damage: LaserTurretStats.damage,
      target: null,
      // Metadata for TurretMenu
      name: turret.name,
      cost: LaserTurretStats.cost,
      targeting: 'closest',   // 'closest' | 'first'
    };
    this._towers.push(towerData);
  }

  _initUI() {
    // HUD
    this._hud = new HUD(this._hudEl);
    this._hud.bind(this._state, () => this._startWave(), () => {
      this._fullReset();
      this._menu.show('main');
    });

    // Bind wave-clear for HUD wave button re-enabling
    this._state.on('waveCleared', () => {
      this._hud.showMsg(`Wave ${this._state.wave} cleared! Build & prepare.`, 3000);
    });

    // Navigation menu
    this._menu = new NavigationMenu(this._mount);
    this._menu.show('main');

    this._menu.on('start', () => { this._state.phase = 'build'; });
    this._menu.on('restart', () => { this._fullReset(); });
    this._menu.on('mainmenu', () => { this._fullReset(); this._menu.show('main'); });
    this._menu.on('nextwave', () => { this._startWave(); });

    // On game over show the overlay
    this._state.on('gameover', () => {
      setTimeout(() => {
        this._menu.show('gameover', { score: this._state.score });
      }, 3500);
    });

    // On victory show the overlay
    this._state.on('victory', ({ score }) => {
      setTimeout(() => {
        this._menu.show('victory', { score });
      }, 2000);
    });

    // Wave cleared → brief overlay
    this._state.on('waveCleared', ({ wave }) => {
      // No full-screen overlay for wave clear; just HUD message
    });
  }

  // ── Game loop ─────────────────────────────────────────────────────────────

  _loop() {
    requestAnimationFrame(() => this._loop());
    const delta = Math.min(this._clock.getDelta(), 0.1);
    this._update(delta);
    this._renderer.render(this._scene, this._camera);
  }

  _update(delta) {
    // Animate all registered objects
    this._animFns.forEach(o => o.update(delta));

    if (this._state.phase === 'combat') {
      this._updateSpawning(delta);
      this._updateEnemies(delta);
      this._updateTowers(delta);
      this._flushDeferredSpawns();
    }
  }

  // ── Spawning ──────────────────────────────────────────────────────────────

  _startWave() {
    if (this._state.phase !== 'build' && this._state.phase !== 'menu') return;

    // Build flat type queue from WaveConfig (0-indexed, wave hasn't incremented yet)
    const waveDef = WaveConfig[this._state.wave];
    if (!waveDef) return;

    this._spawnTypeQueue = [];
    for (const seg of waveDef.enemies) {
      for (let i = 0; i < seg.count; i++) this._spawnTypeQueue.push(seg.type);
    }
    this._spawnInterval = waveDef.spawnInterval;

    const total = this._spawnTypeQueue.length;
    this._state.startWave(total);
    this._spawnQueue = total;
    this._spawnAccum = 0;
    this._cargoShip.openBay();
    this._hud.showMsg(`Wave ${this._state.wave} — Incoming!`, 2000);
  }

  _updateSpawning(delta) {
    if (this._spawnQueue <= 0) return;
    this._spawnAccum += delta * 1000;
    if (this._spawnAccum >= this._spawnInterval) {
      this._spawnAccum -= this._spawnInterval;
      this._spawnEnemy();
    }
  }

  _spawnEnemy() {
    if (this._spawnQueue <= 0) return;
    this._spawnQueue--;

    const type = this._spawnTypeQueue.shift() || 'standard';
    this._spawnEnemyAt(type, 0);

    if (this._spawnQueue <= 0) {
      setTimeout(() => this._cargoShip.closeBay(), 800);
    }
  }

  // Spawn any enemy type at a given path position (0–1).
  // Used for the initial wave spawn and for Eximus on-death child spawns.
  _spawnEnemyAt(type, startPathT) {
    const factory = ENEMY_FACTORIES[type] || ENEMY_FACTORIES.standard;
    const e = factory.create();
    const startPos = this._pathCurve.getPointAt(Math.min(Math.max(startPathT, 0), 0.999));
    e.mesh.position.copy(startPos);
    this._scene.add(e.mesh);
    this._animFns.push(e);

    const { hp, speed, damage, reward } = factory.stats;
    const enemyRecord = {
      mesh: e.mesh,
      update: e.update,
      triggerDeath: e.triggerDeath,
      triggerExplode: e.triggerExplode,
      setWalk: e.setWalk,
      _animRef: e,
      pathT: startPathT,
      speed,
      hp,
      maxHp: hp,
      damage,
      reward,
      stats: factory.stats,
      alive: true,
      reachedEnd: false,
      healAccum: 0,
    };
    if (factory.stats.type === 'boss') {
      enemyRecord.bossSpawnThreshold = hp - 250;
    }
    if (factory.stats.type === 'boss') {
      this._hud.showBossBar(hp, factory.stats.type);
    }
    this._enemies.push(enemyRecord);
  }

  // Process Eximus child-spawns deferred from last frame.
  _flushDeferredSpawns() {
    if (!this._deferredSpawns.length) return;
    this._deferredSpawns.forEach(({ type, pathT }) => {
      this._spawnEnemyAt(type, pathT);
    });
    this._deferredSpawns = [];
  }

  // ── Enemy update ──────────────────────────────────────────────────────────

  _updateEnemies(delta) {
    const totalLen = this._pathCurve.getLength();

    for (let i = this._enemies.length - 1; i >= 0; i--) {
      const e = this._enemies[i];
      if (!e.alive) continue;

      e.pathT += (e.speed * delta) / totalLen;

      if (e.pathT >= 1) {
        // Reached nexus – explode and damage
        e.alive = false;
        e.reachedEnd = true;
        if (e.stats?.type === 'boss') this._hud.hideBossBar();
        const nexusDamage = e.damage;
        e.triggerExplode(
          () => { this._state.damageNexus(nexusDamage); },
          () => {
            this._scene.remove(e.mesh);
            const idx = this._animFns.indexOf(e._animRef);
            if (idx !== -1) this._animFns.splice(idx, 1);
            e._done = true;
          }
        );
        this._state.enemyReachedEnd();
        continue;
      }

      // Healer: periodically restore HP to nearby living allies
      if (e.stats?.type === 'healer' && e.alive) {
        e.healAccum += delta;
        if (e.healAccum >= e.stats.healCooldown) {
          e.healAccum = 0;
          for (const other of this._enemies) {
            if (!other.alive || other === e) continue;
            if (e.mesh.position.distanceTo(other.mesh.position) < e.stats.healRadius) {
              other.hp = Math.min(other.maxHp, other.hp + e.stats.healAmount);
            }
          }
        }
      }

      const pos = this._pathCurve.getPointAt(e.pathT);
      const tangent = this._pathCurve.getTangentAt(e.pathT);
      e.mesh.position.copy(pos);
      if (tangent.length() > 0.001) {
        e.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
      }
      // Update boss bar live
      if (e.stats?.type === 'boss') this._hud.updateBossBar(e.hp);
    }

    // Keep enemies that are still alive OR currently playing their reach/death anim
    this._enemies = this._enemies.filter(e => (e.alive || e.reachedEnd) && !e._done);
  }

  // ── Tower combat ──────────────────────────────────────────────────────────

  _updateTowers(delta) {
    for (const tower of this._towers) {
      tower.fireTimer -= delta;

      // Check if any Disruptor is within disruption range of this tower
      let disrupted = false;
      for (const dis of this._enemies) {
        if (!dis.alive || dis.stats?.type !== 'disruptor') continue;
        if (dis.mesh.position.distanceTo(tower.mesh.position) < dis.stats.disruptRadius) {
          disrupted = true;
          break;
        }
      }

      // Find target based on targeting mode
      let best = null;
      const tp = tower.mesh.position;

      if (tower.targeting === 'closest') {
        let bestDist = Infinity;
        for (const e of this._enemies) {
          if (!e.alive) continue;
          const d = tp.distanceTo(e.mesh.position);
          if (d < tower.range && d < bestDist) { best = e; bestDist = d; }
        }
      } else {
        // 'first' — enemy furthest along the path (highest pathT) within range
        let bestPathT = -1;
        for (const e of this._enemies) {
          if (!e.alive) continue;
          const d = tp.distanceTo(e.mesh.position);
          if (d < tower.range && e.pathT > bestPathT) { best = e; bestPathT = e.pathT; }
        }
      }

      tower.target = best;
      if (best) {
        tower.trackTarget(best.mesh.position);
        if (tower.fireTimer <= 0) {
          // Disruptors slow tower fire rate to 35 %
          tower.fireTimer = 1 / (disrupted ? tower.fireRate * 0.35 : tower.fireRate);
          tower.triggerShoot(best.mesh.position);

          // Immune enemies (e.g. the Duck) cannot be damaged
          if (!best.stats?.immune) {
            best.hp -= tower.damage;
          }
          // Boss: spawn a random minion every 250 HP lost
          if (best.stats?.type === 'boss' && best.alive && best.bossSpawnThreshold !== undefined) {
            while (best.hp <= best.bossSpawnThreshold && best.bossSpawnThreshold > 0) {
              const _BOSS_MINION_TYPES = ['fast', 'tank', 'healer', 'disruptor', 'eximus'];
              const minionType = _BOSS_MINION_TYPES[Math.floor(Math.random() * _BOSS_MINION_TYPES.length)];
              this._deferredSpawns.push({ type: minionType, pathT: Math.max(0, best.pathT - 0.01) });
              this._state.enemiesLeft += 1;
              best.bossSpawnThreshold -= 250;
            }
          }
          if (best.hp <= 0) {
            best.alive = false;

            // Eximus: queue child spawns BEFORE decrementing enemiesLeft
            if (best.stats?.spawnOnDeath) {
              const n = best.stats.spawnOnDeath;
              const pt = best.pathT;
              for (let s = 0; s < n; s++) {
                this._deferredSpawns.push({ type: 'standard', pathT: Math.max(0, pt - s * 0.005) });
              }
              // Keep enemiesLeft accurate so the wave doesn't end prematurely
              this._state.enemiesLeft += n;
            }

            const reward = best.reward;
            if (best.stats?.type === 'boss') this._hud.hideBossBar();
            best.triggerDeath(() => {
              this._scene.remove(best.mesh);
              const idx = this._animFns.indexOf(best._animRef);
              if (idx !== -1) this._animFns.splice(idx, 1);
              best._done = true;
            });
            this._state.enemyKilled(reward);
          }
        }
      }
    }
  }

  // ── Sell tower ────────────────────────────────────────────────────────────

  _sellTower(tower) {
    const refund = Math.floor(tower.cost * 0.5);
    this._state.addStardust(refund);
    this._scene.remove(tower.mesh);
    const animIdx = this._animFns.indexOf(tower._animRef);
    if (animIdx !== -1) this._animFns.splice(animIdx, 1);
    const towerIdx = this._towers.indexOf(tower);
    if (towerIdx !== -1) this._towers.splice(towerIdx, 1);
    this._hud.showMsg(`Sold for +◈ ${refund}`, 2000);
  }

  // ── Full reset ────────────────────────────────────────────────────────────

  _fullReset() {
    location.reload();
  }
}
