import * as THREE from 'three';

/**
 * StandardEnemy – a bipedal robotic unit.
 *
 * Hierarchy:
 *   enemyGroup
 *   ├─ body         (torso box)
 *   │   ├─ head     (box with visor)
 *   │   ├─ shoulderL/R
 *   │   ├─ upperArmL/R  (pivot at shoulder)
 *   │   │   └─ lowerArmL/R
 *   │   ├─ chestGlow
 *   │   └─ antennae
 *   ├─ pelvis
 *   │   ├─ upperLegL/R  (pivot at hip)
 *   │   │   └─ lowerLegL/R (pivot at knee)
 *   │   │       └─ foot
 *   │   └─ backBooster
 */

export const StandardEnemyStats = {
  hp: 60,
  speed: 2,
  damage: 20,
  reward: 25,
};

const _geo = {
  torso: new THREE.BoxGeometry(0.55, 0.55, 0.32),
  chestPlate: new THREE.BoxGeometry(0.22, 0.38, 0.1),
  chestGlow: new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12),
  head: new THREE.BoxGeometry(0.38, 0.32, 0.3),
  visor: new THREE.BoxGeometry(0.3, 0.1, 0.06),
  antenna: new THREE.CylinderGeometry(0.015, 0.015, 0.22, 5),
  antTip: new THREE.SphereGeometry(0.04, 6, 6),
  shoulderPad: new THREE.BoxGeometry(0.14, 0.14, 0.22),
  upperArm: new THREE.BoxGeometry(0.12, 0.28, 0.12),
  elbow: new THREE.SphereGeometry(0.065, 8, 8),
  lowerArm: new THREE.BoxGeometry(0.1, 0.25, 0.1),
  fist: new THREE.BoxGeometry(0.12, 0.1, 0.12),
  pelvis: new THREE.BoxGeometry(0.44, 0.2, 0.28),
  booster: new THREE.BoxGeometry(0.3, 0.45, 0.15),
  boosterGlow: new THREE.CylinderGeometry(0.05, 0.07, 0.1, 8),
  upperLeg: new THREE.BoxGeometry(0.15, 0.3, 0.15),
  knee: new THREE.SphereGeometry(0.08, 8, 8),
  lowerLeg: new THREE.BoxGeometry(0.13, 0.28, 0.13),
  foot: new THREE.BoxGeometry(0.14, 0.1, 0.22),
  kneeStrip: new THREE.BoxGeometry(0.13, 0.04, 0.06),
  shard: new THREE.IcosahedronGeometry(0.08, 0),
};

