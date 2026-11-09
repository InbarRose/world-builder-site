import { describe, it, expect } from 'vitest'
import {
  buildWorldTwoPageOverview,
  exportTwoPageOverviewMarkdown,
  toggleTwoPagerExcludeItem,
  toggleTwoPagerPinItem,
} from '../engine/twoPageOverviewEngine'
import { createNewWorld } from '../engine/storageService'
import { autoPlayFullWorld } from '../engine/autoPlayEngine'

describe('Phase 24: Deterministic Non-LLM 2-Page World Overview Engine (twoPageOverviewEngine)', () => {
  it('condenses a multi-stage simulated world into a structured 2-Page World Overview', () => {
    const base = createNewWorld('Aethelgard Prime')
    const simulated = autoPlayFullWorld(base, 4) // 16 turns across all 4 stages

    const overview = buildWorldTwoPageOverview(simulated)

    expect(overview.worldName).toBe('Aethelgard Prime')
    expect(overview.totalTurns).toBe(simulated.drawHistory.length)
    expect(overview.page1.executiveSynopsis).toContain('Aethelgard Prime')
    expect(overview.page1.biomeBreakdown.landPercent).toBeGreaterThan(0)
    expect(overview.page1.topLandmarks.length).toBeLessThanOrEqual(8)

    // Page 2 has 4 stage digests, each capped at <= 3 pivotal events
    expect(overview.page2.eraDigests.length).toBe(4)
    for (const digest of overview.page2.eraDigests) {
      expect(digest.pivotalEvents.length).toBeLessThanOrEqual(3)
    }
    expect(overview.page2.topEntities.length).toBeLessThanOrEqual(8)
  })

  it('exports a clean 2-Page Markdown document with Page 1 and Page 2 sections', () => {
    const base = createNewWorld('Solstice Reach')
    const simulated = autoPlayFullWorld(base, 3)
    const overview = buildWorldTwoPageOverview(simulated)

    const md = exportTwoPageOverviewMarkdown(overview)
    expect(md).toContain('# 📄 Solstice Reach — 2-Page World Overview')
    expect(md).toContain('## Page 1: Physical Atlas & Iconic Landmarks')
    expect(md).toContain('## Page 2: Peoples, Powers & The Four Ages Digest')
    expect(md).toContain('---')
  })

  it('honors Phase 25 custom 2-Pager pinning, exclusions, and synopsis override', () => {
    const base = createNewWorld('Curated Realm')
    const simulated = autoPlayFullWorld(base, 3)
    const targetEntityId = simulated.entities[simulated.entities.length - 1].id

    let config = toggleTwoPagerPinItem(undefined, 'entity', targetEntityId)
    config = toggleTwoPagerPinItem(config, 'tile', '0,0')
    config.customSynopsisOverride = 'Custom curated synopsis for table handout.'

    const curatedWorld = {
      ...simulated,
      twoPagerConfig: config,
    }
    const overview = buildWorldTwoPageOverview(curatedWorld)
    expect(overview.page1.hasCustomSynopsis).toBe(true)
    expect(overview.page1.executiveSynopsis).toBe('Custom curated synopsis for table handout.')
    expect(overview.page1.topLandmarks[0].tileId).toBe('0,0')
    expect(overview.page1.topLandmarks[0].isPinned).toBe(true)
    expect(overview.page2.topEntities[0].id).toBe(targetEntityId)
    expect(overview.page2.topEntities[0].isPinned).toBe(true)

    // Excluding removes the pinned flag and hides the entity
    const afterExclude = toggleTwoPagerExcludeItem(config, 'entity', targetEntityId)
    const overviewAfterExclude = buildWorldTwoPageOverview({
      ...simulated,
      twoPagerConfig: afterExclude,
    })
    expect(
      overviewAfterExclude.page2.topEntities.some((e) => e.id === targetEntityId)
    ).toBe(false)
  })
})
