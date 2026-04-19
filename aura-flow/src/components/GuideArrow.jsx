import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { RINGS } from '../store'
import { playerPosition } from '../refs'

// Bright beam that shows the way to the next ring
export default function GuideArrow() {
  const lineRef = useRef()
  const ringsPassed = useStore((s) => s.ringsPassed)

  const nextRingPos = useMemo(() => {
    const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
    if (unpassed.length === 0) return null
    return new THREE.Vector3(...unpassed[0].position)
  }, [ringsPassed])

  const nextRingColor = useMemo(() => {
    const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
    if (unpassed.length === 0) return '#ffffff'
    return unpassed[0].color
  }, [ringsPassed])

  // Pre-allocate line geometry: two points (start, end)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(6) // 2 points × 3 coords
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.25,
      linewidth: 1,
    })
  }, [])

  const _start = new THREE.Vector3()
  const _end = new THREE.Vector3()

  useFrame((state) => {
    if (!lineRef.current || !nextRingPos) {
      if (lineRef.current) lineRef.current.visible = false
      return
    }

    const dist = playerPosition.distanceTo(nextRingPos)

    // Hide when close
    if (dist < 5) {
      lineRef.current.visible = false
      return
    }

    lineRef.current.visible = true

    // Line starts 3 units ahead of player toward ring
    _start.copy(playerPosition)
    const dir = _end.copy(nextRingPos).sub(playerPosition).normalize()
    _start.add(dir.multiplyScalar(3))
    _start.y += 0.5 // slightly above eye level

    // Line ends partway toward ring (don't draw the full distance)
    _end.copy(nextRingPos)
    if (dist > 15) {
      _end.copy(playerPosition).add(dir.multiplyScalar(12))
    }

    const posAttr = lineRef.current.geometry.getAttribute('position')
    posAttr.array[0] = _start.x
    posAttr.array[1] = _start.y
    posAttr.array[2] = _start.z
    posAttr.array[3] = _end.x
    posAttr.array[4] = _end.y
    posAttr.array[5] = _end.z
    posAttr.needsUpdate = true

    // Pulse opacity
    const time = state.clock.elapsedTime
    material.opacity = 0.15 + Math.sin(time * 2) * 0.1
    material.color.set(nextRingColor)
  })

  if (!nextRingPos) return null

  return (
    <line ref={lineRef} geometry={geometry} material={material}>
    </line>
  )
}