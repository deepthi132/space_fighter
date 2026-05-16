# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost)
npm run build      # TypeScript compile + Vite production build → dist/
npm run preview    # Preview the production build locally
```

There are no tests or a linter configured.

## Architecture

This is a single-page HTML5 Canvas game ("Rock Rollers") ported from Python/Pygame to TypeScript + Vite for Vercel deployment.

**All game logic lives in `src/main.ts`** (~214 lines). There are four entity classes:

- `Player` — bottom-center ship controlled by arrow keys; wraps horizontally; fires bullets with Space
- `Enemy` — 4 instances spawning at random positions, drifting downward; reset on screen exit or collision
- `Bullet` — single bullet, state machine (`'ready'` | `'fire'`), fires upward, one in flight at a time
- `Explosion` — 15-frame animation triggered by bullet-enemy collision

**Game loop flow:**
1. Assets load asynchronously (`Image.onload` × 4); game starts only when all are ready
2. `requestAnimationFrame` drives the loop: clear canvas → update entities → collision detection → draw in layer order (enemies → bullet → player → explosion → score HUD)
3. Collision detection is distance-based (`dis < 27px`); score decreases by 1 if an enemy reaches `y ≥ 520`

**Canvas:** 800×600, dark blue background (`rgb(0, 0, 102)`). Game assets are in `public/` (spaceship.png, rhino.png, bullet.png, explosion.png) and served at the root path.

**Deployment:** Vercel reads `vercel.json` — build command is `npm run build`, output dir is `dist/`.

The original Python source is preserved in `part1.py` as a reference for the ported logic.
