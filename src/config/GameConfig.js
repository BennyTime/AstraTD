// Central configuration for Astra TD

export const GameConfig = {
  // Board
  boardWidth: 24,
  boardDepth: 16,
  boardY: 0,

  // Path waypoints (XZ on the board, Y = boardY + tileHeight)
  pathWaypoints: [
    [-11, 0, 0],   // spawn (left edge)
    [-6,  0, 0],
    [-6,  0, -6],
    [ 0,  0, -6],
    [ 0,  0,  6],
    [ 6,  0,  6],
    [ 6,  0, -6],
    [10,  0, -6],  // => nexus (right edge)
  ],

  // Waves
  totalWaves:         5,      // waves required to win
  waveCooldown:    5000,      // ms between waves
  enemiesPerWave:     6,      // base count on wave 1
  enemiesPerWaveGrow: 2,      // +N enemies each wave
  spawnInterval:   1200,      // ms between enemy spawns

  // Economy
  startingGold: 200,
  killReward: 25,

  // Nexus
  nexusMaxHP: 200,

  // Towers
  laserTowerCost: 100,
  laserTowerRange: 6,
  laserTowerDamage: 15,
  laserTowerFireRate: 1.0, // shots per second

  // Enemies
  enemyBaseSpeed: 3.5,
  enemyBaseHP:    60,
};
