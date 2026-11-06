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

    // Disabled
    setSoundEnabled(false)
    expect(() => playCardDrawSound()).not.toThrow()
    expect(() => playCardFlipSound()).not.toThrow()
    expect(() => playTurnPassSound()).not.toThrow()
    expect(() => playStageAdvanceSound()).not.toThrow()
    expect(() => playUndoSound()).not.toThrow()
  })
})
