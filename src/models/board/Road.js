import * as THREE from 'three';

const _texLoader = new THREE.TextureLoader();
const _roadTex = (() => {
  const t = _texLoader.load('src/textures/material/road.jpg');
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();

function roadMat(repU, repV, color) {
  const tex = _roadTex.clone();
  tex.repeat.set(repU, repV);
  tex.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.05, color });
}

const _PATH_THEMES = {
  greenhouse: {
    bg: '#0d1426',
    dashColor: 'rgba(255,140,0,0.55)',
    borderColor: 'rgba(255,100,0,0.3)',
    matColor: 0x22304a,
    matEmissive: 0x331800,
    matEmissiveIntensity: 0.18,
  },
  industrial: {
    bg: '#060a10',
    dashColor: 'rgba(70,212,255,0.65)',
    borderColor: 'rgba(0,180,255,0.28)',
    matColor: 0x0e1a28,
    matEmissive: 0x001828,
    matEmissiveIntensity: 0.25,
  },
};

function buildPathTexture(theme = 'greenhouse') {
  const p = _PATH_THEMES[theme] ?? _PATH_THEMES.greenhouse;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, size, size);

  ctx.setLineDash([16, 10]);
  ctx.strokeStyle = p.dashColor;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = p.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 0, size - 16, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export class Road {
  constructor(waypoints, theme = 'greenhouse') {
    this.mesh = new THREE.Group();
    this._build(waypoints, theme);
  }

  _build(waypoints, theme) {
    const group = this.mesh;
    const p = _PATH_THEMES[theme] ?? _PATH_THEMES.greenhouse;
    const pathTex = buildPathTexture(theme);
    const pathW = 2.2;
    const pathH = 0.02;
    const pathUp = 0.31;
    const matColor = 0x888888;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = new THREE.Vector3(...waypoints[i]);
      const b = new THREE.Vector3(...waypoints[i + 1]);
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      const midX = (a.x + b.x) / 2;
      const midZ = (a.z + b.z) / 2;
      const isH = Math.abs(dir.z) < 0.001;
      const segW = isH ? len : pathW;
      const segD = isH ? pathW : len;
      const repU = segW / pathW;
      const repV = segD / pathW;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(segW, pathH, segD), roadMat(repU, repV, matColor));
      seg.position.set(midX, pathUp, midZ);
      seg.receiveShadow = true;
      group.add(seg);
    }

    for (let i = 1; i < waypoints.length - 1; i++) {
      const wp = waypoints[i];
      const corner = new THREE.Mesh(new THREE.BoxGeometry(pathW, pathH, pathW), roadMat(1, 1, matColor));
      corner.position.set(wp[0], pathUp, wp[2]);
      corner.receiveShadow = true;
      group.add(corner);
    }
  }
}
