import useStore, { RINGS } from '../store'
import { playerPosition } from '../refs'
import { useEffect, useState } from 'react'
import { initTouchControls } from '../touchControls'
import * as THREE from 'three'
import './UI.css'

export default function UI({ phase, onStart, onRestart, showHint }) {
  const score = useStore((s) => s.score)
  const color = useStore((s) => s.color)
  const flow = useStore((s) => s.flow)
  const flowMultiplier = useStore((s) => s.flowMultiplier)
  const ringsPassed = useStore((s) => s.ringsPassed)
  const total = RINGS.length

  const [nextRingDist, setNextRingDist] = useState(0)

  // Update distance to next ring every frame
  useEffect(() => {
    if (phase !== 'playing') return
    let raf
    const update = () => {
      const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
      if (unpassed.length > 0) {
        const ringPos = new THREE.Vector3(...unpassed[0].position)
        const dist = playerPosition.distanceTo(ringPos)
        setNextRingDist(Math.round(dist))
      }
      raf = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(raf)
  }, [phase, ringsPassed])

  useEffect(() => {
    if (phase === 'playing') {
      const cleanup = initTouchControls()
      return cleanup
    }
  }, [phase])

  const flowPercent = Math.round(flow)

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
          <div className="menu-rules">
            <p>Fly through rings to paint &amp; score</p>
            <p>Keep moving to build <strong>flow</strong> — higher flow = higher score</p>
            <p>Stop and your flow decays</p>
          </div>
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
          <div className="final-stats">
            <div className="stat">
              <span className="stat-value">{score.toLocaleString()}</span>
              <span className="stat-label">Score</span>
            </div>
            <div className="stat">
              <span className="stat-value">{total}</span>
              <span className="stat-label">Colors Painted</span>
            </div>
          </div>
          <button className="btn-begin" onClick={onRestart}>
            Flow Again
          </button>
        </div>
      </div>
    )
  }

  const passedCount = ringsPassed.length

  return (
    <div className="ui-overlay game-hud">
      {/* Top bar: score + progress */}
      <div className="hud-top">
        <div className="score">{score.toLocaleString()}</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(passedCount / total) * 100}%`, background: color }}
          />
        </div>
        <span className="progress-text">
          {passedCount} / {total}
        </span>
      </div>

      {/* Flow meter */}
      <div className="flow-meter">
        <div className="flow-label">
          FLOW <span className="flow-mult">{flowMultiplier.toFixed(1)}x</span>
        </div>
        <div className="flow-bar">
          <div
            className="flow-fill"
            style={{
              width: `${flowPercent}%`,
              background: flowPercent > 80 ? '#feca57' : flowPercent > 40 ? color : 'rgba(255,255,255,0.6)',
            }}
          />
        </div>
      </div>

      {/* Next ring distance */}
      {passedCount < total && (
        <div className="next-ring-hint">
          <span className="next-ring-label">NEXT RING</span>
          <span className="next-ring-dist">{nextRingDist}m</span>
        </div>
      )}

      {passedCount >= total && (
        <div className="next-ring-hint">
          <span className="next-ring-label complete-label">ALL RINGS PASSED ✦</span>
        </div>
      )}

      {/* Color indicator */}
      <div className="color-indicator">
        <div className="color-dot" style={{ background: color }} />
        <span className="color-label">painting</span>
      </div>

      {/* Touch joystick */}
      <div id="touch-joystick" className="touch-joystick">
        <div id="touch-joystick-base" className="touch-joystick-base" />
        <div id="touch-joystick-knob" className="touch-joystick-knob" />
      </div>

      {/* Ring guide */}
      <div className="ring-guide">
        {RINGS.map((ring, i) => (
          <div
            key={ring.id}
            className={`ring-pip ${ringsPassed.includes(ring.id) ? 'passed' : ''}`}
            style={{
              borderColor: ringsPassed.includes(ring.id) ? ring.color : 'rgba(255,255,255,0.2)',
              backgroundColor: ringsPassed.includes(ring.id) ? ring.color : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}