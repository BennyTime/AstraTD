// Central configuration for Astra TD
// Note: per-unit stats (HP, speed, damage, cost, etc.) live in the
// respective model files (StandardEnemyStats, LaserTurretStats, …).

import { Map1 } from './maps/Map1.js';

export const GameConfig = {
  // Active map — swap this to change the current map
  activeMap: Map1,

  // Board Y offset (shared game-world anchor, not map-specific)
  boardY: 0,

  // Waves  (composition is defined in WaveConfig.js)
  totalWaves: 10,
  waveCooldown: 5000,

  // Economy
  startingStardust: 20000,
  killReward: 25,

  // Nexus
  nexusMaxHP: 200,
};
