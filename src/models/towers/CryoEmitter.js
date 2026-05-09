import * as THREE from 'three';

/**
 * CryoEmitter – area-slow tower.
 *
 * Hierarchy:
 *   group
 *   ├─ base         (wide flat hexagonal disc, ice-blue glow)
 *   ├─ dome         (central hemisphere housing)
 *   ├─ crystalSpines×6 (tapered crystal points around dome)
 *   ├─ orbitRings×3  (thin rings orbiting at different angles)
 *   └─ slowWave      (expanding torus ring shown on pulse)
 *
 * Fire mechanic: Non-directional – fires in all directions equally.
 *   Slows ALL enemies within range for `slowDuration` seconds,
 *   reducing their movement speed by `slowFactor`.
 *   Does not rotate to face a target.
 */

export const CryoEmitterStats = {
  cost: 125,
  range: 4.0,
  damage: 5,
  fireRate: 1.0,
  slowFactor: 0.45,
  slowDuration: 2.5,
  isAreaSlow: true,
};

const _cGeo = {
  base: new THREE.CylinderGeometry(0.94, 1.06, 0.20, 6),
  base2: new THREE.CylinderGeometry(0.70, 0.90, 0.18, 6),
  ring: new THREE.TorusGeometry(0.80, 0.038, 8, 40),
  hexBorder: new THREE.TorusGeometry(1.00, 0.05, 6, 6),
  domeBase: new THREE.CylinderGeometry(0.40, 0.50, 0.28, 8),
  dome: new THREE.SphereGeometry(0.40, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  spineShape: new THREE.ConeGeometry(0.06, 0.48, 6),
  orbitRing: new THREE.TorusGeometry(0.52, 0.028, 8, 36),
  slowWave: new THREE.TorusGeometry(0.5, 0.06, 8, 40),
  crystal: new THREE.ConeGeometry(0.04, 0.30, 5),
};

export function createCryoEmitter() {
  const group = new THREE.Group();

  // ── Materials ──────────────────────────────────────────────────────────
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x041420, roughness: 0.5,  metalness: 0.88 });
  const domeMat = new THREE.MeshStandardMaterial({ color: 0x082838, roughness: 0.35, metalness: 0.82 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x88eeff, emissive: new THREE.Color(0x88eeff), emissiveIntensity: 1.6, roughness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x44ccff, emissive: new THREE.Color(0x44ccff), emissiveIntensity: 1.8, roughness: 0.2 });
  const spineMat = new THREE.MeshStandardMaterial({ color: 0xaaeeff, emissive: new THREE.Color(0x66ddff), emissiveIntensity: 1.4, transparent: true, opacity: 0.90, roughness: 0.15 });
  const domeTopMat= new THREE.MeshStandardMaterial({ color: 0xccf8ff, emissive: new THREE.Color(0x88eeff), emissiveIntensity: 2.2, transparent: true, opacity: 0.78 });
  const waveMat = new THREE.MeshStandardMaterial({ color: 0x66ddff, emissive: new THREE.Color(0x44ccff), emissiveIntensity: 3.0, transparent: true, opacity: 0 });

  // ── Base (wide flat disc) ──
  const base1 = new THREE.Mesh(_cGeo.base, baseMat);
  base1.position.y = 0.10;
  base1.castShadow = base1.receiveShadow = true;
  group.add(base1);

  const base2 = new THREE.Mesh(_cGeo.base2, baseMat);
  base2.position.y = 0.28;
  base2.castShadow = true;
  group.add(base2);

  const baseRing = new THREE.Mesh(_cGeo.ring, ringMat.clone());
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.10;
  group.add(baseRing);

  const hexBorder = new THREE.Mesh(_cGeo.hexBorder, accentMat);
  hexBorder.rotation.x = Math.PI / 2;
  hexBorder.position.y = 0.10;
  group.add(hexBorder);

  // ── Dome body ──
  const domeBase = new THREE.Mesh(_cGeo.domeBase, domeMat);
  domeBase.position.y = 0.50;
  domeBase.castShadow = true;
  group.add(domeBase);

  const domeCap = new THREE.Mesh(_cGeo.dome, domeTopMat);
  domeCap.position.y = 0.64;
  group.add(domeCap);

  // ── Crystal spines (6 evenly spaced, pointing radially outward) ──
  const spines = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    group.add(pivot);

    const spine = new THREE.Mesh(_cGeo.spineShape, spineMat.clone());
    spine.position.set(0.50, 0.68, 0);
    spine.rotation.z = -(Math.PI / 2) + 0.30;
    spine.castShadow = true;
    pivot.add(spine);
    spines.push(spine);
  }

  // ── Orbit rings (3 tilted rings orbiting on Y-axis spinners) ──
  const orbitSpinners = [];
  const tiltAngles = [Math.PI / 5, Math.PI / 3.2, Math.PI / 2.1];
  const spinSpeeds  = [0.90, -0.65, 0.52];
  tiltAngles.forEach((tilt, i) => {
    const spinner = new THREE.Group();
    spinner.rotation.y = (i / 3) * Math.PI * 2;
    group.add(spinner);

    const r = new THREE.Mesh(_cGeo.orbitRing, ringMat.clone());
    r.rotation.x = tilt;
    r.position.y = 0.72;
    spinner.add(r);
    orbitSpinners.push({ spinner, speed: spinSpeeds[i] });
  });

  // ── Slow wave (expands outward on pulse) ──
  const slowWave = new THREE.Mesh(_cGeo.slowWave, waveMat);
  slowWave.rotation.x = Math.PI / 2;
  slowWave.position.y = 0.55;
  slowWave.visible = false;
  group.add(slowWave);

  // ── State ──
  let spawnTimer = 0;
  let spawnDone = false;
  let shootTimer = 0.50;
  let shotRange = CryoEmitterStats.range;
  let t = 0;

  group.scale.setScalar(0);

  function triggerSpawn() {
    spawnTimer = 0;
    spawnDone = false;
    group.scale.setScalar(0);
  }

  function triggerShoot(_targetPos, range) {
    shootTimer = 0;
    shotRange = range ?? CryoEmitterStats.range;

    slowWave.visible = true;
    slowWave.scale.setScalar(0.05);
    waveMat.opacity = 0.9;
  }

  function trackTarget() {}

  function update(delta) {
    t += delta;

    if (!spawnDone) {
      spawnTimer += delta;
      const progress = Math.min(spawnTimer / 0.6, 1);
      const spring = progress < 0.7
        ? (progress / 0.7) * 1.15
        : 1.15 - ((progress - 0.7) / 0.3) * 0.15;
      group.scale.setScalar(spring);
      if (progress >= 1) { group.scale.setScalar(1); spawnDone = true; }
      return;
    }

    // Idle: orbit spinners rotate around Y, base ring pulses, dome glows
    baseRing.rotation.z += delta * 0.9;
    orbitSpinners.forEach(({ spinner, speed }) => {
      spinner.rotation.y += delta * speed;
    });
    domeTopMat.emissiveIntensity = 2.0 + Math.sin(t * 2.0) * 0.5;

    // Crystal shimmer
    spines.forEach((s, i) => {
      s.material.emissiveIntensity = 1.2 + 0.5 * Math.sin(t * 2.5 + i * 1.0);
    });

    // Shoot animation (slow wave expands)
    if (shootTimer < 0.50) {
      shootTimer += delta;
      const s = shootTimer / 0.50;

      if (slowWave.visible) {
        // torus base radius is 0.5 → scale = range/0.5 = range*2 to reach correct world radius
        slowWave.scale.setScalar(0.05 + s * (shotRange * 2 - 0.05));
        waveMat.opacity = (1 - s) * 0.9;
        if (s >= 1) slowWave.visible = false;
      }

      if (shootTimer >= 0.50) {
        const cb = group.userData._shootDone;
        if (typeof cb === 'function') cb();
      }
    }
  }

  triggerSpawn();

  return { name: 'CRYO EMITTER', mesh: group, update, triggerSpawn, triggerShoot, trackTarget };
}
