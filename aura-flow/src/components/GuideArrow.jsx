import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { RINGS } from '../store'
import { playerPosition } from '../refs'

// Visible beam + arrow pointing toward the next unpassed ring
export default function GuideArrow() {
  const groupRef = useRef()
  const ringsPassed = useStore((s) => s.ringsPassed)

  const nextRing = useMemo(() => {
    const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
    return unpassed.length > 0 ? unpassed[0] : null
  }, [ringsPassed])

  const nextRingColor = useMemo(() => {
    const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
    return unpassed.length > 0 ? unpassed[0].color : '#ffffff'
  }, [ringsPassed])

  useFrame(() => {
    if (!groupRef.current || !nextRing) {
      if (groupRef.current) groupRef.current.visible = false
      return
    }

    const ringPos = new THREE.Vector3(...nextRing.position)
    const dist = playerPosition.distanceTo(ringPos)

    if (dist < 4) {
      groupRef.current.visible = false
      return
    }

    groupRef.current.visible = true

    // Position the arrow 3 units in front of the player, above eye level
    const dir = new THREE.Vector3().subVectors(ringPos, playerPosition).normalize()
    const arrowPos = playerPosition.clone().add(dir.clone().multiplyScalar(3))
    arrowPos.y += 1.0

    groupRef.current.position.copy(arrowPos)

    // Point the arrow toward the ring
    const target = new THREE.Quaternion()
    target.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir)
    groupRef.current.quaternion.slerp(target, 0.15)
  })

  if (!nextRing) return null

  return (
    <group ref={groupRef}>
      {/* Arrow cone — bigger and brighter */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.25, 0.7, 3]} />
        <meshBasicMaterial
          color={nextRingColor}
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}