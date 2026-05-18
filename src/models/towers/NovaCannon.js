import * as THREE from 'three';

export const NovaCannonStats = {
  cost: 175,
  range: 4.5,
  damage: 30,
  fireRate: 0.5,
  isAoe: true,
};

const PYLON_BASE_Y = 0.52;
const PYLON_HEIGHT = 1.10;
const CRYSTAL_HEIGHT = 0.55;
const TIP_Y = PYLON_BASE_Y + PYLON_HEIGHT + CRYSTAL_HEIGHT * 0.5;

const _nGeo = {
  base: new THREE.CylinderGeometry(0.92, 1.06, 0.22, 8),
  base2: new THREE.CylinderGeometry(0.70, 0.88, 0.18, 8),
  base3: new THREE.CylinderGeometry(0.52, 0.68, 0.14, 8),
  baseRing: new THREE.TorusGeometry(0.80, 0.042, 8, 48),
  hexBorder: new THREE.TorusGeometry(1.00, 0.052, 6, 6),
  pylonBody: new THREE.CylinderGeometry(0.18, 0.26, PYLON_HEIGHT, 8),
  pylonWaist: new THREE.CylinderGeometry(0.22, 0.18, 0.18, 8),
  crystalTip: new THREE.ConeGeometry(0.18, CRYSTAL_HEIGHT, 8),
  crystalBase: new THREE.CylinderGeometry(0.20, 0.20, 0.08, 8),
  fin: new THREE.BoxGeometry(0.08, 0.55, 0.18),
  ring0: new THREE.TorusGeometry(0.34, 0.032, 8, 36),
  ring1: new THREE.TorusGeometry(0.30, 0.028, 8, 36),
  ring2: new THREE.TorusGeometry(0.26, 0.024, 8, 36),
  chargeHalo: new THREE.TorusGeometry(0.88, 0.055, 8, 52),
  strikeBeam: new THREE.CylinderGeometry(0.09, 0.09, 7.0, 8),
  impactFlash: new THREE.SphereGeometry(0.30, 12, 8),
  impactWave: new THREE.TorusGeometry(1.0, 0.055, 8, 52),
};

