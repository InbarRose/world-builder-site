import { describe, it, expect } from 'vitest'
import {
  buildWorldTwoPageOverview,
  exportTwoPageOverviewMarkdown,
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
})
