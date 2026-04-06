import * as THREE from 'three';

/**
 * StarField – a static particle system of ~1500 stars placed on a large sphere.
 * Includes a subtle slow rotation for parallax feel.
 */
export function createStarField() {
  const group = new THREE.Group();

  // --- Background stars (far) ---
  const farCount = 1200;
  const farGeo = new THREE.BufferGeometry();
  const farPos = new Float32Array(farCount * 3);
  for (let i = 0; i < farCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 400 + Math.random() * 200;
    farPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    farPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    farPos[i * 3 + 2] = r * Math.cos(phi);
  }
  farGeo.setAttribute('position', new THREE.BufferAttribute(farPos, 3));
  const farMat = new THREE.PointsMaterial({ color: 0xd8f1ff, size: 0.55, sizeAttenuation: true, fog: false, depthWrite: false });
  group.add(new THREE.Points(farGeo, farMat));

  // --- Mid stars (medium) ---
  const midCount = 400;
  const midGeo = new THREE.BufferGeometry();
  const midPos = new Float32Array(midCount * 3);
  for (let i = 0; i < midCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 200 + Math.random() * 100;
    midPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    midPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    midPos[i * 3 + 2] = r * Math.cos(phi);
  }
  midGeo.setAttribute('position', new THREE.BufferAttribute(midPos, 3));
  const midMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true, fog: false, depthWrite: false });
  group.add(new THREE.Points(midGeo, midMat));

  // --- Bright accent stars ---
  const accentCount = 80;
  const accentGeo = new THREE.BufferGeometry();
  const accentPos = new Float32Array(accentCount * 3);
  for (let i = 0; i < accentCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 300 + Math.random() * 150;
    accentPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    accentPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    accentPos[i * 3 + 2] = r * Math.cos(phi);
  }
  accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
  const accentMat = new THREE.PointsMaterial({ color: 0x46d4ff, size: 1.4, sizeAttenuation: true, fog: false, depthWrite: false });
  group.add(new THREE.Points(accentGeo, accentMat));

  function update(delta) {
    group.rotation.y += delta * 0.003;
    group.rotation.x += delta * 0.001;
  }

  return { mesh: group, update };
}
