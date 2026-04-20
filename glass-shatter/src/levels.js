// Cell type constants
export const EMPTY = 0
export const GLASS = 1
export const WALL = 2
export const VOID = 3
export const SOURCE = 4
export const CORE_START = 5
export const EXIT = 6
export const BRIDGE = 7

export const LEVELS = [
  {
    name: 'First Break',
    par: 1,
    grid: [
      [2, 6, 2],
      [2, 1, 2],
      [2, 5, 2],
    ],
  },
  {
    name: 'The Corridor',
    par: 3,
    grid: [
      [2, 6, 2],
      [2, 1, 2],
      [2, 1, 2],
      [2, 1, 2],
      [2, 0, 2],
      [2, 5, 2],
    ],
  },
  {
    name: 'Over the Void',
    par: 1,
    grid: [
      [2, 6, 2, 2],
      [0, 3, 0, 0],
      [0, 4, 0, 0],
      [2, 5, 2, 2],
    ],
  },
  {
    name: 'Crystal Path',
    par: 2,
    grid: [
      [2, 6, 2, 2, 2, 2, 2],
      [2, 3, 4, 1, 4, 3, 2],
      [2, 2, 2, 5, 2, 2, 2],
    ],
  },
  {
    name: 'Strategic',
    par: 2,
    grid: [
      [2, 0, 0, 6, 0, 0, 2],
      [2, 3, 2, 2, 2, 3, 2],
      [0, 4, 2, 2, 2, 4, 0],
      [0, 1, 0, 1, 0, 1, 0],
      [2, 0, 0, 5, 0, 0, 2],
    ],
  },
  {
    name: 'The Fork',
    par: 2,
    grid: [
      [6, 2, 2, 2, 0],
      [3, 4, 2, 4, 3],
      [0, 0, 1, 0, 0],
      [2, 1, 0, 1, 2],
      [2, 0, 5, 0, 2],
    ],
  },
  {
    name: 'The Gauntlet',
    par: 3,
    grid: [
      [0, 0, 0, 6, 0, 0, 0],
      [2, 3, 2, 2, 2, 3, 2],
      [0, 4, 0, 1, 0, 4, 0],
      [0, 0, 2, 1, 2, 0, 0],
      [0, 1, 0, 1, 0, 1, 0],
      [2, 0, 2, 0, 2, 0, 2],
      [2, 2, 2, 5, 2, 2, 2],
    ],
  },
]