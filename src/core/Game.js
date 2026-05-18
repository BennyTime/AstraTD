import * as THREE from 'three';
import { GameConfig, MAPS } from '../config/GameConfig.js';
import { WaveConfig } from '../config/WaveConfig.js';
import { GameState } from './GameState.js';
import { HUD } from '../ui/HUD.js';
import { NavigationMenu } from '../ui/NavigationMenu.js';
import { Board } from '../models/board/Board.js';
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
import { createNovaCannon, NovaCannonStats } from '../models/towers/NovaCannon.js';
import { createVoidSniper, VoidSniperStats } from '../models/towers/VoidSniper.js';
import { createCryoEmitter, CryoEmitterStats } from '../models/towers/CryoEmitter.js';
import { TurretMenu } from '../ui/TurretMenu.js';
import { TowerShop } from '../ui/TowerShop.js';

const TOWER_DEFS = [
  {
    key: 'laser',
    name: 'LASER TURRET',
    cost: LaserTurretStats.cost,
    range: LaserTurretStats.range,
    damage: LaserTurretStats.damage,
    fireRate: LaserTurretStats.fireRate,
    tag: 'Single Target',
    color: '#46d4ff',
    icon: '⚡',
    description: 'Precision laser that targets single enemies.',
    create: createLaserTurret,
    stats: LaserTurretStats,
    upgrades: [
      { label: 'Focused Lens',    cost: 80,  damageMultiplier: 1.4, rangeMultiplier: 1.1, fireRateMultiplier: 1.0 },
      { label: 'Rapid Coils',     cost: 120, damageMultiplier: 1.0, rangeMultiplier: 1.0, fireRateMultiplier: 1.5 },
      { label: 'Overcharge Core', cost: 180, damageMultiplier: 1.8, rangeMultiplier: 1.2, fireRateMultiplier: 1.2 },
    ],
  },
  {
    key: 'nova',
    name: 'NOVA CANNON',
    cost: NovaCannonStats.cost,
    range: NovaCannonStats.range,
    damage: NovaCannonStats.damage,
    fireRate: NovaCannonStats.fireRate,
    tag: 'Area Damage',
    color: '#ff8800',
    icon: '💥',
    description: 'Explosive blast that damages ALL enemies in range.',
    create: createNovaCannon,
    stats: NovaCannonStats,
    upgrades: [
      { label: 'Wide Blast', cost: 100, damageMultiplier: 1.2, rangeMultiplier: 1.3, fireRateMultiplier: 1.0 },
      { label: 'Hot Core', cost: 150, damageMultiplier: 1.6, rangeMultiplier: 1.0, fireRateMultiplier: 1.0 },
      { label: 'Nova Surge', cost: 220, damageMultiplier: 1.5, rangeMultiplier: 1.2, fireRateMultiplier: 1.4 },
    ],
  },
  {
    key: 'sniper',
    name: 'VOID SNIPER',
    cost: VoidSniperStats.cost,
    range: VoidSniperStats.range,
    damage: VoidSniperStats.damage,
    fireRate: VoidSniperStats.fireRate,
    tag: 'Long Range',
    color: '#cc44ff',
    icon: '🎯',
    description: 'Extreme-range, high-damage precision rifle.',
    create: createVoidSniper,
    stats: VoidSniperStats,
    upgrades: [
      { label: 'Void Scope', cost: 110, damageMultiplier: 1.5, rangeMultiplier: 1.2, fireRateMultiplier: 1.0 },
      { label: 'Phase Round', cost: 160, damageMultiplier: 1.8, rangeMultiplier: 1.0, fireRateMultiplier: 1.0 },
      { label: 'Singularity', cost: 250, damageMultiplier: 2.0, rangeMultiplier: 1.3, fireRateMultiplier: 1.3 },
    ],
  },
  {
    key: 'cryo',
    name: 'CRYO EMITTER',
    cost: CryoEmitterStats.cost,
    range: CryoEmitterStats.range,
    damage: CryoEmitterStats.damage,
    fireRate: CryoEmitterStats.fireRate,
    tag: 'Area Slow',
    color: '#88eeff',
    icon: '❄️',
    description: 'Pulses cryo waves that slow all nearby enemies.',
    create: createCryoEmitter,
    stats: CryoEmitterStats,
    upgrades: [
      { label: 'Deep Freeze', cost: 90, damageMultiplier: 1.0, rangeMultiplier: 1.3, fireRateMultiplier: 1.3 },
      { label: 'Cryo Shards', cost: 130, damageMultiplier: 2.0, rangeMultiplier: 1.0, fireRateMultiplier: 1.0 },
      { label: 'Absolute Zero', cost: 200, damageMultiplier: 1.5, rangeMultiplier: 1.2, fireRateMultiplier: 1.5 },
    ],
  },
];

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
    this._spawnTypeQueue = [];   
    this._spawnInterval = 1200; 
    this._deferredSpawns = [];   
    this._selectedTowerType = null; 
  }

  start() {
    this._initRenderer();
    this._initScene();
    this._initLights();
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
    const ambient = new THREE.AmbientLight(0x8cb8d8, 2.2);
    this._scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xfff4cc, 0x3a6e28, 1.6);
    this._scene.add(hemi);
    const fill = new THREE.DirectionalLight(0x6080d0, 1.0);
    fill.position.set(-10, 8, -5);
    this._scene.add(fill);
    
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
    const wp = this._config.activeMap.waypoints;
    
    const stars = createStarField();
    sc.add(stars.mesh);
    this._animFns.push(stars);

    const sunPos = new THREE.Vector3(25, 5, -40);
    const sun = createSun();
    sun.mesh.position.copy(sunPos);
    sc.add(sun.mesh);
    sun.light.position.copy(sunPos); 
    sc.add(sun.light);
    sc.add(sun.light.target); 
    this._animFns.push(sun);

    const board = new Board(this._config.activeMap);
    board.mesh.position.y = this._config.boardY;
    sc.add(board.mesh);
    this._animFns.push(board);
    this._board = board;

    const yOff = this._config.boardY + 0.6;
    const pts = wp.map(([x, y, z]) => new THREE.Vector3(x, yOff, z));
    const curvePath = new THREE.CurvePath();
    for (let i = 0; i < pts.length - 1; i++) {
      curvePath.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    }
    this._pathCurve = curvePath;

    const firstWp = wp[0];
    const lastWp  = wp[wp.length - 1];
    const boardY  = this._config.boardY;
    
    const nexus = createNexus();
    const nexusDx = lastWp[0] - wp[wp.length - 2][0];
    const nexusDz = lastWp[2] - wp[wp.length - 2][2];
    const nexusLen = Math.hypot(nexusDx, nexusDz);
    nexus.mesh.position.set(
      lastWp[0] + (nexusDx / nexusLen) * 1.0,
      boardY + 0.3,
      lastWp[2] + (nexusDz / nexusLen) * 1.0
    );
    sc.add(nexus.mesh);
    this._animFns.push(nexus);
    this._nexus = nexus;

    this._state.on('nexusDamaged', ({ hp }) => {
      nexus.triggerHit();
      if (hp <= 0) {
        nexus.triggerExplode(() => {});
      }
    });

    const ship = createCargoShip();
    const shipDx = wp[1][0] - firstWp[0];
    const shipDz = wp[1][2] - firstWp[2];
    ship.mesh.position.set(firstWp[0], 0.0, firstWp[2]);
    ship.mesh.rotation.y = Math.atan2(shipDx, shipDz) + Math.PI; 
    ship.setBaseY(boardY + 4);
    sc.add(ship.mesh);
    this._animFns.push(ship);
    this._cargoShip = ship;

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

    this._turretMenu = new TurretMenu();

    this._renderer.domElement.addEventListener('click', e => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this._camera);

      if (this._state.phase === 'build' || this._state.phase === 'combat') {
        const towerMeshes = this._towers.map(t => t.mesh);
        const hits = raycaster.intersectObjects(towerMeshes, true);
        if (hits.length > 0) {
          let obj = hits[0].object;
          while (obj.parent && !towerMeshes.includes(obj)) obj = obj.parent;
          const tower = this._towers.find(t => t.mesh === obj);
          if (tower) {
            this._turretMenu.show(tower, {
              onTargetChange: (t, mode) => { t.targeting = mode; },
              onUpgrade: (t) => { this._upgradeTower(t); this._turretMenu.refresh(); },
              onSell: (t) => { this._sellTower(t); },
            });
            return;
          }
        }
      }

      if (this._turretMenu.isOpen) { this._turretMenu.hide(); return; }

      if (this._state.phase !== 'build') return;
      if (!this._selectedTowerType) return; 
      const hit = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(planeY, hit)) return;

      const gx = Math.round(hit.x);
      const gz = Math.round(hit.z);

      if (Math.abs(gx) > 11 || Math.abs(gz) > 7) return;
      if (this._isOnPath(gx, gz)) return;
      if (this._isOnDecoration(gx, gz)) return;
      if (this._towers.some(t => Math.abs(t.gx - gx) < 1 && Math.abs(t.gz - gz) < 1)) return;
      const towerDef = TOWER_DEFS.find(d => d.key === this._selectedTowerType);
      if (!towerDef) return;
      const typeKey = this._selectedTowerType;
      if (!this._state.spendStardust(towerDef.cost)) {
        this._hud.showMsg(`Need ${towerDef.cost} stardust!`);
        return;
      }

      this._placeTower(gx, boardY, gz, typeKey);
      this._shop.deselect();
    });

    
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this._state.phase === 'build') this._startWave();
      }
    });
  }

  _isOnPath(gx, gz) {
    const wp = this._config.activeMap.waypoints;
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

  _isOnDecoration(gx, gz) {
    const veg = this._config.activeMap.vegetation ?? {};
    const positions = [
      ...(veg.crates   ?? []).map(([cx, cz]) => [cx, cz]),
      ...(veg.planters ?? []).map(([cx, cz]) => [cx, cz]),
    ];
    return positions.some(([cx, cz]) => Math.abs(gx - cx) < 1.1 && Math.abs(gz - cz) < 1.1);
  }

  _placeTower(gx, boardY, gz, typeKey) {
    const def = TOWER_DEFS.find(d => d.key === typeKey);
    if (!def) return;
    const turret = def.create();
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
      type: typeKey,
      fireTimer: 0,
      fireRate: def.stats.fireRate,
      range: def.stats.range,
      damage: def.stats.damage,
      target: null,
      isAoe: !!def.stats.isAoe,
      isAreaSlow: !!def.stats.isAreaSlow,
      slowFactor: def.stats.slowFactor   || 1.0,
      slowDuration: def.stats.slowDuration || 0,
      name: turret.name,
      cost: def.stats.cost,
      totalSpent: def.stats.cost,
      level: 0,
      upgrades: def.upgrades,
      targeting: 'closest',
    };
    this._towers.push(towerData);
    this._shop?.updateStardust(this._state.stardust);
  }

  _initUI() {
    this._shop = new TowerShop(TOWER_DEFS, (key) => {
      this._selectedTowerType = key;
      const panel = document.getElementById('tower-shop');
      if (panel) panel.classList.toggle('has-selection', key !== null);
    });

    this._hud = new HUD(this._hudEl);
    this._hud.bind(this._state, () => this._startWave(), () => {
      this._fullReset();
      this._menu.show('main');
    });

    this._state.on('waveCleared', () => {
      this._hud.showMsg(`Wave ${this._state.wave} cleared! Build & prepare.`, 3000);
    });

    this._menu = new NavigationMenu(this._mount, MAPS);
    this._menu.show('main');

    this._menu.on('start', (map) => {
      this._config.activeMap = map;
      this._buildWorld();
      this._state.phase = 'build';
      this._shop.show();
      this._shop.updateStardust(this._state.stardust);
    });
    this._menu.on('restart', () => { this._fullReset(); });
    this._menu.on('mainmenu', () => { this._fullReset(); this._menu.show('main'); });

    this._state.on('stardustChanged', () => this._shop?.updateStardust(this._state.stardust));

    this._state.on('waveStarted', () => {
      this._shop.deselect();
      this._shop.hide();
    });
    this._state.on('waveCleared', () => {
      this._shop.show();
      this._shop.updateStardust(this._state.stardust);
    });
    this._menu.on('nextwave', () => { this._startWave(); });
    this._state.on('gameover', () => {
      this._turretMenu?.hide();
      this._shop?.hide();
      setTimeout(() => {
        this._menu.show('gameover', { score: this._state.score });
      }, 3500);
    });

    this._state.on('victory', ({ score }) => {
      this._turretMenu?.hide();
      this._shop?.hide();
      setTimeout(() => {
        this._menu.show('victory', { score });
      }, 2000);
    });
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const delta = Math.min(this._clock.getDelta(), 0.1);
    this._update(delta);
    this._renderer.render(this._scene, this._camera);
  }

  _update(delta) {
    this._animFns.forEach(o => o.update(delta));

    if (this._state.phase === 'combat') {
      this._updateSpawning(delta);
      this._updateEnemies(delta);
      this._updateTowers(delta);
      this._flushDeferredSpawns();
    }
  }

  _startWave() {
    if (this._state.phase !== 'build' && this._state.phase !== 'menu') return;

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

  _spawnEnemyAt(type, startPathT) {
    const factory = ENEMY_FACTORIES[type] || ENEMY_FACTORIES.standard;
    const e = factory.create();
    const startPos = this._pathCurve.getPointAt(Math.min(Math.max(startPathT, 0), 0.999));
    e.mesh.position.copy(startPos);
    e.mesh.userData._joyBaseY = startPos.y;
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
      enemyRecord.bossSpawnThreshold = hp - 400;
    }
    if (factory.stats.type === 'boss') {
      this._hud.showBossBar(hp, factory.stats.type);
    }
    this._enemies.push(enemyRecord);
  }

  _flushDeferredSpawns() {
    if (!this._deferredSpawns.length) return;
    this._deferredSpawns.forEach(({ type, pathT }) => {
      this._spawnEnemyAt(type, pathT);
    });
    this._deferredSpawns = [];
  }

  _updateEnemies(delta) {
    const totalLen = this._pathCurve.getLength();

    for (let i = this._enemies.length - 1; i >= 0; i--) {
      const e = this._enemies[i];
      if (!e.alive) continue;

      if (e.slowTimer > 0) {
        e.slowTimer -= delta;
        if (e.slowTimer <= 0) { e.slowTimer = 0; e.slowFactor = 1.0; }
      }
      const effectiveSpeed = e.speed * (e.slowFactor != null ? e.slowFactor : 1.0);
      e.pathT += (effectiveSpeed * delta) / totalLen;

      if (e.pathT >= 0.97) {
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
      if (e.stats?.type === 'boss') this._hud.updateBossBar(e.hp);
    }

    this._enemies = this._enemies.filter(e => (e.alive || e.reachedEnd) && !e._done);
  }

  _updateTowers(delta) {
    for (const tower of this._towers) {
      tower.fireTimer -= delta;

      let disrupted = false;
      for (const dis of this._enemies) {
        if (!dis.alive || dis.stats?.type !== 'disruptor') continue;
        if (dis.mesh.position.distanceTo(tower.mesh.position) < dis.stats.disruptRadius) {
          disrupted = true;
          break;
        }
      }

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
          tower.fireTimer = 1 / (disrupted ? tower.fireRate * 0.35 : tower.fireRate);
          if (tower.isAoe) {
            const aoePositions = [];
            const aoeHit = [];
            for (const e of this._enemies) {
              if (!e.alive || e.stats?.immune) continue;
              if (tp.distanceTo(e.mesh.position) <= tower.range) {
                e.hp -= tower.damage;
                aoePositions.push(e.mesh.position.clone());
                aoeHit.push(e);
              }
            }
            tower.triggerShoot(aoePositions.length > 0 ? aoePositions : [best.mesh.position.clone()], tower.range);

            for (const e of aoeHit) {
              if (e.stats?.type === 'boss' && e.alive && e.bossSpawnThreshold !== undefined) {
                while (e.hp <= e.bossSpawnThreshold && e.bossSpawnThreshold > 0) {
                  const _BOSS_MINION_TYPES = ['fast', 'tank', 'healer', 'disruptor', 'eximus'];
                  const minionType = _BOSS_MINION_TYPES[Math.floor(Math.random() * _BOSS_MINION_TYPES.length)];
                  this._deferredSpawns.push({ type: minionType, pathT: Math.max(0, e.pathT - 0.01) });
                  this._state.enemiesLeft += 1;
                  e.bossSpawnThreshold -= 400;
                }
              }
              if (e.hp <= 0) {
                e.alive = false;
                if (e.stats?.spawnOnDeath) {
                  const n = e.stats.spawnOnDeath;
                  const pt = e.pathT;
                  for (let s = 0; s < n; s++) {
                    this._deferredSpawns.push({ type: 'standard', pathT: Math.max(0, pt - s * 0.005) });
                  }
                  this._state.enemiesLeft += n;
                }
                if (e.stats?.type === 'boss') this._hud.hideBossBar();
                e.triggerDeath(() => {
                  this._scene.remove(e.mesh);
                  const idx = this._animFns.indexOf(e._animRef);
                  if (idx !== -1) this._animFns.splice(idx, 1);
                  e._done = true;
                });
                this._state.enemyKilled(e.reward);
              }
            }
          } else if (tower.isAreaSlow) {
            const cryoHit = [];
            for (const e of this._enemies) {
              if (!e.alive) continue;
              if (tp.distanceTo(e.mesh.position) < tower.range) {
                if (!e.stats?.immune) { e.hp -= tower.damage; cryoHit.push(e); }
                e.slowTimer  = tower.slowDuration;
                e.slowFactor = tower.slowFactor;
              }
            }
            tower.triggerShoot(best.mesh.position, tower.range);

            for (const e of cryoHit) {
              if (e.stats?.type === 'boss' && e.alive && e.bossSpawnThreshold !== undefined) {
                while (e.hp <= e.bossSpawnThreshold && e.bossSpawnThreshold > 0) {
                  const _BOSS_MINION_TYPES = ['fast', 'tank', 'healer', 'disruptor', 'eximus'];
                  const minionType = _BOSS_MINION_TYPES[Math.floor(Math.random() * _BOSS_MINION_TYPES.length)];
                  this._deferredSpawns.push({ type: minionType, pathT: Math.max(0, e.pathT - 0.01) });
                  this._state.enemiesLeft += 1;
                  e.bossSpawnThreshold -= 400;
                }
              }
              if (e.hp <= 0) {
                e.alive = false;
                if (e.stats?.spawnOnDeath) {
                  const n = e.stats.spawnOnDeath;
                  const pt = e.pathT;
                  for (let s = 0; s < n; s++) {
                    this._deferredSpawns.push({ type: 'standard', pathT: Math.max(0, pt - s * 0.005) });
                  }
                  this._state.enemiesLeft += n;
                }
                if (e.stats?.type === 'boss') this._hud.hideBossBar();
                e.triggerDeath(() => {
                  this._scene.remove(e.mesh);
                  const idx = this._animFns.indexOf(e._animRef);
                  if (idx !== -1) this._animFns.splice(idx, 1);
                  e._done = true;
                });
                this._state.enemyKilled(e.reward);
              }
            }
          } else {
            if (!best.stats?.immune) {
              best.hp -= tower.damage;
            }
            tower.triggerShoot(best.mesh.position);

            if (best.stats?.type === 'boss' && best.alive && best.bossSpawnThreshold !== undefined) {
              while (best.hp <= best.bossSpawnThreshold && best.bossSpawnThreshold > 0) {
                const _BOSS_MINION_TYPES = ['fast', 'tank', 'healer', 'disruptor', 'eximus'];
                const minionType = _BOSS_MINION_TYPES[Math.floor(Math.random() * _BOSS_MINION_TYPES.length)];
                this._deferredSpawns.push({ type: minionType, pathT: Math.max(0, best.pathT - 0.01) });
                this._state.enemiesLeft += 1;
                best.bossSpawnThreshold -= 400;
              }
            }
            if (best.hp <= 0) {
              best.alive = false;
              if (best.stats?.spawnOnDeath) {
                const n = best.stats.spawnOnDeath;
                const pt = best.pathT;
                for (let s = 0; s < n; s++) {
                  this._deferredSpawns.push({ type: 'standard', pathT: Math.max(0, pt - s * 0.005) });
                }
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
  }

  _upgradeTower(tower) {
    if (tower.level >= 3) return;
    const upg = tower.upgrades[tower.level];
    if (!upg) return;
    if (!this._state.spendStardust(upg.cost)) {
      this._hud.showMsg(`Need ◈ ${upg.cost} to upgrade!`, 2000);
      return;
    }
    tower.level += 1;
    tower.damage    *= upg.damageMultiplier;
    tower.range     *= upg.rangeMultiplier;
    tower.fireRate  *= upg.fireRateMultiplier;
    tower.totalSpent += upg.cost;
    this._shop?.updateStardust(this._state.stardust);
  }

  _sellTower(tower) {
    const refund = Math.floor(tower.totalSpent * 0.5);
    this._state.addStardust(refund);
    this._scene.remove(tower.mesh);
    const animIdx = this._animFns.indexOf(tower._animRef);
    if (animIdx !== -1) this._animFns.splice(animIdx, 1);
    const towerIdx = this._towers.indexOf(tower);
    if (towerIdx !== -1) this._towers.splice(towerIdx, 1);
    this._hud.showMsg(`Sold for +◈ ${refund}`, 2000);
  }

  _fullReset() {
    location.reload();
  }
}
