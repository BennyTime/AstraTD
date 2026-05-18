import * as THREE from 'three';

export function createFloatingCrystal({
  color = 0xcc44aa,
  scale = 1,
  orbitR = 0,
  orbitY = 3,
  phase = 0,
} = {}) {
  const group = new THREE.Group();
  const inner = new THREE.Group();

  const emColor = new THREE.Color(color);
  const outerColor = new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.42);
  const coreColor  = new THREE.Color(color).lerp(new THREE.Color(0x110033), 0.60);

  const outerMat = new THREE.MeshStandardMaterial({
    color: outerColor,
    emissive: emColor,
    emissiveIntensity: 0.55,
    roughness: 0.03,
    metalness: 0.22,
    transparent: true,
    opacity: 0.78,
    flatShading: true,
  });

  const coreMat = new THREE.MeshStandardMaterial({
    color: coreColor,
    emissive: emColor,
    emissiveIntensity: 2.8,
    roughness: 0.02,
    metalness: 0.25,
    transparent: true,
    opacity: 0.95,
    flatShading: true,
    side: THREE.BackSide,
  });

  const bodyGeo = new THREE.OctahedronGeometry(0.38, 1);

  const outerMesh = new THREE.Mesh(bodyGeo, outerMat);
  outerMesh.scale.set(1.0, 2.15, 0.85);
  outerMesh.rotation.set(0.05, 0.32, 0.07);
  inner.add(outerMesh);

  const coreMesh = new THREE.Mesh(bodyGeo, coreMat);
  coreMesh.scale.set(0.93, 2.05, 0.79);
  coreMesh.rotation.set(0.05, 0.32, 0.07);
  inner.add(coreMesh);

  const accentDefs = [
    [0.38, 0.14, 0.30, 1.52, 0.18, 0.23, 0.10, 0.06],
    [-0.30, 0.22, 0.28, 1.38, 0.16, -0.20, 0.05, 0.10],
    [0.16, 0.32, 0.24, 1.18, 0.14, 0.08, -0.05, -0.20],
  ];
  accentDefs.forEach(([rz, rx, sx, sy, sz, ox, oy, oz]) => {
    const accent = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.20, 0),
      new THREE.MeshStandardMaterial({
        color: outerColor,
        emissive: emColor,
        emissiveIntensity: 0.70,
        roughness: 0.03,
        metalness: 0.20,
        transparent: true,
        opacity: 0.62,
        flatShading: true,
      })
    );
    accent.scale.set(sx, sy, sz);
    accent.rotation.set(rx, 0, rz);
    accent.position.set(ox, oy, oz);
    inner.add(accent);
  });

  const light = new THREE.PointLight(color, 3.2, 16 * scale);
  inner.add(light);

  const coreSphereGeo = new THREE.SphereGeometry(0.10, 10, 10);
  const coreSphereMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.55),
    emissive: emColor,
    emissiveIntensity: 5.0,
    roughness: 0.0,
    metalness: 0.0,
    transparent: false,
  });
  const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
  inner.add(coreSphere);

  const coreLight = new THREE.PointLight(color, 4.5, 2.5 * scale);
  inner.add(coreLight);

  inner.scale.setScalar(scale);
  group.add(inner);

  let t = phase;

  function update(delta) {
    t += delta;

    if (orbitR > 0) {
      group.position.set(
        Math.cos(t * 0.35) * orbitR,
        orbitY + Math.sin(t * 0.55) * 0.4,
        Math.sin(t * 0.35) * orbitR
      );
    } else {
      group.position.y = orbitY + Math.sin(t * 0.7) * 0.28 * scale;
    }

    inner.rotation.y += delta * 0.22;

    const pulse = 0.48 + Math.sin(t * 2.0) * 0.22;
    outerMat.emissiveIntensity = pulse;
    coreMat.emissiveIntensity = 2.5 + Math.sin(t * 2.0) * 0.75;
    light.intensity = 2.8 + Math.sin(t * 2.0) * 1.0;

    const flareT = ((t + phase * 0.7) % 4.0) / 4.0;
    const flareRaw = Math.max(0, 1 - Math.abs(flareT - 0.08) / 0.08);
    const flareCurve = flareRaw * flareRaw;
    const basePulse = 4.5 + Math.sin(t * 2.0 + 0.4) * 1.2;
    const flareBoost = flareCurve * 28;
    coreSphereMat.emissiveIntensity = basePulse + flareBoost;
    coreLight.intensity = (4.0 + Math.sin(t * 2.0 + 0.4) * 1.5) + flareCurve * 18;
  }

  return { mesh: group, update };
}

export function createCrystalCluster(opts = {}) {
  const group = new THREE.Group();
  const updateFns = [];

  const configs = [
    { color: 0xcc44aa, scale: 1.0, orbitR: 0, orbitY: 0, phase: 0 },
    { color: 0x8844ff, scale: 0.65, orbitR: 0, orbitY: -0.3, phase: 1.2 },
    { color: 0x44aaff, scale: 0.5, orbitR: 0, orbitY: 0, phase: 2.4 },
    { color: 0xee66cc, scale: 0.4, orbitR: 0, orbitY: 0.2, phase: 3.6 },
  ];
  const offsets = [[0, 0], [0.55, 0.2], [-0.45, 0.3], [0.15, -0.5]];

  configs.forEach((cfg, i) => {
    const c = createFloatingCrystal({ cfg, opts });
    c.mesh.position.set(offsets[i][0], 0, offsets[i][1]);
    group.add(c.mesh);
    updateFns.push(c.update);
  });

  function update(delta) { updateFns.forEach(fn => fn(delta)); }
  return { mesh: group, update };
}
