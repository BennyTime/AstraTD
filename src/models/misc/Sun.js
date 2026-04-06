import * as THREE from 'three';

/**
 * Sun – the distant star that acts as the scene's main light source.
 *
 * Structure:
 *   sunGroup
 *   ├─ core          (bright emissive sphere)
 *   ├─ innerCorona   (slightly larger, transparent BackSide sphere)
 *   └─ outerHaze     (large transparent glow shell)
 *
 * All materials have fog disabled — the sun lives above any atmospheric haze.
 *
 * Returns:
 *   mesh   – visual group; position it far away, e.g. (130, 85, 55)
 *   light  – DirectionalLight; add it to the scene and set its position
 *            to match mesh.position (also add light.target to scene).
 *   update – animation tick (delta in seconds)
 */
export function createSun() {
  const group = new THREE.Group();

  function fogless(mat) { mat.fog = false; return mat; }

  // ── Core sphere ───────────────────────────────────────────────────────────
  const coreMat = fogless(new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xffe866),
    emissiveIntensity: 5.0,
    roughness: 0.0,
    metalness: 0.0,
  }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), coreMat));

  // ── Inner corona (rendered back-face to wrap around core) ────────────────
  const innerMat = fogless(new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: new THREE.Color(0xff8800),
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.38,
    side: THREE.BackSide,
    depthWrite: false,
  }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(8, 32, 32), innerMat));

  // ── Outer haze ────────────────────────────────────────────────────────────
  const outerMat = fogless(new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: new THREE.Color(0xff4400),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    depthWrite: false,
  }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(14, 24, 24), outerMat));

  // ── DirectionalLight (replaces the scene's hard-coded key light) ──────────
  const light = new THREE.DirectionalLight(0xfff2d0, 2.8);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 230;
  light.shadow.camera.left = light.shadow.camera.bottom = -30;
  light.shadow.camera.right = light.shadow.camera.top = 30;
  light.shadow.bias = -0.001;

  // ── Animation ─────────────────────────────────────────────────────────────
  let t = 0;
  function update(delta) {
    t += delta;
    coreMat.emissiveIntensity = 4.8 + Math.sin(t * 1.10) * 0.40;
    innerMat.opacity = 0.34 + Math.sin(t * 0.70) * 0.07;
    innerMat.emissiveIntensity = 2.2 + Math.sin(t * 0.90 + 0.5) * 0.40;
    outerMat.opacity = 0.10 + Math.sin(t * 0.50 + 1.2) * 0.04;
  }

  return { mesh: group, light, update };
}
