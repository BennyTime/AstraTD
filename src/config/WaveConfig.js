export const WaveConfig = [
  { spawnInterval: 1200, enemies: [
    { type: 'standard', count: 6 },
  ]},
  { spawnInterval: 1100, enemies: [
    { type: 'standard', count: 10 },
  ]},
  { spawnInterval: 1000, enemies: [
    { type: 'standard', count: 4 },
    { type: 'fast', count: 4 },
  ]},
  { spawnInterval: 900, enemies: [
    { type: 'fast', count: 6 },
    { type: 'tank', count: 4 },
  ]},
  { spawnInterval: 1000, enemies: [
    { type: 'tank', count: 4 },
    { type: 'healer', count: 4 },
  ]},
  { spawnInterval: 950, enemies: [
    { type: 'tank', count: 4 },
    { type: 'healer', count: 4 },
    { type: 'disruptor', count: 2 },
  ]},
  { spawnInterval: 320, enemies: [
    { type: 'standard', count: 20 },
    { type: 'disruptor', count: 4  },
  ]},
  { spawnInterval: 750, enemies: [
    { type: 'fast', count: 10 },
    { type: 'disruptor', count: 4  },
    { type: 'eximus', count: 4  },
  ]},
  { spawnInterval: 8000, enemies: [
    { type: 'duck', count: 1 },
  ]},
  { spawnInterval: 2000, enemies: [
    { type: 'boss', count: 1 },
  ]},
];