export function createStandardEnemy() {
  const group = new THREE.Group();

  // ── Materials (per-instance so death-fade works independently) ──────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 0.5, metalness: 0.85 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff2060, emissive: new THREE.Color(0xff2060), emissiveIntensity: 1.2, roughness: 0.3 });
  const visorMat = new THREE.MeshStandardMaterial({ color: 0xff3388, emissive: new THREE.Color(0xff3388), emissiveIntensity: 2.0, transparent: true, opacity: 0.9 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x0d0618, roughness: 0.4, metalness: 0.9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x120820, roughness: 0.6, metalness: 0.7 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xff2060, emissive: new THREE.Color(0xff2060), emissiveIntensity: 2, transparent: true });

  const SCALE = 0.72;

  // ── Torso ──
  const torso = new THREE.Group();
  group.add(torso);
  torso.position.y = 1.0 * SCALE;

  const torsoMesh = new THREE.Mesh(_geo.torso, bodyMat);
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  const chestL = new THREE.Mesh(_geo.chestPlate, darkMat);
  chestL.position.set(-0.14, 0, 0.16);
  torso.add(chestL);
  const chestR = new THREE.Mesh(_geo.chestPlate, darkMat);
  chestR.position.set(0.14, 0, 0.16);
  torso.add(chestR);

  const chestGlow = new THREE.Mesh(_geo.chestGlow, accentMat);
  chestGlow.rotation.x = Math.PI / 2;
  chestGlow.position.set(0, 0.04, 0.17);
  torso.add(chestGlow);

  // ── Head ──
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.38 * SCALE;
  torso.add(headGroup);

  const headMesh = new THREE.Mesh(_geo.head, bodyMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const visor = new THREE.Mesh(_geo.visor, visorMat);
  visor.position.set(0, 0.04, 0.16);
  headGroup.add(visor);

  const ant = new THREE.Mesh(_geo.antenna, jointMat);
  ant.position.set(0.1, 0.22, 0);
  headGroup.add(ant);
  const antTip = new THREE.Mesh(_geo.antTip, accentMat);
  antTip.position.set(0.1, 0.34, 0);
  headGroup.add(antTip);

  // ── Shoulders & arms ──
  function makeArm(side) {
    const sign = side === 'L' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.32, 0.18, 0);
    torso.add(shoulder);

    const pad = new THREE.Mesh(_geo.shoulderPad, darkMat);
    pad.position.set(sign * 0.06, 0, 0);
    shoulder.add(pad);

    const upperArmPivot = new THREE.Group();
    shoulder.add(upperArmPivot);

    const upperArm = new THREE.Mesh(_geo.upperArm, bodyMat);
    upperArm.position.y = -0.14;
    upperArm.castShadow = true;
    upperArmPivot.add(upperArm);

    const elbow = new THREE.Mesh(_geo.elbow, jointMat);
    elbow.position.y = -0.28;
    upperArmPivot.add(elbow);

    const lowerArmPivot = new THREE.Group();
    lowerArmPivot.position.y = -0.28;
    upperArmPivot.add(lowerArmPivot);

    const lowerArm = new THREE.Mesh(_geo.lowerArm, bodyMat);
    lowerArm.position.y = -0.125;
    lowerArm.castShadow = true;
    lowerArmPivot.add(lowerArm);

    const fist = new THREE.Mesh(_geo.fist, darkMat);
    fist.position.y = -0.28;
    lowerArmPivot.add(fist);

    return { upperArmPivot, lowerArmPivot };
  }
  const armL = makeArm('L');
  const armR = makeArm('R');

  // ── Pelvis / hips ──
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.7 * SCALE;
  group.add(pelvis);

  const pelvisMesh = new THREE.Mesh(_geo.pelvis, bodyMat);
  pelvisMesh.castShadow = true;
  pelvis.add(pelvisMesh);

  const booster = new THREE.Mesh(_geo.booster, darkMat);
  booster.position.set(0, 0.15, -0.22);
  torso.add(booster);
  const bGlow = new THREE.Mesh(_geo.boosterGlow, accentMat);
  bGlow.rotation.x = Math.PI / 2;
  bGlow.position.set(0, -0.05, -0.3);
  torso.add(bGlow);

  // ── Legs ──
  function makeLeg(side) {
    const sign = side === 'L' ? -1 : 1;

    const hipPivot = new THREE.Group();
    hipPivot.position.set(sign * 0.16, 0, 0);
    pelvis.add(hipPivot);

    const upperLeg = new THREE.Mesh(_geo.upperLeg, bodyMat);
    upperLeg.position.y = -0.15;
    upperLeg.castShadow = true;
    hipPivot.add(upperLeg);

    const knee = new THREE.Mesh(_geo.knee, jointMat);
    knee.position.y = -0.32;
    hipPivot.add(knee);

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.32;
    hipPivot.add(kneePivot);

    const lowerLeg = new THREE.Mesh(_geo.lowerLeg, bodyMat);
    lowerLeg.position.y = -0.14;
    lowerLeg.castShadow = true;
    kneePivot.add(lowerLeg);

    const foot = new THREE.Mesh(_geo.foot, darkMat);
    foot.position.set(0, -0.32, 0.04);
    kneePivot.add(foot);

    const strip = new THREE.Mesh(_geo.kneeStrip, accentMat);
    strip.position.set(0, -0.3, 0.07);
    hipPivot.add(strip);

    return { hipPivot, kneePivot };
  }
  const legL = makeLeg('L');
  const legR = makeLeg('R');

  // ── Explosion shards ──────────────────────────────────────────────────
  const SHARD_COUNT = 18;
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
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );
    group.add(s);
    shards.push(s);
  }

  // ── State ─────────────────────────────────────────────────────────────
  let state = 'walk';
  let walkPhase = 0;
  let deathTimer = 0;
  let breakReady = false;
  let breakParts = [];
  let explodeTime = 0;
  let t = 0;

  const JOY_DURATION = 1;

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
      walkPhase += delta * 3.5;
      const swing = Math.sin(walkPhase) * 0.55;

      legL.hipPivot.rotation.x = swing;
      legR.hipPivot.rotation.x = -swing;
      legL.kneePivot.rotation.x = Math.max(0, -Math.sin(walkPhase)) * 0.7;
      legR.kneePivot.rotation.x = Math.max(0, Math.sin(walkPhase)) * 0.7;

      armL.upperArmPivot.rotation.x = -swing * 0.6;
      armR.upperArmPivot.rotation.x = swing * 0.6;
      armL.lowerArmPivot.rotation.x = Math.abs(swing) * 0.3;
      armR.lowerArmPivot.rotation.x = Math.abs(swing) * 0.3;

      torso.position.y = 1.0 * SCALE + Math.abs(Math.sin(walkPhase)) * 0.03;

      visorMat.emissiveIntensity = 1.8 + Math.sin(t * 5) * 0.3;

    } else if (state === 'death') {
      deathTimer += delta;

      if (!breakReady) {
        const flinch = Math.sin((Math.min(deathTimer, 0.13) / 0.13) * Math.PI);
        torso.rotation.x = -flinch * 0.3;
        visorMat.emissiveIntensity = 2.0 + flinch * 2.5;

        if (deathTimer >= 0.13) {
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
            const spd   = 2.0 + Math.random() * 2.5;
            obj.userData.breakVel = new THREE.Vector3(
              Math.cos(angle) * spd,
              1.8 + Math.random() * 3.5,
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
        const bTime = deathTimer - 0.13;

        breakParts.forEach(obj => {
          obj.position.addScaledVector(obj.userData.breakVel, delta);
          obj.userData.breakVel.y -= delta * 9.5;
          obj.rotation.x += obj.userData.breakRot.x * delta;
          obj.rotation.y += obj.userData.breakRot.y * delta;
          obj.rotation.z += obj.userData.breakRot.z * delta;
        });

        if (bTime > 0.20) {
          const fade = 1 - Math.min(1, (bTime - 0.20) / 0.90);
          [bodyMat, accentMat, visorMat, jointMat, darkMat].forEach(m => {
            m.transparent = true;
            m.opacity = fade;
          });
        }

        if (bTime > 1.10) {
          const cb = group.userData._deathDone;
          if (typeof cb === 'function') cb();
        }
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        const raise = Math.min(1, explodeTime / 0.25);
        armL.upperArmPivot.rotation.x = -Math.PI * 0.9 * raise;
        armR.upperArmPivot.rotation.x = -Math.PI * 0.9 * raise;
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

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05) {
          if (!group.userData._shardSpawned) {
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
    [bodyMat, accentMat, visorMat, jointMat, darkMat].forEach(m => {
      m.opacity = 1;
    });
    torso.visible = true;
    pelvis.visible = true;
    shards.forEach(s => { s.visible = false; });
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
