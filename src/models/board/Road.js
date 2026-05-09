import * as THREE from 'three';

function buildPathTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0d1426';
  ctx.fillRect(0, 0, size, size);

  ctx.setLineDash([16, 10]);
  ctx.strokeStyle = 'rgba(255,140,0,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = 'rgba(255,100,0,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 0, size - 16, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Road – generates the visual path surface that enemies walk on.
 *
 * Flat BoxGeometry segments are laid along axis-aligned waypoints, with
 * square corner-fill patches at every interior waypoint to close gaps.
 * Exposes a single `mesh` (THREE.Group) ready to add to the scene.
 *
 * @param {Array<[number,number,number]>} waypoints  Board waypoints [x,y,z]
 */
export class Road {
  constructor(waypoints) {
    this.mesh = new THREE.Group();
    this._build(waypoints);
  }

  _build(waypoints) {
    const group = this.mesh;
    const pathTex = buildPathTexture();
    const pathW = 2.2;
    const pathH = 0.02;
    const pathUp = 0.31; // tiny gap above board surface to prevent z-fighting

    const segMat = new THREE.MeshStandardMaterial({
      map: pathTex, roughness: 0.52, metalness: 0.25,
      color: 0x22304a,
      emissive: new THREE.Color(0x331800), emissiveIntensity: 0.18,
    });

    // Straight segments between consecutive waypoints
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

      const seg = new THREE.Mesh(new THREE.BoxGeometry(segW, pathH, segD), segMat);
      seg.position.set(midX, pathUp, midZ);
      seg.receiveShadow = true;
      group.add(seg);
    }

    // Square fill at every interior waypoint to close corner gaps
    for (let i = 1; i < waypoints.length - 1; i++) {
      const wp = waypoints[i];
      const corner = new THREE.Mesh(new THREE.BoxGeometry(pathW, pathH, pathW), segMat);
      corner.position.set(wp[0], pathUp, wp[2]);
      corner.receiveShadow = true;
      group.add(corner);
    }
  }
}
