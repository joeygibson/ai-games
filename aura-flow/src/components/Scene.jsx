import useStore from '../store'
import PlayerOrb from './PlayerOrb'
import Trail from './Trail'
import Rings from './Rings'
import CameraRig from './CameraRig'
import PostEffects from './PostEffects'
import Ground from './Ground'
import AmbientParticles from './AmbientParticles'
import GuideArrow from './GuideArrow'
import MenuCamera from './MenuCamera'

export default function Scene() {
  const phase = useStore((s) => s.phase)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={0.7}
        color="#e8e8ff"
      />
      <hemisphereLight
        args={['#1a1a3e', '#0a0a0a', 0.4]}
      />

      {/* Fog */}
      <fog attach="fog" args={['#080810', 25, 160]} />

      {/* Game elements */}
      {phase !== 'menu' && (
        <>
          <PlayerOrb />
          <Trail />
          <Rings />
          <CameraRig />
          <GuideArrow />
        </>
      )}

      {phase === 'menu' && <MenuCamera />}

      <Ground />
      <AmbientParticles />

      <PostEffects />
    </>
  )
}