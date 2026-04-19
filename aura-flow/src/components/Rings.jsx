import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { RINGS, RING_OPENING_RADIUS } from '../store'


function Ring({ id, position, color, isNext }) {
  const groupRef = useRef()
  const torusRef = useRef()
  const glowRef = useRef()
  const lightRef = useRef()
  const burstRef = useRef()
  const passed = useStore((s) => s.ringsPassed.includes(id))
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, [])
  const burstTriggered = useRef(false)
  const burstScale = useRef(0)
  const burstOpacity = useRef(0)

  useFrame((state) => {
    const time = state.clock.elapsedTime + timeOffset

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.3
    }

    if (torusRef.current) {
      const rotSpeed = isNext && !passed ? 0.005 : 0.001
      torusRef.current.rotation.y += rotSpeed
      // Subtle tilt wobble
      torusRef.current.rotation.x = Math.sin(time * 0.3) * 0.05
    }

    if (torusRef.current?.material) {
      let pulseIntensity, opacity
      if (passed) {
        pulseIntensity = 2.5
        opacity = 1
      } else if (isNext) {
        pulseIntensity = 1.8 + Math.sin(time * 3) * 1.0
        opacity = 0.85
      } else {
        pulseIntensity = 0.5 + Math.sin(time * 2) * 0.2
        opacity = 0.4
      }
      torusRef.current.material.emissiveIntensity = pulseIntensity
      torusRef.current.material.opacity = opacity
    }

    if (glowRef.current) {
      const glowScale = passed ? 1.4 : (isNext ? (1.2 + Math.sin(time * 1.5) * 0.2) : (1 + Math.sin(time * 1.5) * 0.1))
      glowRef.current.scale.setScalar(glowScale)
      if (glowRef.current.material) {
        glowRef.current.material.opacity = passed ? 0.1 : (isNext ? (0.06 + Math.sin(time * 2) * 0.04) : 0.025)
      }
    }

    if (lightRef.current) {
      if (passed) lightRef.current.intensity = 6
      else if (isNext) lightRef.current.intensity = 4 + Math.sin(time * 3) * 2
      else lightRef.current.intensity = 1.5 + Math.sin(time * 2) * 0.5
    }

    if (burstRef.current) {
      if (passed && !burstTriggered.current) {
        burstTriggered.current = true
        burstScale.current = 1
        burstOpacity.current = 0.8
      }
      if (burstTriggered.current && burstScale.current > 0.01) {
        burstScale.current *= 0.93
        burstOpacity.current *= 0.91
        burstRef.current.scale.setScalar(burstScale.current * 5)
        if (burstRef.current.material) burstRef.current.material.opacity = burstOpacity.current
      } else if (burstTriggered.current && burstScale.current <= 0.01) {
        burstRef.current.scale.setScalar(0)
        burstScale.current = 0
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Main ring torus — vertical, facing Z axis (like a portal) */}
      <mesh ref={torusRef}>
        <torusGeometry args={[RING_OPENING_RADIUS, 0.06, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
          toneMapped={false}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Decorative inner ring */}
      <mesh>
        <torusGeometry args={[RING_OPENING_RADIUS * 0.8, 0.02, 8, 80]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Glow disc — semi-transparent portal surface */}
      <mesh>
        <circleGeometry args={[RING_OPENING_RADIUS * 0.95, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isNext && !passed ? 0.06 : (passed ? 0.08 : 0.02)}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Glow sphere around ring */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {/* Burst effect */}
      <mesh ref={burstRef} scale={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color={color}
        intensity={2}
        distance={18}
        decay={2}
      />
    </group>
  )
}

export default function Rings() {
  const ringsPassed = useStore((s) => s.ringsPassed)
  const nextRingId = useMemo(() => {
    const unpassed = RINGS.filter(r => !ringsPassed.includes(r.id))
    return unpassed.length > 0 ? Math.min(...unpassed.map(r => r.id)) : -1
  }, [ringsPassed])

  return (
    <group>
      {RINGS.map((ring) => (
        <Ring
          key={ring.id}
          id={ring.id}
          position={ring.position}
          color={ring.color}
          isNext={ring.id === nextRingId}
        />
      ))}
    </group>
  )
}