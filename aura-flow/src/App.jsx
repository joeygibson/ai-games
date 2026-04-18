import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import UI from './components/UI'
import useStore from './store'
import audioEngine from './audio/AudioEngine'
import './index.css'

export default function App() {
  const phase = useStore((s) => s.phase)
  const [showHint, setShowHint] = useState(false)

  // Prevent default touch behavior (scrolling, zooming) during gameplay
  useEffect(() => {
    const preventTouch = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }
    document.addEventListener('touchmove', preventTouch, { passive: false })
    document.addEventListener('gesturestart', (e) => e.preventDefault())
    return () => {
      document.removeEventListener('touchmove', preventTouch)
    }
  }, [])

  const handleStart = useCallback(() => {
    audioEngine.init()
    if (audioEngine.ctx?.state === 'suspended') {
      audioEngine.ctx.resume()
    }
    useStore.getState().startGame()
    setTimeout(() => setShowHint(true), 800)
    setTimeout(() => setShowHint(false), 5000)
  }, [])

  const handleRestart = useCallback(() => {
    useStore.getState().resetGame()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 500, position: [0, 8, 14] }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0a' }}
      >
        <Scene />
      </Canvas>

      <UI
        phase={phase}
        onStart={handleStart}
        onRestart={handleRestart}
        showHint={showHint && phase === 'playing'}
      />
    </div>
  )
}