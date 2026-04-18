import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store'
import { playerPosition } from '../refs'

const MAX_POINTS = 8000
const POINT_SIZE = 14
const TRAIL_ADD_RATE = 2 // add a point every N frames

export default function Trail() {
  const pointsRef = useRef()
  const currentIdx = useRef(0)
  const frameCount = useRef(0)

  const color = useStore((s) => s.color)
  const phase = useStore((s) => s.phase)
  const threeColor = useRef(new THREE.Color(color))
  const lastColor = useRef(color)

  // Update cached color when it changes
  if (lastColor.current !== color) {
    threeColor.current.set(color)
    lastColor.current = color
  }

  // Pre-allocate buffers
  const { positions, trailColors, sizes, opacities } = useMemo(() => {
    const positions = new Float32Array(MAX_POINTS * 3)
    const trailColors = new Float32Array(MAX_POINTS * 3)
    const sizes = new Float32Array(MAX_POINTS).fill(0)
    const opacities = new Float32Array(MAX_POINTS).fill(0)
    return { positions, trailColors, sizes, opacities }
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uPixelRatio;
        attribute float aSize;
        attribute float aOpacity;
        attribute vec3 aColor;
        varying float vOpacity;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 0.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying vec3 vColor;
        void main() {
          if (vOpacity < 0.01) discard;
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.05, dist) * vOpacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    })
  }, [])

  useFrame(() => {
    if (phase !== 'playing' || !pointsRef.current) return

    const geometry = pointsRef.current.geometry
    const posAttr = geometry.getAttribute('position')
    const colorAttr = geometry.getAttribute('aColor')
    const sizeAttr = geometry.getAttribute('aSize')
    const opacAttr = geometry.getAttribute('aOpacity')

    frameCount.current++

    // Add a point every few frames
    if (frameCount.current % TRAIL_ADD_RATE === 0) {
      const idx = currentIdx.current % MAX_POINTS
      const i3 = idx * 3

      positions[i3] = playerPosition.x + (Math.random() - 0.5) * 0.05
      positions[i3 + 1] = playerPosition.y + (Math.random() - 0.5) * 0.05
      positions[i3 + 2] = playerPosition.z + (Math.random() - 0.5) * 0.05

      const c = threeColor.current
      trailColors[i3] = c.r
      trailColors[i3 + 1] = c.g
      trailColors[i3 + 2] = c.b

      sizes[idx] = POINT_SIZE
      opacities[idx] = 0.9

      currentIdx.current++

      posAttr.needsUpdate = true
      colorAttr.needsUpdate = true
      sizeAttr.needsUpdate = true
      opacAttr.needsUpdate = true
    }

    // Fade all active points
    const total = Math.min(currentIdx.current, MAX_POINTS)
    for (let i = 0; i < total; i++) {
      if (opacities[i] > 0.01) {
        if (opacities[i] > 0.2) {
          // Recent trail fades gently
          opacities[i] *= 0.9988
        } else {
          // Old trail settles to persistent dim glow
          opacities[i] = Math.max(opacities[i] * 0.9999, 0.015)
        }
      } else {
        opacities[i] = 0
      }
    }
    opacAttr.needsUpdate = true

    geometry.setDrawRange(0, total)
  })

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_POINTS}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={MAX_POINTS}
          array={trailColors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={MAX_POINTS}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          count={MAX_POINTS}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}