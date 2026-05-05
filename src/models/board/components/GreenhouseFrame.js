import * as THREE from 'three';

// ─── GreenhouseFrame ──────────────────────────────────────────────────────────
/**
 * Glass + metal perimeter frame along the north and south board edges.
 * Columns carry hanging vines. Exposes a single `mesh` (THREE.Group).
 *
 * @param {{ width?: number, depth?: number }} options
 */
export class GreenhouseFrame {
  constructor({ width = 24, depth = 16 } = {}) {
    this.mesh = new THREE.Group();
    this._build(width, depth);
  }

  _build(W, D) {
    const group = this.mesh;

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x2a4835, roughness: 0.42, metalness: 0.82,
      emissive: new THREE.Color(0x142818), emissiveIntensity: 0.30,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x99ffcc, transparent: true, opacity: 0.13,
      roughness: 0.04, metalness: 0.10, side: THREE.DoubleSide,
    });
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x44ff88,
      emissive: new THREE.Color(0x44ff88),
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });

    const wallH = 2.2;
    const baseY = 0.3;
    const colR = 0.058;
    const colXs = [-10, -4, 2, 8];
    const vineHues = [0x2d8038, 0x3a9848, 0x22782c, 0x50aa60, 0x5abc68];

    const halfW = W / 2;
    const panelSegs = [
      { x1: -halfW, x2: colXs[0] },
      { x1: colXs[0], x2: colXs[1] },
      { x1: colXs[1], x2: colXs[2] },
      { x1: colXs[2], x2: colXs[3] },
      { x1: colXs[3], x2: halfW },
    ];

    const wallZ = D / 2 - 0.2; // ±7.8 for default D=16

    [-wallZ, wallZ].forEach(wz => {
      // LED stubs at column bases
      colXs.forEach(cx => {
        const stub = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.10), ledMat);
        stub.position.set(cx, baseY + 0.025, wz);
        group.add(stub);
      });

      // Metal top rail
      const rail = new THREE.Mesh(new THREE.BoxGeometry(W, 0.075, 0.11), metalMat);
      rail.position.set(0, baseY + wallH, wz);
      group.add(rail);

      // Vertical columns + hanging vines
      colXs.forEach((cx, ci) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(colR, colR, wallH, 6), metalMat);
        col.position.set(cx, baseY + wallH / 2, wz);
        col.castShadow = true;
        group.add(col);

        const numStrands = 3 + (ci % 2);
        for (let s = 0; s < numStrands; s++) {
          const vx = cx + (s - (numStrands - 1) / 2) * 0.20;
          const vLen = 0.50 + (s % 3) * 0.32;
          const topY = baseY + wallH - 0.06;
          const vh = vineHues[(ci * 3 + s) % vineHues.length];
          const vm = new THREE.MeshStandardMaterial({ color: vh, roughness: 0.92, metalness: 0.0 });

          const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.007, vLen, 3), vm);
          strand.position.set(vx, topY - vLen / 2, wz + (s % 2 - 0.5) * 0.05);
          group.add(strand);

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
        const w = Math.abs(x2 - x1);
        const midX = (x1 + x2) / 2;
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, wallH - 0.14), glassMat);
        panel.position.set(midX, baseY + wallH / 2, wz);
        panel.rotation.y = wz > 0 ? 0 : Math.PI;
        group.add(panel);
      });
    });
  }
}
