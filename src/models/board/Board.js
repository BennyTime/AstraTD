import * as THREE from 'three';
import { BoardSlab } from './components/BoardSlab.js';
import { Vegetation } from './components/Vegetation.js';
import { GreenhouseFrame } from './components/GreenhouseFrame.js';
import { Road } from './Road.js';


export class Board {
  constructor(mapDef) {
    this.mesh = new THREE.Group();

    const width  = mapDef.width  ?? 24;
    const height = mapDef.height ?? 0.6;
    const depth  = mapDef.depth  ?? 16;
    const theme = mapDef.theme ?? 'greenhouse';

    this._slab  = new BoardSlab({
      width, height, depth,
      slabColor: mapDef.slabColor ?? 0x1e3e26,
      edgeColor: mapDef.edgeColor ?? 0x071008,
      theme,
    });
    this._road  = new Road(mapDef.waypoints, theme);
    this._veg   = new Vegetation(mapDef.vegetation ?? {});
    this.mesh.add(this._slab.mesh);
    this.mesh.add(this._road.mesh);
    this.mesh.add(this._veg.mesh);

    if ((mapDef.border ?? 'greenhouse') === 'greenhouse') {
      this._frame = new GreenhouseFrame({ width, depth });
      this.mesh.add(this._frame.mesh);
    }
  }

  update(delta) {
    this._slab.update(delta);
  }
}
