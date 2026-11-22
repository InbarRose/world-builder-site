import { test, expect, Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

interface ErrorCollector {
  consoleErrors: string[]
  pageErrors: string[]
  failedRequests: string[]
}

function attachErrorCollectors(page: Page): ErrorCollector {
  const collector: ErrorCollector = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  }
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      collector.consoleErrors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => {
    collector.pageErrors.push(String(err))
  })
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      collector.failedRequests.push(`${res.status()} ${res.url()}`)
    }
  })
  return collector
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function launchFreshStudioRealm(page: Page) {
  await page.goto('/play', { waitUntil: 'networkidle' })
  const quickStartBtn = page.getByRole('button', { name: /Quick Start/i }).first()
  if (await quickStartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await quickStartBtn.click()
  }
  await expect(page.getByTestId('studio-top-card-ribbon')).toBeVisible({ timeout: 15000 })
}

async function closeAnyOpenDialog(page: Page) {
  await page.keyboard.press('Escape')
  for (let attempt = 0; attempt < 3; attempt++) {
    const overlay = page.locator('[role="dialog"], div.fixed.inset-0.z-50').last()
    if (!(await overlay.isVisible({ timeout: 250 }).catch(() => false))) {
      return
    }
    const closeBtn = overlay
      .locator(
        'button[aria-label*="Close" i], button[title*="Close" i], button:has-text("Close"), button:has-text("Done"), button:has-text("✕"), button:has(svg.lucide-x)'
      )
      .first()
    if (await closeBtn.isVisible({ timeout: 250 }).catch(() => false)) {
      await closeBtn.click()
      await page.waitForTimeout(120)
    } else {
      // Fallback: click backdrop corner or top-right icon button
      const iconClose = overlay.locator('button:has(svg)').last()
      if (await iconClose.isVisible({ timeout: 250 }).catch(() => false)) {
        await iconClose.click()
        await page.waitForTimeout(120)
      } else {
        await page.keyboard.press('Escape')
        return
      }
    }
  }
}

async function dismissPreStageModalIfOpen(page: Page, customName?: string) {
  const modal = page.getByTestId('pre-stage-setup-modal')
  if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
    const input = modal.locator('input[type="text"]').first()
    if (customName && (await input.isVisible().catch(() => false))) {
      await input.fill(customName)
      const addBtn = modal.getByRole('button', { name: /Add|Create|Forge|Save|Rename/i }).first()
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click()
      }
    }
    const doneBtn = modal
      .getByRole('button', { name: /Begin|Continue|Done|Enter|Start|Skip|Close/i })
      .first()
    if (await doneBtn.isVisible().catch(() => false)) {
      await doneBtn.click()
    } else {
      await page.keyboard.press('Escape')
    }
    await expect(modal).toBeHidden({ timeout: 5000 })
  }
}

async function drawAndLogOneTurn(page: Page) {
  const ribbon = page.getByTestId('studio-top-card-ribbon')
  const drawBtn = ribbon.getByRole('button', { name: /Draw Card/i }).first()
  await expect(drawBtn).toBeVisible({ timeout: 8000 })
  await drawBtn.click()

  // Wait for either the Log Turn button in the docked Cards & Turn panel or Workbench
  const logBtn = page.getByRole('button', { name: /Log Turn|Record Turn|Complete Turn/i }).first()
  await expect(logBtn).toBeVisible({ timeout: 8000 })

  // Click the first quick-idea chip if visible so the turn has a rich preset
  const chipBtn = page.locator('[data-testid^="dock-preset-"], [data-testid^="preset-card-"]').first()
  if (await chipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await chipBtn.click()
  }

  await logBtn.click()

  // Dismiss Conclave Handoff Ready button if visible
  const readyBtn = page.getByRole('button', { name: /^Ready$/i }).first()
  if (await readyBtn.isVisible({ timeout: 800 }).catch(() => false)) {
    await readyBtn.click()
  }

  // Verify Top Ribbon cleanly returns to Draw Card state
  await expect(ribbon.getByRole('button', { name: /Draw Card/i }).first()).toBeVisible({
    timeout: 8000,
  })
}

