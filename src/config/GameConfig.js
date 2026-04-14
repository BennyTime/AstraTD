// Central configuration for Astra TD

export const GameConfig = {
  // Board
  boardWidth: 24,
  boardDepth: 16,
  boardY: 0,

  // Path waypoints (XZ on the board, Y = boardY + tileHeight)
  pathWaypoints: [
    [-11, 0, 0],
    [-4, 0, 0],
    [-4, 0, -5],
    [5, 0, -5],
    [5, 0, 5],
    [11, 0, 5],
  ],

  // Waves
  totalWaves: 5,
  waveCooldown: 5000,
  enemiesPerWave: 6,
  enemiesPerWaveGrow: 2,
  spawnInterval: 1200,
  
  // Economy
  startingStardust: 200,
  killReward: 25,

  // Nexus
  nexusMaxHP: 200,

  // Towers
  laserTowerCost: 100,
  laserTowerRange: 6,
  laserTowerDamage: 15,
  laserTowerFireRate: 1.0,

  // Enemies
  enemyBaseSpeed: 20,
  enemyBaseHP: 60,
  enemyBaseDamage: 200,
};
