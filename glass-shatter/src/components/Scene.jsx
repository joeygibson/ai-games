import { Environment } from '@react-three/drei'
import useStore from '../store'
import Grid from './Grid'
import Core from './Core'
import ShatterManager from './ShatterEffect'
import CameraController from './CameraController'
import PostEffects from './PostEffects'
import AmbientParticles from './AmbientParticles'

import CelebrationParticles from './CelebrationParticles'
import PathTrail from './PathTrail'

export default function Scene() {
  const phase = useStore((s) => s.phase)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 8]}
        intensity={0.8}
        color="#e8f0ff"
      />
      <hemisphereLight args={['#1a2040', '#0a0a12', 0.5]} />

      {/* Environment for glass reflections */}
      <Environment preset="city" environmentIntensity={1.0} />

      {/* Game elements */}
      {phase !== 'menu' && (
        <>
          <Grid />
          <Core />
          <ShatterManager />
          <CelebrationParticles />
          <PathTrail />
        </>
      )}

      <CameraController />
      <AmbientParticles />

      <PostEffects />
    </>
  )
}