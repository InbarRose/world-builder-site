/**
 * relationshipMatrixEngine.ts
 * Phase 25: Interactive Codex Diplomatic Relationship Matrix & Quick-Cycler (ADR-031).
 *
 * Provides pure functions to inspect, cycle, and symmetrically set diplomatic
 * relationships between any pair of Codex entities (Species, Societies, Myths)
 * in an N x N matrix without duplicate link accumulation.
 */

import { EntityRelationship, RelationshipType, WorldEntity } from './types'
import { RELATIONSHIP_PRESETS } from './presets'

export interface MatrixCellSummary {
  sourceId: string
  targetId: string
  type: RelationshipType | 'none'
  label: string
  icon: string
  tone: 'alliance' | 'conflict' | 'hierarchy' | 'neutral'
}

export const MATRIX_CYCLE_ORDER: (RelationshipType | 'none')[] = [
  'none',
  'alliance',
  'trade_pact',
  'rivalry',
  'war',
  'vassalage',
  'shared_faith',
]

export function getRelationshipTone(
  type: RelationshipType | 'none'
): 'alliance' | 'conflict' | 'hierarchy' | 'neutral' {
  if (type === 'none') return 'neutral'
  if (type === 'war' || type === 'rivalry') return 'conflict'
  if (type === 'vassalage') return 'hierarchy'
  return 'alliance'
}

/**
 * Returns the active relationship between sourceId and targetId.
 */
export function getPairRelationship(
  entities: WorldEntity[],
  sourceId: string,
  targetId: string
): MatrixCellSummary {
  if (sourceId === targetId) {
    return {
      sourceId,
      targetId,
      type: 'none',
      label: 'Self',
      icon: '—',
      tone: 'neutral',
    }
  }

  const source = entities.find((e) => e.id === sourceId)
  const target = entities.find((e) => e.id === targetId)

  const forward = source?.diplomaticLinks?.find((l) => l.targetEntityId === targetId)
  if (forward) {
    return {
      sourceId,
      targetId,
      type: forward.type,
      label: forward.label,
      icon: forward.icon || '🤝',
      tone: getRelationshipTone(forward.type),
    }
  }

  const reverse = target?.diplomaticLinks?.find((l) => l.targetEntityId === sourceId)
  if (reverse) {
    return {
      sourceId,
      targetId,
      type: reverse.type,
      label: reverse.label,
      icon: reverse.icon || '🤝',
      tone: getRelationshipTone(reverse.type),
    }
  }

  return {
    sourceId,
    targetId,
    type: 'none',
    label: 'Unaligned',
    icon: '·',
    tone: 'neutral',
  }
}

/**
 * Symmetrically sets (or clears when type === 'none') the relationship between two entities,
 * deduplicating any existing links between the pair.
 */
export function setPairRelationship(
  entities: WorldEntity[],
  entityAId: string,
  entityBId: string,
  type: RelationshipType | 'none',
  customLabel?: string
): WorldEntity[] {
  if (!entityAId || !entityBId || entityAId === entityBId) return entities

  const entA = entities.find((e) => e.id === entityAId)
  const entB = entities.find((e) => e.id === entityBId)
  if (!entA || !entB) return entities

  const preset =
    type !== 'none'
      ? RELATIONSHIP_PRESETS.find((r) => r.type === type) || RELATIONSHIP_PRESETS[0]
      : null

  const label = customLabel?.trim() || preset?.label || 'Alliance'
  const icon = preset?.icon || '🤝'

  return entities.map((ent) => {
    if (ent.id === entityAId) {
      const filtered = (ent.diplomaticLinks || []).filter(
        (l) => l.targetEntityId !== entityBId
      )
      if (type === 'none') {
        return { ...ent, diplomaticLinks: filtered }
      }
      const nextLink: EntityRelationship = {
        id: `rel_${entityAId}_${entityBId}_${type}`,
        targetEntityId: entB.id,
        targetEntityName: entB.name,
        type,
        label,
        icon,
      }
      return { ...ent, diplomaticLinks: [...filtered, nextLink] }
    }

    if (ent.id === entityBId) {
      const filtered = (ent.diplomaticLinks || []).filter(
        (l) => l.targetEntityId !== entityAId
      )
      if (type === 'none') {
        return { ...ent, diplomaticLinks: filtered }
      }
      const nextLink: EntityRelationship = {
        id: `rel_${entityBId}_${entityAId}_${type}`,
        targetEntityId: entA.id,
        targetEntityName: entA.name,
        type,
        label,
        icon,
      }
      return { ...ent, diplomaticLinks: [...filtered, nextLink] }
    }

    return ent
  })
}

/**
 * Cycles the relationship between entityAId and entityBId to the next state in MATRIX_CYCLE_ORDER.
 */
export function cyclePairRelationship(
  entities: WorldEntity[],
  entityAId: string,
  entityBId: string
): WorldEntity[] {
  const current = getPairRelationship(entities, entityAId, entityBId)
  const idx = MATRIX_CYCLE_ORDER.indexOf(current.type)
  const nextType = MATRIX_CYCLE_ORDER[(idx + 1) % MATRIX_CYCLE_ORDER.length]
  return setPairRelationship(entities, entityAId, entityBId, nextType)
}

/**
 * Builds an N x N matrix of relationship summaries for the given entities list.
 */
export function buildRelationshipMatrix(entities: WorldEntity[]): MatrixCellSummary[][] {
  return entities.map((rowEnt) =>
    entities.map((colEnt) => getPairRelationship(entities, rowEnt.id, colEnt.id))
  )
}
