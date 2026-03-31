import * as THREE from 'three';

// ─── Shared material helpers ───────────────────────────────────────────────

const _matCache = {};
function mat(hex, opts = {}) {
  const key = `${hex}-${JSON.stringify(opts)}`;
  if (!_matCache[key]) {
    _matCache[key] = new THREE.MeshStandardMaterial({ color: hex, ...opts });
  }
  return _matCache[key];
}

// ─── Board tile procedural texture ────────────────────────────────────────

function buildBoardTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Dark base
  ctx.fillStyle = '#080d1f';
  ctx.fillRect(0, 0, size, size);

  // Grid lines (subtle)
  ctx.strokeStyle = 'rgba(70,212,255,0.12)';
  ctx.lineWidth = 1;
  const gridStep = size / 16;
  for (let i = 0; i <= 16; i++) {
    ctx.beginPath(); ctx.moveTo(i * gridStep, 0); ctx.lineTo(i * gridStep, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * gridStep); ctx.lineTo(size, i * gridStep); ctx.stroke();
  }

  // Hex circuit-like dots
  ctx.fillStyle = 'rgba(70,212,255,0.35)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Circuit traces
  ctx.strokeStyle = 'rgba(70,212,255,0.22)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(Math.random() * 16) * gridStep;
    const y = Math.floor(Math.random() * 16) * gridStep;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() > 0.5 ? gridStep * 2 : 0), y + (Math.random() > 0.5 ? gridStep * 2 : 0));
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

// ─── Path surface procedural texture ──────────────────────────────────────

function buildPathTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0d1426';
  ctx.fillRect(0, 0, size, size);

  // Dashed center line
  ctx.setLineDash([16, 10]);
  ctx.strokeStyle = 'rgba(255,140,0,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
  ctx.setLineDash([]);

  // Side edges
  ctx.strokeStyle = 'rgba(255,100,0,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 0, size - 16, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ─── Path geometry helper ─────────────────────────────────────────────────

function buildPathMesh(waypoints) {
  const group = new THREE.Group();
  const pathTex = buildPathTexture();

  const pathW  = 2.2;
  const pathH  = 0.05;
  const pathUp = 0.52;   // slight raise above board surface

  // Build path segments between consecutive waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = new THREE.Vector3(...waypoints[i]);
    const b = new THREE.Vector3(...waypoints[i + 1]);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const midX = (a.x + b.x) / 2;
    const midZ = (a.z + b.z) / 2;

    const isHoriz = Math.abs(dir.z) < 0.001;  // horizontal (X-aligned)
    const segW = isHoriz ? len : pathW;
    const segD = isHoriz ? pathW : len;

    const mat_ = new THREE.MeshStandardMaterial({
      map: pathTex,
      roughness: 0.55,
      metalness: 0.3,
      color: 0x1c2840,
    });

    const geo = new THREE.BoxGeometry(segW, pathH, segD);
    const seg = new THREE.Mesh(geo, mat_);
    seg.position.set(midX, pathUp, midZ);
    seg.receiveShadow = true;
    group.add(seg);

    // Glowing edge strips
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: new THREE.Color(0xff6600),
      emissiveIntensity: 0.8,
      roughness: 0.4,
    });
    const eGeo = new THREE.BoxGeometry(
      isHoriz ? len : 0.08,
      pathH * 1.2,
      isHoriz ? 0.08 : len
    );
    const e1 = new THREE.Mesh(eGeo, edgeMat); e1.position.set(midX, pathUp + 0.02, midZ + (isHoriz ? pathW / 2 - 0.04 : 0));
    const e2 = new THREE.Mesh(eGeo, edgeMat); e2.position.set(midX, pathUp + 0.02, midZ - (isHoriz ? pathW / 2 - 0.04 : 0));
    if (!isHoriz) {
      e1.position.set(midX + pathW / 2 - 0.04, pathUp + 0.02, midZ);
      e2.position.set(midX - pathW / 2 + 0.04, pathUp + 0.02, midZ);
    }
    group.add(e1, e2);
  }

  return group;
}

// ─── Main Board Model ─────────────────────────────────────────────────────

/**
 * Creates the full game board: floating futuristic platform + path.
 * @param {Array} waypoints  Array of [x,y,z] path nodes
 * @returns {{ mesh: THREE.Group, update: (delta:number)=>void }}
 */
