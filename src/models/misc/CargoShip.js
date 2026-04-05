import * as THREE from 'three';

/**
 * CargoShip – the enemy spawn point, sits at left edge of board.
 *
 * Hierarchical structure:
 *   shipGroup
 *   ├─ fuselage          (wide main body)
 *   ├─ spine             (top centre ridge)
 *   ├─ noseSlab          (forward tapered block)
 *   ├─ noseCap           (wedge tip)
 *   ├─ cockpitBase       (raised command pod above nose)
 *   ├─ windowStrip       (wraparound cockpit glass)
 *   ├─ frontWindow       (nose-face glass panel)
 *   ├─ cockpitAccent_L/R (side glow lines on cockpit)
 *   ├─ shoulder_L/R      (top-edge armor panels with accent lines)
 *   ├─ topStrip          (centre top accent line)
 *   ├─ wingRoot_L/R      (thick wing root slabs, slight dihedral)
 *   ├─ wingTip_L/R       (tapered outer wing panels)
 *   ├─ wStripe_L/R       (wing leading-edge accent lines)
 *   ├─ nacelle_L/R       (tip engine pods, horizontal cylinder)
 *   ├─ nacRing_L/R       (rear glow rings on nacelles)
 *   ├─ nacGlow_L/R       (exhaust cones on nacelles, tracked)
 *   ├─ rearBlock         (rear engine housing)
 *   ├─ rearBorder        (accent frame on engine rear face)
 *   ├─ nozzle[4]         (2×2 engine nozzle cylinders)
 *   ├─ exhaustGlow[4]    (four engine exhaust cones, tracked)
 *   ├─ belly             (underbelly armor panel)
 *   ├─ bayRecess         (cargo bay cavity detail)
 *   ├─ stabFin           (vertical tail fin)
 *   ├─ finAccent         (accent line along fin top)
 *   ├─ navPort / navStbd (nose navigation lights)
 *   ├─ beacon            (top pulse sphere)
 *   ├─ aperture + iris rings (transporter bay on hull belly)
 *   └─ beamGroup         (Star Trek transporter beam assembly)
 *       ├─ beamColumn
 *       ├─ scanRings[5]
 *       ├─ matPad
 *       ├─ matRingMesh
 *       ├─ sparkles[9]
 *       └─ beamLight
 *
 * Animations:
 *   - idle    : hover bob, yaw sway, thruster glow pulse, beacon pulse
 *   - openBay : beam fades in, scan rings sweep downward, pad glows
 *   - closeBay: beam fades out
 */
