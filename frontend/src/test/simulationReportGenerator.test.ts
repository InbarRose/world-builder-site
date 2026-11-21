import { describe, it, expect } from 'vitest'
import { runFullSimulationSuite } from '../engine/simulationReportEngine'

describe('Phase 57: Headless 320-Permutation Simulation Report Generator (ADR-061)', () => {
  it('runs 320 permutations (120 bare maps + 150 4-stage campaigns + 50 turn sessions) with 0 failures and produces inspectable output', async () => {
    const result = runFullSimulationSuite({
      bareSeedsPerPreset: 20,
      campaignsPerPreset: 25,
      turnsPerStage: 4,
      sessionPermutations: 50,
    })

    // 1. All 120 bare maps must pass
    for (const stat of result.bareMapStats) {
      expect(stat.passed).toBe(stat.runs)
      expect(stat.maxRiversOrSettlements).toBe(0)
    }

    // 2. All 150 4-stage campaigns (2,400 turns) must complete cleanly with 0 invariant errors
    expect(result.campaignSummary.totalCampaigns).toBe(150)
    expect(result.campaignSummary.allFourStagesReached).toBe(150)
    expect(result.campaignSummary.totalTurnsSimulated).toBeGreaterThanOrEqual(2400)
    expect(result.campaignSummary.invariantFailures).toBe(0)
    expect(result.campaignSummary.jsonRoundTripsVerified).toBe(30)
    expect(result.campaignSummary.avgSettlementsEnd).toBeGreaterThan(0)

    // 3. All 50 card flexibility & turn session permutations must pass
    expect(result.sessionSummary.passed).toBe(50)
    expect(result.sessionSummary.minExamplesPerDraw).toBeGreaterThanOrEqual(20)
    expect(result.sessionSummary.minPresetsPerDraw).toBeGreaterThanOrEqual(12)

    // 4. Showcase worlds & report markdown
    expect(result.showcaseWorlds.length).toBe(3)
    expect(result.markdown).toContain('Showcase World #1: Valdoria (Continent)')
    expect(result.markdown).toContain('Showcase World #2: The Shattered Isles (Archipelago)')
    expect(result.markdown).toContain('Showcase World #3: Twin Realms of Sol & Vesper (Twin Continents)')

    const nodeProcess = (globalThis as Record<string, any>).process
    if (nodeProcess?.env?.WRITE_SIM_REPORT === '1') {
      const fsMod = 'node:fs'
      const pathMod = 'node:path'
      const fs: any = await import(/* @vite-ignore */ fsMod)
      const path: any = await import(/* @vite-ignore */ pathMod)
      const reportPath = path.resolve(nodeProcess.cwd(), '../docs/SIMULATION_REPORT.md')
      fs.writeFileSync(reportPath, result.markdown, 'utf-8')
    }
  })
})
