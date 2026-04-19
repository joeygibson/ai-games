import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { playerPosition } from '../refs'

// Camera follows from above and behind — always keeps player visible
const CAMERA_OFFSET = [0, 12, 18]    // higher and further back
const CAMERA_LOOK_OFFSET = [0, 0, -5] // look straight at player level, slightly ahead
const LERP_FACTOR = 0.05             // faster follow (was 0.03)

export default function CameraRig() {
  const { camera } = useThree()
  const currentLook = useRef({ x: 0, y: 2, z: -5 })

  useFrame(() => {
    const desiredPosX = playerPosition.x + CAMERA_OFFSET[0]
    const desiredPosY = playerPosition.y + CAMERA_OFFSET[1]
    const desiredPosZ = playerPosition.z + CAMERA_OFFSET[2]

    const desiredLookX = playerPosition.x + CAMERA_LOOK_OFFSET[0]
    const desiredLookY = playerPosition.y + CAMERA_LOOK_OFFSET[1]
    const desiredLookZ = playerPosition.z + CAMERA_LOOK_OFFSET[2]

    camera.position.x += (desiredPosX - camera.position.x) * LERP_FACTOR
    camera.position.y += (desiredPosY - camera.position.y) * LERP_FACTOR
    camera.position.z += (desiredPosZ - camera.position.z) * LERP_FACTOR

    currentLook.current.x += (desiredLookX - currentLook.current.x) * LERP_FACTOR
    currentLook.current.y += (desiredLookY - currentLook.current.y) * LERP_FACTOR
    currentLook.current.z += (desiredLookZ - currentLook.current.z) * LERP_FACTOR

    camera.lookAt(currentLook.current.x, currentLook.current.y, currentLook.current.z)
  })

  return null
}