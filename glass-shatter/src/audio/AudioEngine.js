class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.reverbSend = null
    this.reverb = null
    this.initialized = false
    this.droneNodes = []
  }

  init() {
    if (this.initialized) return
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.5
      this.masterGain.connect(this.ctx.destination)

      // Reverb
      this.reverb = this._createReverb()
      this.reverbSend = this.ctx.createGain()
      this.reverbSend.gain.value = 0.4
      this.reverbSend.connect(this.reverb)
      this.reverb.connect(this.masterGain)

      this.dryGain = this.ctx.createGain()
      this.dryGain.gain.value = 0.6
      this.dryGain.connect(this.masterGain)

      this._startDrone()
      this.initialized = true
    } catch (e) {
      console.warn('Audio init failed', e)
    }
  }

  _createReverb() {
    const convolver = this.ctx.createConvolver()
    const length = this.ctx.sampleRate * 3
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8)
      }
    }
    convolver.buffer = impulse
    return convolver
  }

  _startDrone() {
    const baseFreqs = [130.81, 196.00, 261.63] // C3, G3, C4
    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      gain.gain.value = 0.02

      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.type = 'sine'
      lfo.frequency.value = 0.08 + i * 0.03
      lfoGain.gain.value = freq * 0.005
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()

      osc.connect(gain)
      gain.connect(this.dryGain)
      gain.connect(this.reverbSend)
      osc.start()
      this.droneNodes.push({ osc, gain, lfo })
    })
  }

  // Glass clink/shatter sound
  playShatter(isSource = false) {
    if (!this.initialized) return
    const now = this.ctx.currentTime

    // Multiple glass clinks at different frequencies
    const baseFreqs = isSource
      ? [2200, 3300, 4400, 5500] // amber/warmer
      : [2800, 4200, 5600, 7000] // cyan/brighter

    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      // Slight detune for richness
      osc.frequency.value += (Math.random() - 0.5) * 200

      const delay = i * 0.015
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4)

      osc.connect(gain)
      gain.connect(this.dryGain)
      gain.connect(this.reverbSend)
      osc.start(now + delay)
      osc.stop(now + delay + 0.5)
    })

    // Noise burst for crunch
    const bufferSize = this.ctx.sampleRate * 0.15
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
    }
    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = this.ctx.createGain()
    noiseGain.gain.setValueAtTime(0.08, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    const noiseFilter = this.ctx.createBiquadFilter()
    noiseFilter.type = 'highpass'
    noiseFilter.frequency.value = 3000

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(this.reverbSend)
    noise.start(now)
    noise.stop(now + 0.2)

    // Low thud
    const thud = this.ctx.createOscillator()
    const thudGain = this.ctx.createGain()
    thud.type = 'sine'
    thud.frequency.value = 80
    thudGain.gain.setValueAtTime(0.15, now)
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    thud.connect(thudGain)
    thudGain.connect(this.dryGain)
    thud.start(now)
    thud.stop(now + 0.2)
  }

  // Level complete chord
  playComplete() {
    if (!this.initialized) return
    const now = this.ctx.currentTime
    const chord = [261.63, 329.63, 392.00, 523.25] // C4 E4 G4 C5
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq

      const delay = i * 0.1
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 2)

      osc.connect(gain)
      gain.connect(this.dryGain)
      gain.connect(this.reverbSend)
      osc.start(now + delay)
      osc.stop(now + delay + 2.5)

      // Octave shimmer
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2
      gain2.gain.setValueAtTime(0, now + delay)
      gain2.gain.linearRampToValueAtTime(0.04, now + delay + 0.05)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.5)
      osc2.connect(gain2)
      gain2.connect(this.reverbSend)
      osc2.start(now + delay)
      osc2.stop(now + delay + 2)
    })
  }

  // Bridge rising sound
  playBridgeRise() {
    if (!this.initialized) return
    const now = this.ctx.currentTime

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.linearRampToValueAtTime(800, now + 0.4)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc.connect(gain)
    gain.connect(this.reverbSend)
    osc.start(now)
    osc.stop(now + 0.6)
  }

  // Core move step tick
  playStep() {
    if (!this.initialized) return
    const now = this.ctx.currentTime

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1200 + Math.random() * 400
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(this.reverbSend)
    osc.start(now)
    osc.stop(now + 0.15)
  }
}

const audioEngine = new AudioEngine()
export default audioEngine