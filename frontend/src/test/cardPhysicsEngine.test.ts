import { describe, it, expect } from 'vitest'
import {
  computeCardTiltTransform,
  computeDeckStackLayers,
  pickSmartTargetTileForPreset,
  buildQuickCodexEntity,
} from '../engine/cardPhysicsEngine'
import { createInitialMap } from '../engine/mapEngine'
import { getActionPresetsForDraw } from '../engine/presets'

describe('Phase 22: Single-PC Driver UX, 3D Card Tactility & Smart Turn Flow (cardPhysicsEngine)', () => {
  it('computes 3D perspective card tilt and specular glare from cursor coordinates', () => {
    const rect = { left: 100, top: 100, width: 200, height: 280 }

    // Cursor at exact center -> zero tilt
    const center = computeCardTiltTransform(200, 240, rect, 12)
    expect(center.rotateX).toBe(0)
    expect(center.rotateY).toBe(0)
    expect(center.glareX).toBe(50)
    expect(center.glareY).toBe(50)

    // Cursor at top-right corner -> positive rotateX, positive rotateY
    const topRight = computeCardTiltTransform(300, 100, rect, 12)
    expect(topRight.rotateX).toBe(12)
    expect(topRight.rotateY).toBe(12)
    expect(topRight.transformStyle).toContain('perspective(900px)')
  })

  it('computes visual deck stack layers and thickness accurately as cards are drawn', () => {
    const full = computeDeckStackLayers(54, 54)
    expect(full.visibleLayers).toBe(6)
    expect(full.progressPercent).toBe(100)

    const half = computeDeckStackLayers(27, 54)
    expect(half.visibleLayers).toBe(3)
    expect(half.progressPercent).toBe(50)

    const empty = computeDeckStackLayers(0, 54)
    expect(empty.visibleLayers).toBe(0)
    expect(empty.progressPercent).toBe(0)
  })

  it('picks smart target map coordinates matching land vs water presets', () => {
    const map = createInitialMap(10, 8, 'continent')
    const earthPresets = getActionPresetsForDraw('genesis', '♠', false, false)
    const mountainPreset = earthPresets[0]

    const pickedId = pickSmartTargetTileForPreset(map, mountainPreset, '0,0')
    expect(pickedId).toMatch(/^\d+,\d+$/)
    expect(pickedId).not.toBe('0,0')
  })

  it('builds a quick-forged Codex entity linked to the active turn tile and preset', () => {
    const entity = buildQuickCodexEntity({
      name: 'Order of the Silver Peak',
      category: 'society',
      stage: 'civilization',
      tileId: '5,4',
      customDescription: 'Sworn guardians of the high pass.',
    })

    expect(entity.name).toBe('Order of the Silver Peak')
    expect(entity.category).toBe('society')
    expect(entity.stageCreated).toBe('civilization')
    expect(entity.originTileId).toBe('5,4')
    expect(entity.description).toContain('Sworn guardians')
  })
})
