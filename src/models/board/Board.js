import * as THREE from 'three';
import { BoardSlab } from './components/BoardSlab.js';
import { Vegetation } from './components/Vegetation.js';
import { GreenhouseFrame } from './components/GreenhouseFrame.js';
import { Road } from './Road.js';

/**
 * Board – assembles the full game board from its component classes.
 *
 * Pass a map definition object (see src/config/maps/) which specifies
 * board dimensions, enemy path waypoints, and vegetation layout.
 * Exposes `mesh` and an `update(delta)` for animations.
 *
 * @param {object} mapDef  Map definition (see e.g. Map1.js)
 */
export class Board {
  constructor(mapDef) {
    this.mesh = new THREE.Group();

    const width  = mapDef.width  ?? 24;
    const height = mapDef.height ?? 0.6;
    const depth  = mapDef.depth  ?? 16;

    this._slab  = new BoardSlab({ width, height, depth });
    this._road  = new Road(mapDef.waypoints);
    this._veg   = new Vegetation(mapDef.vegetation ?? {});
    this._frame = new GreenhouseFrame({ width, depth });

    this.mesh.add(this._slab.mesh);
    this.mesh.add(this._road.mesh);
    this.mesh.add(this._veg.mesh);
    this.mesh.add(this._frame.mesh);
  }

  update(delta) {
    this._slab.update(delta);
  }
}
