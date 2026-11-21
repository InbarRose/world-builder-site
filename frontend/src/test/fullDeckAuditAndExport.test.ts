import { describe, it, expect } from 'vitest'
import {
  FULL_DECK_PERMUTATION_SPECS,
  auditFullDeckAcrossAllStages,
  runAndAuditWorldPermutation,
} from '../engine/fullDeckAuditEngine'
import { serializeWorldForExport } from '../engine/storageService'

describe('Phase 58: Exhaustive 54-Card × 4-Stage Audit & Full-Deck Loadable World Exports (ADR-062)', () => {
  it('audits all 54 cards across all 4 stages (216 card-phase pairs) confirming >= 10 presets, >= 15 examples, and valid map stamps', () => {
    const audit = auditFullDeckAcrossAllStages()

    expect(audit.totalCardStagePairs).toBe(216)
    expect(audit.failures).toEqual([])
    expect(audit.passedPairs).toBe(216)

    for (const stageSummary of audit.byStage) {
      expect(stageSummary.cardsChecked).toBe(54)
      expect(stageSummary.minPresets).toBeGreaterThanOrEqual(10)
      expect(stageSummary.minExamples).toBeGreaterThanOrEqual(15)
      expect(stageSummary.failures).toEqual([])
    }
  })

  it('simulates and audits 6 full-deck-scale permutations (including a 216-turn full-54-cards-per-phase world) and exports loadable .world.json + .md + .svg files when EXPORT_LOCAL_WORLDS=1', async () => {
    const results = FULL_DECK_PERMUTATION_SPECS.map((spec) =>
      runAndAuditWorldPermutation(spec)
    )

    for (const res of results) {
      expect(res.audit.issues).toEqual([])
      expect(res.audit.passed).toBe(true)
      expect(res.audit.reimportVerified).toBe(true)
      expect(res.audit.overviewEraCount).toBe(4)
      expect(res.audit.totalTurns).toBeGreaterThanOrEqual(res.spec.turnsPerStage * 4)
      expect(res.audit.settlements).toBeGreaterThan(0)
      expect(res.audit.namedLandmarks).toBeGreaterThan(0)
      expect(res.audit.entities).toBeGreaterThan(0)
      // Engineering Data Efficiency Gate: even a 216-turn portable .world.json must stay < 750 KB
      expect(res.audit.jsonBytes).toBeLessThan(750_000)
    }

    // Verify World #1 truly played a full 54-card deck per phase (216 turns)
    expect(results[0].audit.totalTurns).toBe(216)
    expect(results[0].audit.turnsByStage.genesis).toBe(54)
    expect(results[0].audit.turnsByStage.primal).toBe(54)
    expect(results[0].audit.turnsByStage.civilization).toBe(54)
    expect(results[0].audit.turnsByStage.intrigue).toBe(54)

    const nodeProcess = (globalThis as Record<string, any>).process
    if (nodeProcess?.env?.EXPORT_LOCAL_WORLDS === '1') {
      const fsMod = 'node:fs'
      const pathMod = 'node:path'
      const fs: any = await import(/* @vite-ignore */ fsMod)
      const path: any = await import(/* @vite-ignore */ pathMod)
      const outDir = path.resolve(nodeProcess.cwd(), '../local-exports/simulated-worlds')
      fs.mkdirSync(outDir, { recursive: true })

      const summaryRows: string[] = [
        '# Simulated & Audited Loadable Worlds (`local-exports/simulated-worlds`)',
        '',
        'Load any `.world.json` file directly into **World Builder Studio** via **☰ Menu → Share & Backup → Import World JSON** (or Title Screen → Load / Import).',
        '',
        '| World | Preset | Settings | Turns (G/P/C/I) | Settlements | Landmarks | Codex | Audit | Files |',
        '| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |',
      ]

      for (const res of results) {
        const jsonPath = path.join(outDir, `${res.spec.slug}.world.json`)
        const mdPath = path.join(outDir, `${res.spec.slug}.2-page-overview.md`)
        const svgPath = path.join(outDir, `${res.spec.slug}.map.svg`)

        fs.writeFileSync(jsonPath, serializeWorldForExport(res.world, true), 'utf-8')
        fs.writeFileSync(mdPath, res.overviewMarkdown, 'utf-8')
        fs.writeFileSync(svgPath, res.mapSvg, 'utf-8')

        const t = res.audit.turnsByStage
        summaryRows.push(
          `| **${res.spec.name}** | \`${res.spec.preset}\` | fantasy=\`${res.spec.fantasyLevel}\`, disasters=\`${res.spec.allowDisasters ? res.spec.disasterIntensity : 'off'}\` | **${res.audit.totalTurns}** (${t.genesis}/${t.primal}/${t.civilization}/${t.intrigue}) | ${res.audit.settlements} | ${res.audit.namedLandmarks} | ${res.audit.entities} | ${res.audit.passed ? 'PASS' : 'FAIL'} | \`${res.spec.slug}.world.json\`, \`.2-page-overview.md\`, \`.map.svg\` |`
        )
      }

      fs.writeFileSync(
        path.join(outDir, 'AUDIT_SUMMARY.md'),
        summaryRows.join('\n') + '\n',
        'utf-8'
      )
    }
  })
})
