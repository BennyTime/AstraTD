import * as THREE from 'three';

/**
 * FastEnemy – a sleek hover-drone scout.
 *
 * Hierarchy:
 *   group
 *   └─ fuselage        (disc body + cockpit dome)
 *       ├─ eye          (forward visor strip)
 *       ├─ wingGroupL/R (swept wing panels)
 *       │   ├─ wing mesh
 *       │   └─ thruster glow
 *       └─ fin          (tail stabiliser)
 *
 */

export const FastEnemyStats = {
  hp: 35,
  speed: 4.2,
  damage: 8,
  reward: 15,
  type: 'fast',
};

const _geo = {
  fuselage: new THREE.CylinderGeometry(0.30, 0.23, 0.16, 10),
  cockpit: new THREE.SphereGeometry(0.17, 8, 6),
  wing: new THREE.BoxGeometry(0.60, 0.045, 0.24),
  fin: new THREE.BoxGeometry(0.045, 0.16, 0.20),
  eyeStrip: new THREE.BoxGeometry(0.48, 0.045, 0.055),
  shard: new THREE.IcosahedronGeometry(0.07, 0),
};

export function createFastEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ────────────────────────────────────────────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x06192e, roughness: 0.4, metalness: 0.92 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: new THREE.Color(0x00e5ff), emissiveIntensity: 1.6, roughness: 0.2 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: new THREE.Color(0x00ffff), emissiveIntensity: 2.6, transparent: true, opacity: 0.95 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: new THREE.Color(0x00e5ff), emissiveIntensity: 2, transparent: true });

  const SCALE = 0.7;

  // ── Fuselage group (everything parented here for hover bob) ──────────────
  const fuselage = new THREE.Group();
  fuselage.position.y = 0.82 * SCALE;
  group.add(fuselage);

  const bodyMesh = new THREE.Mesh(_geo.fuselage, bodyMat);
  bodyMesh.castShadow = true;
  fuselage.add(bodyMesh);

  const cockpit = new THREE.Mesh(_geo.cockpit, bodyMat);
  cockpit.position.y = 0.10;
  cockpit.castShadow = true;
  fuselage.add(cockpit);

  const eye = new THREE.Mesh(_geo.eyeStrip, eyeMat);
  eye.position.set(0, 0.06, 0.21);
  fuselage.add(eye);

  // ── Wings ────────────────────────────────────────────────────────────────
  const wingGroups = {};
  function makeWing(side) {
    const sign = side === 'L' ? -1 : 1;
    const wg = new THREE.Group();
    wg.position.set(sign * 0.26, 0, 0);
    fuselage.add(wg);

    const wing = new THREE.Mesh(_geo.wing, bodyMat);
    wing.position.set(sign * 0.22, 0, -0.04);
    wing.rotation.y = sign * -0.18;
    wing.castShadow = true;
    wg.add(wing);

    wingGroups[side] = wg;
  }
  makeWing('L');
  makeWing('R');

  // ── Tail fin ──────────────────────────────────────────────────────────────
  const fin = new THREE.Mesh(_geo.fin, bodyMat);
  fin.position.set(0, 0.12, -0.22);
  fuselage.add(fin);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.04), accentMat);
  stripe.position.set(0, 0.0, 0.20);
  fuselage.add(stripe);

  // ── Explosion shards ─────────────────────────────────────────────────────
  const SHARD_COUNT = 14;
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(_geo.shard, shardMat);
    s.visible = false;
    s.position.set(0, 0.82 * SCALE, 0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const spd = 3 + Math.random() * 5;
    s.userData.vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * spd,
      Math.cos(phi) * spd + 1,
      Math.sin(phi) * Math.sin(theta) * spd
    );
    s.userData.rot = new THREE.Vector3(
      (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 9
    );
    group.add(s);
    shards.push(s);
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let state = 'walk';
  let walkPhase = 0;
  let deathTimer = 0;
  let explodeTime = 0;
  let t = 0;

  const JOY_DURATION = 0.7;

  function setWalk() { state = 'walk'; }

  function triggerDeath(onDone) {
    state = 'death';
    deathTimer = 0;
    group.userData._deathDone = onDone;
  }

  function triggerExplode(onHit, onDone) {
    state = 'explode';
    explodeTime = 0;
    group.userData._explodeHit = onHit;
    group.userData._explodeDone = onDone;
  }

  function update(delta) {
    t += delta;

    if (state === 'walk') {
      walkPhase += delta * 7;

      fuselage.position.y = 0.82 * SCALE + Math.sin(walkPhase * 1.4) * 0.07;

      wingGroups.L.rotation.z =  Math.sin(walkPhase) * 0.14;
      wingGroups.R.rotation.z = -Math.sin(walkPhase) * 0.14;

      eyeMat.emissiveIntensity = 2.3 + Math.sin(t * 9)  * 0.5;
      accentMat.emissiveIntensity = 1.4 + Math.sin(t * 13) * 0.4;

    } else if (state === 'death') {
      deathTimer += delta;

      fuselage.rotation.z += delta * 9;
      fuselage.rotation.x += delta * 5;
      const scale = Math.max(0.01, 1 - deathTimer / 0.45);
      fuselage.scale.setScalar(scale);
      const fade = scale;
      [bodyMat, accentMat, eyeMat].forEach(m => { m.transparent = true; m.opacity = fade; });

      if (deathTimer > 0.45) {
        const cb = group.userData._deathDone;
        if (typeof cb === 'function') cb();
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        fuselage.rotation.y += delta * 6;
        eyeMat.emissiveIntensity = 3.5 + Math.sin(explodeTime * 22) * 1.2;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          shardMat.opacity = 1;
          shards.forEach(s => {
            s.visible = true;
            s.position.set(0, 0.82 * SCALE, 0);
          });
          fuselage.visible = false;
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const shardOpacity = Math.max(0, 1 - burstTime / 0.75);
        shardMat.opacity = shardOpacity;
        shards.forEach(s => {
          s.position.addScaledVector(s.userData.vel, delta);
          s.userData.vel.y -= delta * 8;
          s.rotation.x += s.userData.rot.x * delta;
          s.rotation.y += s.userData.rot.y * delta;
        });

        if (burstTime > 0.75) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    [bodyMat, accentMat, eyeMat].forEach(m => { m.opacity = 1; m.transparent = false; });
    fuselage.visible = true;
    fuselage.scale.setScalar(1);
    fuselage.rotation.set(0, 0, 0);
    shards.forEach(s => { s.visible = false; });
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
