class AudioEngine {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.reverbSend = null
    this.reverb = null
    this.padNodes = []
    this.filterNode = null
    this.initialized = false
    this.currentScale = []
  }

  init() {
    if (this.initialized) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    
    // Master gain
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.4
    this.masterGain.connect(this.ctx.destination)

    // Reverb
    this.reverb = this._createReverb()
    this.reverbSend = this.ctx.createGain()
    this.reverbSend.gain.value = 0.3
    this.reverbSend.connect(this.reverb)
    this.reverb.connect(this.masterGain)

    // Dry send
    this.dryGain = this.ctx.createGain()
    this.dryGain.gain.value = 0.7
    this.dryGain.connect(this.masterGain)

    // Master filter for dynamics
    this.filterNode = this.ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.value = 800
    this.filterNode.Q.value = 0.7
    this.filterNode.connect(this.dryGain)
    this.filterNode.connect(this.reverbSend)

    // Start drone
    this._startDrone()

    this.initialized = true
  }

  _createReverb() {
    const convolver = this.ctx.createConvolver()
    const length = this.ctx.sampleRate * 4
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5)
      }
    }
    convolver.buffer = impulse
    return convolver
  }

  _startDrone() {
    // Ambient pad - pentatonic drone
    const baseFreqs = [65.41, 98.00, 130.81] // C2, G2, C3
    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      gain.gain.value = 0.04

      // Slow LFO for movement
      const lfo = this.ctx.createOscillator()
      const lfoGain = this.ctx.createGain()
      lfo.type = 'sine'
      lfo.frequency.value = 0.1 + i * 0.05
      lfoGain.gain.value = freq * 0.01 // slight vibrato
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      lfo.start()

      osc.connect(gain)
      gain.connect(this.filterNode)
      osc.start()
      this.padNodes.push({ osc, gain, lfo, lfoGain })
    })
  }

  playNote(frequency, duration = 2.5) {
    if (!this.initialized) return
    const now = this.ctx.currentTime

    // Main tone
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.value = frequency
    filter.type = 'lowpass'
    filter.frequency.value = 2000
    filter.Q.value = 1

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.18, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.dryGain)
    gain.connect(this.reverbSend)

    osc.start(now)
    osc.stop(now + duration)

    // Harmonic overtone
    const osc2 = this.ctx.createOscillator()
    const gain2 = this.ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = frequency * 2 // octave
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.05, now + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7)
    osc2.connect(gain2)
    gain2.connect(this.reverbSend)
    osc2.start(now)
    osc2.stop(now + duration)
  }

  setFilterFromSpeed(speed) {
    if (!this.initialized) return
    // speed 0 -> cutoff 600, speed 1 -> cutoff 2400
    const freq = 600 + speed * 1800
    this.filterNode.frequency.linearRampToValueAtTime(
      Math.min(freq, 2400),
      this.ctx.currentTime + 0.1
    )
  }

  setDroneShift(index) {
    if (!this.initialized) return
    const shifts = [0, 1, 2, 3, 4, 5, 6, 7]
    this.padNodes.forEach(({ osc }, i) => {
      const base = [65.41, 98.00, 130.81][i]
      osc.frequency.linearRampToValueAtTime(
        base * Math.pow(2, shifts[index] / 24),
        this.ctx.currentTime + 2
      )
    })
  }

  // Bright chime for ring passage — more noticeable than the note
  playChime(frequency, duration = 1.5) {
    if (!this.initialized) return
    const now = this.ctx.currentTime

    // Bright bell tone
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency * 2 // one octave up for brightness

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.reverbSend)
    osc.start(now)
    osc.stop(now + duration)

    // Second harmonic for shimmer
    const osc2 = this.ctx.createOscillator()
    const gain2 = this.ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = frequency * 3
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.01)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.5)
    osc2.connect(gain2)
    gain2.connect(this.reverbSend)
    osc2.start(now)
    osc2.stop(now + duration)
  }
}

const audioEngine = new AudioEngine()
export default audioEngine