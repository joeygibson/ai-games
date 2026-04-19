import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { RINGS } from '../store'
import audioEngine from '../audio/AudioEngine'
import { playerPosition } from '../refs'
import { getTouchInput } from '../touchControls'

const ACCELERATION = 0.018
const DAMPING = 0.96
const VERTICAL_DAMPING = 0.93
const MAX_SPEED = 0.7
const RING_TRIGGER_RADIUS = 2.8  // generous detection radius

// Reusable vectors
const _moveDir = new THREE.Vector3()
const _horizontalSpeed = new THREE.Vector2()
const _ringPos = new THREE.Vector3()

export default function PlayerOrb() {
  const groupRef = useRef()
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
  const keysRef = useRef({})
  const orbRef = useRef()
  const glowRef = useRef()
  const lightRef = useRef()
  const innerRef = useRef()

  const color = useStore((s) => s.color)
  const threeColor = useMemo(() => new THREE.Color(color), [color])

  useEffect(() => {
    const handleKeyDown = (e) => { keysRef.current[e.key.toLowerCase()] = true }
    const handleKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    const keys = keysRef.current
    const vel = velocityRef.current
    const pos = groupRef.current.position

    _moveDir.set(0, 0, 0)
    if (keys['w'] || keys['arrowup']) _moveDir.z -= 1
    if (keys['s'] || keys['arrowdown']) _moveDir.z += 1
    if (keys['a'] || keys['arrowleft']) _moveDir.x -= 1
    if (keys['d'] || keys['arrowright']) _moveDir.x += 1
    if (keys[' ']) _moveDir.y += 1
    if (keys['shift']) _moveDir.y -= 1

    const touch = getTouchInput()
    if (Math.abs(touch.dx) > 0.1 || Math.abs(touch.dy) > 0.1) {
      _moveDir.x += touch.dx
      _moveDir.z += touch.dy
    }

    if (_moveDir.lengthSq() > 0) _moveDir.normalize()

    vel.x += _moveDir.x * ACCELERATION
    vel.y += _moveDir.y * ACCELERATION * 0.7
    vel.z += _moveDir.z * ACCELERATION

    _horizontalSpeed.set(vel.x, vel.z)
    const hSpeed = _horizontalSpeed.length()
    if (hSpeed > MAX_SPEED) {
      const scale = MAX_SPEED / hSpeed
      vel.x *= scale
      vel.z *= scale
    }
    vel.y = THREE.MathUtils.clamp(vel.y, -MAX_SPEED * 0.5, MAX_SPEED * 0.5)

    vel.x *= DAMPING
    vel.z *= DAMPING
    vel.y *= VERTICAL_DAMPING

    pos.x += vel.x
    pos.y += vel.y
    pos.z += vel.z

    // Keep above ground, prevent going too high
    if (pos.y < 0.5) { pos.y = 0.5; vel.y = Math.max(0, vel.y) }
    if (pos.y > 20) { pos.y = 20; vel.y = Math.min(0, vel.y) }

    playerPosition.copy(pos)

    // Flow-based glow
    const flow = useStore.getState().flow / 100
    const time = state.clock.elapsedTime
    const breathe = 1 + Math.sin(time * 2) * 0.03
    const flowGlow = 1 + flow * 0.04

    if (orbRef.current) {
      orbRef.current.scale.setScalar(breathe * flowGlow)
      orbRef.current.material.emissive.copy(threeColor)
      orbRef.current.material.emissiveIntensity = 2 + flow * 3
      orbRef.current.material.color.copy(threeColor)
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(breathe * flowGlow * 1.1 + Math.sin(time * 3) * 0.05)
      innerRef.current.material.emissive.copy(threeColor)
      innerRef.current.material.emissiveIntensity = 4 + flow * 4
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(breathe * (1.6 + flow * 0.8))
      glowRef.current.material.color.copy(threeColor)
      glowRef.current.material.opacity = 0.12 + flow * 0.08
    }
    if (lightRef.current) {
      lightRef.current.color.copy(threeColor)
      lightRef.current.intensity = 8 + flow * 12
    }

    const speed = hSpeed / MAX_SPEED
    useStore.getState().setSpeed(speed)
    audioEngine.setFilterFromSpeed(speed)

    // Ring detection — proximity-based, generous radius
    const currentRingsPassed = useStore.getState().ringsPassed
    for (let i = 0; i < RINGS.length; i++) {
      const ring = RINGS[i]
      if (currentRingsPassed.includes(ring.id)) continue

      _ringPos.set(...ring.position)
      const dist = pos.distanceTo(_ringPos)

      if (dist < RING_TRIGGER_RADIUS) {
        const flowMult = useStore.getState().flowMultiplier
        useStore.getState().passRing(ring.id)
        audioEngine.playNote(ring.note, flowMult > 2 ? 3.5 : 2.5)
        audioEngine.playChime(ring.note * 0.5)
        audioEngine.setDroneShift(ring.id)
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          metalness={0.3}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={innerRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={4}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        color={color}
        intensity={8}
        distance={20}
        decay={2}
      />
    </group>
  )
}