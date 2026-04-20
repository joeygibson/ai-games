# Glass Shatter Tactics

A crystalline puzzle game built with React Three Fiber. Click glass blocks to shatter them and clear a path from the core to the exit.

## Play

```bash
npm install
npm run dev
```

## How to Play

- **Click glass blocks** (cyan, translucent) to shatter them
- **Gold blocks** (source) bridge adjacent voids when shattered — hover them to see which voids get bridged
- **Voids** (dark pits with red glow) block your path — bridge them or go around
- **Dark walls** are permanent obstacles
- Clear a path for the **core** (glowing sphere) to reach the **exit** (gold portal)
- Use **fewer moves** for a better rating (★★★ at par)
- Press **Z** to undo, **R** to reset

## Levels

| # | Name | Par | New Mechanic |
|---|------|-----|-------------|
| 1 | First Break | 1 | Glass shattering |
| 2 | The Corridor | 3 | Multiple glass blocks |
| 3 | Over the Void | 1 | Source bridging voids |
| 4 | Crystal Path | 2 | Source + glass combo |
| 5 | Strategic | 2 | Red herring blocks |
| 6 | The Fork | 2 | Multiple source paths |
| 7 | The Gauntlet | 3 | Complex multi-step puzzle |

## Tech Stack

- **React Three Fiber** + **drei** for 3D rendering
- **Zustand** for state management
- **Post-processing** (Bloom + Vignette) for glow effects
- **Web Audio API** for synthesized glass sounds
- **BFS pathfinding** for core navigation