import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore, { SPACING } from '../store'
import audioEngine from '../audio/AudioEngine'

// ─── Single Shatter Effect ──────────────────────────────────
function ShatterEffect({ id, col, row, time, blockType }) {
  const groupRef = useRef()
  const removedRef = useRef(false)
  const removeEffect = useStore(s => s.removeShatterEffect)
  const cols = useStore(s => s.cols)
  const rows = useStore(s => s.rows)

  const x = (col - (cols - 1) / 2) * SPACING
  const z = (row - (rows - 1) / 2) * SPACING

  const shardCount = 20
  const color = blockType === 4 ? '#ddaa44' : '#88ccee' // 4 = SOURCE
  const emissive = blockType === 4 ? '#aa7722' : '#4488aa'

  const shards = useMemo(() => {
    return Array.from({ length: shardCount }, () => ({
      px: x + (Math.random() - 0.5) * 0.3,
      py: 0.3 + Math.random() * 0.4,
      pz: z + (Math.random() - 0.5) * 0.3,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 5 + 3,
      vz: (Math.random() - 0.5) * 6,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      rvx: (Math.random() - 0.5) * 10,
      rvy: (Math.random() - 0.5) * 10,
      rvz: (Math.random() - 0.5) * 10,
      scaleX: Math.random() * 0.08 + 0.04,
      scaleY: Math.random() * 0.04 + 0.02,
      scaleZ: Math.random() * 0.07 + 0.03,
    }))
  }, [x, z])

  // Play bridge rise sound for source shatters
  const bridgeSoundPlayed = useRef(false)
  if (blockType === 4 && !bridgeSoundPlayed.current) {
    bridgeSoundPlayed.current = true
    setTimeout(() => audioEngine.playBridgeRise(), 200)
  }

  useFrame((_, delta) => {
    if (!groupRef.current || removedRef.current) return
    const elapsed = performance.now() / 1000 - time

    if (elapsed > 2.0) {
      removedRef.current = true
      removeEffect(id)
      return
    }

    const opacity = Math.max(0, 1 - elapsed / 1.8)

    groupRef.current.children.forEach((child, i) => {
      const s = shards[i]
      // Physics
      s.vy -= 14 * delta
      s.px += s.vx * delta
      s.py += s.vy * delta
      s.pz += s.vz * delta
      // Bounce off floor
      if (s.py < 0.02) {
        s.py = 0.02
        s.vy *= -0.3
        s.vx *= 0.8
        s.vz *= 0.8
      }
      // Rotations
      s.rx += s.rvx * delta
      s.ry += s.rvy * delta
      s.rz += s.rvz * delta

      child.position.set(s.px, s.py, s.pz)
      child.rotation.set(s.rx, s.ry, s.rz)
      child.material.opacity = opacity * 0.75
    })
  })

  return (
    <group ref={groupRef}>
      {shards.map((s, i) => (
        <mesh key={i}>
          <boxGeometry args={[s.scaleX, s.scaleY, s.scaleZ]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.75}
            emissive={emissive}
            emissiveIntensity={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Shatter Manager ─────────────────────────────────────────
export default function ShatterManager() {
  const shatterEffects = useStore(s => s.shatterEffects)

  return (
    <group>
      {shatterEffects.map(effect => (
        <ShatterEffect
          key={effect.id}
          id={effect.id}
          col={effect.col}
          row={effect.row}
          time={effect.time}
          blockType={effect.blockType}
        />
      ))}
    </group>
  )
}