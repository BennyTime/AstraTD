import * as THREE from 'three';

/**
 * HealerEnemy – a hovering support orb that periodically heals nearby allies.
 *
 * Hierarchy:
 *   group
 *   └─ floatGroup     (hover bob parent)
 *       ├─ body        (main sphere)
 *       ├─ innerCore   (brighter inner sphere)
 *       ├─ shell[0-2]  (3 arc segments orbiting the equator)
 *       ├─ ringA/ringB (two rotating torus rings, tilted)
 *       └─ arm[0-3]    (4 extending arms with glowing tips)
 *
 * Game mechanics (handled by Game.js):
 *   stats.healRadius   – radius within which nearby enemies are healed
 *   stats.healAmount   – HP restored per tick
 *   stats.healCooldown – seconds between heal ticks
 *
 * Animations: slow drift, rotating rings, arm pulse, dissolve death.
 */

export const HealerEnemyStats = {
  hp: 80,
  speed: 1.8,
  damage: 12,
  reward: 40,
  type: 'healer',
  healRadius: 3.0,
  healAmount: 8,
  healCooldown: 1.8,
};

const _geo = {
  body: new THREE.SphereGeometry(0.30, 12, 8),
  core: new THREE.SphereGeometry(0.16, 10, 7),
  shell: new THREE.TorusGeometry(0.40, 0.035, 6, 28),
  ring: new THREE.TorusGeometry(0.52, 0.025, 6, 36),
  armSeg: new THREE.BoxGeometry(0.06, 0.28, 0.06),
  armTip: new THREE.SphereGeometry(0.07, 8, 8),
  beam: new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6),
  shard: new THREE.IcosahedronGeometry(0.07, 0),
};

