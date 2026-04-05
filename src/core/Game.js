import * as THREE from 'three';
import { GameConfig }      from '../config/GameConfig.js';
import { GameState }       from './GameState.js';
import { HUD }             from '../ui/HUD.js';
import { NavigationMenu }  from '../ui/NavigationMenu.js';
import { createBoard }     from '../models/board/Board.js';
import { createNexus }     from '../models/misc/Nexus.js';
import { createCargoShip } from '../models/misc/CargoShip.js';
import { createCrystalCluster, createFloatingCrystal } from '../models/misc/FloatingCrystal.js';
import { createStarField }    from '../models/misc/StarField.js';
import { createSun }          from '../models/misc/Sun.js';
import { createStandardEnemy } from '../models/enemies/StandardEnemy.js';
import { createLaserTurret }   from '../models/towers/LaserTurret.js';

export class Game {
  constructor({ mountElement, hudElement }) {
    this._mount = mountElement;
    this._hudEl = hudElement;
    this._config = GameConfig;
    this._state = new GameState(GameConfig);
    this._animFns = [];   // { update(delta) } entries
    this._enemies = [];   // live enemy objects { mesh, update, hp, pathT, ... }
    this._towers = [];   // placed towers
    this._clock = new THREE.Clock(false);
    this._spawnQueue = 0;
    this._spawnAccum = 0;
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
    cam.position.set(0, 18, 22);
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
    // Placed at (22, 8, -18): behind and slightly above the board, which
    // projects to ~25° from screen centre in the upper-right — inside the
    // camera’s 27.5° vertical half-FOV. The light direction follows the mesh.
    const sunPos = new THREE.Vector3(22, 8, -18);
    const sun = createSun();
    sun.mesh.position.copy(sunPos);
    sc.add(sun.mesh);
    sun.light.position.copy(sunPos);  // light shines from sun toward (0,0,0)
    sc.add(sun.light);
    sc.add(sun.light.target);         // target stays at default (0,0,0)
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
    const pts  = wp.map(([x, y, z]) => new THREE.Vector3(x, yOff, z));
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
      { x: -13, z:  7,  scale: 0.9, color: 0xcc44aa, orbitY: 3.5, phase: 0 },
      { x: -13, z: -7,  scale: 0.7, color: 0x8844ff, orbitY: 3.0, phase: 1 },
      { x:  13, z:  7,  scale: 0.8, color: 0x44aaff, orbitY: 4.0, phase: 2 },
      { x:  13, z: -7,  scale: 0.6, color: 0xee66cc, orbitY: 2.8, phase: 3 },
      { x:   0, z:  11, scale: 1.0, color: 0xaa44ff, orbitY: 3.2, phase: 4 },
      { x:   0, z: -11, scale: 0.75,color: 0x44aaff, orbitY: 3.8, phase: 5 },
      { x: -22, z:  13, scale: 1.4, color: 0xcc44aa, orbitY: 5.0, phase: 6  },
      { x: -20, z: -14, scale: 1.2, color: 0x8844ff, orbitY: 5.5, phase: 7  },
      { x:  21, z:  13, scale: 1.3, color: 0xee66cc, orbitY: 4.8, phase: 8  },
      { x:  23, z: -11, scale: 1.5, color: 0x44aaff, orbitY: 6.0, phase: 9  },
      { x:  -5, z:  17, scale: 1.1, color: 0x8844ff, orbitY: 4.4, phase: 10 },
      { x:   7, z: -17, scale: 1.3, color: 0xcc44aa, orbitY: 5.2, phase: 11 },
      { x: -18, z:   1, scale: 1.0, color: 0xee66cc, orbitY: 4.0, phase: 12 },
      { x:  17, z:   2, scale: 1.2, color: 0x44aaff, orbitY: 4.6, phase: 13 },
    ];
    crystalDefs.forEach(({ x, z, scale, color, orbitY, phase }) => {
      const c = createFloatingCrystal({ color, scale, orbitR: 0, orbitY: this._config.boardY + orbitY, phase });
      c.mesh.position.set(x, 0, z);
      sc.add(c.mesh);
      this._animFns.push(c);
    });

