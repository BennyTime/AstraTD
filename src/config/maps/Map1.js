// Map 1 – "Greenhouse Station" (the default map)
// Contains all map-specific data: board dimensions, enemy path, and
// vegetation layout. Add more maps by exporting similar objects from
// new files in this folder and setting GameConfig.activeMap.

export const Map1 = {
  name: 'Greenhouse Station',

  // Board platform dimensions
  width: 24,
  height: 0.6,
  depth: 16,

  // Enemy path waypoints [x, y, z]
  waypoints: [
    [-11, 0, 0],
    [-4, 0, 0],
    [-4, 0, -5],
    [5, 0, -5],
    [5, 0, 5],
    [11, 0, 5],
  ],

  // Vegetation placed on the board.
  // Positions are chosen to avoid the path (clear ±1.1 units from each segment).
  vegetation: {
    // [cx, cz, hue]
    grassTufts: [
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
      [3.0, 2.5, 0x52c46a], [4.5, -2.5, 0x45b85e], [ 2.5, -3.5, 0x60d474],
      [3.8, 1.0, 0x4db86e],
      // Far-right top
      [8.5,  2.0, 0x52c46a], [9.5, 2.5, 0x45b85e], [8.0, 2.0, 0x60d474],
      [10.5,  2.0, 0x4db86e],
      // Far-right bottom
      [ 8.5, -2.0, 0x52c46a], [9.5, -4.0, 0x45b85e], [10.0, -2.5, 0x4db86e],
    ],
    // [cx, cz, hue]
    bushes: [
      [-9.0, 5.0, 0x2d7838], [-10.0, -4.0, 0x336b3e],
      [-4.0, 5.5, 0x2e8040], [3.5, 3.0, 0x2d7838],
      [8.5, 2.5, 0x336b3e], [9.0, -3.0, 0x2e8040],
    ],
    // [cx, cz, rotY]
    planters: [
      [-9.0, 3.0, 0.0],
      [-9.0, -3.0, 0.2],
      [7.5, 0.0, Math.PI / 2],
      [-3.5, 4.5, 0.2],
      [9.0, 3.0, 0.0],
    ],
  },
};
