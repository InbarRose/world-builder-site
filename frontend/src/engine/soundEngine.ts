/**
 * Pure client-side Web Audio API synthesizer for tactile tabletop sound effects.
 * Requires 0 external audio assets, works 100% offline, and has zero latency.
 */

const SOUND_PREFERENCE_KEY = 'wb_sound_enabled'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }

  // Resume suspended context if user already interacted
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Ignored if browser blocks resume before user gesture
    })
  }

  return audioCtx
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem(SOUND_PREFERENCE_KEY)
  return saved === null ? true : saved === 'true'
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled))
  // Dispatch custom event so UI components can sync reactively
  window.dispatchEvent(new CustomEvent('wb:sound-toggle', { detail: { enabled } }))
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled()
  setSoundEnabled(next)
  return next
}

/**
 * Crisp paper card slide/flick sound.
 */
export function playCardDrawSound(): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const bufferSize = ctx.sampleRate * 0.08 // 80ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.Q.setValueAtTime(1.8, now)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
  } catch {
    // Fail silently in restricted sandbox
  }
}

/**
 * Resonant card-snap / flip sound.
 */
export function playCardFlipSound(): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.06)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.07)
  } catch {
    // Fail silently
  }
}

/**
 * Soft tabletop woodblock / confirmation chime when passing or verifying a turn.
 */
export function playTurnPassSound(): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, now) // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09) // A5

    gain.gain.setValueAtTime(0.14, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  } catch {
    // Fail silently
  }
}

/**
 * Grand harmonic chime when advancing across ages (Genesis -> Primal -> Civilization -> Intrigue).
 */
export function playStageAdvanceSound(): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    // C Major Arpeggio: C4, E4, G4, C5
    const notes = [261.63, 329.63, 392.0, 523.25]

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.07

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + 0.45)
    })
  } catch {
    // Fail silently
  }
}

/**
 * Soft rewinding swoosh when undoing canvas or timeline actions.
 */
export function playUndoSound(): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(700, now)
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.1)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.1)
  } catch {
    // Fail silently
  }
}

/**
 * Play a solid wooden/stone token placement sound when dropping settlements,
 * landmarks, or biomes directly onto the physical play mat.
 */
export function playTokenPlaceSound(): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08)

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  } catch {
    // Fail silently
  }
}

export type AmbientSoundscapeMood = 'none' | 'campfire' | 'ocean' | 'ether'

const AMBIENT_PREFERENCE_KEY = 'wb_ambient_mood'
const AMBIENT_VOLUME_KEY = 'wb_ambient_volume'

interface AmbientNodes {
  stop: () => void
  gainNode: GainNode
}

let activeAmbient: AmbientNodes | null = null

export function getAmbientMood(): AmbientSoundscapeMood {
  if (typeof window === 'undefined') return 'none'
  return (localStorage.getItem(AMBIENT_PREFERENCE_KEY) as AmbientSoundscapeMood) || 'none'
}

export function getAmbientVolume(): number {
  if (typeof window === 'undefined') return 0.25
  const saved = localStorage.getItem(AMBIENT_VOLUME_KEY)
  return saved ? parseFloat(saved) : 0.25
}

export function setAmbientVolume(vol: number): void {
  if (typeof window === 'undefined') return
  const clamped = Math.max(0, Math.min(1, vol))
  localStorage.setItem(AMBIENT_VOLUME_KEY, String(clamped))
  if (activeAmbient) {
    const ctx = getAudioContext()
    if (ctx) {
      activeAmbient.gainNode.gain.setValueAtTime(clamped, ctx.currentTime)
    }
  }
}

export function stopAmbientSoundscape(): void {
  if (activeAmbient) {
    try {
      activeAmbient.stop()
    } catch {
      // ignore
    }
    activeAmbient = null
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(AMBIENT_PREFERENCE_KEY, 'none')
    window.dispatchEvent(new CustomEvent('wb:ambient-change', { detail: { mood: 'none' } }))
  }
}

export function startAmbientSoundscape(mood: AmbientSoundscapeMood): void {
  stopAmbientSoundscape()
  if (mood === 'none' || !isSoundEnabled()) return

  if (typeof window !== 'undefined') {
    localStorage.setItem(AMBIENT_PREFERENCE_KEY, mood)
    window.dispatchEvent(new CustomEvent('wb:ambient-change', { detail: { mood } }))
  }

  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(getAmbientVolume(), ctx.currentTime)
    masterGain.connect(ctx.destination)

    const stopCallbacks: (() => void)[] = []

    if (mood === 'ocean') {
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.969 * b2 + white * 0.153852
        b3 = 0.8665 * b3 + white * 0.3104856
        b4 = 0.55 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.016898
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      }
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(320, ctx.currentTime)

      const lfo = ctx.createOscillator()
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime)
      const lfoGain = ctx.createGain()
      lfoGain.gain.setValueAtTime(260, ctx.currentTime)
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)

      noise.connect(filter)
      filter.connect(masterGain)

      noise.start()
      lfo.start()
      stopCallbacks.push(() => {
        try {
          noise.stop()
          lfo.stop()
        } catch {
          // ignore
        }
      })
    } else if (mood === 'campfire') {
      const bufferSize = ctx.sampleRate * 1.5
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.08
      }
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(450, ctx.currentTime)
      filter.Q.setValueAtTime(1.2, ctx.currentTime)

      noise.connect(filter)
      filter.connect(masterGain)
      noise.start()
      stopCallbacks.push(() => {
        try {
          noise.stop()
        } catch {
          // ignore
        }
      })
    } else if (mood === 'ether') {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(110, ctx.currentTime)
      osc2.frequency.setValueAtTime(165.2, ctx.currentTime)

      const oscGain = ctx.createGain()
      oscGain.gain.setValueAtTime(0.09, ctx.currentTime)

      osc1.connect(oscGain)
      osc2.connect(oscGain)
      oscGain.connect(masterGain)

      osc1.start()
      osc2.start()
      stopCallbacks.push(() => {
        try {
          osc1.stop()
          osc2.stop()
        } catch {
          // ignore
        }
      })
    }

    activeAmbient = {
      gainNode: masterGain,
      stop: () => {
        stopCallbacks.forEach((cb) => cb())
      },
    }

    localStorage.setItem(AMBIENT_PREFERENCE_KEY, mood)
    window.dispatchEvent(new CustomEvent('wb:ambient-change', { detail: { mood } }))
  } catch {
    // Fail silently in restricted sandbox
  }
}

