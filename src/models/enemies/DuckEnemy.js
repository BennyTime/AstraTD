import * as THREE from 'three';

/**
 * DuckEnemy – THE DUCK. Wave 9 meme unit.
 *
 * 1,000,000 HP, immune to all tower damage, deals 0 damage to the Nexus.
 * Just waddles along quacking and having a great time.
 *
 * Hierarchy:
 *   group
 *   ├─ bodyGroup         (main duck body)
 *   │   ├─ bodyMesh      (wide yellow sphere)
 *   │   ├─ tailBump
 *   │   ├─ wingL / wingR (flapping wing stubs)
 *   │   └─ headGroup
 *   │       ├─ headMesh
 *   │       ├─ beakUpper / beakLower  (open/close on quack)
 *   │       ├─ eyeL / eyeR
 *   │       └─ pupilL / pupilR
 *   ├─ footL / footR     (orange feet, lift on step)
 *   └─ quackLabel        (invisible anchor – DOM handled by Game.js)
 */

export const DuckEnemyStats = {
  hp: 1_000_000,
  speed: 1.5,
  damage: 0,
  reward: 999,
  type: 'duck',
  immune: true,
};

const _geo = {
  body: new THREE.SphereGeometry(0.42, 14, 10),
  tail: new THREE.SphereGeometry(0.18, 8, 7),
  head: new THREE.SphereGeometry(0.24, 12, 9),
  beakUpper: new THREE.BoxGeometry(0.24, 0.10, 0.20),
  beakLower: new THREE.BoxGeometry(0.22, 0.07, 0.18),
  eye: new THREE.SphereGeometry(0.065, 8, 8),
  pupil: new THREE.SphereGeometry(0.038, 6, 6),
  wing: new THREE.BoxGeometry(0.14, 0.10, 0.30),
  leg: new THREE.CylinderGeometry(0.06, 0.085, 0.22, 8),
  footBase: new THREE.BoxGeometry(0.28, 0.07, 0.22),
  toe: new THREE.BoxGeometry(0.08, 0.05, 0.14),
};

