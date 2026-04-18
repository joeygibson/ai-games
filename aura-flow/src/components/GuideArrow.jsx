import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { RINGS } from '../store'
import { playerPosition } from '../refs'

// Reusable vectors to avoid GC
const _dir = new THREE.Vector3()
const _arrowPos = new THREE.Vector3()
const _up = new THREE.Vector3(0, 0, 1)
const _targetQuat = new THREE.Quaternion()

export default function GuideArrow() {
  const arrowRef = useRef()
  const ringsPassed = useStore((s) => s.ringsPassed)

  const nextRingPos = useMemo(() => {
    const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
    if (unpassed.length === 0) return null
    return new THREE.Vector3(...unpassed[0].position)
  }, [ringsPassed])

  useFrame(() => {
    if (!arrowRef.current || !nextRingPos) {
      if (arrowRef.current) arrowRef.current.visible = false
      return
    }

    _dir.subVectors(nextRingPos, playerPosition)
    const dist = _dir.length()

    if (dist < 3) {
      arrowRef.current.visible = false
      return
    }

    arrowRef.current.visible = true
    _dir.normalize()

    // Position arrow ahead of player toward the next ring
    _arrowPos.copy(playerPosition).add(_dir.clone().multiplyScalar(2.5))
    _arrowPos.y += 1.5
    arrowRef.current.position.copy(_arrowPos)

    // Rotate arrow to point toward ring
    _targetQuat.setFromUnitVectors(_up, _dir)
    arrowRef.current.quaternion.slerp(_targetQuat, 0.1)
  })

  if (!nextRingPos) return null

  return (
    <group ref={arrowRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}