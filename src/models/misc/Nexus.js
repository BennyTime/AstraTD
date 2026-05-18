import * as THREE from 'three';

export function createNexus() {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0e1830, roughness: 0.5, metalness: 0.85 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 1.0, roughness: 0.2, metalness: 0.6 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: new THREE.Color(0x00e5ff), emissiveIntensity: 2.5, roughness: 0.0, metalness: 0.0 });
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 0.5, transparent: true, opacity: 0.12, roughness: 0.0, side: THREE.FrontSide });
  const antMat = new THREE.MeshStandardMaterial({ color: 0x203050, roughness: 0.45, metalness: 0.9 });
  const antTipMat = new THREE.MeshStandardMaterial({ color: 0xff8c00, emissive: new THREE.Color(0xff8c00), emissiveIntensity: 1.5 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: new THREE.Color(0xff6600), emissiveIntensity: 0.9, roughness: 0.3 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 0.55, 8), baseMat);
  base.castShadow = base.receiveShadow = true;
  base.position.y = 0.275;
  group.add(base);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.0, 0.35, 8), baseMat);
  base2.position.y = 0.55 + 0.175;
  base2.castShadow = true;
  group.add(base2);

  const accentRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.055, 8, 32), accentMat);
  accentRing.rotation.x = Math.PI / 2;
  accentRing.position.y = 0.56;
  group.add(accentRing);

  const ring1Pivot = new THREE.Group();
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 8, 48), ringMat);
  ring1Pivot.add(ring1);
  ring1Pivot.position.y = 1.25;
  group.add(ring1Pivot);

  const ring2Pivot = new THREE.Group();
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.045, 8, 48), ringMat);
  ring2.rotation.x = Math.PI / 2;
  ring2Pivot.add(ring2);
  ring2Pivot.position.y = 1.25;
  group.add(ring2Pivot);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.52, 32, 32), coreMat);
  core.position.y = 1.25;
  core.castShadow = false;
  group.add(core);

  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.78, 32, 16), shellMat);
  shell.position.y = 1.25;
  group.add(shell);

  const coreLight = new THREE.PointLight(0x00e5ff, 2.5, 8);
  coreLight.position.y = 1.25;
  group.add(coreLight);

  const antennas = [];
  for (let i = 0; i < 4; i++) {
    const a = new THREE.Group();
    const angle = (i / 4) * Math.PI * 2;
    const r = 0.85;
    a.position.set(Math.cos(angle) * r, 0.72, Math.sin(angle) * r);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.65, 6), antMat);
    rod.position.y = 0.325;
    a.add(rod);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), antTipMat);
    tip.position.y = 0.7;
    a.add(tip);

    const tipLight = new THREE.PointLight(0xff8c00, 0.8, 1.8);
    tipLight.position.y = 0.7;
    a.add(tipLight);

    group.add(a);
    antennas.push({ group: a, tip, tipLight, phase: (i / 4) * Math.PI * 2 });
  }

  const SHARD_COUNT = 60;
  const shardGeo = new THREE.IcosahedronGeometry(0.12, 0);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: new THREE.Color(0x00e5ff), emissiveIntensity: 2, transparent: true });
  const shards = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    const s = new THREE.Mesh(shardGeo, shardMat.clone());
    s.position.set(0, 1.25, 0);
    s.visible = false;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const spd = 3 + Math.random() * 5;
    s.userData.vel = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * spd,
      Math.cos(phi) * spd * 0.6 + 1.5,
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

  let state = 'idle'; 
  let hitTimer = 0;
  let explodeTime = 0;
  let explodeDone = false;
  let t = 0;

  function triggerHit() {
    state = 'hit';
    hitTimer = 0.35;
    coreLight.color.set(0xff2020);
    coreMat.color.set(0xff2020);
    coreMat.emissive.set(0xff2020);
  }

  function triggerExplode(onDone) {
    state = 'explode';
    explodeTime = 0;
    explodeDone = false;
    shards.forEach(s => { s.visible = true; s.position.set(0, 1.25, 0); s.material.opacity = 1; });
    core.visible = false;
    shell.visible = false;
    ring1Pivot.visible = false;
    ring2Pivot.visible = false;
    coreLight.intensity = 12;
    coreLight.color.set(0xffffff);
    group.userData._explodeDone = onDone;
  }

  function update(delta) {
    t += delta;

    if (state === 'idle') {
      ring1Pivot.rotation.y += delta * 0.8;
      ring2Pivot.rotation.x += delta * 0.6;
      ring2Pivot.rotation.z += delta * 0.3;

      const pulse = 0.85 + Math.sin(t * 2.0) * 0.15;
      core.scale.setScalar(pulse);
      coreMat.emissiveIntensity = 2.0 + Math.sin(t * 2.0) * 0.8;
      coreLight.intensity = 2.5 + Math.sin(t * 2.0) * 0.8;

      shell.rotation.y += delta * 0.25;
      shell.rotation.z += delta * 0.1;

      antennas.forEach(({ tipLight, phase }) => {
        tipLight.intensity = 0.6 + Math.sin(t * 4 + phase) * 0.3;
      });

    } else if (state === 'hit') {
      hitTimer -= delta;
      coreMat.emissiveIntensity = 3.5 + Math.sin(t * 20) * 2;
      coreLight.intensity = 5;
      if (hitTimer <= 0) {
        state = 'idle';
        coreLight.color.set(0x00e5ff);
        coreMat.color.set(0x00e5ff);
        coreMat.emissive.set(0x00e5ff);
        coreMat.emissiveIntensity = 2.5;
      }

    } else if (state === 'explode') {
      explodeTime += delta;

      shards.forEach(s => {
        s.position.addScaledVector(s.userData.vel, delta);
        s.userData.vel.y -= delta * 6;
        s.rotation.x += s.userData.rot.x * delta;
        s.rotation.y += s.userData.rot.y * delta;
        s.rotation.z += s.userData.rot.z * delta;
        s.material.opacity = Math.max(0, 1 - explodeTime / 2.5);
      });

      coreLight.intensity = Math.max(0, 12 - explodeTime * 8);

      if (explodeTime > 2.5 && !explodeDone) {
        explodeDone = true;
        const cb = group.userData._explodeDone;
        if (typeof cb === 'function') cb();
      }
    }
  }

  return { mesh: group, update, triggerHit, triggerExplode };
}