export function createDuckEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ─────────────────────────────────────────────
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.55, metalness: 0.05 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.5,  metalness: 0.05 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
  const quackMat = new THREE.MeshStandardMaterial({ color: 0xffee55, emissive: new THREE.Color(0xffee55), emissiveIntensity: 0, roughness: 0.3 });

  const SCALE = 0.85;

  // ── Body group ────────────────────────────────────────────────────────────
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.70 * SCALE;
  group.add(bodyGroup);

  const bodyMesh = new THREE.Mesh(_geo.body, yellowMat);
  bodyMesh.scale.set(1, 0.82, 1.1);
  bodyMesh.castShadow = true;
  bodyGroup.add(bodyMesh);

  const tail = new THREE.Mesh(_geo.tail, yellowMat);
  tail.position.set(0, 0.10, -0.38);
  tail.scale.set(0.8, 0.9, 0.7);
  bodyGroup.add(tail);

  // ── Wings ────────────────────────────────────────────────────────────────
  const wingL = new THREE.Mesh(_geo.wing, yellowMat);
  wingL.position.set(-0.42, 0.06, 0.05);
  wingL.rotation.z =  0.3;
  bodyGroup.add(wingL);

  const wingR = new THREE.Mesh(_geo.wing, yellowMat);
  wingR.position.set( 0.42, 0.06, 0.05);
  wingR.rotation.z = -0.3;
  bodyGroup.add(wingR);

  // ── Legs ─────────────────────────────────────────────────────────────────
  const legLMesh = new THREE.Mesh(_geo.leg, orangeMat);
  legLMesh.position.set(-0.20, -0.44, 0.05);
  bodyGroup.add(legLMesh);

  const legRMesh = new THREE.Mesh(_geo.leg, orangeMat);
  legRMesh.position.set( 0.20, -0.44, 0.05);
  bodyGroup.add(legRMesh);

  // ── Head ─────────────────────────────────────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.36, 0.30);
  bodyGroup.add(headGroup);

  const headMesh = new THREE.Mesh(_geo.head, yellowMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const upperBeakPivot = new THREE.Group();
  upperBeakPivot.position.set(0, 0.02, 0.23);
  headGroup.add(upperBeakPivot);

  const beakUpper = new THREE.Mesh(_geo.beakUpper, orangeMat);
  beakUpper.position.set(0, 0.02, 0.10);
  upperBeakPivot.add(beakUpper);

  const lowerBeakPivot = new THREE.Group();
  lowerBeakPivot.position.set(0, -0.02, 0.23);
  headGroup.add(lowerBeakPivot);

  const beakLower = new THREE.Mesh(_geo.beakLower, orangeMat);
  beakLower.position.set(0, -0.02, 0.09);
  lowerBeakPivot.add(beakLower);

  const eyeL = new THREE.Mesh(_geo.eye, eyeWhiteMat);
  eyeL.position.set(-0.12, 0.07, 0.18);
  headGroup.add(eyeL);
  const pupilL = new THREE.Mesh(_geo.pupil, pupilMat);
  pupilL.position.set(-0.14, 0.07, 0.22);
  headGroup.add(pupilL);

  const eyeR = new THREE.Mesh(_geo.eye, eyeWhiteMat);
  eyeR.position.set( 0.12, 0.07, 0.18);
  headGroup.add(eyeR);
  const pupilR = new THREE.Mesh(_geo.pupil, pupilMat);
  pupilR.position.set( 0.14, 0.07, 0.22);
  headGroup.add(pupilR);

  // ── Feet ─────────────────────────────────────────────────────────────────
  function makeFoot(sign) {
    const footGroup = new THREE.Group();
    footGroup.position.set(sign * 0.20, 0.06 * SCALE, 0.08);
    group.add(footGroup);

    const base = new THREE.Mesh(_geo.footBase, orangeMat);
    base.castShadow = true;
    footGroup.add(base);

    for (let i = -1; i <= 1; i++) {
      const toe = new THREE.Mesh(_geo.toe, orangeMat);
      toe.position.set(i * 0.09, 0, 0.16);
      footGroup.add(toe);
    }
    return footGroup;
  }
  const footL = makeFoot(-1);
  const footR = makeFoot( 1);

  // ── State ─────────────────────────────────────────────────────────────────
  let state = 'walk';
  let walkPhase = 0;
  let quackAccum = 0;
  const QUACK_INTERVAL = 2.5;
  let quacking = false;
  let quackTimer = 0;
  const QUACK_DUR = 0.55;

  let deathTimer = 0;
  let explodeTime = 0;
  let t = 0;

  const JOY_DURATION = 1.5;

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
      walkPhase += delta * 3.5;

      bodyGroup.rotation.z = Math.sin(walkPhase) * 0.22;
      bodyGroup.position.y = 0.70 * SCALE + Math.abs(Math.sin(walkPhase)) * 0.06;

      footL.position.y = 0.06 * SCALE + Math.max(0, -Math.sin(walkPhase)) * 0.12;
      footR.position.y = 0.06 * SCALE + Math.max(0,  Math.sin(walkPhase)) * 0.12;

      headGroup.rotation.z = -Math.sin(walkPhase) * 0.12;

      wingL.rotation.z = 0.3 + Math.sin(t * 2.8) * 0.20;
      wingR.rotation.z = -0.3 - Math.sin(t * 2.8) * 0.20;

      const blinkCycle = (t % 3.2);
      const blink = blinkCycle < 0.12 ? (1 - blinkCycle / 0.06) : blinkCycle < 0.24 ? ((blinkCycle - 0.12) / 0.06) : 1;
      eyeL.scale.y = Math.max(0.05, blink);
      eyeR.scale.y = Math.max(0.05, blink);

      quackAccum += delta;
      if (!quacking && quackAccum >= QUACK_INTERVAL) {
        quacking = true;
        quackTimer = 0;
        quackAccum = 0;
      }
      if (quacking) {
        quackTimer += delta;
        const phase = Math.min(1, quackTimer / (QUACK_DUR * 0.4));
        const close = quackTimer > QUACK_DUR * 0.5 ? 1 - Math.min(1, (quackTimer - QUACK_DUR * 0.5) / (QUACK_DUR * 0.5)) : 1;
        headGroup.rotation.x = -phase * 0.20 * close;
        upperBeakPivot.rotation.x = -phase * 0.45 * close;
        lowerBeakPivot.rotation.x =  phase * 0.35 * close;
        quackMat.emissiveIntensity = phase * 2 * close;
        if (quackTimer >= QUACK_DUR) quacking = false;
      }

    } else if (state === 'death') {
      deathTimer += delta;
      bodyGroup.rotation.z = Math.min(Math.PI / 2, deathTimer * 3);
      bodyGroup.position.y = Math.max(0.15, 0.70 * SCALE - deathTimer * 0.8);
      const fade = Math.max(0, 1 - deathTimer / 1.0);
      [yellowMat, orangeMat, eyeWhiteMat, pupilMat].forEach(m => {
        m.transparent = true;
        m.opacity = fade;
      });
      if (deathTimer > 1.0) {
        const cb = group.userData._deathDone;
        if (typeof cb === 'function') cb();
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        walkPhase += delta * 8;
        bodyGroup.rotation.z = Math.sin(walkPhase) * 0.5;
        bodyGroup.position.y = 0.70 * SCALE + Math.abs(Math.sin(walkPhase)) * 0.18;

        wingL.rotation.z =  0.3 + Math.sin(t * 12) * 0.55;
        wingR.rotation.z = -0.3 - Math.sin(t * 12) * 0.55;

        const bkFast = Math.abs(Math.sin(t * 15)) * 0.6;
        upperBeakPivot.rotation.x = -bkFast;
        lowerBeakPivot.rotation.x =  bkFast * 0.7;

        headGroup.rotation.x = -0.3 + Math.sin(t * 10) * 0.2;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          bodyGroup.visible = false;
          footL.visible = false;
          footR.visible = false;
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const fade = Math.max(0, 1 - burstTime / 0.5);
        [yellowMat, orangeMat].forEach(m => { m.transparent = true; m.opacity = fade; });

        if (burstTime > 0.5) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    [yellowMat, orangeMat, eyeWhiteMat, pupilMat].forEach(m => {
      m.opacity = 1;
      m.transparent = false;
    });
    bodyGroup.visible = true;
    bodyGroup.rotation.set(0, 0, 0);
    bodyGroup.position.y = 0.70 * SCALE;
    footL.visible = true;
    footR.visible = true;
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
