import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isSoundEnabled,
  setSoundEnabled,
  toggleSound,
  playCardDrawSound,
  playCardFlipSound,
  playTurnPassSound,
  playStageAdvanceSound,
  playUndoSound,
  playTokenPlaceSound,
  triggerHapticFeedback,
  getAmbientMood,
  startAmbientSoundscape,
  stopAmbientSoundscape,
  getAmbientVolume,
  setAmbientVolume,
} from '../engine/soundEngine'

describe('SoundEngine Module', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to sound enabled and toggles properly', () => {
    expect(isSoundEnabled()).toBe(true)

    const next = toggleSound()
    expect(next).toBe(false)
    expect(isSoundEnabled()).toBe(false)

    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
  })

  it('dispatches custom event on sound toggle', () => {
    const handler = vi.fn()
    window.addEventListener('wb:sound-toggle', handler)

    setSoundEnabled(false)
    expect(handler).toHaveBeenCalledTimes(1)

    window.removeEventListener('wb:sound-toggle', handler)
  })

  it('executes sound triggers safely without throwing in headless environments', () => {
    // Enabled
    setSoundEnabled(true)
    expect(() => playCardDrawSound()).not.toThrow()
    expect(() => playCardFlipSound()).not.toThrow()
    expect(() => playTurnPassSound()).not.toThrow()
    expect(() => playStageAdvanceSound()).not.toThrow()
    expect(() => playUndoSound()).not.toThrow()
    expect(() => playTokenPlaceSound()).not.toThrow()

    // Disabled
    setSoundEnabled(false)
    expect(() => playCardDrawSound()).not.toThrow()
    expect(() => playTokenPlaceSound()).not.toThrow()
    expect(() => playCardFlipSound()).not.toThrow()
    expect(() => playTurnPassSound()).not.toThrow()
    expect(() => playStageAdvanceSound()).not.toThrow()
    expect(() => playUndoSound()).not.toThrow()

    // Haptics
    expect(() => triggerHapticFeedback('light')).not.toThrow()
    expect(() => triggerHapticFeedback('celebration')).not.toThrow()
  })

  it('manages ambient soundscape moods and volume safely', () => {
    expect(getAmbientMood()).toBe('none')
    expect(getAmbientVolume()).toBe(0.25)

    setAmbientVolume(0.5)
    expect(getAmbientVolume()).toBe(0.5)

    expect(() => startAmbientSoundscape('ocean')).not.toThrow()
    expect(getAmbientMood()).toBe('ocean')

    expect(() => startAmbientSoundscape('campfire')).not.toThrow()
    expect(getAmbientMood()).toBe('campfire')

    expect(() => startAmbientSoundscape('ether')).not.toThrow()
    expect(getAmbientMood()).toBe('ether')

    expect(() => stopAmbientSoundscape()).not.toThrow()
    expect(getAmbientMood()).toBe('none')
  })
})
