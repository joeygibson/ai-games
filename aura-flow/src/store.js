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
  { id: 1, position: [10, 3.5, -38], color: COLORS[1], note: NOTES[1] },
  { id: 2, position: [-6, 5, -60], color: COLORS[2], note: NOTES[2] },
  { id: 3, position: [14, 4, -82], color: COLORS[3], note: NOTES[3] },
  { id: 4, position: [-12, 7, -104], color: COLORS[4], note: NOTES[4] },
  { id: 5, position: [7, 5.5, -126], color: COLORS[5], note: NOTES[5] },
  { id: 6, position: [-16, 9, -148], color: COLORS[6], note: NOTES[6] },
  { id: 7, position: [0, 7, -170], color: COLORS[7], note: NOTES[7] },
]

const useStore = create((set, get) => ({
  // Game state
  phase: 'menu', // 'menu' | 'playing' | 'complete'
  colorIndex: 0,
  color: COLORS[0],
  score: 0,
  ringsPassed: [],
  speed: 0,

  // Flow mechanic: combo builds while moving, resets when idle
  flow: 0,          // 0-100: how deep in flow state you are
  flowBest: 0,      // highest flow achieved this run
  flowMultiplier: 1, // score multiplier from flow

  // Actions
  startGame: () => set({
    phase: 'playing', score: 0, ringsPassed: [],
    colorIndex: 0, color: COLORS[0],
    flow: 0, flowBest: 0, flowMultiplier: 1,
  }),

  completeGame: () => set({ phase: 'complete' }),

  passRing: (ringId) => {
    const state = get()
    if (state.ringsPassed.includes(ringId)) return
    const newIndex = (ringId + 1) % COLORS.length
    const flowBonus = Math.floor(state.flowMultiplier)
    const points = 100 * flowBonus
    const newState = {
      ringsPassed: [...state.ringsPassed, ringId],
      score: state.score + points,
      colorIndex: newIndex,
      color: COLORS[newIndex],
    }
    if (state.ringsPassed.length + 1 >= RINGS.length) {
      setTimeout(() => set({ phase: 'complete' }), 1500)
    }
    set(newState)
  },

  // Called every frame from PlayerOrb
  setSpeed: (speed) => {
    const state = get()
    // Build flow while moving (speed > 0.1), decay while idle
    let flow = state.flow
    const FLOW_BUILD = 0.4   // frames to build
    const FLOW_DECAY = 0.8   // frames to decay

    if (speed > 0.1) {
      flow = Math.min(100, flow + FLOW_BUILD * speed)
    } else {
      flow = Math.max(0, flow - FLOW_DECAY)
    }

    // Flow multiplier: 1x at 0%, up to 5x at 100%
    const flowMultiplier = 1 + (flow / 100) * 4

    const flowBest = Math.max(state.flowBest, flow)

    set({ speed, flow, flowBest, flowMultiplier })
  },

  resetGame: () => set({
    phase: 'menu', score: 0, ringsPassed: [],
    colorIndex: 0, color: COLORS[0],
    flow: 0, flowBest: 0, flowMultiplier: 1,
  }),
}))

export default useStore