# Astra TD - ICG + Game Logic Todo

## GitHub Issues Backlog

### 14. [Logic] Add enemy archetypes (fast, tank, balanced)
- Scope: Implement 3 enemy types with distinct gameplay behavior.
- Labels: `game-logic`, `priority:medium`, `milestone:final`
- Done when: differences are noticeable in speed/survivability pressure.

### 15. [Logic] Implement Pulse Tower with distinct mechanic
- Scope: Add second tower with behavior different from Laser (AoE or burst timing).
- Labels: `game-logic`, `priority:medium`, `milestone:final`
- Done when: Pulse creates a valid strategic alternative.

### 16. [ICG] Add destruction and nexus damage feedback
- Scope: Create enemy destruction animation and nexus visual reaction on hit.
- Labels: `icg`, `audio-vfx`, `priority:medium`, `milestone:final`
- Done when: both events are clearly visible and timed with gameplay events.

### 17. [Logic] Add win/lose flow, restart, and baseline balance
- Scope: Implement end states, restart flow, and first balancing pass for wave curve.
- Labels: `game-logic`, `ui`, `priority:high`, `milestone:final`
- Done when: full match loop is playable without manual resets.

### 19. [Delivery] Web deployment + self-contained setup
- Scope: Ensure project runs from web host and setup is reproducible on another machine.
- Labels: `delivery`, `docs`, `priority:high`, `milestone:final`
- Done when: a clean clone can run following README instructions.

### 20. [Delivery] Add references and AI usage acknowledgements
- Scope: Document non-original assets/libraries and AI usage in README/code/slides.
- Labels: `delivery`, `docs`, `ai-disclosure`, `priority:high`, `milestone:final`
- Done when: compliance text is present and consistent across deliverables.

### 23. [ICG] Model second tower (Pulse) with hierarchical primitives
- Scope: Build Pulse Tower model from primitives, consistent with the Laser model style.
- Labels: `icg`, `priority:medium`, `milestone:final`
- Done when: Pulse model is integrated and animation-ready in scene.

### 24. [ICG] Model remaining enemy archetypes (fast + tank)
- Scope: Build the fast and tank enemy models with distinct silhouettes and matching visual language.
- Labels: `icg`, `priority:medium`, `milestone:final`
- Done when: all 3 enemy archetype models are present and visually distinguishable.

### 26. [Logic] Add debug hotkeys for development
- Scope: Add optional debug controls (for example: spawn enemy, add money, skip wave) for testing flows faster.
- Labels: `game-logic`, `priority:low`, `milestone:final`
- Done when: debug shortcuts are available in dev mode and do not interfere with normal play.

### 27. [Performance] Optimization and frame-time stability pass
- Scope: Optimize update/render hotspots, use pooling where useful, and remove avoidable allocations.
- Labels: `performance`, `priority:high`, `milestone:final`
- Done when: gameplay remains smooth during larger waves with stable frame times.

### 28. [Presentation] Prepare final presentation package
- Scope: Produce final slides + final video and align content with ICG criteria and implemented gameplay systems.
- Labels: `presentation`, `delivery`, `priority:high`, `milestone:final`
- Done when: final presentation assets are complete, rehearsed, and ready for submission/presentation.

## Implementation Order

### Phase 1: Intermediate Presentation (Apr 14/16)
1. `#1` Bootstrap project structure.
2. `#2` Implement game loop and `GameState`.
3. `#3` Build board and spline path.
4. `#4` Model Energy Nexus.
5. `#21` Model first tower (Laser).
6. `#22` Model first enemy archetype.
7. `#5` Set up lighting, shadows, and fog.
8. `#6` Define material language (metallic + emissive).
9. `#25` Environment texture and skybox pass.
10. `#7` Implement enemy base entity and spline movement.
11. `#8` Create wave manager + `SPACE` wave start.
12. `#9` Add raycast tower placement with validation.
13. `#10` Implement Laser Tower targeting and attack.
14. `#11` Add projectile/beam visuals and hit feedback.
15. `#12` Implement economy (costs + rewards).
16. `#13` Build HUD (health, wave, money, status).
17. `#18` Prepare intermediate presentation package.

### Phase 2: Final Delivery (May)
1. `#23` Model second tower (Pulse).
2. `#15` Implement Pulse Tower with distinct mechanic.
3. `#24` Model remaining enemy archetypes (fast + tank).
4. `#14` Add enemy archetypes behavior (fast, tank, balanced).
5. `#16` Add destruction and nexus damage feedback.
6. `#17` Add win/lose flow, restart, and baseline balance.
7. `#26` Add debug hotkeys for development.
8. `#27` Optimization and frame-time stability pass.
9. `#19` Web deployment + self-contained setup.
10. `#20` Add references and AI usage acknowledgements.
11. `#28` Prepare final presentation package.

### Dependency Notes
- Start `#10` only after `#7` and `#9` are functional.
- Start `#15` only after `#23` is integrated.
- Complete `#24` before finishing `#14` balancing/tuning.
- Keep `#27`, `#19`, `#20`, and `#28` near the end to avoid rework.



## Notes

make better UI for main menu, game (nexus HP, Money (change to stardust), Enemy/Wave count, Tower Shop).

New towers.
Organize the code better. board components should be their own class. Road should be separate as well to be called. 

Create extra maps. 2 more.
Board feels empty when it comes to grass.
Textures! lets add textures to the objects. to make it look beter
sfx - use epidemic sound or this https://alkakrab.itch.io/free-sci-fi-game-music-pack