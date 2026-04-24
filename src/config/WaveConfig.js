/**
 * WaveConfig – defines the enemy composition for each of the 10 waves.
 *
 * Each entry:
 *   spawnInterval  – ms between individual spawns (lower = faster / tighter wave)
 *   enemies        – array of { type, count } segments spawned in order
 *
 * Enemy types match the `type` field in each *EnemyStats object:
 *   'standard' | 'fast' | 'tank' | 'healer' | 'disruptor' | 'eximus' | 'duck' | 'boss'
 */
export const WaveConfig = [
  // ── Wave 1 – tutorial: basic infantry ───────────────────────────────────
  { spawnInterval: 1200, enemies: [
    { type: 'standard', count: 6 },
  ]},

  // ── Wave 2 – bigger standard push ────────────────────────────────────────
  { spawnInterval: 1100, enemies: [
    { type: 'standard', count: 10 },
  ]},

  // ── Wave 3 – introduction of fast scouts ─────────────────────────────────
  { spawnInterval: 1000, enemies: [
    { type: 'standard', count: 4 },
    { type: 'fast', count: 4 },
  ]},

  // ── Wave 4 – fast + armoured advance ─────────────────────────────────────
  { spawnInterval: 900, enemies: [
    { type: 'fast', count: 6 },
    { type: 'tank', count: 4 },
  ]},

  // ── Wave 5 – tanks + support healers ─────────────────────────────────────
  { spawnInterval: 1000, enemies: [
    { type: 'tank', count: 4 },
    { type: 'healer', count: 4 },
  ]},

  // ── Wave 6 – mixed threat: tank/healer/disruptor ──────────────────────────
  { spawnInterval: 950, enemies: [
    { type: 'tank', count: 4 },
    { type: 'healer', count: 4 },
    { type: 'disruptor', count: 2 },
  ]},

  // ── Wave 7 – swarm: tight blobs to punish single-target builds ────────────
  //    (very short spawnInterval = enemies clump together)
  { spawnInterval: 320, enemies: [
    { type: 'standard', count: 20 },
    { type: 'disruptor', count: 4  },
  ]},

  // ── Wave 8 – elite mix with spawners ─────────────────────────────────────
  { spawnInterval: 750, enemies: [
    { type: 'fast', count: 10 },
    { type: 'disruptor', count: 4  },
    { type: 'eximus', count: 4  },
  ]},

  // ── Wave 9 – THE DUCK (immune, 0 damage, pure chaos) ─────────────────────
  { spawnInterval: 8000, enemies: [
    { type: 'duck', count: 1 },
  ]},

  // ── Wave 10 – Final Boss: Eximus, Father of the Valken ───────────────────
  { spawnInterval: 2000, enemies: [
    { type: 'boss', count: 1 },
  ]},
];