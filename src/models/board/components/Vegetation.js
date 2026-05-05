import * as THREE from 'three';

// ─── Grass tuft ───────────────────────────────────────────────────────────────
function makeGrassTuft(cx, cz, hue = 0x52c46a) {
  const group = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({
    color: hue, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide,
  });
  // [dx, dz, tiltZ, height, rotY]
  const blades = [
    [0.000, 0.000, 0.00, 0.14, 0.00],
    [0.080, 0.060, 0.28, 0.16, 0.28],
    [-0.070, 0.085,-0.22, 0.11,-0.18],
    [0.100, -0.040,-0.38, 0.18, 0.50],
    [-0.090, -0.075, 0.48, 0.12,-0.45],
    [0.040, 0.110, 0.75, 0.15, 0.80],
    [-0.055, -0.095, 1.18, 0.13,-0.72],
    [0.105, 0.030, 1.52, 0.10, 1.10],
  ];
  blades.forEach(([dx, dz, rz, h, ry]) => {
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.022, h, 3), m);
    blade.position.set(cx + dx, 0.3 + h / 2, cz + dz);
    blade.rotation.set(rz * 0.28, ry, rz * 0.14);
    blade.castShadow = true;
    group.add(blade);
  });
  return group;
}

// ─── Small bush ───────────────────────────────────────────────────────────────
function makeSmallBush(cx, cz, hue = 0x2d7838) {
  const group = new THREE.Group();
  const darkHue = (hue & 0xfefefe) >>> 1;
  const lm = new THREE.MeshStandardMaterial({ color: hue,     roughness: 0.88, metalness: 0.0 });
  const lm2 = new THREE.MeshStandardMaterial({ color: darkHue, roughness: 0.90, metalness: 0.0 });
  const sm = new THREE.MeshStandardMaterial({ color: 0x3a2008, roughness: 1.0,  metalness: 0.0 });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.065, 0.28, 5), sm);
  stem.position.set(cx, 0.44, cz);
  group.add(stem);

  // [dx, dy, dz, radius, mat]
  [
    [0.00, 0.24, 0.00, 0.28, lm ],
    [0.18, 0.14, 0.10, 0.21, lm2],
    [-0.15, 0.13, -0.10, 0.20, lm ],
    [0.03, 0.07, 0.18, 0.17, lm2],
    [-0.08, 0.30, 0.06, 0.15, lm ],
  ].forEach(([dx, dy, dz, r, mat]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), mat);
    b.position.set(cx + dx, 0.55 + dy, cz + dz);
    b.castShadow = true;
    group.add(b);
  });
  return group;
}

// ─── Planter box ──────────────────────────────────────────────────────────────
const _planterBoxColors = [0x1e5e50, 0x7a2e10, 0x2a4a7a, 0x5a3a10, 0x1a4a2a];

function makePlanterBox(cx, cz, rotY = 0, colorIndex = 0) {
  const group = new THREE.Group();
  const boxColor = _planterBoxColors[colorIndex % _planterBoxColors.length];
  const boxMat = new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.50, metalness: 0.55 });
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 1.0,  metalness: 0.0 });
  const sprigMat = new THREE.MeshStandardMaterial({ color: 0x6ae870, roughness: 0.75, metalness: 0.0 });

  const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.75), boxMat);
  box.position.set(cx, 0.39, cz);
  box.rotation.y = rotY;
  box.castShadow = box.receiveShadow = true;
  group.add(box);

  const soil = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.04, 0.62), soilMat);
  soil.position.set(cx, 0.49, cz);
  soil.rotation.y = rotY;
  group.add(soil);

  for (let i = 0; i < 5; i++) {
    const h = 0.10 + (i % 2) * 0.07;
    const lx = (i - 2) * 0.32;
    const sprig = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.022, h, 3), sprigMat);
    sprig.position.set(
      cx +  Math.cos(rotY) * lx,
      0.49 + h / 2,
      cz + -Math.sin(rotY) * lx
    );
    sprig.rotation.z = (i % 2 === 0 ? 0.18 : -0.14);
    group.add(sprig);
  }
  return group;
}

// ─── Vegetation ───────────────────────────────────────────────────────────────
/**
 * Builds all organic board decorations from a map's vegetation config.
 * Exposes a single `mesh` (THREE.Group) ready to add to the scene.
 *
 * @param {{ grassTufts?: Array, bushes?: Array, planters?: Array }} vegConfig
 *   - grassTufts: [[cx, cz, hue], ...]
 *   - bushes:     [[cx, cz, hue], ...]
 *   - planters:   [[cx, cz, rotY], ...]
 */
export class Vegetation {
  constructor({ grassTufts = [], bushes = [], planters = [] } = {}) {
    this.mesh = new THREE.Group();
    grassTufts.forEach(([cx, cz, hue]) => this.mesh.add(makeGrassTuft(cx, cz, hue)));
    bushes.forEach(([cx, cz, hue]) => this.mesh.add(makeSmallBush(cx, cz, hue)));
    planters.forEach(([cx, cz, ry], i) => this.mesh.add(makePlanterBox(cx, cz, ry, i)));
  }
}
