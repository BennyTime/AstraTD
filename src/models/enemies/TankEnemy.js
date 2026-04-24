import * as THREE from 'three';

/**
 * TankEnemy – a slow, hulking 4-legged armoured mech.
 *
 * Hierarchy:
 *   group
 *   ├─ torso            (wide armoured box)
 *   │   ├─ armorTop     (sloped top plate)
 *   │   ├─ head         (small embedded helm)
 *   │   │   └─ visor
 *   │   ├─ shoulderCannonR
 *   │   ├─ ventL/R      (exhaust vents on back)
 *   │   └─ accentStrips x2
 *   └─ legPivot[FL/FR/BL/BR]
 *       └─ upper/lower leg + foot
 *
 * Animations: heavy 4-legged stomp, slow topple death.
 */

export const TankEnemyStats = {
  hp: 280,
  speed: 0.9,
  damage: 50,
  reward: 65,
  type: 'tank',
};

const _geo = {
  torso: new THREE.BoxGeometry(1.05, 0.55, 0.90),
  armorTop: new THREE.BoxGeometry(0.90, 0.12, 0.75),
  armorFront: new THREE.BoxGeometry(0.88, 0.42, 0.10),
  head: new THREE.BoxGeometry(0.36, 0.30, 0.38),
  visor: new THREE.BoxGeometry(0.28, 0.08, 0.06),
  vent: new THREE.BoxGeometry(0.28, 0.10, 0.07),
  ventGlow: new THREE.BoxGeometry(0.22, 0.06, 0.04),
  upperLeg: new THREE.BoxGeometry(0.22, 0.38, 0.22),
  lowerLeg: new THREE.BoxGeometry(0.20, 0.30, 0.20),
  foot: new THREE.BoxGeometry(0.32, 0.10, 0.38),
  kneePad: new THREE.BoxGeometry(0.20, 0.08, 0.08),
  shard: new THREE.IcosahedronGeometry(0.11, 0),
};

