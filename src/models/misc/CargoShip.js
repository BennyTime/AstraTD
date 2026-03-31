import * as THREE from 'three';

/**
 * CargoShip – the enemy spawn point, sits at left edge of board.
 *
 * Hierarchical structure:
 *   shipGroup
 *   ├─ hull         (elongated box, tapered)
 *   ├─ bridge       (raised cockpit box)
 *   ├─ wing_L/R     (flat swept wings)
 *   ├─ thruster_L/R (cylinder exhausts)
 *   ├─ cargo bay    (recessed dark panel)
 *   └─ bay door     (animates open/close)
 *
 * Animations:
 *   - idle : slight hover bob and yaw sway, thruster glow pulse
 *   - openBay : bay door rotates open
 *   - closeBay : bay door closes
 */
export function createCargoShip() {
  const group = new THREE.Group();

  // ── Materials ──────────────────────────────────────────────────────────
  const hullMat     = new THREE.MeshStandardMaterial({ color: 0x2a1a3a, roughness: 0.55, metalness: 0.75 });
  const accentMat   = new THREE.MeshStandardMaterial({ color: 0xaa00ff, emissive: new THREE.Color(0xaa00ff), emissiveIntensity: 1.0, roughness: 0.3, metalness: 0.5 });
  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x660099, emissive: new THREE.Color(0x9900ff), emissiveIntensity: 2.0, roughness: 0.2 });
  const windowMat   = new THREE.MeshStandardMaterial({ color: 0x90e0ff, emissive: new THREE.Color(0x40c0ff), emissiveIntensity: 1.2, transparent: true, opacity: 0.85 });
  const bayMat      = new THREE.MeshStandardMaterial({ color: 0x110a1c, roughness: 0.8, metalness: 0.4 });
  const wingMat     = new THREE.MeshStandardMaterial({ color: 0x1e102e, roughness: 0.6, metalness: 0.7 });
  const bayDoorMat  = new THREE.MeshStandardMaterial({ color: 0x2a1a3a, roughness: 0.6, metalness: 0.7 });

  // ── Hull ──
  const hull = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.9, 2.0), hullMat);
  hull.position.y = 0;
  hull.castShadow = hull.receiveShadow = true;
  group.add(hull);

  // Hull nose taper (smaller box at front)
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.4), hullMat);
  nose.position.set(2.6, -0.05, 0);
  group.add(nose);

  // ── Bridge / cockpit ──
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1.0), hullMat);
  bridge.position.set(1.4, 0.7, 0);
  bridge.castShadow = true;
  group.add(bridge);

  // Bridge windows
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.95), windowMat);
  win.position.set(1.9, 0.72, 0);
  group.add(win);

  // ── Wings ──
  const wingGeo = new THREE.BoxGeometry(2.5, 0.12, 1.2);
  ['L', 'R'].forEach((side, idx) => {
    const w = new THREE.Mesh(wingGeo, wingMat);
    const sign = idx === 0 ? 1 : -1;
    w.position.set(-0.6, -0.08, sign * 1.6);
    w.rotation.z = sign * 0.08;
    w.castShadow = true;
    group.add(w);

    // Wing accent stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.1), accentMat);
    stripe.position.set(-0.6, 0.05, sign * (1.6 + 0.55));
    group.add(stripe);
  });

  // ── Thrusters ──
  const thrGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.7, 10);
  const thrusterMeshes = [];
  [1, -1].forEach(sign => {
    const thr = new THREE.Mesh(thrGeo, hullMat);
    thr.rotation.z = Math.PI / 2;
    thr.position.set(-2.6, -0.05, sign * 0.65);
    thr.castShadow = true;
    group.add(thr);

    // Exhaust glow cone
    const glow = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.55, 10, 1, true),
      thrusterMat.clone()
    );
    glow.rotation.z = -Math.PI / 2;
    glow.position.set(-3.05, -0.05, sign * 0.65);
    group.add(glow);
    thrusterMeshes.push(glow);

    // Thruster light
    const tLight = new THREE.PointLight(0x9900ff, 1.2, 3.5);
    tLight.position.set(-3.1, -0.05, sign * 0.65);
    group.add(tLight);
  });

  // ── Cargo bay recessed panel ──
  const bay = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.6), bayMat);
  bay.position.set(-0.5, -0.3, 0);
  group.add(bay);

  // ── Boarding bridge / ramp ────────────────────────────────────────────
  // Pivot at the nose-bottom of the hull; bridge deploys by rotating down around Z
  const bridgePivot = new THREE.Group();
  bridgePivot.position.set(1.8, -0.45, 0);
  group.add(bridgePivot);

  const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.9), bayDoorMat);
  bridgeMesh.position.x = 1.4;
  bridgeMesh.castShadow = true;
  bridgePivot.add(bridgeMesh);

  // Side rails
  [-0.42, 0.42].forEach(z => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 0.06), accentMat);
    rail.position.set(1.4, 0.1, z);
    bridgePivot.add(rail);
  });

  // Grip steps
  for (let i = 0; i < 4; i++) {
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.9), accentMat);
    grip.position.x = 0.5 + i * 0.65;
    bridgePivot.add(grip);
  }

  // Hull accent markings
  const stripGeo = new THREE.BoxGeometry(1.95, 0.05, 0.08);
  [-0.55, 0, 0.55].forEach(z => {
    const strip = new THREE.Mesh(stripGeo, accentMat);
    strip.position.set(-0.5, 0.48, z);
    group.add(strip);
  });

  // Top beacon light
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), accentMat);
  beacon.position.set(0, 0.55, 0);
  group.add(beacon);
  const beaconLight = new THREE.PointLight(0xaa00ff, 1.0, 4);
  beaconLight.position.set(0, 0.55, 0);
  group.add(beaconLight);

  // ── State ─────────────────────────────────────────────────────────────
  let t               = 0;
  let baseY           = 0;
  let bayState        = 'closed';  // 'closed' | 'opening' | 'open' | 'closing'
  const BRIDGE_CLOSED = Math.PI / 2;   // folded up against hull nose
  const BRIDGE_OPEN   = -Math.PI / 4;  // deployed as boarding ramp ~45° down
  let bayAngle        = BRIDGE_CLOSED;

  bridgePivot.rotation.z = BRIDGE_CLOSED;

  function openBay()  { if (bayState === 'closed') bayState = 'opening'; }
  function closeBay() { if (bayState === 'open')   bayState = 'closing'; }

  function update(delta) {
    t += delta;

    // Hover bob
    group.position.y = baseY + Math.sin(t * 0.9) * 0.12;
    // Gentle yaw sway
    group.rotation.y = Math.sin(t * 0.45) * 0.06;

    // Thruster glow pulse
    thrusterMeshes.forEach(g => {
      g.material.emissiveIntensity = 1.5 + Math.sin(t * 4 + Math.random() * 0.1) * 0.5;
    });
    beaconLight.intensity = 0.7 + Math.sin(t * 3.5) * 0.4;

    // Bridge animation (rotates around Z axis)
    if (bayState === 'opening') {
      bayAngle = Math.max(BRIDGE_OPEN, bayAngle - delta * 1.8);
      bridgePivot.rotation.z = bayAngle;
      if (bayAngle <= BRIDGE_OPEN) bayState = 'open';
    } else if (bayState === 'closing') {
      bayAngle = Math.min(BRIDGE_CLOSED, bayAngle + delta * 1.8);
      bridgePivot.rotation.z = bayAngle;
      if (bayAngle >= BRIDGE_CLOSED) bayState = 'closed';
    }
  }

  function setBaseY(y) { baseY = y; }

  return { mesh: group, update, openBay, closeBay, setBaseY };
}
