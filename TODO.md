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
    COMPLETED

### Phase 2: Final Delivery (May)
10. `#20` Add references and AI usage acknowledgements.
11. `#28` Prepare final presentation package.

### Dependency Notes
- Start `#10` only after `#7` and `#9` are functional.
- Start `#15` only after `#23` is integrated.
- Complete `#24` before finishing `#14` balancing/tuning.
- Keep `#27`, `#19`, `#20`, and `#28` near the end to avoid rework.



## Notes

Create extra maps. 2 more.
Board feels empty when it comes to grass.
Textures! lets add textures to the objects. to make it look beter