export function createCargoShip() {
  const group = new THREE.Group();

  // ── Materials ──────────────────────────────────────────────────────────
  const hullMat     = new THREE.MeshStandardMaterial({ color: 0x1c1028, roughness: 0.55, metalness: 0.80 });
  const armorMat    = new THREE.MeshStandardMaterial({ color: 0x2a1838, roughness: 0.50, metalness: 0.75 });
  const accentMat   = new THREE.MeshStandardMaterial({ color: 0xaa00ff, emissive: new THREE.Color(0xaa00ff), emissiveIntensity: 1.2, roughness: 0.25, metalness: 0.5 });
  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x660099, emissive: new THREE.Color(0x9900ff), emissiveIntensity: 2.0, roughness: 0.2 });
  const windowMat   = new THREE.MeshStandardMaterial({ color: 0x90e0ff, emissive: new THREE.Color(0x40c0ff), emissiveIntensity: 1.2, transparent: true, opacity: 0.85 });
  const wingMat     = new THREE.MeshStandardMaterial({ color: 0x16091f, roughness: 0.62, metalness: 0.78 });
  const bayMat      = new THREE.MeshStandardMaterial({ color: 0x0e0818, roughness: 0.85, metalness: 0.4 });

  // All emissive exhaust cones collected here for pulsing in update()
  const thrusterMeshes = [];

  // ── Fuselage ──────────────────────────────────────────────────────────
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.1, 2.8), hullMat);
  fuselage.castShadow = fuselage.receiveShadow = true;
  group.add(fuselage);

  // Top spine ridge
  const spine = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.28, 0.82), armorMat);
  spine.position.set(-0.1, 0.69, 0);
  group.add(spine);

  // ── Nose ──────────────────────────────────────────────────────────────
  // Slab is shifted so its back face (2.95-0.75=2.2) sits inside the fuselage (front=2.4),
  // eliminating the gap. Z widened to 2.6 to closely match fuselage width (2.8).
  const noseSlab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 2.6), hullMat);
  noseSlab.position.set(2.95, 0, 0);
  noseSlab.castShadow = true;
  group.add(noseSlab);

  // Narrow wedge tip — back face at 3.625, overlaps noseSlab front (3.7)
  const noseCap = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 1.5), armorMat);
  noseCap.position.set(3.85, -0.05, 0);
  group.add(noseCap);

  // ── Cockpit / Command pod ──────────────────────────────────────────────
  const cockpitBase = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.54, 1.55), armorMat);
  cockpitBase.position.set(2.1, 0.82, 0);
  cockpitBase.castShadow = true;
  group.add(cockpitBase);

  // Wraparound window strip along cockpit top
  const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.21, 1.5), windowMat);
  windowStrip.position.set(2.1, 0.97, 0);
  group.add(windowStrip);

  // Forward-face glass panel
  const frontWindow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.21, 0.9), windowMat);
  frontWindow.position.set(2.79, 0.97, 0);
  group.add(frontWindow);

  // Cockpit side accent lines
  [1, -1].forEach(sign => {
    const ca = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.04, 0.07), accentMat);
    ca.position.set(2.1, 0.89, sign * 0.78);
    group.add(ca);
  });

  // ── Shoulder armor panels (longitudinal, top edges) ───────────────────
  [1, -1].forEach(sign => {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.17, 0.42), armorMat);
    shoulder.position.set(-0.15, 0.64, sign * 1.75);
    group.add(shoulder);

    const pLine = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.04, 0.06), accentMat);
    pLine.position.set(-0.15, 0.73, sign * 1.56);
    group.add(pLine);
  });

  // Centre top accent strip
  const topStrip = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.04, 0.08), accentMat);
  topStrip.position.set(-0.15, 0.97, 0);
  group.add(topStrip);

  // ── Wings ──────────────────────────────────────────────────────────────
  [1, -1].forEach(sign => {
    // Thick root slab — shifted inward so inner edge (±1.375) overlaps fuselage (±1.4)
    const wingRoot = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, 0.95), wingMat);
    wingRoot.position.set(-0.55, -0.14, sign * 1.85);
    wingRoot.rotation.z = sign * 0.1;
    wingRoot.castShadow = true;
    group.add(wingRoot);

    // Thinner tapered tip — inner edge overlaps wingRoot outer edge (±2.325)
    const wingTip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.11, 0.55), wingMat);
    wingTip.position.set(-0.85, -0.27, sign * 2.75);
    wingTip.rotation.z = sign * 0.18;
    wingTip.castShadow = true;
    group.add(wingTip);

    // Leading-edge accent line — runs along wing root
    const wStripe = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.07), accentMat);
    wStripe.position.set(-0.6, 0.02, sign * 1.85);
    group.add(wStripe);

    // Wing-tip nacelle pod — butted flush against wing tip outer edge (±3.025 + r 0.24 = ±3.27)
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.55, 10), hullMat);
    nacelle.rotation.z = Math.PI / 2;
    nacelle.position.set(-0.8, -0.28, sign * 3.27);
    nacelle.castShadow = true;
    group.add(nacelle);

    // Nacelle rear glow ring
    const nacRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 8, 20), accentMat);
    nacRing.position.set(-1.58, -0.28, sign * 3.27);
    group.add(nacRing);

    // Nacelle exhaust cone
    const nacGlow = new THREE.Mesh(
      new THREE.ConeGeometry(0.20, 0.5, 10, 1, true),
      thrusterMat.clone()
    );
    nacGlow.rotation.z = Math.PI / 2;
    nacGlow.position.set(-1.9, -0.28, sign * 3.27);
    group.add(nacGlow);
    thrusterMeshes.push(nacGlow);

    const nacLight = new THREE.PointLight(0x9900ff, 0.9, 3.5);
    nacLight.position.set(-2.05, -0.28, sign * 3.27);
    group.add(nacLight);
  });

  // ── Rear engine block ──────────────────────────────────────────────────
  const rearBlock = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.0, 2.55), armorMat);
  rearBlock.position.set(-2.7, 0.0, 0);
  rearBlock.castShadow = true;
  group.add(rearBlock);

  // Thin accent border framing the engine face
  const rearBorder = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 2.44), accentMat);
  rearBorder.position.set(-3.27, 0.0, 0);
  group.add(rearBorder);

  // 4 engine nozzles in a 2×2 grid on rear face
  [[0.65, 0.26], [0.65, -0.26], [-0.65, 0.26], [-0.65, -0.26]].forEach(([dz, dy]) => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.21, 0.4, 10), hullMat);
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(-3.15, dy, dz);
    group.add(nozzle);

    const exhaustGlow = new THREE.Mesh(
      new THREE.ConeGeometry(0.21, 0.65, 10, 1, true),
      thrusterMat.clone()
    );
    exhaustGlow.rotation.z = Math.PI / 2;
    exhaustGlow.position.set(-3.62, dy, dz);
    group.add(exhaustGlow);
    thrusterMeshes.push(exhaustGlow);

    const eLight = new THREE.PointLight(0x9900ff, 0.75, 2.5);
    eLight.position.set(-3.8, dy, dz);
    group.add(eLight);
  });

  // ── Underbelly armor ──────────────────────────────────────────────────
  const belly = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.19, 2.3), armorMat);
  belly.position.set(-0.3, -0.645, 0);
  belly.receiveShadow = true;
  group.add(belly);

  // Cargo bay cavity recess in belly
  const bayRecess = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.65), bayMat);
  bayRecess.position.set(-0.5, -0.74, 0);
  group.add(bayRecess);

  // ── Vertical tail fin ─────────────────────────────────────────────────
  const stabFin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.75, 0.1), wingMat);
  stabFin.position.set(-1.55, 1.12, 0);
  group.add(stabFin);

  const finAccent = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.06), accentMat);
  finAccent.position.set(-1.55, 1.52, 0);
  group.add(finAccent);

  // ── Navigation lights (nose tip) ──────────────────────────────────────
  const navGeo  = new THREE.SphereGeometry(0.07, 6, 6);
  const portMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: new THREE.Color(0x00ff88), emissiveIntensity: 2.5 });
  const stbdMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: new THREE.Color(0xff4400), emissiveIntensity: 2.5 });
  const portNav = new THREE.Mesh(navGeo, portMat);
  portNav.position.set(3.55, -0.08, 0.42);
  group.add(portNav);
  const stbdNav = new THREE.Mesh(navGeo, stbdMat);
  stbdNav.position.set(3.55, -0.08, -0.42);
  group.add(stbdNav);

  // ── Beacon — sits on top of the vertical fin tip ─────────────────────
  // fin centre (-1.55, 1.12), half-height 0.375 → fin top ≈ 1.495
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 8), accentMat);
  beacon.position.set(-1.55, 1.60, 0);
  group.add(beacon);
  const beaconLight = new THREE.PointLight(0xaa00ff, 0.8, 4);
  beaconLight.position.set(-1.55, 1.60, 0);
  group.add(beaconLight);

  // ── Transporter aperture ring (hull belly, always visible) ────────────
  // Positioned flush with belly bottom (local y ≈ −0.74)
  const apertureMat = new THREE.MeshStandardMaterial({
    color: 0x330055, emissive: new THREE.Color(0x220033), emissiveIntensity: 0.0,
    roughness: 0.35, metalness: 0.85,
  });
  const aperture = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 12, 32), apertureMat);
  aperture.rotation.x = Math.PI / 2;
  aperture.position.set(-0.5, -0.76, 0);
  group.add(aperture);

  // Inner iris detail rings
  [0.28, 0.14].forEach((r, i) => {
    const iris = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.03, 8, 24),
      apertureMat.clone()
    );
    iris.rotation.x = Math.PI / 2;
    iris.position.set(-0.5, -0.75 - i * 0.01, 0);
    group.add(iris);
  });

  // ── Transporter beam assembly ─────────────────────────────────────────
  // The beam hangs from local Y ≈ -0.76 (hull belly) downward.
  // BEAM_LENGTH covers the distance to the spawn-point ground below.
  const BEAM_LENGTH  = 3.0;
  const BEAM_TOP_Y   = -0.76;         // just below hull belly
  const BEAM_BOT_Y = BEAM_TOP_Y - BEAM_LENGTH;
  const BEAM_CTR_Y = BEAM_TOP_Y - BEAM_LENGTH * 0.5;

  const beamGroup = new THREE.Group();
  beamGroup.position.set(-0.5, 0, 0);  // align with aperture X
  group.add(beamGroup);

  // Main beam column (tapered cylinder, open-ended)
  const beamMat = new THREE.MeshStandardMaterial({
    color: 0x88ffff,
    emissive: new THREE.Color(0x44ddff),
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beamColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.38, BEAM_LENGTH, 18, 1, true),
    beamMat
  );
  beamColumn.position.y = BEAM_CTR_Y;
  beamGroup.add(beamColumn);

  // Scan rings (slide from top to bottom, loop continuously)
  const N_RINGS   = 5;
  const scanRings = [];
  for (let i = 0; i < N_RINGS; i++) {
    const rm = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0x99eeff),
      emissiveIntensity: 3.5,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 28), rm);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = BEAM_TOP_Y;
    beamGroup.add(ring);
    scanRings.push({ mesh: ring, mat: rm, phase: i / N_RINGS });
  }

  // Materialization pad — disc + outer ring at spawn ground level
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x44aaff,
    emissive: new THREE.Color(0x22aaff),
    emissiveIntensity: 2.2,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const matPad = new THREE.Mesh(new THREE.CircleGeometry(0.55, 36), padMat);
  matPad.rotation.x = -Math.PI / 2;
  matPad.position.y = BEAM_BOT_Y + 0.05;
  beamGroup.add(matPad);

  const padRingMat = new THREE.MeshStandardMaterial({
    color: 0xccffff,
    emissive: new THREE.Color(0x88eeff),
    emissiveIntensity: 3.0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const matRingMesh = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.055, 8, 36), padRingMat);
  matRingMesh.rotation.x = Math.PI / 2;
  matRingMesh.position.y = BEAM_BOT_Y + 0.06;
  beamGroup.add(matRingMesh);

  // Sparkle particles (small spheres drifting along the beam)
  const N_SPARKS  = 9;
  const sparkMat  = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xaaffff),
    emissiveIntensity: 4.0,
    transparent: true,
    opacity: 0,
  });
  const sparkles = [];
  for (let i = 0; i < N_SPARKS; i++) {
    const sm = sparkMat.clone();
    const s  = new THREE.Mesh(new THREE.SphereGeometry(0.038, 5, 5), sm);
    beamGroup.add(s);
    sparkles.push({
      mesh: s, mat: sm,
      phase:  (i / N_SPARKS) * Math.PI * 2,
      speed:  0.7 + Math.random() * 1.1,
      angle:  Math.random() * Math.PI * 2,
      radius: 0.06 + Math.random() * 0.22,
    });
  }

  // Dynamic point light at pad level
  const beamLight = new THREE.PointLight(0x44aaff, 0, 7);
  beamLight.position.y = BEAM_BOT_Y;
  beamGroup.add(beamLight);

  // ── State ─────────────────────────────────────────────────────────────
  let t = 0;
  let baseY = 0;
  let bayState = 'closed';   // 'closed' | 'opening' | 'active' | 'closing'
  let beamOpacity = 0;

  const BEAM_MAX_OPACITY = 0.82;
  const FADE_SPEED = 2.2;   // opacity units per second

  function openBay()  { if (bayState === 'closed')  bayState = 'opening'; }
  function closeBay() { if (bayState === 'active' || bayState === 'opening') bayState = 'closing'; }

  function _applyBeamOpacity(op) {
    beamMat.opacity = op * 0.72;
    apertureMat.emissiveIntensity = op * 3.5;
    beamLight.intensity = op * 4.0;

    scanRings.forEach(({ mat }) => { mat.opacity = op * 0.88; });
    padMat.opacity = op * 0.65;
    padRingMat.opacity = op * (0.55 + Math.sin(t * 4.5) * 0.22);
  }

  function update(delta) {
    t += delta;

    // Hover bob & gentle yaw sway
    group.position.y = baseY + Math.sin(t * 0.9) * 0.12;
    group.rotation.y = Math.sin(t * 0.45) * 0.06;

    // Thruster glow pulse
    thrusterMeshes.forEach(g => {
      g.material.emissiveIntensity = 1.5 + Math.sin(t * 4 + Math.random() * 0.1) * 0.5;
    });
    beaconLight.intensity = 0.7 + Math.sin(t * 3.5) * 0.4;

    // ── Beam state machine ──────────────────────────────────────────────
    if (bayState === 'opening') {
      beamOpacity = Math.min(BEAM_MAX_OPACITY, beamOpacity + delta * FADE_SPEED);
      if (beamOpacity >= BEAM_MAX_OPACITY) bayState = 'active';
    } else if (bayState === 'closing') {
      beamOpacity = Math.max(0, beamOpacity - delta * FADE_SPEED);
      if (beamOpacity <= 0) bayState = 'closed';
    } else if (bayState === 'closed') {
      beamOpacity = 0;
    }

    _applyBeamOpacity(beamOpacity);

    if (bayState !== 'closed') {
      // Scan rings: each slides top→bottom, then teleports back to top
      scanRings.forEach(({ mesh, phase }) => {
        const frac = ((t * 0.75 + phase) % 1.0);
        mesh.position.y = BEAM_TOP_Y - frac * BEAM_LENGTH;
      });

      // Sparkles drift along the beam with a helical orbit
      sparkles.forEach(sp => {
        const frac  = ((t * sp.speed + sp.phase / (Math.PI * 2)) % 1.0);
        const angle = sp.angle + t * 1.4;
        sp.mesh.position.set(
          Math.cos(angle) * sp.radius,
          BEAM_TOP_Y - frac * BEAM_LENGTH,
          Math.sin(angle) * sp.radius,
        );
        sp.mat.opacity = beamOpacity * frac * (1.0 - frac) * 3.8;
      });

      // Aperture iris pulse
      apertureMat.emissive.setHSL(0.55, 1.0, 0.3 + Math.sin(t * 6) * 0.15);
    } else {
      sparkles.forEach(sp => { sp.mat.opacity = 0; });
    }
  }

  function setBaseY(y) { baseY = y; }

  return { mesh: group, update, openBay, closeBay, setBaseY };
}
