import { useFrame, useThree } from '@react-three/fiber'
import useStore from '../store'

export default function MenuCamera() {
  const { camera } = useThree()
  const phase = useStore((s) => s.phase)

  useFrame((state) => {
    if (phase !== 'menu') return
    const time = state.clock.elapsedTime

    // Slow orbit around the scene
    const radius = 25
    const height = 8
    const speed = 0.08
    camera.position.x = Math.sin(time * speed) * radius
    camera.position.z = Math.cos(time * speed) * radius - 30
    camera.position.y = height + Math.sin(time * 0.1) * 2
    camera.lookAt(0, 3, -40)
  })

  return null
}