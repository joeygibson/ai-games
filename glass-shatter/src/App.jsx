import { Component, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import UI from './components/UI'
import useStore from './store'
import audioEngine from './audio/AudioEngine'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw', height: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0a12', color: '#fff', fontFamily: 'Inter, sans-serif',
          flexDirection: 'column', gap: '16px'
        }}>
          <h2 style={{ fontWeight: 300, letterSpacing: '0.1em' }}>Something went wrong</h2>
          <pre style={{ color: '#ff6b6b', fontSize: '0.8rem', maxWidth: '80vw', overflow: 'auto' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{ padding: '12px 32px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px', color: '#fff', cursor: 'pointer', letterSpacing: '0.1em' }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const phase = useStore((s) => s.phase)

  const handleStart = useCallback(() => {
    audioEngine.init()
    if (audioEngine.ctx?.state === 'suspended') audioEngine.ctx.resume()
    useStore.getState().startGame()
  }, [])

  const handleNextLevel = useCallback(() => {
    if (audioEngine.ctx?.state === 'suspended') audioEngine.ctx.resume()
    useStore.getState().nextLevel()
  }, [])

  const handleReset = useCallback(() => {
    useStore.getState().resetLevel()
  }, [])

  const handleRestart = useCallback(() => {
    useStore.getState().restartGame()
  }, [])

  const handleMenu = useCallback(() => {
    useStore.getState().goToMenu()
  }, [])

  const handleUndo = useCallback(() => {
    useStore.getState().undo()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      const state = useStore.getState()
      if (key === 'r' && state.phase === 'playing') {
        state.resetLevel()
      }
      if (key === 'z' && (e.metaKey || e.ctrlKey) && state.phase === 'playing') {
        e.preventDefault()
        state.undo()
      }
      if (key === 'z' && !(e.metaKey || e.ctrlKey) && state.phase === 'playing') {
        state.undo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent mobile pinch zoom
  useEffect(() => {
    const preventTouch = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault()
    }
    document.addEventListener('touchmove', preventTouch, { passive: false })
    return () => document.removeEventListener('touchmove', preventTouch)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <ErrorBoundary>
        <Canvas
          camera={{ fov: 45, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0a0a12')
          }}
        >
          <Scene />
        </Canvas>
      </ErrorBoundary>

      <UI
        phase={phase}
        onStart={handleStart}
        onNextLevel={handleNextLevel}
        onReset={handleReset}
        onRestart={handleRestart}
        onMenu={handleMenu}
        onUndo={handleUndo}
      />
    </div>
  )
}