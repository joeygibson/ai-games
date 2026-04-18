import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore, { RINGS } from '../store'
import audioEngine from '../audio/AudioEngine'
import { playerPosition } from '../refs'
import { getTouchInput } from '../touchControls'

const ACCELERATION = 0.015
const DAMPING = 0.96
const VERTICAL_DAMPING = 0.93
const MAX_SPEED = 0.7
const RING_TRIGGER_RADIUS = 2.5

// Reusable vectors to avoid GC
const _moveDir = new THREE.Vector3()
const _horizontalSpeed = new THREE.Vector2()
const _ringPos = new THREE.Vector3()
const _toRing = new THREE.Vector3()

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
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true
    }
    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false
    }
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

    // Calculate movement direction
    _moveDir.set(0, 0, 0)
    if (keys['w'] || keys['arrowup']) _moveDir.z -= 1
    if (keys['s'] || keys['arrowdown']) _moveDir.z += 1
    if (keys['a'] || keys['arrowleft']) _moveDir.x -= 1
    if (keys['d'] || keys['arrowright']) _moveDir.x += 1
    if (keys[' ']) _moveDir.y += 1
    if (keys['shift']) _moveDir.y -= 1

    // Touch input (mobile)
    const touch = getTouchInput()
    if (Math.abs(touch.dx) > 0.1 || Math.abs(touch.dy) > 0.1) {
      _moveDir.x += touch.dx
      _moveDir.z += touch.dy
    }

    if (_moveDir.lengthSq() > 0) {
      _moveDir.normalize()
    }

    // Apply acceleration
    vel.x += _moveDir.x * ACCELERATION
    vel.y += _moveDir.y * ACCELERATION * 0.7
    vel.z += _moveDir.z * ACCELERATION

    // Clamp horizontal speed
    _horizontalSpeed.set(vel.x, vel.z)
    const hSpeed = _horizontalSpeed.length()
    if (hSpeed > MAX_SPEED) {
      const scale = MAX_SPEED / hSpeed
      vel.x *= scale
      vel.z *= scale
    }
    vel.y = THREE.MathUtils.clamp(vel.y, -MAX_SPEED * 0.5, MAX_SPEED * 0.5)

    // Apply damping (floating in oil)
    vel.x *= DAMPING
    vel.z *= DAMPING
    vel.y *= VERTICAL_DAMPING

    // Update position
    pos.x += vel.x
    pos.y += vel.y
    pos.z += vel.z

    // Keep above ground
    if (pos.y < 0.5) {
      pos.y = 0.5
      vel.y = Math.max(0, vel.y)
    }

    // Write to shared ref for other components
    playerPosition.copy(pos)

    // Breathing animation
    const time = state.clock.elapsedTime
    const breathe = 1 + Math.sin(time * 2) * 0.03
    if (orbRef.current) {
      orbRef.current.scale.setScalar(breathe)
      orbRef.current.material.emissive.copy(threeColor)
      orbRef.current.material.color.copy(threeColor)
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(breathe * 1.1 + Math.sin(time * 3) * 0.05)
      innerRef.current.material.emissive.copy(threeColor)
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(breathe * 1.6)
      glowRef.current.material.color.copy(threeColor)
    }
    if (lightRef.current) {
      lightRef.current.color.copy(threeColor)
    }

    // Update audio filter based on speed
    const speed = hSpeed / MAX_SPEED
    useStore.getState().setSpeed(speed)
    audioEngine.setFilterFromSpeed(speed)

    // Check ring collisions
    const currentRingsPassed = useStore.getState().ringsPassed
    for (let i = 0; i < RINGS.length; i++) {
      const ring = RINGS[i]
      if (currentRingsPassed.includes(ring.id)) continue
      _ringPos.set(...ring.position)
      if (pos.distanceTo(_ringPos) < RING_TRIGGER_RADIUS) {
        useStore.getState().passRing(ring.id)
        audioEngine.playNote(ring.note)
        audioEngine.setDroneShift(ring.id)
        // Gentle push toward ring center
        _toRing.copy(_ringPos).sub(pos).normalize()
        vel.add(_toRing.multiplyScalar(0.05))
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