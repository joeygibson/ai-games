import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { SPACING } from '../store'
import audioEngine from '../audio/AudioEngine'

export default function Core() {
  const groupRef = useRef()
  const moveProgressRef = useRef(0)
  const lastStepIndex = useRef(-1)
  const trailRef = useRef([])

  const corePos = useStore(s => s.corePos)
  const path = useStore(s => s.path)
  const phase = useStore(s => s.phase)
  const cols = useStore(s => s.cols)
  const rows = useStore(s => s.rows)
  const levelLoadTime = useStore(s => s.levelLoadTime)

  const cellToWorld = (col, row) => {
    return new THREE.Vector3(
      (col - (cols - 1) / 2) * SPACING,
      0.55,
      (row - (rows - 1) / 2) * SPACING
    )
  }

  // Reset when path changes
  const pathRef = useRef(path)
  if (pathRef.current !== path) {
    pathRef.current = path
    moveProgressRef.current = 0
    lastStepIndex.current = -1
    trailRef.current = []
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Intro animation
    const levelElapsed = performance.now() / 1000 - levelLoadTime
    const introDelay = (corePos[0] + corePos[1]) * 0.06
    const introT = Math.max(0, levelElapsed - introDelay)
    const introProgress = Math.min(1, introT / 0.45)
    const c1 = 1.70158
    const c3 = c1 + 1
    const introEased = introProgress === 1
      ? 1
      : 1 + c3 * Math.pow(introProgress - 1, 3) + c1 * Math.pow(introProgress - 1, 2)

    if (phase === 'playing' || phase === 'level-complete' || phase === 'game-complete') {
      const pos = cellToWorld(corePos[0], corePos[1])
      pos.y = -1.5 + introEased * 0.55
      groupRef.current.position.lerp(pos, 0.15)
    }

    if (phase === 'core-moving' && path && path.length > 1) {
      const speed = 3
      moveProgressRef.current += speed * delta

      const maxIdx = path.length - 1
      const idx = Math.min(Math.floor(moveProgressRef.current), maxIdx)

      // Step sound for each new cell
      if (idx > lastStepIndex.current && idx < maxIdx) {
        audioEngine.playStep()
        lastStepIndex.current = idx
      }

      if (idx >= maxIdx) {
        const finalPos = cellToWorld(path[maxIdx][0], path[maxIdx][1])
        finalPos.y = 0.55
        groupRef.current.position.copy(finalPos)
        useStore.getState().completeLevel()
        return
      }

      const frac = moveProgressRef.current - Math.floor(moveProgressRef.current)
      const from = cellToWorld(path[idx][0], path[idx][1])
      const to = cellToWorld(path[Math.min(idx + 1, maxIdx)][0], path[Math.min(idx + 1, maxIdx)][1])
      const lerped = new THREE.Vector3().lerpVectors(from, to, frac)
      lerped.y = 0.55
      groupRef.current.position.copy(lerped)
    }

    // Breathing
    const time = state.clock.elapsedTime
    const breathe = 1 + Math.sin(time * 2) * 0.03
    groupRef.current.scale.setScalar(breathe)

    // Subtle float
    groupRef.current.position.y += Math.sin(time * 1.5) * 0.02
  })

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color="#eeffff"
          emissive="#88ccff"
          emissiveIntensity={2}
          metalness={0.3}
          roughness={0.1}
          toneMapped={false}
        />
      </mesh>
      {/* Inner bright */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#aaddff"
          emissiveIntensity={3}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
      {/* Outer halo */}
      <mesh>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshBasicMaterial
          color="#88ccff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#88ccff" intensity={5} distance={8} decay={2} />
    </group>
  )
}