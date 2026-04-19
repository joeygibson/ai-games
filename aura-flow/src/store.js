import { create } from 'zustand'

export const COLORS = [
  '#ff6b6b', // Coral
  '#ffa502', // Amber
  '#feca57', // Gold
  '#7bed9f', // Lime
  '#48dbfb', // Cyan
  '#54a0ff', // Azure
  '#5f27cd', // Violet
  '#ff6b81', // Rose
]

export const NOTES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.26, // E5
]

export const RINGS = [
  { id: 0, position: [0, 2, -18], color: COLORS[0], note: NOTES[0] },
  { id: 1, position: [3, 3, -38], color: COLORS[1], note: NOTES[1] },
  { id: 2, position: [-2, 4, -60], color: COLORS[2], note: NOTES[2] },
  { id: 3, position: [4, 3.5, -82], color: COLORS[3], note: NOTES[3] },
  { id: 4, position: [-3, 5, -104], color: COLORS[4], note: NOTES[4] },
  { id: 5, position: [2, 4.5, -126], color: COLORS[5], note: NOTES[5] },
  { id: 6, position: [-4, 5.5, -148], color: COLORS[6], note: NOTES[6] },
  { id: 7, position: [0, 5, -170], color: COLORS[7], note: NOTES[7] },
]

export const RING_OPENING_RADIUS = 2.2

const useStore = create((set, get) => ({
  // Game state
  phase: 'menu', // 'menu' | 'playing' | 'complete' | 'zen'
  colorIndex: 0,
  color: COLORS[0],
  score: 0,
  ringsPassed: [],
  speed: 0,

  // Flow mechanic
  flow: 0,
  flowBest: 0,
  flowMultiplier: 1,

  // Actions
  startGame: () => set({
    phase: 'playing', score: 0, ringsPassed: [],
    colorIndex: 0, color: COLORS[0],
    flow: 0, flowBest: 0, flowMultiplier: 1,
  }),

  completeGame: () => set({ phase: 'complete' }),

  enterZen: () => set({ phase: 'zen' }),

  passRing: (ringId) => {
    const state = get()
    if (state.ringsPassed.includes(ringId)) return
    const newIndex = (ringId + 1) % COLORS.length
    const flowBonus = Math.floor(state.flowMultiplier)
    const points = 100 * flowBonus
    const newRingsPassed = [...state.ringsPassed, ringId]
    set({
      ringsPassed: newRingsPassed,
      score: state.score + points,
      colorIndex: newIndex,
      color: COLORS[newIndex],
    })
    // All 8 rings = complete
    if (newRingsPassed.length >= RINGS.length) {
      setTimeout(() => set({ phase: 'complete' }), 1500)
    }
  },

  setSpeed: (speed) => set({ speed }),

  // In zen mode, rings don't end the game — they just change color
  passRingZen: (ringId) => {
    const state = get()
    const newIndex = (ringId + 1) % COLORS.length
    set({
      colorIndex: newIndex,
      color: COLORS[newIndex],
      score: state.score + Math.floor(state.flowMultiplier) * 50,
    })
  },

  resetGame: () => set({
    phase: 'menu', score: 0, ringsPassed: [],
    colorIndex: 0, color: COLORS[0],
    flow: 0, flowBest: 0, flowMultiplier: 1,
  }),
}))

export default useStore