export function createTankEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ────────────────────────────────────────────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a2310, roughness: 0.7, metalness: 0.75 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x253018, roughness: 0.65, metalness: 0.70 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff5500), emissiveIntensity: 1.4, roughness: 0.3 });
  const visorMat = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: new THREE.Color(0xff8800), emissiveIntensity: 2.0, transparent: true, opacity: 0.9 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x0e140a, roughness: 0.5, metalness: 0.85 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff5500), emissiveIntensity: 2, transparent: true });

  const SCALE = 0.88;

  // ── Torso ─────────────────────────────────────────────────────────────────
  const torso = new THREE.Group();
  torso.position.y = 1.05 * SCALE;
  group.add(torso);

  const torsoMesh = new THREE.Mesh(_geo.torso, bodyMat);
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Sloped top armour
  const armorTop = new THREE.Mesh(_geo.armorTop, plateMat);
  armorTop.position.set(0, 0.34, 0);
  armorTop.rotation.x = -0.12;
  torso.add(armorTop);

  // Front armour plate
  const armorFront = new THREE.Mesh(_geo.armorFront, plateMat);
  armorFront.position.set(0, 0.0, 0.50);
  torso.add(armorFront);

  // ── Head (embedded low) ──
  const headGroup = new THREE.Group();
  headGroup.position.set(0.12, 0.26, 0.40);
  torso.add(headGroup);

  const headMesh = new THREE.Mesh(_geo.head, bodyMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const visor = new THREE.Mesh(_geo.visor, visorMat);
  visor.position.set(0, 0.04, 0.20);
  headGroup.add(visor);

  // ── Back exhaust vents ────────────────────────────────────────────────────
  for (let v = 0; v < 3; v++) {
    const vent = new THREE.Mesh(_geo.vent, plateMat);
    vent.position.set(0, 0.20 - v * 0.18, -0.48);
    torso.add(vent);

    const vg = new THREE.Mesh(_geo.ventGlow, accentMat);
    vg.position.set(0, 0.20 - v * 0.18, -0.50);
    torso.add(vg);
  }

  // ── Legs (FL, FR, BL, BR) ─────────────────────────────────────────────────
  const legPivots = {};

  function makeLeg(key, xSign, zOff) {
    const pivot = new THREE.Group();
    pivot.position.set(xSign * 0.50, -0.30, zOff);
    torso.add(pivot);

    const upper = new THREE.Mesh(_geo.upperLeg, bodyMat);
    upper.position.y = -0.19;
    upper.castShadow = true;
    pivot.add(upper);

    // Knee
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), jointMat);
    knee.position.y = -0.40;
    pivot.add(knee);

    const kneePad = new THREE.Mesh(_geo.kneePad, accentMat);
    kneePad.position.set(0, -0.38, 0.09);
    pivot.add(kneePad);

    // Lower leg pivot (at knee)
    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.40;
    pivot.add(kneePivot);

    const lower = new THREE.Mesh(_geo.lowerLeg, bodyMat);
    lower.position.y = -0.15;
    lower.castShadow = true;
    kneePivot.add(lower);

    const foot = new THREE.Mesh(_geo.foot, plateMat);
    foot.position.set(0, -0.33, 0.06);
    kneePivot.add(foot);

    legPivots[key] = { pivot, kneePivot };
  }

  makeLeg('FL', -1, 0.32);
  makeLeg('FR', 1, 0.32);
  makeLeg('BL', -1, -0.32);
  makeLeg('BR', 1, -0.32);

  // ── Explosion shards ──────────────────────────────────────────────────────
  const SHARD_COUNT = 22;
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(_geo.shard, shardMat);
    s.visible = false;
    s.position.set(0, 1.0, 0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const spd = 1.5 + Math.random() * 3;
    s.userData.vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * spd,
      Math.cos(phi) * spd + 0.5,
      Math.sin(phi) * Math.sin(theta) * spd
    );
    s.userData.rot = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
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

  const JOY_DURATION = 1.2;

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
      walkPhase += delta * 1.8; // slow stomp cycle

      // Diagonal pairs: FL+BR move together, FR+BL move together
      const swingA =  Math.sin(walkPhase) * 0.35;
      const swingB = -Math.sin(walkPhase) * 0.35;

      legPivots.FL.pivot.rotation.x =  swingA;
      legPivots.BR.pivot.rotation.x =  swingA;
      legPivots.FR.pivot.rotation.x =  swingB;
      legPivots.BL.pivot.rotation.x =  swingB;

      // Knee bend for raised leg
      legPivots.FL.kneePivot.rotation.x = Math.max(0, -Math.sin(walkPhase)) * 0.45;
      legPivots.BR.kneePivot.rotation.x = Math.max(0, -Math.sin(walkPhase)) * 0.45;
      legPivots.FR.kneePivot.rotation.x = Math.max(0, Math.sin(walkPhase)) * 0.45;
      legPivots.BL.kneePivot.rotation.x = Math.max(0, Math.sin(walkPhase)) * 0.45;

      // Torso heave (heavy footfall)
      torso.position.y = 1.05 * SCALE + Math.abs(Math.sin(walkPhase * 2)) * -0.02;

      // Visor glow flicker
      visorMat.emissiveIntensity = 1.8 + Math.sin(t * 4) * 0.3;

    } else if (state === 'death') {
      deathTimer += delta;

      // Topple forward slowly
      torso.rotation.x = Math.min(Math.PI / 2, deathTimer * 1.5);
      torso.position.y = Math.max(0, 1.05 * SCALE - deathTimer * 0.8);

      if (deathTimer > 0.3) {
        const fade = Math.max(0, 1 - (deathTimer - 0.3) / 1.0);
        [bodyMat, plateMat, accentMat, visorMat, jointMat].forEach(m => {
          m.transparent = true;
          m.opacity = fade;
        });
      }

      if (deathTimer > 1.3) {
        const cb = group.userData._deathDone;
        if (typeof cb === 'function') cb();
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        // Heavy stomp in place
        const stomp = Math.abs(Math.sin(explodeTime * Math.PI * 2));
        group.position.y = (group.userData._joyBaseY || 0) + stomp * 0.12;
        visorMat.emissiveIntensity = 2.5 + Math.sin(t * 15) * 0.8;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          group.position.y = group.userData._joyBaseY || 0;
          shardMat.opacity = 1;
          shards.forEach(s => {
            s.visible = true;
            s.position.set(0, 1.0, 0);
          });
          torso.visible = false;
          Object.values(legPivots).forEach(lp => { lp.pivot.visible = false; });
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const shardOpacity = Math.max(0, 1 - burstTime / 1.1);
        shardMat.opacity = shardOpacity;
        shards.forEach(s => {
          s.position.addScaledVector(s.userData.vel, delta);
          s.userData.vel.y -= delta * 9;
          s.rotation.x += s.userData.rot.x * delta;
          s.rotation.y += s.userData.rot.y * delta;
        });

        if (burstTime > 1.1) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    [bodyMat, plateMat, accentMat, visorMat, jointMat].forEach(m => {
      m.opacity = 1;
      m.transparent = false;
    });
    torso.visible = true;
    torso.rotation.set(0, 0, 0);
    torso.position.y = 1.05 * SCALE;
    Object.values(legPivots).forEach(lp => { lp.pivot.visible = true; });
    shards.forEach(s => { s.visible = false; });
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
