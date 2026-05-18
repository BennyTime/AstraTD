import * as THREE from 'three';

export const LaserTurretStats = {
  cost: 100,
  range: 6,
  damage: 15,
  fireRate: 1.0,
};

const _tGeo = {
  base: new THREE.CylinderGeometry(0.72, 0.88, 0.28, 6),
  base2: new THREE.CylinderGeometry(0.48, 0.68, 0.2, 6),
  rings: [0.52, 0.46, 0.40].map(r => new THREE.TorusGeometry(r, 0.035, 8, 36)),
  hexBorder: new THREE.TorusGeometry(0.84, 0.04, 6, 6),
  housing: new THREE.CylinderGeometry(0.38, 0.44, 0.38, 8),
  facePlate: new THREE.BoxGeometry(0.55, 0.32, 0.12),
  fin: new THREE.BoxGeometry(0.06, 0.22, 0.14),
  barrelOuter: new THREE.CylinderGeometry(0.055, 0.065, 0.75, 8),
  barrelGlow: new THREE.CylinderGeometry(0.022, 0.022, 0.7, 6),
  muzzleCap: new THREE.CylinderGeometry(0.07, 0.055, 0.08, 8),
  flash: new THREE.SphereGeometry(0.18, 8, 8),
  beam: new THREE.CylinderGeometry(0.025, 0.025, 1, 6),
  scopeBase: new THREE.CylinderGeometry(0.12, 0.15, 0.1, 8),
  scopeDome: new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
};

export function createLaserTurret() {
  const group = new THREE.Group();

  const _scratchOrigin = new THREE.Vector3();
  const _scratchFrom = new THREE.Vector3();
  const _scratchDir = new THREE.Vector3();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0e1226, roughness: 0.45, metalness: 0.9 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x162040, roughness: 0.35, metalness: 0.85 });
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0b0e1a, roughness: 0.3,  metalness: 1.0 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 1.5, roughness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: new THREE.Color(0x00aaff), emissiveIntensity: 1.0, roughness: 0.25 });
  const scopeMat = new THREE.MeshStandardMaterial({ color: 0x00e0ff, emissive: new THREE.Color(0x00e0ff), emissiveIntensity: 1.8, transparent: true, opacity: 0.85 });
  const flashMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 4, transparent: true, opacity: 0 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x08111f, roughness: 0.6,  metalness: 0.7 });

  const baseMesh = new THREE.Mesh(_tGeo.base, baseMat);
  baseMesh.position.y = 0.14;
  baseMesh.castShadow = baseMesh.receiveShadow = true;
  group.add(baseMesh);

  const base2 = new THREE.Mesh(_tGeo.base2, baseMat);
  base2.position.y = 0.38;
  base2.castShadow = true;
  group.add(base2);

  const powerRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(_tGeo.rings[i], ringMat.clone());
    ring.position.y = 0.44 + i * 0.07;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    powerRings.push(ring);
  }

  const hexBorder = new THREE.Mesh(_tGeo.hexBorder, accentMat);
  hexBorder.rotation.x = Math.PI / 2;
  hexBorder.position.y = 0.14;
  group.add(hexBorder);

  const rotator = new THREE.Group();
  rotator.position.y = 0.55;
  group.add(rotator);

  const housing = new THREE.Mesh(_tGeo.housing, bodyMat);
  housing.castShadow = true;
  rotator.add(housing);

  const facePlate = new THREE.Mesh(_tGeo.facePlate, darkMat);
  facePlate.position.set(0, 0, 0.4);
  rotator.add(facePlate);

  [-1, 1].forEach(sign => {
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(_tGeo.fin, darkMat);
      fin.position.set(sign * (0.44 + i * 0.065), 0, -0.08 - i * 0.06);
      rotator.add(fin);
    }
  });

  const barrelPivot = new THREE.Group(); 
  barrelPivot.position.set(0, 0, 0.3);
  rotator.add(barrelPivot);

  const barrels = [];
  [-0.1, 0.1].forEach(ox => {
    const outer = new THREE.Mesh(_tGeo.barrelOuter, barrelMat);
    outer.rotation.x = Math.PI / 2;
    outer.position.set(ox, 0, 0.375);
    outer.castShadow = true;
    barrelPivot.add(outer);

    const glow = new THREE.Mesh(_tGeo.barrelGlow, scopeMat.clone());
    glow.rotation.x = Math.PI / 2;
    glow.position.set(ox, 0, 0.37);
    barrelPivot.add(glow);

    const muzzle = new THREE.Mesh(_tGeo.muzzleCap, darkMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(ox, 0, 0.79);
    barrelPivot.add(muzzle);

    barrels.push({ outer, glow });
  });

  const flashL = new THREE.Mesh(_tGeo.flash, flashMat.clone());
  flashL.position.set(-0.1, 0, 0.85);
  flashL.visible = false;
  barrelPivot.add(flashL);
  const flashR = new THREE.Mesh(_tGeo.flash, flashMat.clone());
  flashR.position.set( 0.1, 0, 0.85);
  flashR.visible = false;
  barrelPivot.add(flashR);

  const beamMat = new THREE.MeshStandardMaterial({
    color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 3, transparent: true, opacity: 0,
  });
  const beam = new THREE.Mesh(_tGeo.beam, beamMat);
  beam.rotation.x = Math.PI / 2;
  beam.position.set(0, 0, 1.4);
  barrelPivot.add(beam);
  const scopeBase = new THREE.Mesh(_tGeo.scopeBase, bodyMat);
  scopeBase.position.set(0, 0.22, 0.1);
  rotator.add(scopeBase);
  const scopeDome = new THREE.Mesh(_tGeo.scopeDome, scopeMat);
  scopeDome.position.set(0, 0.27, 0.1);
  rotator.add(scopeDome);

  let spawnTimer = 0;
  let spawnDone = false;
  let shootTimer = 0.35;
  let t = 0;

  group.scale.setScalar(0);

  function triggerSpawn() {
    spawnTimer = 0;
    spawnDone = false;
    group.scale.setScalar(0);
  }

  function triggerShoot(targetPos, onDone) {
    shootTimer = 0;
    flashL.visible = true;
    flashR.visible = true;
    flashL.material.opacity = 1;
    flashR.material.opacity = 1;

    if (targetPos) {
      rotator.getWorldPosition(_scratchOrigin);
      const dist = _scratchOrigin.distanceTo(targetPos);
      beam.scale.z = dist * 1.3;
      beamMat.opacity = 0.9;
    }

    barrelPivot.position.z = 0.3;
    group.userData._shootDone = onDone;
  }

  function trackTarget(targetPos) {
    if (!targetPos) return;
    group.getWorldPosition(_scratchFrom);
    _scratchDir.subVectors(targetPos, _scratchFrom);
    rotator.rotation.y = Math.atan2(_scratchDir.x, _scratchDir.z);
  }

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

    powerRings.forEach((r, i) => {
      r.rotation.z += delta * (0.9 + i * 0.4) * (i % 2 === 0 ? 1 : -1);
    });
    scopeDome.rotation.y += delta * 1.2;

    if (shootTimer < 0.35) {
      shootTimer += delta;
      const s = shootTimer / 0.35;
      barrelPivot.position.z = 0.3 - Math.sin(s * Math.PI) * 0.15;
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

  triggerSpawn(); 

  return { name: 'LASER TURRET', mesh: group, update, triggerSpawn, triggerShoot, trackTarget };
}