    // Clusters – several grouped formations scattered around the scene
    const clusterDefs = [
      { x:  12, z: -3,  y: 1,   orbitY: 2.5 },
      { x: -16, z:  0,  y: 1,   orbitY: 2.8 },
      { x:   6, z: -15, y: 1.5, orbitY: 3.0 },
      { x: -10, z:  14, y: 1.5, orbitY: 3.2 },
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
    const mouse     = new THREE.Vector2();
    const boardY    = this._config.boardY + 0.3;
    const planeY    = new THREE.Plane(new THREE.Vector3(0, 1, 0), -boardY);

    this._renderer.domElement.addEventListener('click', e => {
      if (this._state.phase !== 'build' && this._state.phase !== 'menu') return;
      if (this._state.phase === 'menu') return;  // no placement before first wave

      mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this._camera);

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
      if (!this._state.spendGold(this._config.laserTowerCost)) {
        this._hud.showMsg(`Need ${this._config.laserTowerCost} gold!`);
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
      hp: 100,
      fireTimer: 0,
      fireRate: this._config.laserTowerFireRate,
      range: this._config.laserTowerRange,
      damage: this._config.laserTowerDamage,
      target: null,
    };
    this._towers.push(towerData);
  }

  _initUI() {
    // HUD
    this._hud = new HUD(this._hudEl);
    this._hud.bind(this._state, () => this._startWave());

    // Bind wave-clear for HUD wave button re-enabling
    this._state.on('waveCleared', () => {
      this._hud.showMsg(`Wave ${this._state.wave} cleared! Build & prepare.`, 3000);
    });

    // Navigation menu
    this._menu = new NavigationMenu(this._mount);
    this._menu.show('main');

    this._menu.on('start',    () => { this._state.phase = 'build'; });
    this._menu.on('restart',  () => { this._fullReset(); });
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
    }
  }

  // ── Spawning ──────────────────────────────────────────────────────────────

  _startWave() {
    if (this._state.phase !== 'build' && this._state.phase !== 'menu') return;
    this._state.startWave();
    this._spawnQueue = this._state.enemiesLeft;
    this._spawnAccum = 0;
    this._cargoShip.openBay();
    this._hud.showMsg(`Wave ${this._state.wave} — Incoming!`, 2000);
  }

  _updateSpawning(delta) {
    if (this._spawnQueue <= 0) return;
    this._spawnAccum += delta * 1000;
    if (this._spawnAccum >= this._config.spawnInterval) {
      this._spawnAccum -= this._config.spawnInterval;
      this._spawnEnemy();
    }
  }

  _spawnEnemy() {
    if (this._spawnQueue <= 0) return;
    this._spawnQueue--;

    const e = createStandardEnemy();
    e.mesh.position.set(-12, this._config.boardY + 0.3, 0);
    this._scene.add(e.mesh);
    this._animFns.push(e);

    const hp    = this._config.enemyBaseHP;
    const speed = this._config.enemyBaseSpeed;

    // Keep reference to the animFn entry so we can splice it later
    this._enemies.push({
      mesh: e.mesh,
      update: e.update,
      triggerDeath: e.triggerDeath,
      triggerExplode: e.triggerExplode,
      setWalk: e.setWalk,
      _animRef: e,   // reference to entry in _animFns
      pathT: 0,
      speed,
      hp,
      maxHp: hp,
      alive: true,
      reachedEnd: false,
    });

    if (this._spawnQueue <= 0) {
      setTimeout(() => this._cargoShip.closeBay(), 800);
    }
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
        e.triggerExplode(
          () => { this._state.damageNexus(20); },          // onHit: fires when burst starts
          () => {                                           // onDone: fires when animation finishes
            this._scene.remove(e.mesh);
            const idx = this._animFns.indexOf(e._animRef);
            if (idx !== -1) this._animFns.splice(idx, 1);
          }
        );
        this._state.enemyReachedEnd(); // no gold/score for enemies that deal damage
        continue;
      }

      const pos = this._pathCurve.getPointAt(e.pathT);
      const tangent = this._pathCurve.getTangentAt(e.pathT);
      e.mesh.position.copy(pos);
      if (tangent.length() > 0.001) {
        e.mesh.rotation.y = Math.atan2(tangent.x, tangent.z);
      }
    }

    // Keep enemies that are still alive OR currently playing their reach/death anim
    this._enemies = this._enemies.filter(e => e.alive || e.reachedEnd);
  }

  // ── Tower combat ──────────────────────────────────────────────────────────

  _updateTowers(delta) {
    for (const tower of this._towers) {
      tower.fireTimer -= delta;

      // Find closest enemy in range
      let best = null;
      let bestDist = Infinity;
      const tp = tower.mesh.position;

      for (const e of this._enemies) {
        if (!e.alive) continue;
        const d = tp.distanceTo(e.mesh.position);
        if (d < tower.range && d < bestDist) {
          best = e;
          bestDist = d;
        }
      }

      tower.target = best;
      if (best) {
        tower.trackTarget(best.mesh.position);
        if (tower.fireTimer <= 0) {
          tower.fireTimer = 1 / tower.fireRate;
          tower.triggerShoot(best.mesh.position);

          best.hp -= tower.damage;
          if (best.hp <= 0) {
            best.alive = false;
            best.triggerDeath(() => {
              this._scene.remove(best.mesh);
              const idx = this._animFns.indexOf(best._animRef);
              if (idx !== -1) this._animFns.splice(idx, 1);
            });
            this._state.enemyKilled();
          }
        }
      }
    }
  }

  // ── Full reset ────────────────────────────────────────────────────────────

  _fullReset() {
    location.reload();
  }
}
