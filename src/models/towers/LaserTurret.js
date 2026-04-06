import * as THREE from 'three';

/**
 * LaserTurret – placeable defensive tower.
 *
 * Hierarchy:
 *   turretGroup
 *   ├─ base         (hexagonal mount)
 *   │   └─ powerRings (×3 stacked, animated)
 *   ├─ rotator      (yaws to face target)
 *   │   ├─ body     (main turret housing)
 *   │   ├─ barrel_L/R (paired gun barrels)
 *   │   ├─ scope    (top sensor dome)
 *   │   └─ exhaustL/R (side vents)
 *   └─ muzzleFlash  (hidden, shown on fire)
 *
 * Animations:
 *   - spawn  : scale up from 0 with a spring overshoot
 *   - idle   : power rings rotate, scope rotates, subtle bobble
 *   - shoot  : muzzle flash + recoil on barrels
 *   - track(target) : rotator.rotation.y points at target
 */
export function createLaserTurret() {
  const group = new THREE.Group();

  // ── Materials ──────────────────────────────────────────────────────────
  const baseMat    = new THREE.MeshStandardMaterial({ color: 0x0e1226, roughness: 0.45, metalness: 0.9 });
  const bodyMat    = new THREE.MeshStandardMaterial({ color: 0x162040, roughness: 0.35, metalness: 0.85 });
  const barrelMat  = new THREE.MeshStandardMaterial({ color: 0x0b0e1a, roughness: 0.3,  metalness: 1.0 });
  const ringMat    = new THREE.MeshStandardMaterial({ color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 1.5, roughness: 0.2 });
  const accentMat  = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: new THREE.Color(0x00aaff), emissiveIntensity: 1.0, roughness: 0.25 });
  const scopeMat   = new THREE.MeshStandardMaterial({ color: 0x00e0ff, emissive: new THREE.Color(0x00e0ff), emissiveIntensity: 1.8, transparent: true, opacity: 0.85 });
  const flashMat   = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 4, transparent: true, opacity: 0 });
  const darkMat    = new THREE.MeshStandardMaterial({ color: 0x08111f, roughness: 0.6,  metalness: 0.7 });

  // ── Base platform (hex) ──
  const baseGeo = new THREE.CylinderGeometry(0.72, 0.88, 0.28, 6);
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.14;
  baseMesh.castShadow = baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Base step 2
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.68, 0.2, 6), baseMat);
  base2.position.y = 0.38;
  base2.castShadow = true;
  group.add(base2);

  // Power rings on base (rotate independently)
  const powerRings = [];
  for (let i = 0; i < 3; i++) {
    const r = 0.52 - i * 0.06;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 36), ringMat.clone());
    ring.position.y = 0.44 + i * 0.07;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    powerRings.push(ring);
  }

  // Base accent hex border
  const hexBorder = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.04, 6, 6), accentMat);
  hexBorder.rotation.x = Math.PI / 2;
  hexBorder.position.y = 0.14;
  group.add(hexBorder);

  // ── Rotator (everything that aims) ──
  const rotator = new THREE.Group();
  rotator.position.y = 0.55;
  group.add(rotator);

  // Main housing cylinder
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.38, 8), bodyMat);
  housing.castShadow = true;
  rotator.add(housing);

  // Front face plate
  const facePlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.12), darkMat);
  facePlate.position.set(0, 0, 0.4);
  rotator.add(facePlate);

  // Side cooling fins
  [-1, 1].forEach(sign => {
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.14), darkMat);
      fin.position.set(sign * (0.44 + i * 0.065), 0, -0.08 - i * 0.06);
      rotator.add(fin);
    }
  });

  // ── Barrels (twin) ──
  const barrelPivot = new THREE.Group(); // recoil pivot
  barrelPivot.position.set(0, 0, 0.3);
  rotator.add(barrelPivot);

  const barrels = [];
  [-0.1, 0.1].forEach(ox => {
    // Outer barrel tube
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.75, 8), barrelMat);
    outer.rotation.x = Math.PI / 2;
    outer.position.set(ox, 0, 0.375);
    outer.castShadow = true;
    barrelPivot.add(outer);

    // Energy channel glow along barrel
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.7, 6), scopeMat.clone());
    glow.rotation.x = Math.PI / 2;
    glow.position.set(ox, 0, 0.37);
    barrelPivot.add(glow);

    // Muzzle cap
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.08, 8), darkMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(ox, 0, 0.79);
    barrelPivot.add(muzzle);

    barrels.push({ outer, glow });
  });

  // ── Muzzle flash (shown briefly on fire) ──
  const flashGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const flashL = new THREE.Mesh(flashGeo, flashMat.clone());
  flashL.position.set(-0.1, 0, 0.85);
  flashL.visible = false;
  barrelPivot.add(flashL);
  const flashR = new THREE.Mesh(flashGeo, flashMat.clone());
  flashR.position.set( 0.1, 0, 0.85);
  flashR.visible = false;
  barrelPivot.add(flashR);

  // Laser beam (hidden between shots)
  const beamMat = new THREE.MeshStandardMaterial({
    color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 3, transparent: true, opacity: 0,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 6), beamMat);
  beam.rotation.x = Math.PI / 2;
  beam.position.set(0, 0, 1.4);
  barrelPivot.add(beam);
  // beam length is adjusted at shoot time

  // ── Scope / sensor dome ──
  const scopeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.1, 8), bodyMat);
  scopeBase.position.set(0, 0.22, 0.1);
  rotator.add(scopeBase);
  const scopeDome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), scopeMat);
  scopeDome.position.set(0, 0.27, 0.1);
  rotator.add(scopeDome);

  // ── Turret light ──
  const turretLight = new THREE.PointLight(0x46d4ff, 0.6, 4);
  turretLight.position.set(0, 0.3, 0.4);
  rotator.add(turretLight);

  // ── State ─────────────────────────────────────────────────────────────
  let spawnTimer   = 0;
  let spawnDone    = false;
  let shootTimer   = 0.35;  // start past threshold so shoot doesn't auto-trigger
  let t            = 0;

  // Start spawning (scale from 0)
  group.scale.setScalar(0);

  function triggerSpawn() {
    spawnTimer = 0;
    spawnDone  = false;
    group.scale.setScalar(0);
  }

  function triggerShoot(targetPos, onDone) {
    shootTimer = 0;
    // Flash on
    flashL.visible = true;
    flashR.visible = true;
    flashL.material.opacity = 1;
    flashR.material.opacity = 1;

    // Aim beam toward target
    if (targetPos) {
      const origin   = new THREE.Vector3();
      rotator.getWorldPosition(origin);
      const dist     = origin.distanceTo(targetPos);
      beam.scale.z   = dist * 1.3;
      beamMat.opacity = 0.9;
    }

    // Recoil
    barrelPivot.position.z = 0.3;
    group.userData._shootDone = onDone;
  }

  function trackTarget(targetPos) {
    if (!targetPos) return;
    const from = new THREE.Vector3();
    group.getWorldPosition(from);
    const dir = new THREE.Vector3().subVectors(targetPos, from);
    rotator.rotation.y = Math.atan2(dir.x, dir.z);
  }

  function update(delta) {
    t += delta;

    // ── Spawn animation ──
    if (!spawnDone) {
      spawnTimer += delta;
      const progress = Math.min(spawnTimer / 0.6, 1);
      // Spring overshoot: scale goes 0→1.15→1
      const spring = progress < 0.7
        ? (progress / 0.7) * 1.15
        : 1.15 - ((progress - 0.7) / 0.3) * 0.15;
      group.scale.setScalar(spring);
      if (progress >= 1) { group.scale.setScalar(1); spawnDone = true; }
      return; // don't animate before spawned
    }

    // ── Idle animations ──
    powerRings.forEach((r, i) => {
      r.rotation.z += delta * (0.9 + i * 0.4) * (i % 2 === 0 ? 1 : -1);
    });
    scopeDome.rotation.y += delta * 1.2;
    turretLight.intensity = 0.5 + Math.sin(t * 2) * 0.15;

    // ── Shoot animation ──
    if (shootTimer < 0.35) {
      shootTimer += delta;
      const s = shootTimer / 0.35;
      // Recoil recover
      barrelPivot.position.z = 0.3 - Math.sin(s * Math.PI) * 0.15;
      // Flash fade
      const fade = 1 - s;
      flashL.material.opacity = fade;
      flashR.material.opacity = fade;
      beamMat.opacity = (1 - s) * 0.9;
      if (fade <= 0) {
        flashL.visible = false;
        flashR.visible = false;
        barrels.forEach(b => { b.glow.material.emissiveIntensity = 1.5; });
      }
      if (shootTimer >= 0.35) {
        const cb = group.userData._shootDone;
        if (typeof cb === 'function') cb();
      }
    }
  }

  triggerSpawn(); // start spawn immediately

  return { name: 'LASER TURRET', mesh: group, update, triggerSpawn, triggerShoot, trackTarget };
}
