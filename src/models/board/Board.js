import * as THREE from 'three';
import { createRoad } from './Road.js';

// ─── Board surface: organic green centre blending into tech circuit edge ──────

function buildBoardTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Dark green-brown base — visible, not pitch black
  ctx.fillStyle = '#0e1c10';
  ctx.fillRect(0, 0, size, size);

  // Rich organic green gradient from centre outward
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.52);
  g.addColorStop(0, 'rgba(52, 118, 64, 0.88)');
  g.addColorStop(0.35, 'rgba(34,  88, 44, 0.65)');
  g.addColorStop(0.65, 'rgba(16,  40, 20, 0.35)');
  g.addColorStop(1, 'rgba(0,    0,  0, 0.00)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Warm amber undertone near centre — the "golden light coming through glass" feel
  const ag = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.30);
  ag.addColorStop(0, 'rgba(120, 80, 20, 0.22)');
  ag.addColorStop(1, 'rgba(0,   0,  0, 0.00)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, 0, size, size);

  // Soil & moss speckle (golden-spiral, deterministic)
  for (let i = 0; i < 160; i++) {
    const a   = i * 2.399;
    const rad = Math.sqrt(i / 160) * size * 0.46;
    const x = size/2 + Math.cos(a) * rad;
    const y = size/2 + Math.sin(a) * rad;
    const alpha = 0.07 + (i % 7) * 0.022;
    ctx.fillStyle = (i % 3 === 0) ? `rgba(30,18,6,${alpha})` : `rgba(55,110,35,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright green organic dots — visible leaf-like spots
  for (let i = 0; i < 70; i++) {
    const a   = i * 2.399;
    const rad = Math.sqrt((i + 4) / 74) * size * 0.38;
    ctx.fillStyle = `rgba(80,200,70,${(0.07 + (i % 6) * 0.022).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(size/2 + Math.cos(a) * rad, size/2 + Math.sin(a) * rad, 1.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  // Very faint circuit traces only near the outer 15% of the board edge
  const gridStep = size / 12;
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const edge = Math.pow(Math.max(Math.abs(u - 0.5) * 2 - 0.70, 0) / 0.30, 2.2);
    const alpha = (edge * 0.10).toFixed(3);
    if (parseFloat(alpha) < 0.01) continue;
    ctx.strokeStyle = `rgba(70,212,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(i * gridStep, 0); ctx.lineTo(i * gridStep, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * gridStep); ctx.lineTo(size, i * gridStep); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.5);
  return tex;
}

// ─── Vegetation helpers ───────────────────────────────────────────────────────

// Grass tuft — deterministic blade positions so it looks consistent
function makeGrassTuft(cx, cz, hue = 0x52c46a) {
  const group = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: hue, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide });
  // [dx, dz, tiltZ, height, rotY]
  const blades = [
    [ 0.000, 0.000, 0.00, 0.14, 0.00],
    [ 0.080, 0.060, 0.28, 0.16, 0.28],
    [-0.070, 0.085, -0.22, 0.11, -0.18],
    [ 0.100, -0.040, -0.38, 0.18, 0.50],
    [-0.090, -0.075, 0.48, 0.12, -0.45],
    [ 0.040, 0.110, 0.75, 0.15, 0.80],
    [-0.055, -0.095, 1.18, 0.13, -0.72],
    [ 0.105, 0.030, 1.52, 0.10, 1.10],
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

// Small bush — sphere blobs on a stem (bigger, more visible)
function makeSmallBush(cx, cz, hue = 0x2d7838) {
  const group = new THREE.Group();
  // Slightly darker variant for depth blobs
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
    [-0.15, 0.13, -0.10, 0.20, lm],
    [0.03, 0.07, 0.18, 0.17, lm2],
    [-0.08, 0.30, 0.06, 0.15, lm],
  ].forEach(([dx, dy, dz, r, mat]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), mat);
    b.position.set(cx + dx, 0.55 + dy, cz + dz);
    b.castShadow = true;
    group.add(b);
  });
  return group;
}

// Low tech-planter box with soil + small sprigs
// Each call cycles through a vivid paint colour for variety
let _planterIdx = 0;
const _planterBoxColors = [0x1e5e50, 0x7a2e10, 0x2a4a7a, 0x5a3a10, 0x1a4a2a];
function makePlanterBox(cx, cz, rotY = 0) {
  const group = new THREE.Group();
  const boxColor = _planterBoxColors[(_planterIdx++) % _planterBoxColors.length];
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
    const h  = 0.10 + (i % 2) * 0.07;
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

// ─── Greenhouse perimeter frame ───────────────────────────────────────────────
// Glass + metal panels along the north (z=+7.8) and south (z=-7.8) board edges.
// Columns have hanging vines inspired by the reference city imagery.

function buildGreenhouseFrame() {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x2a4835, roughness: 0.42, metalness: 0.82,
    emissive: new THREE.Color(0x142818), emissiveIntensity: 0.30,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x99ffcc, transparent: true, opacity: 0.13,
    roughness: 0.04, metalness: 0.10, side: THREE.DoubleSide,
  });
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x44ff88, emissive: new THREE.Color(0x44ff88), emissiveIntensity: 2.2, roughness: 0.2,
  });

  const wallH  = 2.2;
  const baseY = 0.3;
  const colR = 0.058;  // thicker so they read clearly
  const colXs = [-10, -4, 2, 8];
  const vineHues = [0x2d8038, 0x3a9848, 0x22782c, 0x50aa60, 0x5abc68];

  const panelSegs = [
    { x1: -12, x2: -10 },
    { x1: -10, x2: -4 },
    { x1: -4, x2: 2 },
    { x1: 2, x2: 8 },
    { x1: 8, x2: 12 },
  ];

  [-7.8, 7.8].forEach(wz => {
    // LED stubs at column bases
    colXs.forEach(cx => {
      const stub = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.10), ledMat);
      stub.position.set(cx, baseY + 0.025, wz);
      group.add(stub);
    });

    // Metal top rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(24, 0.075, 0.11), metalMat);
    rail.position.set(0, baseY + wallH, wz);
    group.add(rail);

    // Vertical columns + hanging vines
    colXs.forEach((cx, ci) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(colR, colR, wallH, 6), metalMat);
      col.position.set(cx, baseY + wallH / 2, wz);
      col.castShadow = true;
      group.add(col);

      // Hanging vine strands from column top
      const numStrands = 3 + (ci % 2);
      for (let s = 0; s < numStrands; s++) {
        const vx   = cx + (s - (numStrands - 1) / 2) * 0.20;
        const vLen = 0.50 + (s % 3) * 0.32;   // 0.5 – 1.14 units hang down
        const topY = baseY + wallH - 0.06;
        const vh = vineHues[(ci * 3 + s) % vineHues.length];
        const vm = new THREE.MeshStandardMaterial({ color: vh, roughness: 0.92, metalness: 0.0 });

        const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.007, vLen, 3), vm);
        strand.position.set(vx, topY - vLen / 2, wz + (s % 2 - 0.5) * 0.05);
        group.add(strand);

        // Leaf blobs along strand
        const numLeaves = 2 + (s % 2);
        for (let l = 0; l < numLeaves; l++) {
          const ly = topY - (l + 0.7) * (vLen / (numLeaves + 0.5));
          const lr = 0.042 + (l % 2) * 0.025;
          const lh = vineHues[(ci + s + l + 1) % vineHues.length];
          const lm = new THREE.MeshStandardMaterial({ color: lh, roughness: 0.88, metalness: 0.0 });
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(lr, 5, 4), lm);
          leaf.position.set(
            vx + (l % 2 - 0.5) * 0.10,
            ly,
            wz + (s % 2 ? 0.07 : -0.07)
          );
          group.add(leaf);
        }
      }
    });

    // Glass panels between columns
    panelSegs.forEach(({ x1, x2 }) => {
      const w    = Math.abs(x2 - x1);
      const midX = (x1 + x2) / 2;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, wallH - 0.14), glassMat);
      panel.position.set(midX, baseY + wallH / 2, wz);
      panel.rotation.y = wz > 0 ? 0 : Math.PI;
      group.add(panel);
    });
  });

  return group;
}

// ─── Main Board ───────────────────────────────────────────────────────────────

/**
 * Creates the full game board: floating platform, organic interior,
 * greenhouse glass perimeter, and enemy path.
 *
 * @param {Array} waypoints  Array of [x,y,z] path nodes
 * @returns {{ mesh: THREE.Group, update: (delta:number)=>void }}
 */
export function createBoard(waypoints) {
  const group = new THREE.Group();
  const boardTex = buildBoardTexture();
  const W = 24, H = 0.6, D = 16;

  // ── Main slab ──────────────────────────────────────────────────────────────
  const slabMat = new THREE.MeshStandardMaterial({
    map: boardTex, roughness: 0.75, metalness: 0.18, color: 0x1e3e26,
  });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), slabMat);
  slab.receiveShadow = slab.castShadow = true;
  group.add(slab);

  // ── Underside bevel panels ─────────────────────────────────────────────────
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x071008, roughness: 0.7, metalness: 0.6 });
  const bevelH  = 0.18;
  [
    { sx: W - 0.2, sz: 0.25, px: 0, pz: D/2 - 0.12 },
    { sx: W - 0.2, sz: 0.25, px: 0, pz: -D/2 + 0.12 },
    { sx: 0.25, sz: D, px: W/2 - 0.12, pz: 0 },
    { sx: 0.25, sz: D, px: -W/2 + 0.12, pz: 0 },
  ].forEach(({ sx, sz, px, pz }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, bevelH, sz), edgeMat);
    m.position.set(px, -H/2 - bevelH/2, pz);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  });

  // ── Top edge accent strips ─────────────────────────────────────────────────
  // N/S edges (z-axis): green — marks the living interior boundary
  // E/W edges (x-axis): cyan  — tech boundary
  const greenAccentMat = new THREE.MeshStandardMaterial({
    color: 0x44ff88, emissive: new THREE.Color(0x44ff88), emissiveIntensity: 0.55, roughness: 0.22,
  });
  const cyanAccentMat  = new THREE.MeshStandardMaterial({
    color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 0.65, roughness: 0.20,
  });
  [
    { sx: W, sz: 0.05, px: 0, pz:  D/2, m: greenAccentMat },
    { sx: W, sz: 0.05, px: 0, pz: -D/2, m: greenAccentMat },
    { sx: 0.05, sz: D, px: W/2, pz: 0, m: cyanAccentMat  },
    { sx: 0.05, sz: D, px: -W/2, pz: 0, m: cyanAccentMat  },
  ].forEach(({ sx, sz, px, pz, m }) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.08, sz), m);
    strip.position.set(px, H/2 + 0.04, pz);
    group.add(strip);
  });

  // ── Support pillars ────────────────────────────────────────────────────────
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0a1810, roughness: 0.5, metalness: 0.8 });
  [
    [-W/2 + 1.5,  D/2 - 1.5],
    [ W/2 - 1.5,  D/2 - 1.5],
    [-W/2 + 1.5, -D/2 + 1.5],
    [ W/2 - 1.5, -D/2 + 1.5],
    [0, 0],
  ].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 5, 8), pillarMat);
    pillar.position.set(px, -H/2 - 2.5, pz);
    pillar.castShadow = true;
    group.add(pillar);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(px, -H/2 - 0.05, pz);
    group.add(ring);
  });

  // ── Path surface ───────────────────────────────────────────────────────────
  group.add(createRoad(waypoints));

  // ── Corner tech boxes ──────────────────────────────────────────────────────
  const techBoxMat = new THREE.MeshStandardMaterial({ color: 0x102035, roughness: 0.5, metalness: 0.7 });
  const screenMat  = new THREE.MeshStandardMaterial({
    color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 0.8, roughness: 0.3,
  });
  [[-W/2+1, D/2-1], [W/2-1, D/2-1], [-W/2+1, -D/2+1], [W/2-1, -D/2+1]].forEach(([px, pz]) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), techBoxMat);
    box.position.set(px, H/2 + 0.2, pz);
    box.castShadow = box.receiveShadow = true;
    group.add(box);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), screenMat);
    screen.position.set(px, H/2 + 0.46, pz);
    group.add(screen);
  });

  // ── Vegetation ─────────────────────────────────────────────────────────────
  // All positions chosen to avoid the path (centre ±1.1 units clear of each segment).
  // Grass tufts: [cx, cz, hue]
  [
    // Far-left top
    [-9.5, 4.5, 0x52c46a], [-10.2, 3.0, 0x45b85e], [-8.5, 5.5, 0x60d474],
    [-10.5, 5.8, 0x4cb968], [-8.0, 2.5, 0x58cc72],
    // Far-left bottom
    [-9.5, -4.5, 0x52c46a], [-10.2, -3.0, 0x45b85e], [-8.5, -5.5, 0x60d474],
    [-10.5, -5.8, 0x4cb968],
    // Left-centre top
    [-4.5, 4.0, 0x52c46a], [-3.5, 5.2, 0x4db86e], [-5.5, 3.0, 0x45b85e],
    [-3.0, 3.5, 0x60d474], [-4.0, 6.0, 0x52c46a],
    // Centre-right
    [3.0, 2.5, 0x52c46a], [2.5, -2.5, 0x45b85e], [2.5, -3.5, 0x60d474],
    [3.8, 1.0, 0x4db86e],
    // Far-right top
    [8.5, 2.0, 0x52c46a], [9.5, 2.5, 0x45b85e], [8.0, 2.0, 0x60d474],
    [10.5, 2.0, 0x4db86e],
    // Far-right bottom
    [8.5, -2.0, 0x52c46a], [9.5, -4.0, 0x45b85e], [10.0, -2.5, 0x4db86e],
  ].forEach(([cx, cz, hue]) => group.add(makeGrassTuft(cx, cz, hue)));

  // Small bushes: [cx, cz, hue]
  [
    [-9.0, 5.0, 0x2d7838], [-10.0, -4.0, 0x336b3e],
    [-4.0, 5.5, 0x2e8040], [3.5, 3.0, 0x2d7838],
    [8.5, 2.5, 0x336b3e], [9.0, -3.0, 0x2e8040],
  ].forEach(([cx, cz, hue]) => group.add(makeSmallBush(cx, cz, hue)));

  // Planter boxes: [cx, cz, rotY]
  [
    [-9.0, 3.0, 0.0],
    [-9.0, -3.0, 0.2],
    [ 7.5, 0.0, Math.PI / 2],
    [-3.5, 4.5, 0.2],
    [ 9.0, 3.0, 0.0],
  ].forEach(([cx, cz, ry]) => group.add(makePlanterBox(cx, cz, ry)));

  // ── Greenhouse glass frame (N/S walls) ────────────────────────────────────
  group.add(buildGreenhouseFrame());

  // ── Lighting ──────────────────────────────────────────────────────────────
  const amberGlow  = new THREE.PointLight(0xffaa44, 2.2, 28);
  amberGlow.position.set(-4, 2.2, 1);
  group.add(amberGlow);

  const amberGlow2 = new THREE.PointLight(0xff8822, 1.8, 22);
  amberGlow2.position.set(7, 2.0, -2);
  group.add(amberGlow2);

  // Green fill — organic interior
  const greenGlow = new THREE.PointLight(0x44ff88, 2.2, 34);
  greenGlow.position.set(0, 2.8, 0);
  group.add(greenGlow);

  // Cyan — tech edge
  const glow1 = new THREE.PointLight(0x46d4ff, 1.4, 28);
  glow1.position.set(0, 2.0, 0);
  group.add(glow1);

  // Animate: pulse accent strips + lights
  let t = 0;
  function update(delta) {
    t += delta;
    const pulse = 0.82 + Math.sin(t * 1.4) * 0.28;
    cyanAccentMat.emissiveIntensity = pulse * 2.0;
    greenAccentMat.emissiveIntensity = 1.60 + Math.sin(t * 1.0 + 0.8) * 0.50;
    glow1.intensity = 1.20 + Math.sin(t * 1.2) * 0.30;
    greenGlow.intensity = 1.90 + Math.sin(t * 0.85 + 1.0) * 0.45;
    amberGlow.intensity = 1.80 + Math.sin(t * 0.70 + 2.0) * 0.45;
    amberGlow2.intensity = 1.40 + Math.sin(t * 0.90 + 0.5) * 0.35;
  }

  return { mesh: group, update };
}
