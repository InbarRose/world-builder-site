/**
 * workspaceLayoutEngine.ts
 *
 * Pure, deterministic state engine for the Full-Viewport Modular Design Studio
 * (Photoshop / Figma / Warcraft 3 World Editor-style dockable, resizable, and
 * draggable floating panels).
 */

export type StudioPanelId = 'cards' | 'codex' | 'timeline'

export type StudioDockSlot = 'left' | 'right' | 'bottom' | 'floating' | 'hidden'

export type WorkspacePresetId =
  | 'classic'
  | 'pure-canvas'
  | 'card-focus'
  | 'lore-history'

export interface FloatingPanelRect {
  x: number
  y: number
  width: number
  height: number
}

export interface StudioPanelConfig {
  id: StudioPanelId
  title: string
  icon: string
  dock: StudioDockSlot
  collapsed: boolean
  floatingRect: FloatingPanelRect
  zIndex: number
}

export interface StudioWorkspaceLayout {
  presetId: WorkspacePresetId | 'custom'
  panels: Record<StudioPanelId, StudioPanelConfig>
  leftDockWidth: number
  rightDockWidth: number
  bottomDockHeight: number
  activeLeftTab: StudioPanelId | null
  activeRightTab: StudioPanelId | null
  activeBottomTab: StudioPanelId | null
  allPanelsHidden: boolean
}

export interface WorkspacePresetMeta {
  id: WorkspacePresetId
  label: string
  icon: string
  description: string
}

export const WORKSPACE_PRESETS: WorkspacePresetMeta[] = [
  {
    id: 'classic',
    label: 'Classic Studio',
    icon: '🎨',
    description: 'Left: Cards & Turn · Center: World Map · Right: Codex & History (tabbed)',
  },
  {
    id: 'pure-canvas',
    label: 'Pure Canvas',
    icon: '🗺️',
    description: 'All side panels hidden — maximum full-bleed map canvas (Press Tab to toggle)',
  },
  {
    id: 'card-focus',
    label: 'Card & Map Split',
    icon: '🃏',
    description: 'Wider Left Cards & Turn dock beside the full World Map canvas',
  },
  {
    id: 'lore-history',
    label: 'Lore & Chronicle',
    icon: '📖',
    description: 'Left: Timeline History · Center: World Map · Right: Species & Societies Codex',
  },
]

export const STUDIO_WORKSPACE_STORAGE_KEY = 'wb_studio_workspace_v1'

