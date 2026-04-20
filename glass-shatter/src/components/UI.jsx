import useStore from '../store'
import { LEVELS } from '../levels'
import './UI.css'

export default function UI({ phase, onStart, onNextLevel, onReset, onRestart, onMenu, onUndo }) {
  const moves = useStore(s => s.moves)
  const levelPar = useStore(s => s.levelPar)
  const levelName = useStore(s => s.levelName)
  const currentLevelIndex = useStore(s => s.currentLevelIndex)
  const undoStack = useStore(s => s.undoStack)

  if (phase === 'menu') {
    return (
      <div className="ui-overlay menu-screen">
        <div className="menu-content">
          <div className="title-block">
            <h1 className="title">GLASS SHATTER</h1>
            <p className="subtitle">Tactics</p>
          </div>
          <button className="btn-primary" onClick={onStart}>
            Play
          </button>
          <div className="menu-rules">
            <div className="rule-row">
              <span className="rule-icon glass-icon" />
              <span>Click <strong>glass blocks</strong> to shatter them</span>
            </div>
            <div className="rule-row">
              <span className="rule-icon source-icon" />
              <span><strong>Gold blocks</strong> bridge adjacent voids when shattered</span>
            </div>
            <div className="rule-row">
              <span className="rule-icon void-icon" />
              <span>Voids block your path — bridge them or go around</span>
            </div>
            <div className="rule-row">
              <span className="rule-icon core-icon" />
              <span>Clear a path for the core to reach the <strong>exit</strong></span>
            </div>
          </div>
          <p className="hint">Use fewer moves for a better rating · Undo with Z key</p>
        </div>
      </div>
    )
  }

  if (phase === 'level-complete') {
    const rating = moves <= levelPar ? '★★★' : moves <= levelPar + 1 ? '★★☆' : '★☆☆'
    const isPerfect = moves <= levelPar

    return (
      <div className="ui-overlay complete-screen">
        <div className="complete-content">
          <div className="complete-emoji">{isPerfect ? '✦' : '✧'}</div>
          <h2 className="complete-title">Level Complete</h2>
          <div className="rating">{rating}</div>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-value">{moves}</span>
              <span className="stat-label">Moves</span>
            </div>
            <div className="stat">
              <span className="stat-value">{levelPar}</span>
              <span className="stat-label">Par</span>
            </div>
          </div>
          <div className="complete-buttons">
            <button className="btn-primary" onClick={onNextLevel}>
              Next Level
            </button>
            <button className="btn-secondary" onClick={onReset}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'game-complete') {
    return (
      <div className="ui-overlay complete-screen">
        <div className="complete-content">
          <div className="complete-emoji">◆</div>
          <h2 className="complete-title">All Levels Complete</h2>
          <p className="complete-sub">You shattered every barrier.</p>
          <div className="complete-buttons">
            <button className="btn-primary" onClick={onRestart}>
              Play Again
            </button>
            <button className="btn-secondary" onClick={onMenu}>
              Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  const total = LEVELS.length

  return (
    <div className="ui-overlay game-hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="level-indicator">
          <span className="level-name">{levelName}</span>
          <span className="level-num">{currentLevelIndex + 1} / {total}</span>
        </div>
        <div className="moves-display">
          <span className="moves-num">{moves}</span>
          <span className="moves-label">moves</span>
          <span className="par-label">par {levelPar}</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="hud-bottom">
        <button className="btn-icon" onClick={onMenu} title="Menu">⏎</button>
        <button
          className="btn-icon"
          onClick={onUndo}
          disabled={undoStack.length === 0}
          title="Undo (Z)"
          style={{ opacity: undoStack.length > 0 ? 1 : 0.3 }}
        >
          ↩
        </button>
        <button className="btn-icon" onClick={onReset} title="Reset (R)">↺</button>
      </div>

      {/* First-move hint */}
      {moves === 0 && (
        <div className="hud-legend">
          <span className="legend-hint">Click glass or gold blocks to shatter</span>
        </div>
      )}
    </div>
  )
}