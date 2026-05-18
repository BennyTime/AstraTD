import * as THREE from 'three';

export const VoidSniperStats = {
  cost: 150,
  range: 12,
  damage: 60,
  fireRate: 0.4,
};

const _vGeo = {
  base: new THREE.CylinderGeometry(0.60, 0.72, 0.32, 6),
  base2: new THREE.CylinderGeometry(0.38, 0.56, 0.28, 6),
  base3: new THREE.CylinderGeometry(0.26, 0.38, 0.22, 6),
  ring: new THREE.TorusGeometry(0.56, 0.035, 8, 36),
  hexBorder: new THREE.TorusGeometry(0.66, 0.04, 6, 6),
  body: new THREE.BoxGeometry(0.45, 0.32, 0.55),
  barrel: new THREE.CylinderGeometry(0.038, 0.052, 1.2, 8),
  barrelTip: new THREE.CylinderGeometry(0.044, 0.038, 0.18, 8),
  coilRing: new THREE.TorusGeometry(0.11, 0.022, 6, 20),
  scopeBody: new THREE.CylinderGeometry(0.09, 0.10, 0.36, 8),
  scopeLens: new THREE.SphereGeometry(0.10, 12, 8),
  snapBeam: new THREE.CylinderGeometry(0.032, 0.032, 1, 6),
  glowBeam: new THREE.CylinderGeometry(0.10,  0.10,  1, 6),
  flashSphere: new THREE.SphereGeometry(0.30, 12, 8),
  muzzleRing: new THREE.TorusGeometry(0.08, 0.03, 8, 28),
};

