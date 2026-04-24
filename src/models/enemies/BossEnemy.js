import * as THREE from 'three';

/**
 * BossEnemy – "Eximus, Father of the Valken". Wave 10 final boss.
 *
 * A colossal dark-emperor mech: brutalist cathedral helm with a triple
 * glowing visor, massive symmetric war-arms with forearm blades, enormous
 * pauldrons each crowned with three spines, a diamond of five exposed chest
 * cores, and a towering dorsal spine array rising from the back.
 *
 * Hierarchy:
 *   group
 *   ├─ torso
 *   │   ├─ torsoMesh + lip bands
 *   │   ├─ 5 chest cores (diamond pattern)
 *   │   ├─ pauldronL / pauldronR   (3 spikes + glow strip each)
 *   │   ├─ headGroup
 *   │   │   ├─ headMesh
 *   │   │   ├─ 3 visor slits
 *   │   │   ├─ crestFin + crestGlow
 *   │   │   ├─ jawPlate
 *   │   │   └─ cheek guards x2
 *   │   ├─ armL / armR  (symmetric heavy war-arms)
 *   │   │   ├─ upperArm, elbow
 *   │   │   └─ forearm, forearmBlade, fist, fistSpike
 *   │   └─ dorsal spine array
 *   └─ pelvis
 *       └─ legL / legR
 *           └─ hipPivot → kneePivot → lowerLeg, footPlate, heel
 */

export const BossEnemyStats = {
  hp: 2500,
  speed: 0.55,
  damage: 100,
  reward: 500,
  type: 'boss',
};

const _geo = {
  // Torso
  torso: new THREE.BoxGeometry(1.40, 0.92, 0.72),
  torsoLip: new THREE.BoxGeometry(1.24, 0.18, 0.78),
  // Chest cores
  core: new THREE.SphereGeometry(0.095, 10, 8),
  coreRing: new THREE.TorusGeometry(0.125, 0.022, 6, 18),
  // Pauldrons
  pauldronBase: new THREE.BoxGeometry(0.58, 0.76, 0.56),
  pauldronSpike: new THREE.ConeGeometry(0.075, 0.46, 5),
  pauldronGlow: new THREE.BoxGeometry(0.06, 0.60, 0.06),
  // Head
  head: new THREE.BoxGeometry(0.68, 0.56, 0.58),
  visorSlit: new THREE.BoxGeometry(0.15, 0.10, 0.07),
  crestFin: new THREE.BoxGeometry(0.06, 0.46, 0.34),
  jawPlate: new THREE.BoxGeometry(0.58, 0.20, 0.52),
  cheek: new THREE.BoxGeometry(0.10, 0.32, 0.12),
  // Arms (symmetric)
  upperArm: new THREE.BoxGeometry(0.30, 0.58, 0.30),
  elbow: new THREE.SphereGeometry(0.16, 8, 8),
  forearm: new THREE.BoxGeometry(0.28, 0.52, 0.28),
  forearmBlade: new THREE.BoxGeometry(0.06, 0.48, 0.14),
  fist: new THREE.BoxGeometry(0.30, 0.26, 0.28),
  fistSpike: new THREE.ConeGeometry(0.07, 0.22, 5),
  // Spine array base
  spineBase: new THREE.BoxGeometry(0.76, 0.14, 0.18),
  // Pelvis / legs
  pelvis: new THREE.BoxGeometry(0.96, 0.38, 0.62),
  upperLeg: new THREE.BoxGeometry(0.32, 0.64, 0.32),
  kneePad: new THREE.BoxGeometry(0.32, 0.16, 0.16),
  lowerLeg: new THREE.BoxGeometry(0.28, 0.56, 0.28),
  footPlate: new THREE.BoxGeometry(0.38, 0.14, 0.52),
  heel: new THREE.BoxGeometry(0.14, 0.12, 0.24),
  // Debris
  shard: new THREE.IcosahedronGeometry(0.15, 0),
};