export function createHealerEnemy() {
  const group = new THREE.Group();

  // ── Per-instance materials ────────────────────────────────────────────────
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0a3838, roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.88 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x44ff88, emissive: new THREE.Color(0x44ff88), emissiveIntensity: 2.5, roughness: 0.2 });
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x22cc66, emissive: new THREE.Color(0x22cc66), emissiveIntensity: 0.8, roughness: 0.4 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x00ffaa, emissive: new THREE.Color(0x00ffaa), emissiveIntensity: 1.8, roughness: 0.2, transparent: true, opacity: 0.85 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x66ffbb, emissive: new THREE.Color(0x66ffbb), emissiveIntensity: 3.0, roughness: 0.1 });
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x44ff88, emissive: new THREE.Color(0x44ff88), emissiveIntensity: 2, transparent: true });

  const SCALE = 0.8;

  // ── Float group ───────────────────────────────────────────────────────────
  const floatGroup = new THREE.Group();
  floatGroup.position.y = 1.1 * SCALE;
  group.add(floatGroup);

  // Main sphere
  const body = new THREE.Mesh(_geo.body, bodyMat);
  body.castShadow = true;
  floatGroup.add(body);

  // Inner glowing core
  const core = new THREE.Mesh(_geo.core, coreMat);
  floatGroup.add(core);

  // ── Protective shell arcs ─────────────────────────────────────────────────
  const shellGroup = new THREE.Group();
  floatGroup.add(shellGroup);

  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(_geo.shell, shellMat);
    s.rotation.y = (i / 3) * Math.PI * 2;
    s.rotation.x = Math.PI / 2;
    shellGroup.add(s);
  }

  // ── Rings ─────────────────────────────────────────────────────────────────
  const ringA = new THREE.Mesh(_geo.ring, ringMat);
  ringA.rotation.x = 0.4;
  floatGroup.add(ringA);

  const ringB = new THREE.Mesh(_geo.ring, ringMat);
  ringB.rotation.x = -0.4;
  ringB.rotation.z = Math.PI / 2;
  floatGroup.add(ringB);

  // ── Arms (4, equally distributed around equator) ─────────────────────────
  const arms = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const armGroup = new THREE.Group();
    armGroup.rotation.y = angle;
    floatGroup.add(armGroup);

    const seg = new THREE.Mesh(_geo.armSeg, shellMat);
    seg.position.set(0.48, 0, 0);
    seg.rotation.z = Math.PI / 2;
    armGroup.add(seg);

    const tip = new THREE.Mesh(_geo.armTip, tipMat);
    tip.position.set(0.68, 0, 0);
    armGroup.add(tip);

    arms.push({ armGroup, tip });
  }

  // ── Shards (death explosion) ──────────────────────────────────────────────
  const SHARD_COUNT = 16;
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(_geo.shard, shardMat);
    s.visible = false;
    s.position.set(0, 1.1 * SCALE, 0);
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
  let explodeTime = 0;
  let t = 0;

  const JOY_DURATION = 0.9;

  function setWalk() { state = 'walk'; }

  function triggerDeath(onDone) {
    state = 'death';
    deathTimer = 0;
    group.userData._deathDone = onDone;
  }

  function triggerExplode(onHit, onDone) {
    state = 'explode';
    explodeTime = 0;
    group.userData._explodeHit  = onHit;
    group.userData._explodeDone = onDone;
  }

  function update(delta) {
    t += delta;

    if (state === 'walk') {
      walkPhase += delta * 2;

      // Gentle hover
      floatGroup.position.y = 1.1 * SCALE + Math.sin(walkPhase * 1.2) * 0.10;

      // Slow body rotation
      floatGroup.rotation.y += delta * 0.6;

      // Shell arcs orbit
      shellGroup.rotation.y += delta * 1.4;

      // Rings rotate (opposite directions)
      ringA.rotation.z += delta * 1.8;
      ringB.rotation.z -= delta * 1.8;

      // Arm tips bob with individual phase offsets
      arms.forEach((arm, i) => {
        arm.armGroup.rotation.x = Math.sin(walkPhase + i * 1.5) * 0.22;
        arm.tip.scale.setScalar(0.9 + Math.sin(t * 4 + i) * 0.15);
      });

      // Core pulse
      coreMat.emissiveIntensity = 2.2 + Math.sin(t * 5) * 0.6;
      ringMat.opacity = 0.7 + Math.sin(t * 3) * 0.2;

    } else if (state === 'death') {
      deathTimer += delta;

      // Shatter: scale down + fade
      const scale = Math.max(0.01, 1 - deathTimer / 0.7);
      floatGroup.scale.setScalar(scale);
      floatGroup.position.y = Math.max(0.3, 1.1 * SCALE - deathTimer * 1.2);

      const fade = scale;
      [bodyMat, coreMat, shellMat, ringMat, tipMat].forEach(m => {
        m.transparent = true;
        m.opacity = fade;
      });

      if (deathTimer > 0.7) {
        const cb = group.userData._deathDone;
        if (typeof cb === 'function') cb();
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      if (explodeTime < JOY_DURATION) {
        // Joy: rings spin super fast, arms spread wide
        ringA.rotation.z += delta * 8;
        ringB.rotation.z -= delta * 8;
        shellGroup.rotation.y += delta * 6;
        floatGroup.rotation.y += delta * 3;
        coreMat.emissiveIntensity = 4 + Math.sin(t * 20) * 1.5;
        tipMat.emissiveIntensity  = 5 + Math.sin(t * 25) * 2;

      } else {
        const burstTime = explodeTime - JOY_DURATION;

        if (burstTime < 0.05 && !group.userData._shardSpawned) {
          group.userData._shardSpawned = true;
          shardMat.opacity = 1;
          shards.forEach(s => {
            s.visible = true;
            s.position.set(0, 1.1 * SCALE, 0);
          });
          floatGroup.visible = false;
          const hitCb = group.userData._explodeHit;
          if (typeof hitCb === 'function') hitCb();
        }

        const shardOpacity = Math.max(0, 1 - burstTime / 0.9);
        shardMat.opacity = shardOpacity;
        shards.forEach(s => {
          s.position.addScaledVector(s.userData.vel, delta);
          s.userData.vel.y -= delta * 8;
          s.rotation.x += s.userData.rot.x * delta;
          s.rotation.y += s.userData.rot.y * delta;
        });

        if (burstTime > 0.9) {
          group.userData._shardSpawned = false;
          const cb = group.userData._explodeDone;
          if (typeof cb === 'function') cb();
        }
      }
    }
  }

  function resetMaterials() {
    [bodyMat, coreMat, shellMat, ringMat, tipMat].forEach(m => {
      m.opacity = m === bodyMat ? 0.88 : m === ringMat ? 0.85 : 1;
    });
    floatGroup.visible = true;
    floatGroup.scale.setScalar(1);
    floatGroup.position.y = 1.1 * SCALE;
    shards.forEach(s => { s.visible = false; });
  }

  return { mesh: group, update, setWalk, triggerDeath, triggerExplode, resetMaterials };
}
