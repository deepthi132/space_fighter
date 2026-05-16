# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost)
npm run build      # TypeScript compile + Vite production build → dist/
npm run preview    # Preview the production build locally
```

There are no tests or a linter configured. TypeScript strict checks act as the lint step (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are all enabled in `tsconfig.json`).

## Architecture

This is a single-page web app with two tabs — a space shooter game ("Relax") and a kawaii notes app ("Focus") — built with TypeScript + Vite for Vercel deployment.

**Entry point:** `index.html` loads `src/main.ts` as an ES module. Tab switching is handled in `main.ts`; switching away from the game auto-pauses it.

### Relax tab — game (`src/main.ts`, ~503 lines)

Four entity classes:
- `Player` — ship at bottom-center; arrow keys move it, wraps horizontally; three visual variants via `SHIPS` config
- `Enemy` — 4 instances drifting downward; `respawn()` on screen exit or hit; tracks `escaped` flag for scoring
- `Projectile` — flies upward, `active` flag (not a state machine); multiple can be in flight simultaneously
- `Explosion` — 15-frame animation triggered by hit

**Weapon system (`WEAPONS` record):** Three weapons (laser/ak47/cannon) each define `fireDelay`, `speed`, bullet `offsets[]` (multi-barrel), `color`, dimensions, `hitScore`, and `missScore`. Keys 1/2/3 switch weapons.

**Ship system (`SHIPS` record):** Three ships (scout/viper/titan) with different widths and draw functions. Scout uses a sprite (`spaceship.png`); Viper and Titan are drawn procedurally with canvas 2D paths.

**Score popups:** `ScorePopup` objects float upward and fade out; rendered each frame via `drawPopups()`.

**Game loop flow:** Assets load → `initGame()` sets up event listeners (keyboard + touch) and calls `requestAnimationFrame(gameLoop)`. Each frame: clear → update entities → collision detection (distance < 27px) → draw in layer order (enemies → projectiles → player → explosion → popups → score HUD). When paused, state is drawn then dimmed with an overlay.

**Touch controls:** `touchstart`/`touchmove` reposition the player to the touch X; firing is continuous while touching.

**Canvas:** 800×600, dark blue background (`rgb(0, 0, 102)`). Assets in `public/` (spaceship.png, rhino.png, explosion.png).

### Focus tab — notes app (`src/focus.ts` + `src/focus.css`)

A master-detail notes app with two note types: `'text'` (free-form textarea) and `'checklist'`.

**Data model (`Note` interface):** `id`, `type`, `title`, `content`, `items[]` (checklist only), `color`, `emoji`, `theme`. Persisted to `localStorage` under the key `'focus-notes'`.

**UI structure:** `initFocus()` injects a `#focus-sidebar` and `#focus-detail` into `#focus-app`. The sidebar has two views: a home screen with decorated section boxes (Notes / Lists), and a drill-down list. `renderSidebar()` and `renderDetail()` are called together via `render()` after any mutation.

**Card themes:** Six themes (rose, strawberry, unicorn, stars, garden, clouds) apply CSS background patterns (plaid, dots) and corner emoji decorations via `THEME_DECOR`.

**Checklist behavior:** Enter adds a new item below; Backspace on an empty item deletes it and focuses the previous one.

### Styles

- `src/style.css` — global styles, tab bar, game controls, canvas, weapon/ship button UI
- `src/focus.css` — all Focus tab styles; imports Nunito from Google Fonts; has responsive breakpoints at ≤640px (mobile) and 641–900px (tablet)

### Deployment

Vercel reads `vercel.json` — build command is `npm run build`, output dir is `dist/`. The original Python source is in `part1.py` as a reference for the ported game logic.
