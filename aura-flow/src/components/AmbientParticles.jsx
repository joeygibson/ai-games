import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 200
const SPREAD = 80

export default function AmbientParticles() {
  const meshRef = useRef()

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * SPREAD
      positions[i3 + 1] = Math.random() * 20 + 1
      positions[i3 + 2] = (Math.random() - 0.5) * SPREAD * 2 - 40

      velocities[i3] = (Math.random() - 0.5) * 0.003
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.002
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003

      sizes[i] = Math.random() * 3 + 1
    }
    return { positions, velocities, sizes }
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform float uPixelRatio;
        uniform float uTime;
        attribute float aSize;
        varying float vAlpha;
        void main() {
          vAlpha = 0.3;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (80.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
          gl_FragColor = vec4(0.6, 0.7, 1.0, alpha);
        }
      `,
    })
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return

    const posAttr = meshRef.current.geometry.getAttribute('position')
    material.uniforms.uTime.value = state.clock.elapsedTime

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3] += velocities[i3] + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.001
      positions[i3 + 1] += velocities[i3 + 1] + Math.sin(state.clock.elapsedTime * 0.2 + i * 0.5) * 0.001
      positions[i3 + 2] += velocities[i3 + 2]

      // Wrap around
      if (positions[i3] > SPREAD / 2) positions[i3] = -SPREAD / 2
      if (positions[i3] < -SPREAD / 2) positions[i3] = SPREAD / 2
      if (positions[i3 + 1] > 25) positions[i3 + 1] = 1
      if (positions[i3 + 1] < 0) positions[i3 + 1] = 20
      if (positions[i3 + 2] > SPREAD) positions[i3 + 2] = -SPREAD - 40
      if (positions[i3 + 2] < -SPREAD - 40) positions[i3 + 2] = SPREAD
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={meshRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}