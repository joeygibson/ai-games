import { useMemo } from 'react'
import * as THREE from 'three'

const GROUND_SIZE = 400

export default function Ground() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: { value: new THREE.Color('#1a1a2e') },
        uLineColor: { value: new THREE.Color('#2a2a4e') },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uLineColor;
        varying vec3 vWorldPos;
        void main() {
          float scale = 2.0;
          vec2 grid = abs(fract(vWorldPos.xz / scale - 0.5) - 0.5);
          float line = min(grid.x, grid.y);
          float gridAlpha = 1.0 - smoothstep(0.0, 0.04, line);
          
          float dist = length(vWorldPos.xz);
          float fade = 1.0 - smoothstep(20.0, 100.0, dist);
          
          vec3 color = mix(uColor, uLineColor, gridAlpha * 0.5);
          float alpha = mix(0.6, 0.02, fade) + gridAlpha * 0.05;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
    })
  }, [])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, -80]}
      material={material}
    >
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
    </mesh>
  )
}