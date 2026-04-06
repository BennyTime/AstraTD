import * as THREE from 'three';

/**
 * FloatingCrystal – a single floating gemstone crystal.
 * Shape: tall elongated bipyramid (pointed top & bottom, wide faceted middle)
 * built from two OctahedronGeometry layers to create the translucent outer
 * shell + deep glowing inner core look seen in faceted minerals.
 *
 * Hierarchy:
 *   group
 *   └─ inner  (slow Y rotation)
 *       ├─ outerMesh   (OctahedronGeometry detail=1, translucent shell)
 *       ├─ coreMesh    (same geo, BackSide, deep emissive inner colour)
 *       ├─ accent0…2   (OctahedronGeometry detail=0, thin tilted face slabs)
 *       └─ pointLight
 *
 * @param {object} opts
 *   color  – hex integer (default 0xcc44aa)
 *   scale  – uniform scale scalar (default 1)
 *   orbitR – orbit radius around origin (default 0, no orbit)
 *   orbitY – height of orbit plane (default 3)
 *   phase  – initial orbit phase (default 0)
 */
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
  // Outer shell: lighten the base colour so it looks like frosted translucent facets
  const outerColor = new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.42);
  // Core: darken + shift toward blue-violet for the deep inner colour
  const coreColor  = new THREE.Color(color).lerp(new THREE.Color(0x110033), 0.60);

  // Outer translucent shell – glossy, flat-shaded gem faces
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

  // Inner core layer – deep colour, BackSide so it glows through the outer shell
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

  // OctahedronGeometry detail=1 → 32 flat triangular faces, perfect gem-cut look
  const bodyGeo = new THREE.OctahedronGeometry(0.38, 1);

  // Outer mesh: elongated on Y (tall bipyramid) and slightly rotated for visual interest
  const outerMesh = new THREE.Mesh(bodyGeo, outerMat);
  outerMesh.scale.set(1.0, 2.15, 0.85);
  outerMesh.rotation.set(0.05, 0.32, 0.07);
  inner.add(outerMesh);

  // Core mesh: fractionally smaller so it sits fully inside the outer shell
  const coreMesh = new THREE.Mesh(bodyGeo, coreMat);
  coreMesh.scale.set(0.93, 2.05, 0.79);
  coreMesh.rotation.set(0.05, 0.32, 0.07);
  inner.add(coreMesh);

  // Accent shards – thin, tilted OctahedronGeometry(r, 0) slabs representing
  const accentDefs = [
    [ 0.38, 0.14, 0.30, 1.52, 0.18, 0.23, 0.10, 0.06],
    [-0.30, 0.22, 0.28, 1.38, 0.16, -0.20, 0.05, 0.10],
    [ 0.16, 0.32, 0.24, 1.18, 0.14, 0.08, -0.05, -0.20],
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

  // Point light inside – casts coloured light onto nearby surfaces
  const light = new THREE.PointLight(color, 3.2, 16 * scale);
  inner.add(light);

  // ── Bright inner core sphere ──────────────────────────────────────────
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

  // Tight fill light right on the sphere — illuminates the inner facets
  const coreLight = new THREE.PointLight(color, 4.5, 2.5 * scale);
  inner.add(coreLight);

  inner.scale.setScalar(scale);
  group.add(inner);

  let t = phase;

  function update(delta) {
    t += delta;

    // Orbit around origin, or hover in place
    if (orbitR > 0) {
      group.position.set(
        Math.cos(t * 0.35) * orbitR,
        orbitY + Math.sin(t * 0.55) * 0.4,
        Math.sin(t * 0.35) * orbitR
      );
    } else {
      group.position.y = orbitY + Math.sin(t * 0.7) * 0.28 * scale;
    }

    // Slow gem rotation – just enough to catch the light at different angles
    inner.rotation.y += delta * 0.22;

    // Breathing emissive pulse
    const pulse = 0.48 + Math.sin(t * 2.0) * 0.22;
    outerMat.emissiveIntensity = pulse;
    coreMat.emissiveIntensity = 2.5 + Math.sin(t * 2.0) * 0.75;
    light.intensity = 2.8 + Math.sin(t * 2.0) * 1.0;

    // Core sphere: gentle base breath + periodic hard flare
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

/**
 * createCrystalCluster – builds a tight group of several crystal gems
 * close together near the nexus. Returns a single { mesh, update } pair.
 */
export function createCrystalCluster(opts = {}) {
  const group = new THREE.Group();
  const updateFns = [];

  // Pink/purple/cyan gem palette matching the reference
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