export function createVoidSniper() {
  const group = new THREE.Group();

  const _scratchOrigin = new THREE.Vector3();
  const _scratchFrom   = new THREE.Vector3();
  const _scratchDir    = new THREE.Vector3();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0d0420, roughness: 0.45, metalness: 0.9 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x180830, roughness: 0.35, metalness: 0.88 });
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0a0318, roughness: 0.25, metalness: 1.0 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xcc44ff, emissive: new THREE.Color(0xcc44ff), emissiveIntensity: 1.6, roughness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x8800ff, emissive: new THREE.Color(0x8800ff), emissiveIntensity: 1.4, roughness: 0.25 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0xdd88ff, emissive: new THREE.Color(0xaa44ff), emissiveIntensity: 2.4, transparent: true, opacity: 0.82 });
  const beamMat = new THREE.MeshStandardMaterial({ color: 0xee88ff, emissive: new THREE.Color(0xcc44ff), emissiveIntensity: 8, transparent: true, opacity: 0 });
  const glowBeamMat= new THREE.MeshStandardMaterial({ color: 0xcc44ff, emissive: new THREE.Color(0x8800ff), emissiveIntensity: 3, transparent: true, opacity: 0, depthWrite: false });
  const flashMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffffff), emissiveIntensity: 10, transparent: true, opacity: 0 });
  const muzzleRingMat = new THREE.MeshStandardMaterial({ color: 0xdd88ff, emissive: new THREE.Color(0xcc44ff), emissiveIntensity: 5, transparent: true, opacity: 0 });

  const base1 = new THREE.Mesh(_vGeo.base, baseMat);
  base1.position.y = 0.16;
  base1.castShadow = base1.receiveShadow = true;
  group.add(base1);

  const base2 = new THREE.Mesh(_vGeo.base2, baseMat);
  base2.position.y = 0.44;
  base2.castShadow = true;
  group.add(base2);

  const base3 = new THREE.Mesh(_vGeo.base3, baseMat);
  base3.position.y = 0.66;
  base3.castShadow = true;
  group.add(base3);

  const baseRing = new THREE.Mesh(_vGeo.ring, ringMat.clone());
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.16;
  group.add(baseRing);

  const hexBorder = new THREE.Mesh(_vGeo.hexBorder, accentMat);
  hexBorder.rotation.x = Math.PI / 2;
  hexBorder.position.y = 0.16;
  group.add(hexBorder);

  const rotator = new THREE.Group();
  rotator.position.y = 0.78;
  group.add(rotator);

  const bodyMesh = new THREE.Mesh(_vGeo.body, bodyMat);
  bodyMesh.castShadow = true;
  rotator.add(bodyMesh);

  const barrelPivot = new THREE.Group();
  barrelPivot.position.set(0, 0, 0.28);
  rotator.add(barrelPivot);

  const barrel = new THREE.Mesh(_vGeo.barrel, barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.60;
  barrel.castShadow = true;
  barrelPivot.add(barrel);

  const barrelTip = new THREE.Mesh(_vGeo.barrelTip, ringMat.clone());
  barrelTip.rotation.x = Math.PI / 2;
  barrelTip.position.z = 1.29;
  barrelPivot.add(barrelTip);

  const coils = [];
  for (let i = 0; i < 4; i++) {
    const coil = new THREE.Mesh(_vGeo.coilRing, ringMat.clone());
    coil.rotation.x = Math.PI / 2;
    coil.position.z = 0.22 + i * 0.22;
    barrelPivot.add(coil);
    coils.push(coil);
  }

  const scopeGroup = new THREE.Group();
  scopeGroup.position.set(0.25, 0.08, 0.18);
  rotator.add(scopeGroup);

  const scopeBody = new THREE.Mesh(_vGeo.scopeBody, bodyMat.clone());
  scopeBody.rotation.x = Math.PI / 2;
  scopeGroup.add(scopeBody);

  const scopeLens = new THREE.Mesh(_vGeo.scopeLens, lensMat);
  scopeLens.position.z = 0.20;
  scopeGroup.add(scopeLens);

  const glowBeam = new THREE.Mesh(_vGeo.glowBeam, glowBeamMat);
  glowBeam.rotation.x = Math.PI / 2;
  glowBeam.position.set(0, 0, 1.0);
  glowBeam.visible = false;
  barrelPivot.add(glowBeam);

  const snapBeam = new THREE.Mesh(_vGeo.snapBeam, beamMat);
  snapBeam.rotation.x = Math.PI / 2;
  snapBeam.position.set(0, 0, 1.0);
  snapBeam.visible = false;
  barrelPivot.add(snapBeam);

  const flashSphere = new THREE.Mesh(_vGeo.flashSphere, flashMat);
  flashSphere.position.set(0, 0, 1.4);
  flashSphere.scale.setScalar(0.1);
  flashSphere.visible = false;
  barrelPivot.add(flashSphere);

  const muzzleRing = new THREE.Mesh(_vGeo.muzzleRing, muzzleRingMat);
  muzzleRing.rotation.x = Math.PI / 2;
  muzzleRing.position.set(0, 0, 1.38);
  muzzleRing.visible = false;
  barrelPivot.add(muzzleRing);

  let spawnTimer = 0;
  let spawnDone = false;
  let shootTimer = 0.45;
  let t = 0;

  group.scale.setScalar(0);

  function triggerSpawn() {
    spawnTimer = 0;
    spawnDone = false;
    group.scale.setScalar(0);
  }

  function triggerShoot(targetPos, onDone) {
    shootTimer = 0;
    group.userData._shootDone = onDone;

    flashSphere.visible = true;
    flashSphere.scale.setScalar(0.4);
    flashMat.opacity = 1.0;

    muzzleRing.visible = true;
    muzzleRing.scale.set(1, 1, 1);
    muzzleRingMat.opacity = 0.9;

    snapBeam.visible = true;
    glowBeam.visible = true;

    if (targetPos) {
      barrelPivot.getWorldPosition(_scratchOrigin);
      const dist = _scratchOrigin.distanceTo(targetPos);
      const scaleZ = dist * 0.78;
      snapBeam.scale.z = scaleZ;
      glowBeam.scale.z = scaleZ;
      beamMat.opacity = 1.0;
      glowBeamMat.opacity = 0.55;
    }

    coils.forEach(c => { c.material.emissiveIntensity = 8; });
    scopeLens.material.emissiveIntensity = 8;

    barrelPivot.position.z = 0.28 - 0.26;
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

    baseRing.rotation.z += delta * 0.8;
    coils.forEach((c, i) => {
      c.rotation.z += delta * (0.6 + i * 0.3) * (i % 2 === 0 ? 1 : -1);
    });
    scopeLens.material.emissiveIntensity = 2.0 + Math.sin(t * 1.8) * 0.5;
    lensMat.emissiveIntensity = scopeLens.material.emissiveIntensity;

    if (shootTimer < 0.55) {
      shootTimer += delta;
      const s = shootTimer / 0.55;

      barrelPivot.position.z = 0.28 - Math.sin(s * Math.PI) * 0.26;

      const flashS = Math.min(s / 0.18, 1);
      flashSphere.scale.setScalar(0.4 + flashS * 1.6);
      flashMat.opacity = Math.pow(1 - flashS, 1.5);
      if (flashMat.opacity <= 0.01) flashSphere.visible = false;

      const ringS = Math.min(s / 0.40, 1);
      muzzleRing.scale.set(1 + ringS * 5, 1 + ringS * 5, 1);
      muzzleRingMat.opacity = (1 - ringS) * 0.9;
      if (muzzleRingMat.opacity <= 0.01) muzzleRing.visible = false;

      const glowS = Math.min(s / 0.45, 1);
      glowBeamMat.opacity = (1 - glowS) * 0.55;
      if (glowBeamMat.opacity <= 0.01) glowBeam.visible = false;

      const beamS = Math.min(s / 0.60, 1);
      beamMat.opacity = Math.pow(1 - beamS, 0.7);
      if (beamMat.opacity <= 0.01) snapBeam.visible = false;

      coils.forEach((c, i) => {
        c.material.emissiveIntensity = Math.max(1.6 + i * 0.3, 8 * (1 - s * 3));
      });
      scopeLens.material.emissiveIntensity = Math.max(2.0 + Math.sin(t * 1.8) * 0.5, 8 * (1 - s * 2));

      if (shootTimer >= 0.55) {
        const cb = group.userData._shootDone;
        if (typeof cb === 'function') cb();
      }
    }
  }

  triggerSpawn();

  return { name: 'VOID SNIPER', mesh: group, update, triggerSpawn, triggerShoot, trackTarget };
}