export function createBoard(waypoints) {
  const group = new THREE.Group();

  const boardTex = buildBoardTexture();
  const W = 24, H = 0.6, D = 16;

  // ── Main platform slab ──
  const slabGeo = new THREE.BoxGeometry(W, H, D);
  const slabMat = new THREE.MeshStandardMaterial({
    map: boardTex,
    roughness: 0.65,
    metalness: 0.55,
    color: 0x0c1528,
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = 0;
  slab.receiveShadow = true;
  slab.castShadow   = true;
  group.add(slab);

  // ── Underside bevelled edge panels ──
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x0a1220, roughness: 0.7, metalness: 0.6 });
  const bevelH = 0.18;
  const borders = [
    { sx: W - 0.2, sz: 0.25, px: 0,        pz:  D / 2 - 0.12 },  // front
    { sx: W - 0.2, sz: 0.25, px: 0,        pz: -D / 2 + 0.12 },  // back
    { sx: 0.25,    sz: D,    px:  W / 2 - 0.12, pz: 0 },           // right
    { sx: 0.25,    sz: D,    px: -W / 2 + 0.12, pz: 0 },           // left
  ];
  borders.forEach(({ sx, sz, px, pz }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, bevelH, sz), edgeMat);
    m.position.set(px, -H / 2 - bevelH / 2, pz);
    m.receiveShadow = m.castShadow = true;
    group.add(m);
  });

  // ── Glowing cyan accent strips on top edges ──
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x46d4ff,
    emissive: new THREE.Color(0x46d4ff),
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  const accentStrips = [
    { sx: W, sz: 0.06, px: 0,        pz:  D / 2 },
    { sx: W, sz: 0.06, px: 0,        pz: -D / 2 },
    { sx: 0.06, sz: D, px:  W / 2,   pz: 0 },
    { sx: 0.06, sz: D, px: -W / 2,   pz: 0 },
  ];
  accentStrips.forEach(({ sx, sz, px, pz }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.08, sz), accentMat);
    m.position.set(px, H / 2 + 0.04, pz);
    group.add(m);
  });

  // ── Floating support pillars (4 corners + center) ──
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0e1830, roughness: 0.5, metalness: 0.8 });
  const pillarPositions = [
    [-W / 2 + 1.5,  D / 2 - 1.5],
    [ W / 2 - 1.5,  D / 2 - 1.5],
    [-W / 2 + 1.5, -D / 2 + 1.5],
    [ W / 2 - 1.5, -D / 2 + 1.5],
    [0, 0],
  ];
  pillarPositions.forEach(([px, pz]) => {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 5, 8), pillarMat);
    base.position.set(px, -H / 2 - 2.5, pz);
    base.castShadow = true;
    group.add(base);

    // glowing ring at top of pillar
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.04, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(px, -H / 2 - 0.05, pz);
    group.add(ring);
  });

  // ── Path surface ──
  group.add(buildPathMesh(waypoints));

  // ── Corner decorative tech boxes ──
  const techBoxMat = new THREE.MeshStandardMaterial({ color: 0x102035, roughness: 0.5, metalness: 0.7 });
  [[-W/2+1, D/2-1], [W/2-1, D/2-1], [-W/2+1, -D/2+1], [W/2-1, -D/2+1]].forEach(([px, pz]) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), techBoxMat);
    box.position.set(px, H / 2 + 0.2, pz);
    box.castShadow = box.receiveShadow = true;
    group.add(box);

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 0.8, roughness: 0.3
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), screenMat);
    screen.position.set(px, H / 2 + 0.46, pz);
    group.add(screen);
  });

  // ── Point lights for the board glow ──
  const glow1 = new THREE.PointLight(0x46d4ff, 0.6, 18);
  glow1.position.set(0, 2, 0);
  group.add(glow1);

  // Animate: pulse edge glow
  let t = 0;
  function update(delta) {
    t += delta;
    const pulse = 0.8 + Math.sin(t * 1.5) * 0.3;
    accentMat.emissiveIntensity = pulse;
    glow1.intensity = 0.4 + Math.sin(t * 1.2) * 0.15;
  }

  return { mesh: group, update };
}