export function createBossEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ───────────────────────────────────────────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x150306, roughness: 0.55, metalness: 0.90 });
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x1e0408, roughness: 0.50, metalness: 0.85 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: new THREE.Color(0xff3300), emissiveIntensity: 1.9, roughness: 0.25 });
  const visorMat = new THREE.MeshStandardMaterial({ color: 0xff1100, emissive: new THREE.Color(0xff1100), emissiveIntensity: 3.2, transparent: true, opacity: 0.94 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff5500), emissiveIntensity: 3.8, roughness: 0.1 });
  const coreRingMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: new THREE.Color(0xff3300), emissiveIntensity: 2.2, transparent: true, opacity: 0.78 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x0c0203, roughness: 0.45, metalness: 0.95 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: new THREE.Color(0xff3300), emissiveIntensity: 2.2, transparent: true });

  const SCALE = 1.55;

  // ── Torso ─────────────────────────────────────────────────────────────────
  const torso = new THREE.Group();
  torso.position.y = 1.4 * SCALE;
  group.add(torso);

  const torsoMesh = new THREE.Mesh(_geo.torso, bodyMat);
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Top and bottom armour lip bands
  const torsoLipTop = new THREE.Mesh(_geo.torsoLip, armorMat);
  torsoLipTop.position.y = 0.55;
  torso.add(torsoLipTop);

  const torsoLipBot = new THREE.Mesh(_geo.torsoLip, armorMat);
  torsoLipBot.position.y = -0.55;
  torso.add(torsoLipBot);

  // ── Pauldrons ─────────────────────────────────────────────────────────────
  function makePauldron(side) {
    const sign = side === 'L' ? -1 : 1;
    const pg = new THREE.Group();
    pg.position.set(sign * 0.97, 0.20, 0);
    torso.add(pg);

    const base = new THREE.Mesh(_geo.pauldronBase, armorMat);
    base.castShadow = true;
    pg.add(base);

    // Three spikes along the top edge
    for (let i = -1; i <= 1; i++) {
      const spike = new THREE.Mesh(_geo.pauldronSpike, accentMat);
      spike.position.set(i * 0.17, 0.61, 0);
      pg.add(spike);
    }

    // Outer glow strip
    const glowStrip = new THREE.Mesh(_geo.pauldronGlow, accentMat);
    glowStrip.position.set(sign * 0.30, 0, 0.22);
    pg.add(glowStrip);
  }
  makePauldron('L');
  makePauldron('R');

  // ── Head ──────────────────────────────────────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.74;  // torso half (0.46) + head half (0.28) = sits on torso top
  torso.add(headGroup);

  const headMesh = new THREE.Mesh(_geo.head, bodyMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Triple glowing visor slits
  for (let i = -1; i <= 1; i++) {
    const slit = new THREE.Mesh(_geo.visorSlit, visorMat);
    slit.position.set(i * 0.22, 0.09, 0.30);
    headGroup.add(slit);
  }

  // Crown fin on top
  const crestFin = new THREE.Mesh(_geo.crestFin, armorMat);
  crestFin.position.set(0, 0.51, 0);
  headGroup.add(crestFin);

  // Crest glow edge
  const crestGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.42, 0.06),
    accentMat
  );
  crestGlow.position.set(0, 0.51, 0.16);
  headGroup.add(crestGlow);

  // Jaw plate
  const jaw = new THREE.Mesh(_geo.jawPlate, armorMat);
  jaw.position.set(0, -0.22, 0);
  headGroup.add(jaw);

  // Cheek guards
  for (const sign of [-1, 1]) {
    const cheek = new THREE.Mesh(_geo.cheek, armorMat);
    cheek.position.set(sign * 0.38, 0.02, 0.22);
    headGroup.add(cheek);
  }

  // ── Chest cores (3: centre + flanks) ─────────────────────────────────────
  // Diamond of 5 chest cores
  const corePositions = [
    [0, 0.18, 0.38],
    [-0.24, 0, 0.38],
    [0.24, 0, 0.38],
    [-0.12, -0.22, 0.38],
    [0.12, -0.22, 0.38],
  ];
  corePositions.forEach(([x, y, z]) => {
    const c = new THREE.Mesh(_geo.core, coreMat);
    c.position.set(x, y, z);
    torso.add(c);

    const ring = new THREE.Mesh(_geo.coreRing, coreRingMat);
    ring.position.set(x, y, z);
    ring.rotation.x = Math.PI / 2;
    torso.add(ring);
  });

  // ── Arms (symmetric heavy war-arms) ───────────────────────────────────────
  function makeArm(side) {
    const sign = side === 'L' ? -1 : 1;
    const armGroup = new THREE.Group();
    armGroup.position.set(sign * 0.83, 0.30, 0);
    torso.add(armGroup);

    const ua = new THREE.Mesh(_geo.upperArm, bodyMat);
    ua.position.y = -0.29;
    ua.castShadow = true;
    armGroup.add(ua);

    const elbow = new THREE.Mesh(_geo.elbow, jointMat);
    elbow.position.y = -0.62;
    armGroup.add(elbow);

    const lowerGroup = new THREE.Group();
    lowerGroup.position.y = -0.62;
    armGroup.add(lowerGroup);

    const fa = new THREE.Mesh(_geo.forearm, bodyMat);
    fa.position.y = -0.26;
    fa.castShadow = true;
    lowerGroup.add(fa);

    // Side blade on forearm
    const blade = new THREE.Mesh(_geo.forearmBlade, accentMat);
    blade.position.set(sign * 0.19, -0.26, 0.06);
    lowerGroup.add(blade);

    const fist = new THREE.Mesh(_geo.fist, armorMat);
    fist.position.y = -0.60;
    lowerGroup.add(fist);

    const fistSpike = new THREE.Mesh(_geo.fistSpike, accentMat);
    fistSpike.position.set(0, -0.78, 0);
    lowerGroup.add(fistSpike);

    return { armGroup, lowerGroup };
  }
  const armL = makeArm('L');
  const armR = makeArm('R');

  // ── Dorsal spine array (back) ──────────────────────────────────────────────
  const spineBaseMesh = new THREE.Mesh(_geo.spineBase, armorMat);
  spineBaseMesh.position.set(0, 0.28, -0.44);
  torso.add(spineBaseMesh);

  const spineHeights = [0.80, 1.10, 1.45, 1.10, 0.80];
  const spineXPos = [-0.28, -0.14, 0, 0.14, 0.28];
  for (let i = 0; i < 5; i++) {
    const h = spineHeights[i];
    const spine = new THREE.Mesh(
      new THREE.ConeGeometry(0.068, h, 5),
      i === 2 ? accentMat : armorMat
    );
    spine.position.set(spineXPos[i], 0.36 + h * 0.5, -0.43);
    torso.add(spine);
  }

  // ── Pelvis ────────────────────────────────────────────────────────────────
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.82 * SCALE;
  group.add(pelvis);

  const pelvisMesh = new THREE.Mesh(_geo.pelvis, bodyMat);
  pelvisMesh.castShadow = true;
  pelvis.add(pelvisMesh);

  // ── Legs ──────────────────────────────────────────────────────────────────
  function makeLeg(side) {
    const sign = side === 'L' ? -1 : 1;

    const hipPivot = new THREE.Group();
    hipPivot.position.set(sign * 0.36, 0, 0);
    pelvis.add(hipPivot);

    const ul = new THREE.Mesh(_geo.upperLeg, bodyMat);
    ul.position.y = -0.32;
    ul.castShadow = true;
    hipPivot.add(ul);

    const kp = new THREE.Mesh(_geo.kneePad, accentMat);
    kp.position.set(0, -0.66, 0.14);
    hipPivot.add(kp);

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.68;
    hipPivot.add(kneePivot);

    const ll = new THREE.Mesh(_geo.lowerLeg, bodyMat);
    ll.position.y = -0.28;
    ll.castShadow = true;
    kneePivot.add(ll);

    const boot = new THREE.Mesh(_geo.footPlate, armorMat);
    boot.position.set(0, -0.62, 0.10);
    kneePivot.add(boot);

    // Heel spur
    const heel = new THREE.Mesh(_geo.heel, armorMat);
    heel.position.set(0, -0.60, -0.20);
    kneePivot.add(heel);

    return { hipPivot, kneePivot };
  }
  const legL = makeLeg('L');
  const legR = makeLeg('R');

  // ── Explosion debris ──────────────────────────────────────────────────────
  const SHARD_COUNT = 30;
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(_geo.shard, shardMat);
    s.visible = false;
    s.position.set(0, 1.4 * SCALE, 0);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const spd = 1.2 + Math.random() * 3.5;
    s.userData.vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * spd,
      Math.cos(phi) * spd + 0.5,
      Math.sin(phi) * Math.sin(theta) * spd
    );
    s.userData.rot = new THREE.Vector3(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
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

  const JOY_DURATION = 1.5;

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
      walkPhase += delta * 1.6; // heavy, deliberate stride

      const swing = Math.sin(walkPhase) * 0.50;
      legL.hipPivot.rotation.x =  swing;
      legR.hipPivot.rotation.x = -swing;
      legL.kneePivot.rotation.x = Math.max(0, -Math.sin(walkPhase)) * 0.55;
      legR.kneePivot.rotation.x = Math.max(0,  Math.sin(walkPhase)) * 0.55;

      // Arms swing slightly
      armL.armGroup.rotation.x = -swing * 0.28;
      armR.armGroup.rotation.x =  swing * 0.28;

      // Menacing torso sway
      torso.rotation.z = Math.sin(walkPhase * 0.5) * 0.04;
      torso.position.y = 1.4 * SCALE + Math.abs(Math.sin(walkPhase)) * -0.04;

      // Core pulse
      coreMat.emissiveIntensity = 3.5 + Math.sin(t * 4)  * 0.8;
      coreRingMat.emissiveIntensity = 2.0 + Math.sin(t * 3)  * 0.5;
      visorMat.emissiveIntensity = 3.0 + Math.sin(t * 6)  * 0.5;
      accentMat.emissiveIntensity = 1.7 + Math.sin(t * 5)  * 0.4;
      visorMat.emissiveIntensity = 2.5 + Math.sin(t * 6)  * 0.4;
      accentMat.emissiveIntensity = 1.6 + Math.sin(t * 5)  * 0.4;

    } else if (state === 'death') {
      deathTimer += delta;

      if (!breakReady) {
        const flinch = Math.sin((Math.min(deathTimer, 0.20) / 0.20) * Math.PI);
        torso.rotation.x = -flinch * 0.28;
        coreMat.emissiveIntensity = 3.0 + flinch * 5;

        if (deathTimer >= 0.20) {
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
            const spd = 1.5 + Math.random() * 2;
            obj.userData.breakVel = new THREE.Vector3(
              Math.cos(angle) * spd,
              1.5 + Math.random() * 2.5,
              Math.sin(angle) * spd
            );
            obj.userData.breakRot = new THREE.Vector3(
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            );
          });
          breakParts = [torso, pelvis, legL.hipPivot, legR.hipPivot];
        }

      } else {
        const bTime = deathTimer - 0.20;

        breakParts.forEach(obj => {
          obj.position.addScaledVector(obj.userData.breakVel, delta);
          obj.userData.breakVel.y -= delta * 9.5;
          obj.rotation.x += obj.userData.breakRot.x * delta;
          obj.rotation.y += obj.userData.breakRot.y * delta;
          obj.rotation.z += obj.userData.breakRot.z * delta;
        });

        if (bTime > 0.30) {
          const fade = 1 - Math.min(1, (bTime - 0.30) / 1.40);
          [bodyMat, armorMat, accentMat, visorMat, coreMat, coreRingMat, jointMat].forEach(m => {
            m.transparent = true;
            m.opacity = fade;
          });
        }

        if (bTime > 1.70) {
          const cb = group.userData._deathDone;
          if (typeof cb === 'function') cb();
        }
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        // Menacing pause then lunge
        const lunge = Math.min(1, explodeTime / 0.4);
        armL.armGroup.rotation.x = lunge * -0.90;
        armR.armGroup.rotation.x = lunge * -0.90;
        torso.rotation.x = -lunge * 0.12;
        visorMat.emissiveIntensity = 3 + Math.sin(t * 14) * 1.5;
        coreMat.emissiveIntensity = 5 + Math.sin(t * 10) * 2.5;
        accentMat.emissiveIntensity = 3 + Math.sin(t * 18) * 1.5;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          group.position.y = group.userData._joyBaseY || 0;
          shardMat.opacity = 1;
          shards.forEach(s => {
            s.visible = true;
            s.position.set(0, 1.4 * SCALE, 0);
          });
          torso.visible = false;
          pelvis.visible = false;
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const shardOpacity = Math.max(0, 1 - burstTime / 1.4);
        shardMat.opacity = shardOpacity;
        shards.forEach(s => {
          s.position.addScaledVector(s.userData.vel, delta);
          s.userData.vel.y -= delta * 9;
          s.rotation.x += s.userData.rot.x * delta;
          s.rotation.y += s.userData.rot.y * delta;
        });

        if (burstTime > 1.4) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    [bodyMat, armorMat, accentMat, visorMat, coreMat, coreRingMat, jointMat].forEach(m => {
      m.opacity = 1;
      m.transparent = m === visorMat || m === coreRingMat;
    });
    torso.visible = true;
    pelvis.visible = true;
    torso.rotation.set(0, 0, 0);
    torso.position.y = 1.4 * SCALE;
    shards.forEach(s => { s.visible = false; });
    group.userData._shardSpawned = false;
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