export const DOCK_LIMITS = {
  minSideWidth: 260,
  maxSideWidth: 640,
  minBottomHeight: 150,
  maxBottomHeight: 460,
  minFloatingWidth: 300,
  minFloatingHeight: 220,
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function createBasePanels(): Record<StudioPanelId, StudioPanelConfig> {
  return {
    cards: {
      id: 'cards',
      title: 'Cards & Turn',
      icon: '🃏',
      dock: 'left',
      collapsed: false,
      floatingRect: { x: 72, y: 64, width: 420, height: 520 },
      zIndex: 31,
    },
    codex: {
      id: 'codex',
      title: 'Codex',
      icon: '👥',
      dock: 'right',
      collapsed: false,
      floatingRect: { x: 520, y: 80, width: 380, height: 480 },
      zIndex: 32,
    },
    timeline: {
      id: 'timeline',
      title: 'Chronicle',
      icon: '📜',
      dock: 'right',
      collapsed: false,
      floatingRect: { x: 160, y: 120, width: 420, height: 440 },
      zIndex: 33,
    },
  }
}

export function createWorkspacePreset(presetId: WorkspacePresetId): StudioWorkspaceLayout {
  const panels = createBasePanels()

  if (presetId === 'pure-canvas') {
    return {
      presetId: 'pure-canvas',
      panels,
      leftDockWidth: 390,
      rightDockWidth: 340,
      bottomDockHeight: 240,
      activeLeftTab: 'cards',
      activeRightTab: 'codex',
      activeBottomTab: null,
      allPanelsHidden: true,
    }
  }

  if (presetId === 'card-focus') {
    panels.cards.dock = 'left'
    panels.codex.dock = 'hidden'
    panels.timeline.dock = 'bottom'
    return {
      presetId: 'card-focus',
      panels,
      leftDockWidth: 440,
      rightDockWidth: 340,
      bottomDockHeight: 210,
      activeLeftTab: 'cards',
      activeRightTab: null,
      activeBottomTab: 'timeline',
      allPanelsHidden: false,
    }
  }

  if (presetId === 'lore-history') {
    panels.cards.dock = 'bottom'
    panels.timeline.dock = 'left'
    panels.codex.dock = 'right'
    return {
      presetId: 'lore-history',
      panels,
      leftDockWidth: 360,
      rightDockWidth: 360,
      bottomDockHeight: 240,
      activeLeftTab: 'timeline',
      activeRightTab: 'codex',
      activeBottomTab: 'cards',
      allPanelsHidden: false,
    }
  }

  // Default: 'classic'
  return {
    presetId: 'classic',
    panels,
    leftDockWidth: 390,
    rightDockWidth: 340,
    bottomDockHeight: 240,
    activeLeftTab: 'cards',
    activeRightTab: 'codex',
    activeBottomTab: null,
    allPanelsHidden: false,
  }
}

export function getPanelsInDock(
  layout: StudioWorkspaceLayout,
  dock: StudioDockSlot
): StudioPanelConfig[] {
  return (Object.values(layout.panels) as StudioPanelConfig[]).filter((p) => p.dock === dock)
}

function reconcileActiveTabs(layout: StudioWorkspaceLayout): StudioWorkspaceLayout {
  const leftPanels = getPanelsInDock(layout, 'left')
  const rightPanels = getPanelsInDock(layout, 'right')
  const bottomPanels = getPanelsInDock(layout, 'bottom')

  const activeLeftTab =
    layout.activeLeftTab && leftPanels.some((p) => p.id === layout.activeLeftTab)
      ? layout.activeLeftTab
      : leftPanels[0]?.id ?? null

  const activeRightTab =
    layout.activeRightTab && rightPanels.some((p) => p.id === layout.activeRightTab)
      ? layout.activeRightTab
      : rightPanels[0]?.id ?? null

  const activeBottomTab =
    layout.activeBottomTab && bottomPanels.some((p) => p.id === layout.activeBottomTab)
      ? layout.activeBottomTab
      : bottomPanels[0]?.id ?? null

  return {
    ...layout,
    activeLeftTab,
    activeRightTab,
    activeBottomTab,
  }
}

export function movePanelToDock(
  layout: StudioWorkspaceLayout,
  panelId: StudioPanelId,
  targetDock: StudioDockSlot
): StudioWorkspaceLayout {
  const maxZ = Math.max(...Object.values(layout.panels).map((p) => p.zIndex), 30)
  const nextPanels: Record<StudioPanelId, StudioPanelConfig> = {
    ...layout.panels,
    [panelId]: {
      ...layout.panels[panelId],
      dock: targetDock,
      collapsed: false,
      zIndex: targetDock === 'floating' ? maxZ + 1 : layout.panels[panelId].zIndex,
    },
  }

  const next: StudioWorkspaceLayout = {
    ...layout,
    presetId: 'custom',
    allPanelsHidden: targetDock === 'hidden' ? layout.allPanelsHidden : false,
    panels: nextPanels,
    activeLeftTab: targetDock === 'left' ? panelId : layout.activeLeftTab,
    activeRightTab: targetDock === 'right' ? panelId : layout.activeRightTab,
    activeBottomTab: targetDock === 'bottom' ? panelId : layout.activeBottomTab,
  }

  return reconcileActiveTabs(next)
}

export function togglePanelVisibility(
  layout: StudioWorkspaceLayout,
  panelId: StudioPanelId
): StudioWorkspaceLayout {
  const current = layout.panels[panelId]
  if (current.dock === 'hidden') {
    const defaultDock: StudioDockSlot = panelId === 'cards' ? 'left' : 'right'
    return movePanelToDock(layout, panelId, defaultDock)
  }
  return movePanelToDock(layout, panelId, 'hidden')
}

export function togglePanelCollapsed(
  layout: StudioWorkspaceLayout,
  panelId: StudioPanelId
): StudioWorkspaceLayout {
  return {
    ...layout,
    presetId: 'custom',
    panels: {
      ...layout.panels,
      [panelId]: {
        ...layout.panels[panelId],
        collapsed: !layout.panels[panelId].collapsed,
      },
    },
  }
}

export function bringFloatingPanelToFront(
  layout: StudioWorkspaceLayout,
  panelId: StudioPanelId
): StudioWorkspaceLayout {
  const maxZ = Math.max(...Object.values(layout.panels).map((p) => p.zIndex), 30)
  if (layout.panels[panelId].zIndex >= maxZ) return layout
  return {
    ...layout,
    panels: {
      ...layout.panels,
      [panelId]: {
        ...layout.panels[panelId],
        zIndex: maxZ + 1,
      },
    },
  }
}

export function updateFloatingPanelRect(
  layout: StudioWorkspaceLayout,
  panelId: StudioPanelId,
  partial: Partial<FloatingPanelRect>
): StudioWorkspaceLayout {
  const prev = layout.panels[panelId].floatingRect
  const nextRect: FloatingPanelRect = {
    x: Math.max(8, Math.round(partial.x ?? prev.x)),
    y: Math.max(8, Math.round(partial.y ?? prev.y)),
    width: Math.max(DOCK_LIMITS.minFloatingWidth, Math.round(partial.width ?? prev.width)),
    height: Math.max(DOCK_LIMITS.minFloatingHeight, Math.round(partial.height ?? prev.height)),
  }

  return {
    ...layout,
    presetId: 'custom',
    panels: {
      ...layout.panels,
      [panelId]: {
        ...layout.panels[panelId],
        floatingRect: nextRect,
      },
    },
  }
}

export function resizeDock(
  layout: StudioWorkspaceLayout,
  edge: 'left' | 'right' | 'bottom',
  sizePx: number
): StudioWorkspaceLayout {
  if (edge === 'left') {
    return {
      ...layout,
      presetId: 'custom',
      leftDockWidth: clampNumber(sizePx, DOCK_LIMITS.minSideWidth, DOCK_LIMITS.maxSideWidth),
    }
  }
  if (edge === 'right') {
    return {
      ...layout,
      presetId: 'custom',
      rightDockWidth: clampNumber(sizePx, DOCK_LIMITS.minSideWidth, DOCK_LIMITS.maxSideWidth),
    }
  }
  return {
    ...layout,
    presetId: 'custom',
    bottomDockHeight: clampNumber(
      sizePx,
      DOCK_LIMITS.minBottomHeight,
      DOCK_LIMITS.maxBottomHeight
    ),
  }
}

export function toggleAllPanelsHidden(layout: StudioWorkspaceLayout): StudioWorkspaceLayout {
  return {
    ...layout,
    allPanelsHidden: !layout.allPanelsHidden,
  }
}

export function loadStudioWorkspaceLayout(): StudioWorkspaceLayout {
  try {
    const raw = localStorage.getItem(STUDIO_WORKSPACE_STORAGE_KEY)
    if (!raw) return createWorkspacePreset('classic')
    const parsed = JSON.parse(raw) as Partial<StudioWorkspaceLayout>
    const base = createWorkspacePreset('classic')
    if (!parsed || !parsed.panels) return base
    const mergedPanels: Record<StudioPanelId, StudioPanelConfig> = {
      cards: { ...base.panels.cards, ...(parsed.panels.cards || {}) },
      codex: { ...base.panels.codex, ...(parsed.panels.codex || {}) },
      timeline: { ...base.panels.timeline, ...(parsed.panels.timeline || {}) },
    }
    return reconcileActiveTabs({
      ...base,
      ...parsed,
      panels: mergedPanels,
      leftDockWidth: clampNumber(
        parsed.leftDockWidth ?? base.leftDockWidth,
        DOCK_LIMITS.minSideWidth,
        DOCK_LIMITS.maxSideWidth
      ),
      rightDockWidth: clampNumber(
        parsed.rightDockWidth ?? base.rightDockWidth,
        DOCK_LIMITS.minSideWidth,
        DOCK_LIMITS.maxSideWidth
      ),
      bottomDockHeight: clampNumber(
        parsed.bottomDockHeight ?? base.bottomDockHeight,
        DOCK_LIMITS.minBottomHeight,
        DOCK_LIMITS.maxBottomHeight
      ),
    })
  } catch {
    return createWorkspacePreset('classic')
  }
}

export function saveStudioWorkspaceLayout(layout: StudioWorkspaceLayout): void {
  try {
    localStorage.setItem(STUDIO_WORKSPACE_STORAGE_KEY, JSON.stringify(layout))
  } catch {
    // ignore storage quota errors
  }
}
