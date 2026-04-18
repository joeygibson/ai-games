# Aura Flow — Setup & Run Guide

## Quick Start (Dev Mode)

```bash
cd aura-flow
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Production Build

```bash
cd aura-flow
npm run build
npm run preview
```

This serves the optimized ~385KB gzipped build at `http://localhost:4173`.

## Deployment — GitHub Pages

The game lives in the `ai-games` repo and is served at **joeygibson.github.io/ai-games/aura-flow/**.

1. Make sure your `ai-games` repo is pushed to GitHub as `joeygibson/ai-games`
2. In the repo Settings → Pages → set Source to the `gh-pages` branch
3. From the `aura-flow/` directory, run:

```bash
cd aura-flow
npm run deploy
```

This builds the site with the correct base path (`/ai-games/aura-flow/`) and pushes the `dist/` contents into the `aura-flow/` folder on the `gh-pages` branch — without deleting other games already on that branch.

Your game will be live at: **https://joeygibson.github.io/ai-games/aura-flow/**

> If you add another game to this repo later, just run its own deploy with a different `--dest` flag — the `--add` flag keeps everything intact.

## How to Play

| Control | Action |
|---------|--------|
| **WASD / Arrow keys** | Move the orb |
| **Space** | Ascend |
| **Shift** | Descend |
| **Touch & drag** (mobile) | Virtual joystick |

Navigate through the **8 glowing rings** — each one changes your trail color and adds a musical note. Pass all 8 to complete the flow.

## Architecture

```
src/
├── App.jsx                 # Main app: Canvas + UI overlay
├── main.jsx                # Entry point
├── store.js                # Zustand state (phase, color, score, rings)
├── refs.js                 # Shared mutable refs (playerPosition)
├── touchControls.js         # Mobile joystick handler
├── index.css               # Global styles
├── audio/
│   └── AudioEngine.js      # Web Audio API generative audio
└── components/
    ├── Scene.jsx            # 3D scene composition
    ├── PlayerOrb.jsx        # Controllable glowing orb + physics
    ├── Trail.jsx            # Neon painting trail (shader points)
    ├── Rings.jsx            # 8 architectural rings with collision
    ├── CameraRig.jsx        # Smooth follow camera
    ├── MenuCamera.jsx       # Orbiting camera for menu
    ├── GuideArrow.jsx       # Directional arrow to next ring
    ├── Ground.jsx           # Grid shader ground plane
    ├── AmbientParticles.jsx # Floating atmosphere particles
    ├── PostEffects.jsx      # Bloom + Vignette post-processing
    ├── UI.jsx               # HUD overlay (progress, color, hints)
    └── UI.css               # UI styles (glassmorphism)
```

## Vibe Jam Rule Compliance

| Rule | Status |
|------|--------|
| ≥90% AI-written code | ✅ Entire codebase written by AI |
| Started today or after | ✅ Built fresh today |
| Web accessible, no login/signup | ✅ Static site, zero auth |
| Free to play | ✅ No cost |
| No loading screens / heavy downloads | ✅ ~385KB gzipped, no external assets, instant start |
| ThreeJS recommended | ✅ React Three Fiber (R3F) + ThreeJS |
| Multiplayer preferred | ⬜ Not implemented (future: WebSocket collaborative painting) |