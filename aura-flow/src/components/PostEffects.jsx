import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function PostEffects() {
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