import { describe, it, expect } from 'vitest'
import {
  createDraftFromPreset,
  createCustomTurnDraft,
  generateDraftChronicleNote,
  stampDraftOnMapTile,
  syncDraftToDrawRecord,
  createBrainstormIdea,
  applyBrainstormIdea,
  appendChimeInQuote,
} from '../engine/turnWorkbenchEngine'
import { createDefaultTile } from '../engine/mapEngine'
import { getActionPresetsForDraw } from '../engine/presets'
import { DrawRecord } from '../engine/types'

describe('Phase 23: Editable Turn Event & Map Stamp Workbench Engine (turnWorkbenchEngine)', () => {
  it('populates a full editable TurnActionDraft from a StageActionPreset', () => {
    const presets = getActionPresetsForDraw('genesis', '♠', false, false)
    const preset = presets[0]
    const draft = createDraftFromPreset(preset, '5,4', 12345)

    expect(draft.source).toBe('preset')
    expect(draft.presetId).toBe(preset.id)
    expect(draft.actionTitle).toBe(preset.name)
    expect(draft.featureName.length).toBeGreaterThan(2)
    expect(draft.icon).toBe(preset.icon)
    expect(draft.note).toContain('5,4')
  })

  it('stamps a preset or custom draft onto a MapTile and updates in-place on subsequent edits', () => {
    const tile = createDefaultTile(5, 4)
    const presets = getActionPresetsForDraw('genesis', '♠', false, false)
    const preset = presets[0]
    const draft = createDraftFromPreset(preset, '5,4', 42)

    // First placement onto tile (5,4)
    const { updatedTile: placed1, slotChange: change1 } = stampDraftOnMapTile(
      tile,
      draft,
      'rec_turn_1',
      1
    )
    expect(placed1.label).toBe(draft.featureName)
    expect(placed1.slots?.length).toBe(1)
    expect(change1.slotName).toBe(draft.featureName)

    // Player edits the feature name and icon after placing it on the map
    const editedDraft = {
      ...draft,
      featureName: 'Obsidian Crown Peak',
      icon: '🌋',
      terrainChange: 'volcano' as const,
    }
    const { updatedTile: placed2, slotChange: change2 } = stampDraftOnMapTile(
      placed1,
      editedDraft,
      'rec_turn_1',
      1
    )

    // Updates in-place without duplicating slots!
    expect(placed2.slots?.length).toBe(1)
    expect(placed2.slots?.[0].name).toBe('Obsidian Crown Peak')
    expect(placed2.slots?.[0].icon).toBe('🌋')
    expect(placed2.label).toBe('Obsidian Crown Peak')
    expect(placed2.terrain).toBe('volcano')
    expect(change2.slotName).toBe('Obsidian Crown Peak')
  })

  it('creates a fast Custom TurnActionDraft and syncs edits into DrawRecord', () => {
    const customDraft = createCustomTurnDraft('civilization', 'Settlement', '6,3', 99)
    expect(customDraft.source).toBe('custom')
    expect(customDraft.actionTitle).toContain('Settlement')

    const editedCustom = {
      ...customDraft,
      actionTitle: 'Founding of Silverhaven',
      featureName: 'Silverhaven Citadel',
      icon: '🏰',
      placedTileIds: ['6,3'],
    }
    editedCustom.note = generateDraftChronicleNote(
      editedCustom,
      'civilization',
      '6,3',
      'Settlement',
      null
    )

    const baseRecord: DrawRecord = {
      id: 'rec_1',
      moveId: 1,
      card: { id: 'c1', suit: '♦', value: '8' },
      timestamp: new Date().toISOString(),
      stage: 'civilization',
      power: 'Settlement',
      note: '',
      linkedTileIds: [],
      linkedEntityIds: [],
    }

    const synced = syncDraftToDrawRecord(baseRecord, editedCustom)
    expect(synced.actionTitle).toBe('Founding of Silverhaven')
    expect(synced.note).toContain('Silverhaven Citadel')
    expect(synced.linkedTileIds).toContain('6,3')
    expect(synced.slotChanges?.[0].slotName).toBe('Silverhaven Citadel')
  })

  it('supports Phase 27 Table Brainstorm Candidate Stash and Player Chime-In Quotes', () => {
    const customDraft = createCustomTurnDraft('genesis', 'Mountain', '3,3', 101)
    customDraft.actionTitle = 'Titan Horn Spire'
    customDraft.featureName = 'The Great Horn'

    // 1. Create brainstorm candidate idea
    const idea = createBrainstormIdea(customDraft, 'Alice (Cartographer)')
    expect(idea.title).toBe('Titan Horn Spire')
    expect(idea.featureName).toBe('The Great Horn')
    expect(idea.suggestedBy).toBe('Alice (Cartographer)')

    // 2. Apply brainstorm idea onto a different active draft while preserving placement
    const activeDraft = createCustomTurnDraft('genesis', 'Ocean', '7,7', 202)
    activeDraft.placedTileIds = ['7,7']

    const swapped = applyBrainstormIdea(activeDraft, idea)
    expect(swapped.actionTitle).toBe('Titan Horn Spire')
    expect(swapped.featureName).toBe('The Great Horn')
    expect(swapped.placedTileIds).toEqual(['7,7'])

    // 3. Append player chime-in quote
    const noteWithQuote = appendChimeInQuote(
      'The mountain pierced the sky.',
      'Bob (Dwarf)',
      'Look at the veins of mithril in those sheer cliffs!'
    )
    expect(noteWithQuote).toContain('The mountain pierced the sky.')
    expect(noteWithQuote).toContain('> *"Look at the veins of mithril in those sheer cliffs!"*')
    expect(noteWithQuote).toContain('— **Bob (Dwarf)**')
  })
})
