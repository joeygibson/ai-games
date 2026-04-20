import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { SPACING } from '../store'

export default function CameraController() {
  const { camera } = useThree()
  const shakeRef = useRef(new THREE.Vector3())
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  const phase = useStore(s => s.phase)
  const cols = useStore(s => s.cols)
  const rows = useStore(s => s.rows)

  useFrame((_, delta) => {
    // Compute camera target based on grid size
    const gridMax = Math.max(cols || 5, rows || 5)
    const dist = gridMax * 0.95

    targetPos.current.set(0, dist * 0.85, dist * 0.65)
    targetLookAt.current.set(0, 0, 0.3)

    // Smooth camera position
    camera.position.lerp(targetPos.current, 0.04)

    // Screen shake
    const shakeIntensity = useStore.getState().shakeIntensity
    if (shakeIntensity > 0.01) {
      shakeRef.current.set(
        (Math.random() - 0.5) * shakeIntensity * 0.15,
        (Math.random() - 0.5) * shakeIntensity * 0.1,
        (Math.random() - 0.5) * shakeIntensity * 0.15
      )
      camera.position.add(shakeRef.current)
      useStore.getState().reduceShake(delta)
    } else {
      shakeRef.current.set(0, 0, 0)
    }

    // Look at center
    camera.lookAt(targetLookAt.current)
  })

  return null
}