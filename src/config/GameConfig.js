import { Map1 } from './maps/Map1.js';
import { Map2 } from './maps/Map2.js';
import { Map3 } from './maps/Map3.js';

export const MAPS = [Map1, Map2, Map3];

export const GameConfig = {
  activeMap: Map3,
  boardY: 0,
  totalWaves: 10,
  waveCooldown: 5000,
  startingStardust: 200,
  killReward: 25,
  nexusMaxHP: 200,
};
