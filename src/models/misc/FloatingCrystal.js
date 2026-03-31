import * as THREE from 'three';

/**
 * FloatingCrystal – decorative animated crystal clustered around the board.
 *
 * Hierarchy:
 *   crystalGroup
 *   ├─ pivotRef  (for orbit animation)
 *   │   └─ inner (slow self-rotation)
 *   │       ├─ main prism (tall, sharp)
 *   │       ├─ side shard L
 *   │       ├─ side shard R
 *   │       └─ glow sphere (emissive)
 *   └─ point light
 *
 * @param {object} opts
 *   color  – hex integer (default 0x44aaff)
 *   scale  – uniform scale scalar (default 1)
 *   orbitR – orbit radius around origin (default 0, no orbit)
 *   orbitY – height of orbit plane (default 3)
 *   phase  – initial orbit phase (default 0)
 */
export function createFloatingCrystal({
  color   = 0x44aaff,
  scale   = 1,
  orbitR  = 0,
  orbitY  = 3,
  phase   = 0,
} = {}) {
  const group = new THREE.Group();

  const emColor = new THREE.Color(color);
  const crystalMat = new THREE.MeshStandardMaterial({
    color,
    emissive: emColor,
    emissiveIntensity: 0.7,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });
  const innerGlowMat = new THREE.MeshStandardMaterial({
    color,
    emissive: emColor,
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.45,
    side: THREE.BackSide,
  });

  const inner = new THREE.Group();

  // Main prism (tall CylinderGeometry with 6 sides, tapered to a point)
  const mainPrism = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 0.25, 1.2, 6),
    crystalMat
  );
  mainPrism.position.y = 0.3;
  inner.add(mainPrism);

  // Inverted base cap
  const baseCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0, 0.45, 6),
    crystalMat
  );
  baseCap.rotation.x = Math.PI;
  baseCap.position.y = -0.1;
  inner.add(baseCap);

  // Side shards
  [[-0.22, 0.1, 0.05, -0.3], [0.22, 0.1, -0.05, 0.3]].forEach(([x, y, rz, rx]) => {
    const shard = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 0.12, 0.7, 6),
      crystalMat
    );
    shard.position.set(x, y, 0);
    shard.rotation.set(rx, 0, rz);
    inner.add(shard);
  });

  // Glow sphere (inside, slightly larger, backSide render)
  const glowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 16),
    innerGlowMat
  );
  glowSphere.position.y = 0.15;
  inner.add(glowSphere);

  inner.scale.setScalar(scale);
  group.add(inner);

  // Point light from crystal core
  const light = new THREE.PointLight(color, 1.0, 5 * scale);
  light.position.y = 0.15;
  group.add(light);

  // Orbit state
  let t = phase;

  function update(delta) {
    t += delta;

    // Orbit around origin (if orbitR > 0)
    if (orbitR > 0) {
      group.position.set(
        Math.cos(t * 0.35) * orbitR,
        orbitY + Math.sin(t * 0.55) * 0.4,
        Math.sin(t * 0.35) * orbitR
      );
    } else {
      group.position.y = orbitY + Math.sin(t * 0.8) * 0.3 * scale;
    }

    // Self rotate
    inner.rotation.y += delta * 0.6;

    // Pulse emissive
    const pulse = 0.6 + Math.sin(t * 2.5) * 0.3;
    crystalMat.emissiveIntensity = pulse;
    light.intensity = 0.8 * pulse * scale;
  }

  return { mesh: group, update };
}

/**
 * createCrystalCluster – builds a group of several crystals close together.
 * Returns a single { mesh, update } pair.
 */
export function createCrystalCluster(opts = {}) {
  const group = new THREE.Group();
  const updateFns = [];

  const configs = [
    { color: 0x44aaff, scale: 1.0,  orbitR: 0, orbitY: 0,    phase: 0 },
    { color: 0x8844ff, scale: 0.65, orbitR: 0, orbitY: -0.3, phase: 1.2 },
    { color: 0x00ffdd, scale: 0.5,  orbitR: 0, orbitY: 0,    phase: 2.4 },
    { color: 0x44aaff, scale: 0.4,  orbitR: 0, orbitY: 0.2,  phase: 3.6 },
  ];
  const offsets = [[0, 0], [0.55, 0.2], [-0.45, 0.3], [0.15, -0.5]];

  configs.forEach((cfg, i) => {
    const c = createFloatingCrystal({ ...cfg, ...opts });
    c.mesh.position.set(offsets[i][0], 0, offsets[i][1]);
    group.add(c.mesh);
    updateFns.push(c.update);
  });

  function update(delta) { updateFns.forEach(fn => fn(delta)); }
  return { mesh: group, update };
}
