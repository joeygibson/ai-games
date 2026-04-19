import { useEffect, useState } from 'react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

// Wrap in error boundary — if postprocessing fails, just skip it
export default function PostEffects() {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Test if WebGL is available
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) setHasError(true)
    } catch {
      setHasError(true)
    }
  }, [])

  if (hasError) return null

  return (
    <EffectComposer>
      <Bloom
        intensity={1.8}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}