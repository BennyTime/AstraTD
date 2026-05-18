import * as THREE from 'three';

/**
 * DisruptorEnemy – an EMP tripod that slows nearby towers.
 *
 * Hierarchy:
 *   group
 *   ├─ bodyGroup          (main body + dish + EMP rings)
 *   │   ├─ hull           (angled hex-box head)
 *   │   ├─ eye
 *   │   ├─ dishGroup      (spinning satellite dish assembly)
 *   │   │   ├─ dishArm
 *   │   │   └─ dish (torus)
 *   │   ├─ empRing[0-1]   (two pulsing torus rings, different radii)
 *   │   └─ antennaL/R
 *   └─ legPivot[A/B/C]   (3 spider legs, 120° apart)
 *       └─ upper + lower + foot
 *
 * Game mechanics (handled by Game.js):
 *   stats.disruptRadius – towers within this radius fire at 35% normal rate
 *
 * Animations: dish spin, EMP ring pulse/expand, tripod walk (2+1 gait).
 */

export const DisruptorEnemyStats = {
  hp: 75,
  speed: 1.8,
  damage: 18,
  reward: 45,
  type: 'disruptor',
  disruptRadius: 5.5,
};

const _geo = {
  hull: new THREE.OctahedronGeometry(0.32, 0),
  hullCap: new THREE.BoxGeometry(0.50, 0.14, 0.44),
  eye: new THREE.SphereGeometry(0.08, 8, 8),
  dishArm: new THREE.BoxGeometry(0.06, 0.06, 0.34),
  dish: new THREE.TorusGeometry(0.18, 0.03, 6, 22),
  dishCenter: new THREE.CircleGeometry(0.16, 16),
  empRing: new THREE.TorusGeometry(0.55, 0.022, 6, 36),
  empRingBig: new THREE.TorusGeometry(0.80, 0.016, 6, 40),
  antenna: new THREE.CylinderGeometry(0.018, 0.018, 0.36, 5),
  antTip: new THREE.SphereGeometry(0.04, 6, 6),
  upperLeg: new THREE.BoxGeometry(0.10, 0.42, 0.10),
  lowerLeg: new THREE.BoxGeometry(0.08, 0.36, 0.08),
  shard: new THREE.IcosahedronGeometry(0.07, 0),
};

