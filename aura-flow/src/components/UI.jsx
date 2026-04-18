import useStore, { RINGS } from '../store'
import { useEffect } from 'react'
import { initTouchControls } from '../touchControls'
import './UI.css'

export default function UI({ phase, onStart, onRestart, showHint }) {
  const score = useStore((s) => s.score)
  const color = useStore((s) => s.color)
  const total = RINGS.length

  useEffect(() => {
    if (phase === 'playing') {
      const cleanup = initTouchControls()
      return cleanup
    }
  }, [phase])

  if (phase === 'menu') {
    return (
      <div className="ui-overlay menu-screen">
        <div className="menu-content">
          <div className="title-container">
            <h1 className="title">AURA FLOW</h1>
            <p className="subtitle">A Zen Kinetic Experience</p>
          </div>
          <button className="btn-begin" onClick={onStart}>
            Begin
          </button>
          <p className="hint-text">
            WASD / Arrow keys to move &nbsp;&middot;&nbsp; Space / Shift to fly
          </p>
          <p className="hint-text mobile-hint">
            Touch and drag to move on mobile
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'complete') {
    return (
      <div className="ui-overlay complete-screen">
        <div className="complete-content">
          <h2 className="complete-title">Flow Complete</h2>
          <p className="complete-subtitle">
            You painted with {total} colors
          </p>
          <button className="btn-begin" onClick={onRestart}>
            Flow Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-overlay game-hud">
      {/* Progress */}
      <div className="hud-top">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(score / total) * 100}%`, background: color }}
          />
        </div>
        <span className="progress-text">
          {score} / {total}
        </span>
      </div>

      {/* Color indicator */}
      <div className="color-indicator">
        <div className="color-dot" style={{ background: color }} />
        <span className="color-label">painting</span>
      </div>

      {/* Touch joystick area */}
      <div id="touch-joystick" className="touch-joystick">
        <div id="touch-joystick-base" className="touch-joystick-base" />
        <div id="touch-joystick-knob" className="touch-joystick-knob" />
      </div>

      {/* Ring guide */}
      <div className="ring-guide">
        {RINGS.map((ring, i) => (
          <div
            key={ring.id}
            className={`ring-pip ${i < score ? 'passed' : ''}`}
            style={{
              borderColor: i < score ? ring.color : 'rgba(255,255,255,0.2)',
              backgroundColor: i < score ? ring.color : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}