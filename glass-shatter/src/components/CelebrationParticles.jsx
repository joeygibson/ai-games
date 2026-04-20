import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { SPACING } from '../store'

// ─── Celebration Particles on Level Complete ────────────────
function CelebrationParticles() {
  const meshRef = useRef()
  const exitPos = useStore(s => s.exitPos)
  const cols = useStore(s => s.cols)
  const rows = useStore(s => s.rows)
  const phase = useStore(s => s.phase)

  const worldX = (exitPos[0] - (cols - 1) / 2) * SPACING
  const worldZ = (exitPos[1] - (rows - 1) / 2) * SPACING

  const particleCount = 30
  const startTime = useRef(0)
  const prevPhase = useRef(phase)
  if (prevPhase.current !== phase && (phase === 'level-complete' || phase === 'game-complete')) {
    startTime.current = performance.now() / 1000
  }
  prevPhase.current = phase

  const particles = useMemo(() => {
    startTime.current = performance.now() / 1000
    return Array.from({ length: particleCount }, () => ({
      px: worldX + (Math.random() - 0.5) * 0.3,
      py: 0.3 + Math.random() * 0.2,
      pz: worldZ + (Math.random() - 0.5) * 0.3,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      vz: (Math.random() - 0.5) * 4,
      scale: Math.random() * 0.06 + 0.02,
    }))
  }, [worldX, worldZ, phase]) // re-create on phase change (new celebration)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    if (phase !== 'level-complete' && phase !== 'game-complete') {
      meshRef.current.visible = false
      return
    }
    meshRef.current.visible = true

    const now = performance.now() / 1000
    const elapsed = now - startTime.current
    const opacity = Math.max(0, 1 - elapsed / 2.5)

    meshRef.current.children.forEach((child, i) => {
      const p = particles[i]
      p.vy -= 8 * delta
      p.px += p.vx * delta
      p.py += p.vy * delta
      p.pz += p.vz * delta
      if (p.py < 0.02) { p.py = 0.02; p.vy *= -0.2; }

      child.position.set(p.px, p.py, p.pz)
      child.material.opacity = opacity * 0.8
    })
  })

  return (
    <group ref={meshRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.px, p.py, p.pz]}>
          <boxGeometry args={[p.scale, p.scale, p.scale]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#ffcc44' : '#88ccee'}
            transparent
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default CelebrationParticles