import * as THREE from 'three';

/**
 * EximusEnemy – a heavy commander unit that spawns two StandardEnemies on death.
 *
 * Game mechanic (handled by Game.js):
 *   On kill → spawn 2 StandardEnemies at the Eximus's current pathT position.
 *   stats.spawnOnDeath gives the count.
 *
 * Hierarchy:
 *   group
 *   ├─ torso
 *   │   ├─ head  + visor
 *   │   ├─ shoulders + arms (L/R)
 *   │   ├─ chestCore
 *   │   └─ reactor backpack (glowing dome + veins)
 *   └─ pelvis
 *       └─ legs (L/R)
 */

export const EximusEnemyStats = {
  hp: 160,
  speed: 1.5,
  damage: 30,
  reward: 35,
  type: 'eximus',
  spawnOnDeath: 2,
};

const _geo = {
  torso: new THREE.BoxGeometry(0.72, 0.72, 0.44),
  chestCore: new THREE.CylinderGeometry(0.10, 0.10, 0.16, 12),
  conduit: new THREE.BoxGeometry(0.04, 0.28, 0.03),
  capePanel: new THREE.BoxGeometry(0.90, 0.70, 0.04),
  capeGlow: new THREE.BoxGeometry(0.04, 0.66, 0.04),
  pauldron: new THREE.BoxGeometry(0.20, 0.25, 0.30),
  pauldronSpike: new THREE.ConeGeometry(0.055, 0.30, 4),
  head: new THREE.BoxGeometry(0.48, 0.40, 0.38),
  visor: new THREE.BoxGeometry(0.38, 0.10, 0.07),
  headCrest: new THREE.BoxGeometry(0.05, 0.42, 0.22),
  upperArm: new THREE.BoxGeometry(0.15, 0.36, 0.15),
  elbow: new THREE.SphereGeometry(0.080, 8, 8),
  lowerArm: new THREE.BoxGeometry(0.13, 0.32, 0.13),
  fist: new THREE.BoxGeometry(0.16, 0.13, 0.16),
  pelvis: new THREE.BoxGeometry(0.56, 0.26, 0.36),
  upperLeg: new THREE.BoxGeometry(0.19, 0.38, 0.19),
  knee: new THREE.SphereGeometry(0.10, 8, 8),
  lowerLeg: new THREE.BoxGeometry(0.17, 0.36, 0.17),
  foot: new THREE.BoxGeometry(0.20, 0.12, 0.30),
  reactorBody: new THREE.CylinderGeometry(0.16, 0.20, 0.50, 10),
  reactorDome: new THREE.SphereGeometry(0.18, 10, 8),
  reactorVein: new THREE.BoxGeometry(0.05, 0.44, 0.04),
  shard: new THREE.IcosahedronGeometry(0.10, 0),
};

