# Astra TD - ICG + Game Logic Todo

## GitHub Issues Backlog

### 1. [Logic] Bootstrap project structure
- Scope: Create `src/core`, `src/entities`, `src/systems`, `src/ui`, `src/config`, plus entrypoint wiring.
- Labels: `game-logic`, `docs`, `priority:high`, `milestone:intermediate`
- Done when: folders exist and app boots without runtime errors.

### 2. [Logic] Implement game loop and `GameState`
- Scope: Add `update(delta)` flow and central state (`health`, `wave`, `money`, `gameOver`, `paused`).
- Labels: `game-logic`, `priority:high`, `milestone:intermediate`
- Done when: state updates every frame and is accessible across systems.

### 3. [ICG] Build board and spline path
- Scope: Create floating arena and define enemy route with `CatmullRomCurve3`.
- Labels: `icg`, `game-logic`, `priority:high`, `milestone:intermediate`
- Done when: path is visible/debuggable and usable by enemy movement.

### 4. [ICG] Model Energy Nexus (hierarchical primitives)
- Scope: Build nexus using primitive geometry and grouped transforms.
- Labels: `icg`, `priority:medium`, `milestone:intermediate`
- Done when: nexus model is placed at path end and clearly readable.

### 5. [ICG] Set up lighting, shadows, and fog
- Scope: Add directional + ambient light, enable/tune shadows, configure fog depth.
- Labels: `icg`, `priority:high`, `milestone:intermediate`
- Done when: scene has clear depth and shadow readability.

### 6. [ICG] Define material language (metallic + emissive)
- Scope: Create consistent materials for towers, enemies, and energy elements.
- Labels: `icg`, `priority:medium`, `milestone:intermediate`
- Done when: palette and material roles match README art direction.

### 7. [Logic] Implement enemy base entity and spline movement
- Scope: Add enemy stats (`hp`, `speed`, `damage`, `reward`) and movement along path.
- Labels: `game-logic`, `priority:high`, `milestone:intermediate`
- Done when: enemies reach end, damage nexus, and despawn correctly.

### 8. [Logic] Create wave manager + `SPACE` wave start
- Scope: Implement timed spawns, active wave state, and wave completion detection.
- Labels: `game-logic`, `priority:high`, `milestone:intermediate`
- Done when: pressing `SPACE` starts a valid wave and prevents double-start.

### 9. [Logic] Add raycast tower placement with validation
- Scope: Implement mouse placement and block invalid spots (path overlap + tower overlap).
- Labels: `game-logic`, `ui`, `priority:high`, `milestone:intermediate`
- Done when: valid/invalid placement behavior is deterministic.

### 10. [Logic] Implement Laser Tower targeting and attack
- Scope: Add in-range target acquisition, turret rotation, and damage output.
- Labels: `game-logic`, `priority:high`, `milestone:intermediate`
- Done when: Laser Tower reliably kills enemies in range.

### 11. [ICG][Logic] Add projectile/beam visuals and hit feedback
- Scope: Implement shot visuals and impact feedback tied to real damage events.
- Labels: `icg`, `game-logic`, `audio-vfx`, `priority:medium`, `milestone:intermediate`
- Done when: attack feels responsive and clearly communicated.

### 12. [Logic] Implement economy (costs + rewards)
- Scope: Add tower purchase cost, kill rewards, and money checks on placement.
- Labels: `game-logic`, `priority:medium`, `milestone:intermediate`
- Done when: player cannot place towers without enough currency.

### 13. [UI] Build HUD (health, wave, money, status)
- Scope: Add on-screen values and clear state messages.
- Labels: `ui`, `game-logic`, `priority:high`, `milestone:intermediate`
- Done when: HUD updates correctly in real time.

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

### 18. [Presentation] Prepare intermediate presentation package
- Scope: Create 7-minute script, map features to ICG topics, and record backup demo clip.
- Labels: `presentation`, `priority:high`, `milestone:intermediate`
- Done when: demo flow is rehearsed and fallback video is ready.

### 19. [Delivery] Web deployment + self-contained setup
- Scope: Ensure project runs from web host and setup is reproducible on another machine.
- Labels: `delivery`, `docs`, `priority:high`, `milestone:final`
- Done when: a clean clone can run following README instructions.

### 20. [Delivery] Add references and AI usage acknowledgements
- Scope: Document non-original assets/libraries and AI usage in README/code/slides.
- Labels: `delivery`, `docs`, `ai-disclosure`, `priority:high`, `milestone:final`
- Done when: compliance text is present and consistent across deliverables.

### 21. [ICG] Model first tower (Laser) with hierarchical primitives
- Scope: Build Laser Tower from primitives with clear parent-child structure for rotating/animated parts.
- Labels: `icg`, `priority:high`, `milestone:intermediate`
- Done when: Laser model is integrated and animation-ready in scene.

### 22. [ICG] Model first enemy archetype with hierarchical primitives
- Scope: Build the initial enemy model (balanced archetype) with clear silhouette and style consistency.
- Labels: `icg`, `priority:high`, `milestone:intermediate`
- Done when: first enemy model is integrated and used in gameplay for intermediate demo.

### 23. [ICG] Model second tower (Pulse) with hierarchical primitives
- Scope: Build Pulse Tower model from primitives, consistent with the Laser model style.
- Labels: `icg`, `priority:medium`, `milestone:final`
- Done when: Pulse model is integrated and animation-ready in scene.

### 24. [ICG] Model remaining enemy archetypes (fast + tank)
- Scope: Build the fast and tank enemy models with distinct silhouettes and matching visual language.
- Labels: `icg`, `priority:medium`, `milestone:final`
- Done when: all 3 enemy archetype models are present and visually distinguishable.

### 25. [ICG] Environment texture and skybox pass
- Scope: Add textured platform/terrain treatment and a space skybox (or equivalent starfield environment).
- Labels: `icg`, `priority:medium`, `milestone:intermediate`
- Done when: scene has textured ground + background environment matching art direction.

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