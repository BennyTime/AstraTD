# Astra TD – A 3D Tower Defense Experience

A 3D tower defense game built with [three.js](https://threejs.org/) for the Introduction to Computer Graphics course (2025/2026).

**Author:** Bernardo Rodrigues Borges — NMEC 103592

---

## Overview

Astra TD puts you in charge of defending a futuristic energy nexus from waves of robotic enemies. Place towers strategically along the enemy path, survive each wave, and keep the core alive.

The visual style draws from stylized sci-fi aesthetics — luminous materials, floating platforms, glowing energy effects, and a deep-space atmosphere.

---

## Features

### Visuals & Art Direction
- Floating platform arena with a starfield skybox
- Color palette of deep blues and purples for the environment
- Cyan accents for structures, magenta for enemies
- Metallic silver towers and dark metallic enemies
- Soft atmospheric fog

### 3D Models
All objects are built from primitive geometrical shapes combined hierarchically:
- **Energy Nexus** — the glowing core to defend
- **2 Tower types** — Laser Tower and Pulse Tower
- **3 Enemy types** — robotic units with distinct designs
- Elevated path segments and sci-fi architectural pieces
- Floating energy platforms

### Materials & Lighting
- Metallic materials for towers and enemies
- Emissive/glowing materials for lasers and energy elements
- Textured terrain surface
- Space-themed skybox
- Directional light simulating artificial illumination
- Ambient light for general visibility
- Shadow casting

### Interactivity
- **Point & click** tower placement
- **SPACE** to start a new enemy wave
- On-screen Nexus health tracking

### Animation
- Enemies follow a predefined spline path (`CatmullRomCurve3`)
- Towers rotate to face their current target
- Projectile motion towards enemies
- Lego-style enemy destruction animation
- Energy core damage feedback (visual + audio)

---

## Tech Stack

- [three.js](https://threejs.org/) — 3D rendering
- Vanilla JavaScript / HTML5

---

## Course

Introduction to Computer Graphics — University of Aveiro, 2025/2026
