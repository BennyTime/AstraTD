import * as THREE from 'three';

// ─── Board surface texture ─────────────────────────────────────────────────────
function buildBoardTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0e1c10';
  ctx.fillRect(0, 0, size, size);

  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.52);
  g.addColorStop(0, 'rgba(52, 118, 64, 0.88)');
  g.addColorStop(0.35, 'rgba(34, 88, 44, 0.65)');
  g.addColorStop(0.65, 'rgba(16, 40, 20, 0.35)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.00)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const ag = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.30);
  ag.addColorStop(0, 'rgba(120, 80, 20, 0.22)');
  ag.addColorStop(1, 'rgba(0, 0, 0, 0.00)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 160; i++) {
    const a = i * 2.399;
    const rad = Math.sqrt(i / 160) * size * 0.46;
    const x = size/2 + Math.cos(a) * rad;
    const y = size/2 + Math.sin(a) * rad;
    const alpha = 0.07 + (i % 7) * 0.022;
    ctx.fillStyle = (i % 3 === 0) ? `rgba(30,18,6,${alpha})` : `rgba(55,110,35,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 70; i++) {
    const a = i * 2.399;
    const rad = Math.sqrt((i + 4) / 74) * size * 0.38;
    ctx.fillStyle = `rgba(80,200,70,${(0.07 + (i % 6) * 0.022).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(size/2 + Math.cos(a) * rad, size/2 + Math.sin(a) * rad, 1.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

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

// ─── BoardSlab ────────────────────────────────────────────────────────────────
/**
 * The floating platform: main slab, underside bevel panels, top edge accent
 * strips, support pillars, corner tech boxes, and ambient point lights.
 * Exposes `mesh` and an `update(delta)` for pulsing animations.
 *
 * @param {{ width?: number, height?: number, depth?: number }} options
 */
export class BoardSlab {
  constructor({ width = 24, height = 0.6, depth = 16 } = {}) {
    this._W = width;
    this._H = height;
    this._D = depth;
    this.mesh = new THREE.Group();
    this._t = 0;

    // Set in _build; referenced in update()
    this._cyanAccentMat  = null;
    this._greenAccentMat = null;
    this._lights = {};

    this._build();
  }

  _build() {
    const { _W: W, _H: H, _D: D, mesh } = this;

    // ── Main slab ──────────────────────────────────────────────────────────
    const slabMat = new THREE.MeshStandardMaterial({
      map: buildBoardTexture(), roughness: 0.75, metalness: 0.18, color: 0x1e3e26,
    });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), slabMat);
    slab.receiveShadow = slab.castShadow = true;
    mesh.add(slab);

    // ── Underside bevel panels ─────────────────────────────────────────────
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
      mesh.add(m);
    });

    // ── Top edge accent strips ─────────────────────────────────────────────
    const greenAccentMat = new THREE.MeshStandardMaterial({
      color: 0x44ff88, emissive: new THREE.Color(0x44ff88), emissiveIntensity: 0.55, roughness: 0.22,
    });
    const cyanAccentMat = new THREE.MeshStandardMaterial({
      color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 0.65, roughness: 0.20,
    });
    this._cyanAccentMat  = cyanAccentMat;
    this._greenAccentMat = greenAccentMat;

    [
      { sx: W, sz: 0.05, px: 0, pz: D/2, m: greenAccentMat },
      { sx: W, sz: 0.05, px: 0, pz: -D/2, m: greenAccentMat },
      { sx: 0.05, sz: D, px:  W/2, pz: 0, m: cyanAccentMat  },
      { sx: 0.05, sz: D, px: -W/2, pz: 0, m: cyanAccentMat  },
    ].forEach(({ sx, sz, px, pz, m }) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.08, sz), m);
      strip.position.set(px, H/2 + 0.04, pz);
      mesh.add(strip);
    });

    // ── Support pillars ────────────────────────────────────────────────────
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0a1810, roughness: 0.5, metalness: 0.8 });
    [
      [-W/2 + 1.5, D/2 - 1.5],
      [W/2 - 1.5, D/2 - 1.5],
      [-W/2 + 1.5, -D/2 + 1.5],
      [W/2 - 1.5, -D/2 + 1.5],
      [0, 0],
    ].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 5, 8), pillarMat);
      pillar.position.set(px, -H/2 - 2.5, pz);
      pillar.castShadow = true;
      mesh.add(pillar);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.04, 8, 24),
        new THREE.MeshStandardMaterial({
          color: 0x46d4ff,
          emissive: new THREE.Color(0x46d4ff),
          emissiveIntensity: 1.5,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(px, -H/2 - 0.05, pz);
      mesh.add(ring);
    });

    // ── Corner tech boxes ──────────────────────────────────────────────────
    const techBoxMat = new THREE.MeshStandardMaterial({ color: 0x102035, roughness: 0.5, metalness: 0.7 });
    const screenMat  = new THREE.MeshStandardMaterial({
      color: 0x46d4ff, emissive: new THREE.Color(0x46d4ff), emissiveIntensity: 0.8, roughness: 0.3,
    });
    [[-W/2+1, D/2-1], [W/2-1, D/2-1], [-W/2+1, -D/2+1], [W/2-1, -D/2+1]].forEach(([px, pz]) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), techBoxMat);
      box.position.set(px, H/2 + 0.2, pz);
      box.castShadow = box.receiveShadow = true;
      mesh.add(box);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), screenMat);
      screen.position.set(px, H/2 + 0.46, pz);
      mesh.add(screen);
    });

    // ── Point lights ──────────────────────────────────────────────────────
    const amberGlow = new THREE.PointLight(0xffaa44, 2.2, 28);
    amberGlow.position.set(-4, 2.2, 1);
    mesh.add(amberGlow);

    const amberGlow2 = new THREE.PointLight(0xff8822, 1.8, 22);
    amberGlow2.position.set(7, 2.0, -2);
    mesh.add(amberGlow2);

    const greenGlow = new THREE.PointLight(0x44ff88, 2.2, 34);
    greenGlow.position.set(0, 2.8, 0);
    mesh.add(greenGlow);

    const glow1 = new THREE.PointLight(0x46d4ff, 1.4, 28);
    glow1.position.set(0, 2.0, 0);
    mesh.add(glow1);

    this._lights = { amberGlow, amberGlow2, greenGlow, glow1 };
  }

  update(delta) {
    this._t += delta;
    const { _t: t, _cyanAccentMat: cyan, _greenAccentMat: green, _lights: l } = this;
    const pulse = 0.82 + Math.sin(t * 1.4) * 0.28;
    cyan.emissiveIntensity = pulse * 2.0;
    green.emissiveIntensity = 1.60 + Math.sin(t * 1.0 + 0.8) * 0.50;
    l.glow1.intensity = 1.20 + Math.sin(t * 1.2) * 0.30;
    l.greenGlow.intensity = 1.90 + Math.sin(t * 0.85 + 1.0) * 0.45;
    l.amberGlow.intensity = 1.80 + Math.sin(t * 0.70 + 2.0) * 0.45;
    l.amberGlow2.intensity = 1.40 + Math.sin(t * 0.90 + 0.5) * 0.35;
  }
}
