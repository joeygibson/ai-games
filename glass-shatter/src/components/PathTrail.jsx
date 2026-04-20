import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { SPACING } from '../store'

export default function PathTrail() {
  const lineRef = useRef()
  const prevPathRef = useRef(null)

  const path = useStore(s => s.path)
  const phase = useStore(s => s.phase)
  const cols = useStore(s => s.cols)
  const rows = useStore(s => s.rows)

  const cellToWorld = (col, row) => [
    (col - (cols - 1) / 2) * SPACING,
    0.02,
    (row - (rows - 1) / 2) * SPACING,
  ]

  // Create initial geometry with dummy points
  const initialGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ])
  }, [])

  useFrame(() => {
    if (!lineRef.current) return

    const shouldShow = phase === 'core-moving' && path && path.length > 1

    if (shouldShow) {
      // Check if path changed
      const pathKey = path.map(p => p.join(',')).join(';')
      if (pathKey !== prevPathRef.current) {
        prevPathRef.current = pathKey
        const pts = path.map(([c, r]) => new THREE.Vector3(...cellToWorld(c, r)))
        const geometry = new THREE.BufferGeometry().setFromPoints(pts)
        lineRef.current.geometry.dispose()
        lineRef.current.geometry = geometry
      }
      lineRef.current.visible = true
    } else {
      lineRef.current.visible = false
      prevPathRef.current = null
    }
  })

  return (
    <line ref={lineRef} geometry={initialGeometry} visible={false}>
      <lineBasicMaterial
        color="#88ccee"
        transparent
        opacity={0.25}
      />
    </line>
  )
}