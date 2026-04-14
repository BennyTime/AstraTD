export const GameConfig = {

    // Wave 1 (6 basic enemies)
    // Wave 2 (10 basic enemies)
    // Wave 3 (4 basic enemies, 4 fast enemies)
    // Wave 4 (6 fast enemies, 4 tank enemies)
    // Wave 5 (4 tank enemies, 4 healer enemies)
    // Wave 6 (4 tank enemies, 4 healer enemies, 2 disruptor enemies)
    // Wave 7 (20 basic enemies, 4 disruptor enemies [Enemies should be very close together, to enphasize the need to use the AOE tower])
    // Wave 8 (10 fast enemies, 4 disruptor enemies, 2 eximus enemies [on death, spawn 2 basic enemies])
    // Wave 9 (1 duck, its a duck, dont ask. it has 1 million HP and is immune to all damage, but it deals no damage. the fucking bird should quack a lot
    // and emote along the way. its just a fun meme wave to break the tension before the final boss)
    // Wave 10 (Final Wave) (Eximus, Father of the Valken)

    totalWaves: 10,
    waveCooldown: 5000,
    enemiesPerWave: 6,
    enemiesPerWaveGrow: 2,
    spawnInterval: 1200,
}