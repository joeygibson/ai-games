import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { playerPosition } from '../refs'

const CAMERA_OFFSET = [0, 10, 16]
const CAMERA_LOOK_OFFSET = [0, 1, -8]
const LERP_FACTOR = 0.03

export default function CameraRig() {
  const { camera } = useThree()
  const currentLook = useRef({ x: 0, y: 2, z: -10 })

  useFrame(() => {
    // Smooth follow the player
    const desiredPosX = playerPosition.x + CAMERA_OFFSET[0]
    const desiredPosY = playerPosition.y + CAMERA_OFFSET[1]
    const desiredPosZ = playerPosition.z + CAMERA_OFFSET[2]

    const desiredLookX = playerPosition.x + CAMERA_LOOK_OFFSET[0]
    const desiredLookY = playerPosition.y + CAMERA_LOOK_OFFSET[1]
    const desiredLookZ = playerPosition.z + CAMERA_LOOK_OFFSET[2]

    // Lerp camera position
    camera.position.x += (desiredPosX - camera.position.x) * LERP_FACTOR
    camera.position.y += (desiredPosY - camera.position.y) * LERP_FACTOR
    camera.position.z += (desiredPosZ - camera.position.z) * LERP_FACTOR

    // Lerp look target
    currentLook.current.x += (desiredLookX - currentLook.current.x) * LERP_FACTOR
    currentLook.current.y += (desiredLookY - currentLook.current.y) * LERP_FACTOR
    currentLook.current.z += (desiredLookZ - currentLook.current.z) * LERP_FACTOR

    camera.lookAt(currentLook.current.x, currentLook.current.y, currentLook.current.z)
  })

  return null
}