import { useState, useCallback, useEffect, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import UI from './components/UI'
import useStore from './store'
import audioEngine from './audio/AudioEngine'
import './index.css'

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
          background: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif',
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
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const preventTouch = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault()
    }
    document.addEventListener('touchmove', preventTouch, { passive: false })
    return () => document.removeEventListener('touchmove', preventTouch)
  }, [])

  const handleStart = useCallback(() => {
    audioEngine.init()
    if (audioEngine.ctx?.state === 'suspended') audioEngine.ctx.resume()
    useStore.getState().startGame()
    setTimeout(() => setShowHint(true), 800)
    setTimeout(() => setShowHint(false), 5000)
  }, [])

  const handleRestart = useCallback(() => {
    useStore.getState().resetGame()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <ErrorBoundary>
        <Canvas
          camera={{ fov: 60, near: 0.1, far: 500, position: [0, 8, 14] }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ background: '#0a0a0a' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#080810')
          }}
        >
          <Scene />
        </Canvas>
      </ErrorBoundary>

      <UI
        phase={phase}
        onStart={handleStart}
        onRestart={handleRestart}
        showHint={showHint && phase === 'playing'}
      />
    </div>
  )
}