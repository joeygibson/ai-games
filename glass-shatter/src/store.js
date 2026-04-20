import { create } from 'zustand'
import audioEngine from './audio/AudioEngine'
import { LEVELS, EMPTY, GLASS, SOURCE, VOID, BRIDGE, CORE_START, EXIT } from './levels'

export const SPACING = 1.6

// BFS pathfinding from core to exit
function findPath(grid, startCol, startRow, exitCol, exitRow) {
  const rows = grid.length
  const cols = grid[0].length
  const walkable = new Set([EMPTY, EXIT, BRIDGE])
  const dirs = [[0,-1],[0,1],[-1,0],[1,0]]

  const queue = [[startCol, startRow]]
  const visited = new Map()
  const key = (c, r) => `${c},${r}`
  visited.set(key(startCol, startRow), null)

  while (queue.length > 0) {
    const [col, row] = queue.shift()
    if (col === exitCol && row === exitRow) {
      const path = []
      let cur = key(col, row)
      while (cur !== null) {
        const [c, r] = cur.split(',').map(Number)
        path.unshift([c, r])
        cur = visited.get(cur)
      }
      return path
    }
    for (const [dc, dr] of dirs) {
      const nc = col + dc
      const nr = row + dr
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue
      const k = key(nc, nr)
      if (visited.has(k)) continue
      if (!walkable.has(grid[nr][nc])) continue
      visited.set(k, key(col, row))
      queue.push([nc, nr])
    }
  }
  return null
}

let shatterIdCounter = 0

const useStore = create((set, get) => ({
  // Game phase
  phase: 'menu', // 'menu' | 'playing' | 'core-moving' | 'level-complete' | 'game-complete'

  // Current level
  currentLevelIndex: 0,
  levelName: '',
  levelPar: 0,
  levelLoadTime: 0,

  // Grid state
  grid: [],
  rows: 0,
  cols: 0,
  corePos: [0, 0],
  exitPos: [0, 0],

  // Gameplay
  moves: 0,
  path: null,
  undoStack: [], // array of { grid, moves, bridgeAnims } snapshots

  // Visual effects
  shatterEffects: [], // { id, col, row, time, blockType }
  shakeIntensity: 0,
  bridgeAnims: {}, // "col,row": time

  // ─── Actions ────────────────────────

  startGame: () => {
    get().loadLevel(0)
    set({ phase: 'playing' })
  },

  loadLevel: (index) => {
    const level = LEVELS[index]
    if (!level) {
      set({ phase: 'game-complete' })
      return
    }

    const grid = level.grid.map(row => [...row])
    const rows = grid.length
    const cols = grid[0].length

    let corePos = [0, 0]
    let exitPos = [0, 0]

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === CORE_START) {
          corePos = [c, r]
          grid[r][c] = EMPTY
        }
        if (grid[r][c] === EXIT) {
          exitPos = [c, r]
        }
      }
    }

    set({
      currentLevelIndex: index,
      levelName: level.name,
      levelPar: level.par,
      levelLoadTime: performance.now() / 1000,
      grid,
      rows,
      cols,
      corePos,
      exitPos,
      moves: 0,
      path: null,
      undoStack: [],
      shatterEffects: [],
      shakeIntensity: 0,
      bridgeAnims: {},
    })
  },

  shatterBlock: (col, row) => {
    const state = get()
    if (state.phase !== 'playing') return
    const { grid, corePos, exitPos, moves, bridgeAnims } = state
    const cellType = grid[row][col]
    if (cellType !== GLASS && cellType !== SOURCE) return

    const now = performance.now() / 1000

    // Save undo state (deep copy grid + bridgeAnims)
    const undoEntry = {
      grid: grid.map(r => [...r]),
      moves,
      bridgeAnims: { ...bridgeAnims },
    }

    const newGrid = grid.map(r => [...r])

    // Remove the block
    newGrid[row][col] = EMPTY

    // If source, bridge adjacent voids
    const newBridgeAnims = { ...bridgeAnims }
    let hasBridge = false
    if (cellType === SOURCE) {
      const dirs = [[0,-1],[0,1],[-1,0],[1,0]]
      for (const [dc, dr] of dirs) {
        const nc = col + dc
        const nr = row + dr
        if (nc >= 0 && nc < state.cols && nr >= 0 && nr < state.rows) {
          if (newGrid[nr][nc] === VOID) {
            newGrid[nr][nc] = BRIDGE
            newBridgeAnims[`${nc},${nr}`] = now
            hasBridge = true
          }
        }
      }
    }

    // Add shatter effect
    const effectId = shatterIdCounter++
    const newShatterEffects = [...state.shatterEffects, {
      id: effectId,
      col,
      row,
      time: now,
      blockType: cellType,
    }]

    // Check for path
    const path = findPath(newGrid, corePos[0], corePos[1], exitPos[0], exitPos[1])

    set({
      grid: newGrid,
      moves: moves + 1,
      undoStack: [...state.undoStack, undoEntry],
      shatterEffects: newShatterEffects,
      shakeIntensity: 1.0,
      bridgeAnims: newBridgeAnims,
      path,
      phase: path ? 'core-moving' : 'playing',
    })

    // Play audio
    if (cellType === SOURCE) {
      audioEngine.playShatter(true)
    } else {
      audioEngine.playShatter(false)
    }
  },

  undo: () => {
    const state = get()
    if (state.phase !== 'playing' && state.phase !== 'core-moving') return
    if (state.undoStack.length === 0) return

    const entry = state.undoStack[state.undoStack.length - 1]
    const { corePos, exitPos } = state

    // Check if restored state has a path
    const path = findPath(entry.grid, corePos[0], corePos[1], exitPos[0], exitPos[1])

    set({
      grid: entry.grid,
      moves: entry.moves,
      bridgeAnims: entry.bridgeAnims,
      undoStack: state.undoStack.slice(0, -1),
      path,
      phase: path ? 'core-moving' : 'playing',
    })

    audioEngine.playStep()
  },

  completeLevel: () => {
    const index = get().currentLevelIndex
    if (index >= LEVELS.length - 1) {
      set({ phase: 'game-complete' })
    } else {
      set({ phase: 'level-complete' })
    }
    audioEngine.playComplete()
  },

  nextLevel: () => {
    const index = get().currentLevelIndex + 1
    get().loadLevel(index)
    set({ phase: 'playing' })
  },

  resetLevel: () => {
    const index = get().currentLevelIndex
    get().loadLevel(index)
    set({ phase: 'playing' })
  },

  restartGame: () => {
    get().loadLevel(0)
    set({ phase: 'playing' })
  },

  removeShatterEffect: (id) => {
    set(state => ({
      shatterEffects: state.shatterEffects.filter(e => e.id !== id),
    }))
  },

  reduceShake: (delta) => {
    set(state => ({
      shakeIntensity: Math.max(0, state.shakeIntensity - delta * 5),
    }))
  },

  goToMenu: () => set({ phase: 'menu' }),
}))

export default useStore