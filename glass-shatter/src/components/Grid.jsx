import { useRef, useState, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { SPACING } from '../store'
import { EMPTY, GLASS, WALL, VOID, SOURCE, EXIT, BRIDGE } from '../levels'
import { getHoveredBlock, setHoveredBlock } from '../hoverState'

// ─── Custom grid lines (perfectly aligned with cells) ────────
function GridLines({ cols, rows }) {
  const linePositions = useMemo(() => {
    const positions = []

    // Vertical lines (cols + 1)
    for (let c = 0; c <= cols; c++) {
      const x = (c - cols / 2) * SPACING
      const zStart = (0 - rows / 2) * SPACING
      const zEnd = (rows - rows / 2) * SPACING
      positions.push(x, 0, zStart, x, 0, zEnd)
    }
    // Horizontal lines (rows + 1)
    for (let r = 0; r <= rows; r++) {
      const z = (r - rows / 2) * SPACING
      const xStart = (0 - cols / 2) * SPACING
      const xEnd = (cols - cols / 2) * SPACING
      positions.push(xStart, 0, z, xEnd, 0, z)
    }
    return new Float32Array(positions)
  }, [cols, rows])

  return (
    <lineSegments position={[0, -0.09, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={linePositions.length / 3}
          array={linePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#1a2a3a"
        transparent
        opacity={0.4}
      />
    </lineSegments>
  )
}

// ─── Glass Block (clickable - glass or source) ───────────────
function GlassBlock({ col, row, x, z, isSource }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const shatterBlock = useStore(s => s.shatterBlock)
  const levelLoadTime = useStore(s => s.levelLoadTime)

  const color = isSource ? '#ddaa44' : '#66ddff'
  const emissiveColor = isSource ? '#cc9922' : '#3399cc'
  const targetY = 0.5

  useFrame(() => {
    if (!meshRef.current) return
    const elapsed = performance.now() / 1000 - levelLoadTime
    const delay = (col + row) * 0.06
    const t = Math.max(0, elapsed - delay)
    const progress = Math.min(1, t / 0.45)
    // Ease out back
    const c1 = 1.70158
    const c3 = c1 + 1
    const eased = progress === 1
      ? 1
      : 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2)

    meshRef.current.position.y = -1.5 + eased * targetY

    // Hover scale
    const targetScale = hovered ? 1.05 : 1.0
    const s = meshRef.current.scale
    s.x += (targetScale - s.x) * 0.15
    s.y += (targetScale - s.y) * 0.15
    s.z += (targetScale - s.z) * 0.15

    // Emissive pulse for source
    if (isSource) {
      const pulse = 0.4 + Math.sin(performance.now() / 1000 * 3) * 0.2
      meshRef.current.material.emissiveIntensity = pulse
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[x, -1.5, z]}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
        setHoveredBlock(isSource ? { col, row, type: SOURCE } : { col, row, type: GLASS })
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
        setHoveredBlock(null)
      }}
      onClick={() => shatterBlock(col, row)}
    >
      <boxGeometry args={[1.15, 1.0, 1.15]} />
      <meshPhysicalMaterial
        color={hovered ? '#ccddff' : color}
        transparent
        opacity={1.0}
        metalness={0.0}
        roughness={0.05}
        transmission={0.65}
        thickness={1.2}
        ior={1.45}
        clearcoat={1}
        clearcoatRoughness={0.05}
        emissive={emissiveColor}
        emissiveIntensity={isSource ? 0.6 : 0.4}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

// ─── Wall Block ──────────────────────────────────────────────
function WallBlock({ x, z, col, row }) {
  const meshRef = useRef()
  const levelLoadTime = useStore(s => s.levelLoadTime)

  useFrame(() => {
    if (!meshRef.current) return
    const elapsed = performance.now() / 1000 - levelLoadTime
    const delay = (col + row) * 0.06 + 0.15
    const t = Math.max(0, elapsed - delay)
    const progress = Math.min(1, t / 0.5)
    const eased = 1 - Math.pow(1 - progress, 3)
    meshRef.current.position.y = -1.5 + eased * 0.75
  })

  return (
    <mesh ref={meshRef} position={[x, -1.5, z]}>
      <boxGeometry args={[1.18, 1.5, 1.18]} />
      <meshStandardMaterial
        color="#1e1e2a"
        metalness={0.3}
        roughness={0.8}
        emissive="#0a0a15"
        emissiveIntensity={0.08}
      />
    </mesh>
  )
}

// ─── Void Cell ───────────────────────────────────────────────
function VoidCell({ x, z, col, row }) {
  const previewRef = useRef()

  useFrame(() => {
    if (!previewRef.current) return
    const hovered = getHoveredBlock()
    if (hovered && hovered.type === SOURCE) {
      const dc = Math.abs(hovered.col - col)
      const dr = Math.abs(hovered.row - row)
      const isAdjacent = (dc + dr) === 1
      previewRef.current.visible = isAdjacent
    } else {
      previewRef.current.visible = false
    }
  })

  return (
    <group position={[x, 0, z]}>
      {/* Dark pit */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial color="#0a0005" transparent opacity={0.9} />
      </mesh>
      {/* Danger glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <ringGeometry args={[0.3, 0.55, 4]} />
        <meshBasicMaterial
          color="#cc3333"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bridge preview glow when adjacent source hovered */}
      <mesh ref={previewRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} visible={false}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial
          color="#ddaa44"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─── Bridge Block ────────────────────────────────────────────
function BridgeBlock({ x, z, col, row }) {
  const meshRef = useRef()
  const bridgeAnims = useStore(s => s.bridgeAnims)
  const animTime = bridgeAnims[`${col},${row}`] || 0

  useFrame(() => {
    if (!meshRef.current) return
    const elapsed = performance.now() / 1000 - animTime
    const progress = Math.min(1, Math.max(0, elapsed / 0.5))
    const eased = 1 - Math.pow(1 - progress, 3)
    meshRef.current.position.y = -0.5 + eased * 0.15
    meshRef.current.scale.y = 0.01 + eased * 0.99
  })

  return (
    <mesh ref={meshRef} position={[x, -0.5, z]} scale={[1, 0.01, 1]}>
      <boxGeometry args={[1.15, 0.25, 1.15]} />
      <meshPhysicalMaterial
        color="#bbddff"
        transparent
        opacity={1.0}
        metalness={0.0}
        roughness={0.1}
        transmission={0.45}
        thickness={0.3}
        ior={1.4}
        clearcoat={1}
        clearcoatRoughness={0.1}
        emissive="#6688aa"
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

// ─── Exit Portal ─────────────────────────────────────────────
function ExitPortal({ x, z }) {
  const ringRef = useRef()
  const lightRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5
      const pulse = 1 + Math.sin(t * 2.5) * 0.1
      ringRef.current.scale.setScalar(pulse)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3 + Math.sin(t * 2.5) * 1
    }
  })

  return (
    <group position={[x, 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#ffaa33" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.35, 0.5, 32]} />
        <meshBasicMaterial
          color="#ffcc44"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#ffaa33"
        intensity={3}
        distance={6}
        decay={2}
        position={[0, 0.5, 0]}
      />
    </group>
  )
}

// ─── Walkable cell floor tile ────────────────────────────────
function FloorTile({ x, z }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.095, z]}>
      <planeGeometry args={[1.35, 1.35]} />
      <meshStandardMaterial
        color="#121220"
        metalness={0.5}
        roughness={0.5}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

// ─── Main Grid Component ─────────────────────────────────────
export default function Grid() {
  const grid = useStore(s => s.grid)
  const cols = useStore(s => s.cols)
  const rows = useStore(s => s.rows)

  // Reset cursor when grid changes or phase changes
  useEffect(() => {
    document.body.style.cursor = 'default'
    setHoveredBlock(null)
  }, [grid])

  const floorWidth = (cols + 2) * SPACING
  const floorDepth = (rows + 2) * SPACING

  if (!grid || grid.length === 0) return null

  return (
    <group>
      {/* Dark reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[floorWidth, floorDepth]} />
        <meshStandardMaterial color="#0c0c18" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Grid lines */}
      <GridLines cols={cols} rows={rows} />

      {/* Render all cells */}
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const x = (c - (cols - 1) / 2) * SPACING
          const z = (r - (rows - 1) / 2) * SPACING

          switch (cell) {
            case GLASS:
              return [
                <FloorTile key={`t${c},${r}`} x={x} z={z} />,
                <GlassBlock key={`${c},${r}`} col={c} row={r} x={x} z={z} isSource={false} />
              ]
            case SOURCE:
              return [
                <FloorTile key={`t${c},${r}`} x={x} z={z} />,
                <GlassBlock key={`${c},${r}`} col={c} row={r} x={x} z={z} isSource={true} />
              ]
            case WALL:
              return <WallBlock key={`${c},${r}`} col={c} row={r} x={x} z={z} />
            case VOID:
              return <VoidCell key={`${c},${r}`} col={c} row={r} x={x} z={z} />
            case BRIDGE:
              return [
                <FloorTile key={`t${c},${r}`} x={x} z={z} />,
                <BridgeBlock key={`${c},${r}`} col={c} row={r} x={x} z={z} />
              ]
            case EXIT:
              return [
                <FloorTile key={`t${c},${r}`} x={x} z={z} />,
                <ExitPortal key={`${c},${r}`} x={x} z={z} />
              ]
            case EMPTY:
              return <FloorTile key={`t${c},${r}`} x={x} z={z} />
            default:
              return null
          }
        })
      )}
    </group>
  )
}