export function createNovaCannon() {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x180800, roughness: 0.55, metalness: 0.90 });
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x221000, roughness: 0.40, metalness: 0.88 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: new THREE.Color(0xff8800), emissiveIntensity: 1.8, roughness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: new THREE.Color(0xff5500), emissiveIntensity: 1.2, roughness: 0.2 });
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: new THREE.Color(0xffaa00), emissiveIntensity: 2.6, transparent: true, opacity: 0.92 });
  const haloMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: new THREE.Color(0xff6600), emissiveIntensity: 1.4, roughness: 0.2, transparent: true, opacity: 0.80 });
  const beamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffdd88), emissiveIntensity: 6.0, transparent: true, opacity: 0 });
  const flashMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xff8800), emissiveIntensity: 5.0, transparent: true, opacity: 0 });
  const waveMat = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: new THREE.Color(0xff6600), emissiveIntensity: 4.5, transparent: true, opacity: 0, side: THREE.DoubleSide });

  const waveRing = new THREE.Mesh(_nGeo.impactWave, waveMat);
  waveRing.rotation.x = Math.PI / 2;
  waveRing.position.y = 0.15;
  waveRing.visible = false;
  group.add(waveRing);

  const step1 = new THREE.Mesh(_nGeo.base, baseMat);
  step1.position.y = 0.11;
  step1.castShadow = step1.receiveShadow = true;
  group.add(step1);

  const step2 = new THREE.Mesh(_nGeo.base2, baseMat);
  step2.position.y = 0.29;
  step2.castShadow = true;
  group.add(step2);

  const step3 = new THREE.Mesh(_nGeo.base3, baseMat);
  step3.position.y = 0.45;
  step3.castShadow = true;
  group.add(step3);

  const baseRing = new THREE.Mesh(_nGeo.baseRing, ringMat.clone());
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.12;
  group.add(baseRing);

  const hexBorder = new THREE.Mesh(_nGeo.hexBorder, accentMat.clone());
  hexBorder.rotation.x = Math.PI / 2;
  hexBorder.position.y = 0.12;
  group.add(hexBorder);

  const pylonBody = new THREE.Mesh(_nGeo.pylonBody, pylonMat);
  pylonBody.position.y = PYLON_BASE_Y + PYLON_HEIGHT * 0.5;
  pylonBody.castShadow = true;
  group.add(pylonBody);

  const pylonWaist = new THREE.Mesh(_nGeo.pylonWaist, ringMat.clone());
  pylonWaist.position.y = PYLON_BASE_Y + PYLON_HEIGHT * 0.5;
  group.add(pylonWaist);

  const crystalCollar = new THREE.Mesh(_nGeo.crystalBase, pylonMat.clone());
  crystalCollar.position.y = PYLON_BASE_Y + PYLON_HEIGHT;
  group.add(crystalCollar);

  const crystalTip = new THREE.Mesh(_nGeo.crystalTip, crystalMat);
  crystalTip.position.y = TIP_Y;
  crystalTip.castShadow = true;
  group.add(crystalTip);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const fin = new THREE.Mesh(_nGeo.fin, pylonMat.clone());
    fin.position.set(
      Math.sin(angle) * 0.36,
      PYLON_BASE_Y + 0.28,
      Math.cos(angle) * 0.36
    );
    fin.rotation.y = -angle;
    fin.castShadow = true;
    group.add(fin);
  }

  const orbitRings = [];
  const orbitGeos = [_nGeo.ring0, _nGeo.ring1, _nGeo.ring2];
  const orbitYOff = [0.20, 0.50, 0.78];
  orbitGeos.forEach((geo, i) => {
    const r = new THREE.Mesh(geo, ringMat.clone());
    r.position.y = PYLON_BASE_Y + PYLON_HEIGHT * orbitYOff[i];
    group.add(r);
    orbitRings.push(r);
  });

  const chargeHalo = new THREE.Mesh(_nGeo.chargeHalo, haloMat);
  chargeHalo.rotation.x = Math.PI / 2;
  chargeHalo.position.y = 0.13;
  group.add(chargeHalo);

  const BEAM_HALF = 7.0 / 2;
  const strikeBeam = new THREE.Mesh(_nGeo.strikeBeam, beamMat);
  strikeBeam.position.y = TIP_Y + BEAM_HALF;
  strikeBeam.visible = false;
  group.add(strikeBeam);

  const impactFlash = new THREE.Mesh(_nGeo.impactFlash, flashMat);
  impactFlash.position.y = TIP_Y;
  impactFlash.visible = false;
  group.add(impactFlash);

  let spawnTimer = 0;
  let spawnDone = false;
  let shootTimer = 0.55;
  let t = 0;
  let phase = 'idle';
  let activeWave = false;
  let waveRange = NovaCannonStats.range;

  group.scale.setScalar(0);

  function triggerSpawn() {
    spawnTimer = 0;
    spawnDone = false;
    group.scale.setScalar(0);
  }

  function triggerShoot(targetPositions, range) {
    shootTimer = 0;
    phase = 'strike';
    const shotRange = range ?? NovaCannonStats.range;

    activeWave = false;
    waveRing.visible = false;
    waveRing.scale.setScalar(0.05);
    waveMat.opacity = 0;

    waveRange = shotRange;
    waveRing.visible = true;
    waveMat.opacity = 0.85;
    activeWave = true;

    strikeBeam.visible = true;
    beamMat.opacity = 0.95;

    impactFlash.visible = true;
    flashMat.opacity = 1.0;
    impactFlash.scale.setScalar(0.3);

    haloMat.emissiveIntensity = 4.0;
  }

  function trackTarget() {}

  function update(delta) {
    t += delta;

    if (!spawnDone) {
      spawnTimer += delta;
      const progress = Math.min(spawnTimer / 0.7, 1);
      const spring = progress < 0.7
        ? (progress / 0.7) * 1.15
        : 1.15 - ((progress - 0.7) / 0.3) * 0.15;
      group.scale.setScalar(spring);
      if (progress >= 1) { group.scale.setScalar(1); spawnDone = true; }
      return;
    }

    baseRing.rotation.z += delta * 0.7;
    hexBorder.rotation.z -= delta * 0.4;
    orbitRings.forEach((r, i) => {
      r.rotation.z += delta * (0.9 + i * 0.5) * (i % 2 === 0 ? 1 : -1);
    });
    crystalMat.emissiveIntensity = 2.4 + Math.sin(t * 2.2) * 0.6;
    pylonWaist.material.emissiveIntensity = 1.6 + Math.sin(t * 2.2 + 0.5) * 0.5;
    haloMat.emissiveIntensity = 1.0 + Math.sin(t * 1.8) * 0.4;

    if (shootTimer < 0.55) {
      shootTimer += delta;
      const s = shootTimer / 0.55;

      if (phase === 'strike') {
        const beamS = Math.min(s / 0.30, 1);
        beamMat.opacity = (1 - beamS) * 0.95;
        if (beamS >= 1) strikeBeam.visible = false;

        const flashS = Math.min(s / 0.25, 1);
        impactFlash.scale.setScalar(0.3 + flashS * 1.2);
        flashMat.opacity = (1 - flashS);
        if (flashS >= 1) impactFlash.visible = false;

        crystalTip.scale.setScalar(1 + Math.max(0, 0.3 - s * 2.0));

        if (activeWave) {
          const waveS = Math.max((s - 0.15) / 0.60, 0);
          const waveFd = Math.max((s - 0.35) / 0.65, 0);
          waveRing.scale.setScalar(0.05 + Math.min(waveS, 1) * waveRange);
          waveMat.opacity = (1 - Math.min(waveFd, 1)) * 0.85;
        }
      }

      if (shootTimer >= 0.55) {
        crystalTip.scale.setScalar(1);
        activeWave = false;
        waveRing.visible = false;
        waveMat.opacity = 0;
        phase = 'idle';
        const cb = group.userData._shootDone;
        if (typeof cb === 'function') cb();
      }
    }
  }

  triggerSpawn();

  return { name: 'NOVA CANNON', mesh: group, update, triggerSpawn, triggerShoot, trackTarget };
}