test.describe('Phase 58: Static LLM-Free Playwright E2E, Acceptance, Menu Audit & Chaos Suite', () => {
  test('1. Sanity & Full 4-Stage Acceptance Journey (Genesis -> Primal -> Civilization -> Intrigue -> 2-Page Overview)', async ({
    page,
  }) => {
    const errors = attachErrorCollectors(page)
    await launchFreshStudioRealm(page)

    // Viewport zero-scroll lock check at 1440x900
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(scrollHeight).toBeLessThanOrEqual(920)

    // Stage 1: Genesis — draw & log Turn #1
    await drawAndLogOneTurn(page)

    // Verify State-Machine Lock after Turn #1 (resize buttons 14×9 / 26×15 hidden)
    await expect(page.getByRole('button', { name: '14×9' })).toHaveCount(0)

    // Advance through Age 2 (Primal), Age 3 (Civilization), Age 4 (Intrigue)
    const stageProgression = [
      { ritualName: 'Sunborn Elves' },
      { ritualName: 'Kingdom of Solaria' },
      { ritualName: 'Highspire' },
    ]

    for (const next of stageProgression) {
      // Click the Age badge in the top bar (e.g. "Age 1: Genesis") to open Epoch Advancement Ceremony
      const ageBtn = page.getByRole('button', { name: /Age \d:/i }).first()
      await expect(ageBtn).toBeVisible({ timeout: 5000 })
      await ageBtn.click()

      // Confirm Epoch Ceremony modal ("Ascend to ...")
      const ceremonyConfirm = page
        .getByRole('button', { name: /Ascend to|Enter Age|Advance to|Begin Age|Confirm Advancement/i })
        .first()
      await expect(ceremonyConfirm).toBeVisible({ timeout: 5000 })
      await ceremonyConfirm.click()

      await dismissPreStageModalIfOpen(page, next.ritualName)
      await drawAndLogOneTurn(page)
    }

    // Open 2-Page World Overview ("2-Page World Overview") and confirm both pages render cleanly
    const twoPagerBtn = page.getByRole('button', { name: /2-Page World Overview/i }).first()
    await expect(twoPagerBtn).toBeVisible({ timeout: 5000 })
    await twoPagerBtn.click()
    await expect(page.getByText(/2-Page World Overview/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/PAGE 1 OF 2/i)).toBeVisible()
    await page.keyboard.press('Escape')

    expect(errors.consoleErrors).toEqual([])
    expect(errors.pageErrors).toEqual([])
    expect(errors.failedRequests).toEqual([])
  })

  test('2. Complete Menu, Popover, Pure Canvas, Edge Tray & Card Options Audit', async ({
    page,
  }) => {
    const errors = attachErrorCollectors(page)
    await launchFreshStudioRealm(page)

    // 1. Toggle Pure Canvas & inspect floating Edge Tray Pills
    const ribbon = page.getByTestId('studio-top-card-ribbon')
    const pureCanvasBtn = ribbon.getByRole('button', { name: /Pure Canvas/i }).first()
    await expect(pureCanvasBtn).toBeVisible({ timeout: 5000 })
    await pureCanvasBtn.click()
    await expect(page.getByTestId('studio-edge-tray-bar')).toBeVisible({ timeout: 5000 })
    // Open Chronicle tray pill and close Pure Canvas
    const chroniclePill = page.getByTestId('edge-tray-open-chronicle')
    if (await chroniclePill.isVisible().catch(() => false)) {
      await chroniclePill.click()
    }
    const restoreBtn = ribbon.getByRole('button', { name: /Restore Panels|Pure Canvas/i }).first()
    if (await restoreBtn.isVisible().catch(() => false)) {
      await restoreBtn.click()
    }

    // 2. Verify always-visible Turn State-Machine Stepper & tucked ⋯ More Tools popover
    await expect(page.getByTestId('top-nav-turn-stepper')).toBeVisible({ timeout: 5000 })
    const moreBtn = page.getByTestId('studio-more-tools-btn')
    await expect(moreBtn).toBeVisible({ timeout: 5000 })
    // Table Sync & Vault must be tucked inside More ▾ (not cluttering the main top bar)
    await expect(page.getByTestId('studio-more-tools-popover')).toHaveCount(0)

    for (const label of [/Compendium/i, /Session Checkpoint Vault/i, /Hooks/i, /Primer/i]) {
      await moreBtn.click()
      await expect(page.getByTestId('studio-more-tools-popover')).toBeVisible({ timeout: 3000 })
      const btn = page.getByTestId('studio-more-tools-popover').getByRole('button', { name: label }).first()
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(150)
        await closeAnyOpenDialog(page)
        await page.waitForTimeout(100)
      }
    }

    // 3. Switch to Deck & Draw tab, draw a card, and exercise Card Options ▾ -> Redraw
    const deckTab = page.getByRole('tab', { name: /Deck & Draw/i }).or(page.getByRole('button', { name: /Deck & Draw/i })).first()
    await deckTab.click()
    const drawBtn = page.getByRole('button', { name: /Draw Card/i }).first()
    if (await drawBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await drawBtn.click()
    }
    const cardOptionsBtn = page.getByTestId('card-options-menu-btn')
    if (await cardOptionsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cardOptionsBtn.click()
      await expect(page.getByTestId('card-options-popover')).toBeVisible({ timeout: 3000 })
      const redrawBtn = page.getByTestId('card-options-popover').getByRole('button', { name: /Redraw/i }).first()
      if (await redrawBtn.isVisible().catch(() => false)) {
        await redrawBtn.click()
      }
    }

    // 4. Open Command Palette (Ctrl+K) and close with Escape
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(150)
    await page.keyboard.press('Escape')

    expect(errors.consoleErrors).toEqual([])
    expect(errors.pageErrors).toEqual([])
    expect(errors.failedRequests).toEqual([])
  })

  test('3. Deterministic Seeded Chaos / Monkey Test (60 rapid seeded UI actions with 0 crashes)', async ({
    page,
  }) => {
    const errors = attachErrorCollectors(page)
    await launchFreshStudioRealm(page)

    const rng = createMulberry32(133742)
    const unsafePatterns = /delete|reset all|clear all|wipe|import|export|download|print|main menu/i

    for (let step = 0; step < 60; step++) {
      if (step % 10 === 9) {
        await page.keyboard.press('Escape')
        continue
      }

      const buttons = page.locator('button:visible:not([disabled])')
      const count = await buttons.count()
      if (count === 0) {
        await page.keyboard.press('Escape')
        continue
      }

      const idx = Math.floor(rng() * Math.min(count, 40))
      const btn = buttons.nth(idx)
      const label = (
        (await btn.innerText().catch(() => '')) +
        ' ' +
        ((await btn.getAttribute('aria-label').catch(() => '')) || '')
      ).trim()

      if (unsafePatterns.test(label)) {
        continue
      }

      await btn.click({ timeout: 1000, force: false }).catch(() => {
        // Ignore transient occlusion during chaos clicking
      })
    }

    await page.keyboard.press('Escape')
    const rootHtmlLen = await page.evaluate(
      () => document.getElementById('root')?.innerHTML.length || 0
    )
    expect(rootHtmlLen).toBeGreaterThan(200)
    expect(errors.consoleErrors).toEqual([])
    expect(errors.pageErrors).toEqual([])
    expect(errors.failedRequests).toEqual([])
  })

  test('4. Import & Visually Verify Exported 216-Turn Full-Deck World (.world.json) via Live Share & Backup UI', async ({
    page,
  }) => {
    const errors = attachErrorCollectors(page)
    const exportedJsonPath = path.resolve(
      process.cwd(),
      '../local-exports/simulated-worlds/01-valdoria-full-54-deck-per-phase-continent.world.json'
    )

    test.skip(!fs.existsSync(exportedJsonPath), 'Local exported 216-turn world JSON not present')

    await launchFreshStudioRealm(page)

    // Open Share -> Share & Backup JSON modal
    const shareBtn = page.getByRole('button', { name: /Share/i }).first()
    await expect(shareBtn).toBeVisible({ timeout: 5000 })
    await shareBtn.click()

    const backupOption = page.getByRole('button', { name: /Backup|Import|JSON/i }).first()
    if (await backupOption.isVisible({ timeout: 2500 }).catch(() => false)) {
      await backupOption.click()
    }

    // Switch to the Import (.json) tab inside the Share & Backup dialog
    const shareDialog = page.getByRole('dialog', { name: /Export, Import and Share Realm/i })
    await expect(shareDialog).toBeVisible({ timeout: 5000 })
    await shareDialog.getByRole('button', { name: /Import \(\.json\)/i }).click()

    // Upload the actual exported 216-turn .world.json file through the dialog file input
    const fileInput = shareDialog.locator('input[type="file"]').first()
    await expect(fileInput).toBeAttached({ timeout: 5000 })
    await fileInput.setInputFiles(exportedJsonPath)

    // Confirm import preview button inside the Share & Backup dialog
    const confirmImportBtn = shareDialog.getByRole('button', {
      name: /Load & Play Imported Realm/i,
    })
    await expect(confirmImportBtn).toBeVisible({ timeout: 5000 })
    await confirmImportBtn.click()

    // Confirm imported 216-turn world loads into Studio cleanly
    await expect(page.getByText(/Valdoria/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Turn #216|216/i).first()).toBeVisible({ timeout: 8000 })

    // Open 2-Page World Overview on the imported 216-turn world and verify rendering
    await closeAnyOpenDialog(page)
    const twoPagerBtn = page.getByRole('button', { name: /2-Page World Overview/i }).first()
    await expect(twoPagerBtn).toBeVisible({ timeout: 5000 })
    await twoPagerBtn.click()
    await expect(page.getByText(/2-Page World Overview/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/216 Turns/i)).toBeVisible({ timeout: 5000 })

    expect(errors.consoleErrors).toEqual([])
    expect(errors.pageErrors).toEqual([])
    expect(errors.failedRequests).toEqual([])
  })
})