export function createDisruptorEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ────────────────────────────────────────────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a1800, roughness: 0.5, metalness: 0.82 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: new THREE.Color(0xffcc00), emissiveIntensity: 1.6, roughness: 0.25 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff44, emissive: new THREE.Color(0xffff44), emissiveIntensity: 3.0, transparent: true, opacity: 0.95 });
  const empMat = new THREE.MeshStandardMaterial({ color: 0xffee00, emissive: new THREE.Color(0xffee00), emissiveIntensity: 2.0, transparent: true, opacity: 0.55 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x120c00, roughness: 0.5, metalness: 0.88 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: new THREE.Color(0xffcc00), emissiveIntensity: 2, transparent: true });

  const SCALE = 0.82;

  // ── Body group ────────────────────────────────────────────────────────────
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 1.0 * SCALE;
  group.add(bodyGroup);

  const hull = new THREE.Mesh(_geo.hull, bodyMat);
  hull.scale.set(1, 0.85, 0.95);
  hull.castShadow = true;
  bodyGroup.add(hull);

  const hullCap = new THREE.Mesh(_geo.hullCap, bodyMat);
  hullCap.position.y = 0.20;
  bodyGroup.add(hullCap);

  const eye = new THREE.Mesh(_geo.eye, eyeMat);
  eye.position.set(0, 0.04, 0.28);
  bodyGroup.add(eye);

  // ── Antennas ──────────────────────────────────────────────────────────────
  for (const [xOff, tilt] of [[-0.12, -0.3], [0.12, 0.3]]) {
    const ant = new THREE.Mesh(_geo.antenna, jointMat);
    ant.position.set(xOff, 0.38, 0);
    ant.rotation.z = tilt;
    bodyGroup.add(ant);

    const tip = new THREE.Mesh(_geo.antTip, accentMat);
    tip.position.set(xOff + Math.sin(tilt) * 0.20, 0.38 + 0.20, 0);
    bodyGroup.add(tip);
  }

  // ── Spinning dish assembly ────────────────────────────────────────────────
  const dishGroup = new THREE.Group();
  dishGroup.position.set(0.22, 0.28, 0);
  bodyGroup.add(dishGroup);

  const dishArm = new THREE.Mesh(_geo.dishArm, bodyMat);
  dishArm.position.set(0, 0, 0.17);
  dishGroup.add(dishArm);

  const dish = new THREE.Mesh(_geo.dish, accentMat);
  dish.position.z = 0.38;
  dish.rotation.x = Math.PI / 2;
  dishGroup.add(dish);

  const dishCenter = new THREE.Mesh(_geo.dishCenter, eyeMat);
  dishCenter.position.z = 0.39;
  dishCenter.rotation.x = Math.PI / 2;
  dishGroup.add(dishCenter);

  // ── EMP rings ─────────────────────────────────────────────────────────────
  const empRing = new THREE.Mesh(_geo.empRing,    empMat);
  const empRing2 = new THREE.Mesh(_geo.empRingBig, empMat);
  bodyGroup.add(empRing);
  bodyGroup.add(empRing2);

  // ── Tripod legs (3 legs, 120° apart) ─────────────────────────────────────
  const legPivots = [];

  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    pivot.position.y = -0.10 * SCALE;
    group.add(pivot);

    const upper = new THREE.Mesh(_geo.upperLeg, bodyMat);
    upper.position.set(0.32, -0.21, 0);
    upper.rotation.z = 0.5;
    upper.castShadow = true;
    pivot.add(upper);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), jointMat);
    knee.position.set(0.44, -0.46, 0);
    pivot.add(knee);

    const lower = new THREE.Mesh(_geo.lowerLeg, bodyMat);
    lower.position.set(0.44, -0.66, 0);
    lower.castShadow = true;
    pivot.add(lower);

    legPivots.push(pivot);
  }

  // ── Shards ────────────────────────────────────────────────────────────────
  const SHARD_COUNT = 16;
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(_geo.shard, shardMat);
    s.visible = false;
    s.position.set(0, 0.8, 0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const spd = 2 + Math.random() * 4;
    s.userData.vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * spd,
      Math.cos(phi) * spd + 1,
      Math.sin(phi) * Math.sin(theta) * spd
    );
    s.userData.rot = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
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

  const JOY_DURATION = 0.8;

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
      walkPhase += delta * 2.2;

      dishGroup.rotation.z += delta * 3.5;

      const pulse = Math.sin(t * 2.5);
      empMat.opacity = 0.4 + pulse * 0.22;
      empMat.emissiveIntensity = 1.6 + pulse * 0.6;

      const rs = 1 + Math.sin(t * 2.5) * 0.08;
      empRing.scale.setScalar(rs);
      empRing2.scale.setScalar(1 / rs);

      const swingA =  Math.sin(walkPhase) * 0.28;
      const swingB = -Math.sin(walkPhase) * 0.28;
      legPivots[0].rotation.x = swingA;
      legPivots[2].rotation.x = swingA;
      legPivots[1].rotation.x = swingB;

      bodyGroup.position.y = 1.0 * SCALE + Math.abs(Math.sin(walkPhase)) * 0.04;

      eyeMat.emissiveIntensity = 2.8 + Math.sin(t * 7) * 0.5;

    } else if (state === 'death') {
      deathTimer += delta;

      bodyGroup.rotation.z += delta * 4;
      const scale = Math.max(0.01, 1 - deathTimer / 0.6);
      bodyGroup.scale.setScalar(scale);
      const fade = scale;
      [bodyMat, accentMat, eyeMat, empMat, jointMat].forEach(m => {
        m.transparent = true;
        m.opacity = fade;
      });

      if (deathTimer > 0.6) {
        const cb = group.userData._deathDone;
        if (typeof cb === 'function') cb();
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        dishGroup.rotation.z += delta * 12;
        empMat.opacity = 0.8 + Math.sin(t * 20) * 0.2;
        empRing.scale.setScalar(1 + explodeTime * 0.6);
        empRing2.scale.setScalar(1 + explodeTime * 0.3);
        eyeMat.emissiveIntensity = 5 + Math.sin(t * 25) * 2;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          shardMat.opacity = 1;
          shards.forEach(s => {
            s.visible = true;
            s.position.set(0, 0.8, 0);
          });
          bodyGroup.visible = false;
          legPivots.forEach(lp => { lp.visible = false; });
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const shardOpacity = Math.max(0, 1 - burstTime / 0.85);
        shardMat.opacity = shardOpacity;
        shards.forEach(s => {
          s.position.addScaledVector(s.userData.vel, delta);
          s.userData.vel.y -= delta * 8;
          s.rotation.x += s.userData.rot.x * delta;
          s.rotation.y += s.userData.rot.y * delta;
        });

        if (burstTime > 0.85) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    bodyMat.opacity = 1;  bodyMat.transparent = false;
    accentMat.opacity = 1;  accentMat.transparent = false;
    eyeMat.opacity = 0.95;
    empMat.opacity = 0.55;
    jointMat.opacity = 1;  jointMat.transparent = false;
    bodyGroup.visible = true;
    bodyGroup.scale.setScalar(1);
    bodyGroup.rotation.set(0, 0, 0);
    legPivots.forEach(lp => { lp.visible = true; });
    shards.forEach(s => { s.visible = false; });
    empRing.scale.setScalar(1);
    empRing2.scale.setScalar(1);
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