export function createEximusEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ────────────────────────────────────────────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0a0620, roughness: 0.50, metalness: 0.88 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x180430, roughness: 0.55, metalness: 0.80 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x44ffee, emissive: new THREE.Color(0x44ffee), emissiveIntensity: 1.5, roughness: 0.25 });
  const visorMat = new THREE.MeshStandardMaterial({ color: 0x88ffff, emissive: new THREE.Color(0x88ffff), emissiveIntensity: 2.5, transparent: true, opacity: 0.92 });
  const reactorMat = new THREE.MeshStandardMaterial({ color: 0x0a0620, roughness: 0.45, metalness: 0.85 });
  const reactorGlowMat = new THREE.MeshStandardMaterial({ color: 0x00ddff, emissive: new THREE.Color(0x00ddff), emissiveIntensity: 2.2, roughness: 0.2 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x05020e, roughness: 0.40, metalness: 0.92 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x44ffee, emissive: new THREE.Color(0x44ffee), emissiveIntensity: 2, transparent: true });

  const SCALE = 0.90;

  // ── Torso ─────────────────────────────────────────────────────────────────
  const torso = new THREE.Group();
  group.add(torso);
  torso.position.y = 1.0 * SCALE;

  const torsoMesh = new THREE.Mesh(_geo.torso, bodyMat);
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  const chestCore = new THREE.Mesh(_geo.chestCore, accentMat);
  chestCore.rotation.x = Math.PI / 2;
  chestCore.position.set(0, 0.10, 0.23);
  torso.add(chestCore);

  for (let i = -1; i <= 1; i += 2) {
    for (let j = 0; j < 2; j++) {
      const cond = new THREE.Mesh(_geo.conduit, accentMat);
      cond.position.set(i * (0.10 + j * 0.16), -0.06, 0.23);
      torso.add(cond);
    }
  }

  const cape = new THREE.Mesh(_geo.capePanel, darkMat);
  cape.position.set(0, -0.02, -0.26);
  torso.add(cape);

  const capeGlowL = new THREE.Mesh(_geo.capeGlow, accentMat);
  capeGlowL.position.set(-0.47, -0.02, -0.26);
  torso.add(capeGlowL);

  const capeGlowR = new THREE.Mesh(_geo.capeGlow, accentMat);
  capeGlowR.position.set( 0.47, -0.02, -0.26);
  torso.add(capeGlowR);

  for (const side of ['L', 'R']) {
    const sign = side === 'L' ? -1 : 1;
    const pg = new THREE.Group();
    pg.position.set(sign * 0.44, 0.28, 0);
    torso.add(pg);

    const pad = new THREE.Mesh(_geo.pauldron, darkMat);
    pad.position.x = sign * 0.10;
    pg.add(pad);

    for (let k = 0; k < 2; k++) {
      const spike = new THREE.Mesh(_geo.pauldronSpike, accentMat);
      spike.position.set(sign * (0.06 + k * 0.11), 0.26, 0);
      pg.add(spike);
    }
  }

  // ── Head ──────────────────────────────────────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.50 * SCALE;
  torso.add(headGroup);

  const headMesh = new THREE.Mesh(_geo.head, bodyMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const visor = new THREE.Mesh(_geo.visor, visorMat);
  visor.position.set(0, 0.06, 0.20);
  headGroup.add(visor);

  const headCrest = new THREE.Mesh(_geo.headCrest, darkMat);
  headCrest.position.set(0, 0.41, 0);
  headGroup.add(headCrest);

  const crestGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.38, 0.06),
    accentMat
  );
  crestGlow.position.set(0, 0.41, 0.10);
  headGroup.add(crestGlow);

  // ── Arms ──────────────────────────────────────────────────────────────────
  function makeArm(side) {
    const sign = side === 'L' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.42, 0.24, 0);
    torso.add(shoulder);

    const upperArmPivot = new THREE.Group();
    shoulder.add(upperArmPivot);

    const upperArm = new THREE.Mesh(_geo.upperArm, bodyMat);
    upperArm.position.y = -0.18;
    upperArmPivot.add(upperArm);

    const elbow = new THREE.Mesh(_geo.elbow, jointMat);
    elbow.position.y = -0.38;
    upperArmPivot.add(elbow);

    const lowerArmPivot = new THREE.Group();
    lowerArmPivot.position.y = -0.38;
    upperArmPivot.add(lowerArmPivot);

    const lowerArm = new THREE.Mesh(_geo.lowerArm, bodyMat);
    lowerArm.position.y = -0.16;
    lowerArmPivot.add(lowerArm);

    const fist = new THREE.Mesh(_geo.fist, darkMat);
    fist.position.y = -0.35;
    lowerArmPivot.add(fist);

    return { upperArmPivot, lowerArmPivot };
  }
  const armL = makeArm('L');
  const armR = makeArm('R');

  // ── Reactor backpack ───────────────────────────────────────────────────────
  const reactorGroup = new THREE.Group();
  reactorGroup.position.set(0, 0.10, -0.28);
  torso.add(reactorGroup);

  const rBody = new THREE.Mesh(_geo.reactorBody, reactorMat);
  reactorGroup.add(rBody);

  const rDome = new THREE.Mesh(_geo.reactorDome, reactorGlowMat);
  rDome.position.y = 0.34;
  reactorGroup.add(rDome);

  for (let i = -1; i <= 1; i++) {
    const vein = new THREE.Mesh(_geo.reactorVein, reactorGlowMat);
    vein.position.set(i * 0.10, -0.02, 0.12);
    reactorGroup.add(vein);
  }

  // ── Pelvis / hips ─────────────────────────────────────────────────────────
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.72 * SCALE;
  group.add(pelvis);

  const pelvisMesh = new THREE.Mesh(_geo.pelvis, bodyMat);
  pelvisMesh.castShadow = true;
  pelvis.add(pelvisMesh);

  // ── Legs ──────────────────────────────────────────────────────────────────
  function makeLeg(side) {
    const sign = side === 'L' ? -1 : 1;
    const hipPivot = new THREE.Group();
    hipPivot.position.set(sign * 0.20, 0, 0);
    pelvis.add(hipPivot);

    const upperLeg = new THREE.Mesh(_geo.upperLeg, bodyMat);
    upperLeg.position.y = -0.18;
    upperLeg.castShadow = true;
    hipPivot.add(upperLeg);

    const knee = new THREE.Mesh(_geo.knee, jointMat);
    knee.position.y = -0.38;
    hipPivot.add(knee);

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.38;
    hipPivot.add(kneePivot);

    const lowerLeg = new THREE.Mesh(_geo.lowerLeg, bodyMat);
    lowerLeg.position.y = -0.17;
    kneePivot.add(lowerLeg);

    const foot = new THREE.Mesh(_geo.foot, darkMat);
    foot.position.set(0, -0.38, 0.05);
    kneePivot.add(foot);

    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.05, 0.07),
      accentMat
    );
    strip.position.set(0, -0.36, 0.09);
    hipPivot.add(strip);

    return { hipPivot, kneePivot };
  }
  const legL = makeLeg('L');
  const legR = makeLeg('R');

  // ── Shards ────────────────────────────────────────────────────────────────
  const SHARD_COUNT = 20;
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(_geo.shard, shardMat);
    s.visible = false;
    s.position.set(0, 0.9, 0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const spd = 2 + Math.random() * 4;
    s.userData.vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * spd,
      Math.cos(phi) * spd + 1,
      Math.sin(phi) * Math.sin(theta) * spd
    );
    s.userData.rot = new THREE.Vector3(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 7
    );
    group.add(s);
    shards.push(s);
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let state = 'walk';
  let walkPhase = 0;
  let deathTimer = 0;
  let breakReady = false;
  let breakParts = [];
  let explodeTime = 0;
  let t = 0;

  const JOY_DURATION = 1.1;

  function setWalk() { state = 'walk'; }

  function triggerDeath(onDone) {
    state = 'death';
    deathTimer = 0;
    breakReady = false;
    breakParts = [];
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
      walkPhase += delta * 3.0;
      const swing = Math.sin(walkPhase) * 0.52;

      legL.hipPivot.rotation.x =  swing;
      legR.hipPivot.rotation.x = -swing;
      legL.kneePivot.rotation.x = Math.max(0, -Math.sin(walkPhase)) * 0.65;
      legR.kneePivot.rotation.x = Math.max(0,  Math.sin(walkPhase)) * 0.65;

      armL.upperArmPivot.rotation.x = -swing * 0.55;
      armR.upperArmPivot.rotation.x =  swing * 0.55;
      armL.lowerArmPivot.rotation.x = Math.abs(swing) * 0.28;
      armR.lowerArmPivot.rotation.x = Math.abs(swing) * 0.28;

      torso.position.y = 1.0 * SCALE + Math.abs(Math.sin(walkPhase)) * 0.04;

      reactorGlowMat.emissiveIntensity = 1.6 + Math.sin(t * 4) * 0.6;
      visorMat.emissiveIntensity = 1.9 + Math.sin(t * 6) * 0.3;
      accentMat.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.4;

    } else if (state === 'death') {
      deathTimer += delta;

      if (!breakReady) {
        const flinch = Math.sin((Math.min(deathTimer, 0.15) / 0.15) * Math.PI);
        torso.rotation.x = -flinch * 0.35;
        reactorGlowMat.emissiveIntensity = 2.0 + flinch * 4;

        if (deathTimer >= 0.15) {
          breakReady = true;

          [legL.hipPivot, legR.hipPivot].forEach(hip => {
            const wp = new THREE.Vector3();
            hip.getWorldPosition(wp);
            const wq = new THREE.Quaternion();
            hip.getWorldQuaternion(wq);
            hip.parent.remove(hip);
            group.add(hip);
            group.worldToLocal(wp);
            hip.position.copy(wp);
            const gq = new THREE.Quaternion();
            group.getWorldQuaternion(gq);
            hip.quaternion.copy(gq.invert().multiply(wq));
          });

          [torso, pelvis, legL.hipPivot, legR.hipPivot].forEach((obj, i) => {
            const angle = (i * Math.PI / 2) + (Math.random() - 0.5) * 0.9;
            const spd = 2.2 + Math.random() * 2.8;
            obj.userData.breakVel = new THREE.Vector3(
              Math.cos(angle) * spd,
              2.0 + Math.random() * 3.5,
              Math.sin(angle) * spd
            );
            obj.userData.breakRot = new THREE.Vector3(
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 12
            );
          });
          breakParts = [torso, pelvis, legL.hipPivot, legR.hipPivot];
        }

      } else {
        const bTime = deathTimer - 0.15;

        breakParts.forEach(obj => {
          obj.position.addScaledVector(obj.userData.breakVel, delta);
          obj.userData.breakVel.y -= delta * 9.5;
          obj.rotation.x += obj.userData.breakRot.x * delta;
          obj.rotation.y += obj.userData.breakRot.y * delta;
          obj.rotation.z += obj.userData.breakRot.z * delta;
        });

        if (bTime > 0.22) {
          const fade = 1 - Math.min(1, (bTime - 0.22) / 0.90);
          [bodyMat, accentMat, visorMat, jointMat, darkMat, reactorMat, reactorGlowMat].forEach(m => {
            m.transparent = true;
            m.opacity = fade;
          });
        }

        if (bTime > 1.12) {
          const cb = group.userData._deathDone;
          if (typeof cb === 'function') cb();
        }
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        const raise = Math.min(1, explodeTime / 0.3);
        armL.upperArmPivot.rotation.x = -Math.PI * 0.88 * raise;
        armR.upperArmPivot.rotation.x = -Math.PI * 0.88 * raise;
        armL.lowerArmPivot.rotation.x = 0;
        armR.lowerArmPivot.rotation.x = 0;

        const hopCycle = Math.max(0, Math.sin(explodeTime * Math.PI / JOY_DURATION * 4));
        group.position.y = (group.userData._joyBaseY || 0.186) + hopCycle * 0.35;

        legL.hipPivot.rotation.x = 0;
        legR.hipPivot.rotation.x = 0;
        legL.kneePivot.rotation.x = 0;
        legR.kneePivot.rotation.x = 0;

        torso.rotation.x = -raise * 0.2;
        torso.position.y = 1.0 * SCALE;
        visorMat.emissiveIntensity = 2.5 + Math.sin(t * 12) * 0.6;
        reactorGlowMat.emissiveIntensity = 4 + Math.sin(t * 18) * 2;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          group.position.y = group.userData._joyBaseY || 0.186;
          shardMat.opacity = 1;
          shards.forEach(s => {
            s.visible = true;
            s.position.set(0, 0.9, 0);
          });
          torso.visible = false;
          pelvis.visible = false;
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const shardOpacity = Math.max(0, 1 - burstTime / 1.0);
        shardMat.opacity = shardOpacity;
        shards.forEach(s => {
          s.position.addScaledVector(s.userData.vel, delta);
          s.userData.vel.y -= delta * 8;
          s.rotation.x += s.userData.rot.x * delta;
          s.rotation.y += s.userData.rot.y * delta;
        });

        if (burstTime > 1.0) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    [bodyMat, accentMat, visorMat, jointMat, darkMat, reactorMat, reactorGlowMat].forEach(m => {
      m.opacity = 1;
      m.transparent = m === visorMat;
    });
    torso.visible = true;
    pelvis.visible = true;
    torso.rotation.set(0, 0, 0);
    torso.position.y = 1.0 * SCALE;
    shards.forEach(s => { s.visible = false; });
    group.userData._shardSpawned = false;
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
