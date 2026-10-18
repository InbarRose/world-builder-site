export const CURRENT_SCHEMA_VERSION = 2

export type Suit = '♠' | '♥' | '♣' | '♦' | ''

export type StageId = 'genesis' | 'primal' | 'civilization' | 'intrigue'

export type CompanionViewMode =
  | 'cards-only'
  | 'cards-and-powers'
  | 'companion-tracker'
  | 'full-studio'

export type VisualStyleMode = 'fantasy' | 'dark' | 'simplified'

export type BotPersonalityId =
  | 'shaper'
  | 'naturalist'
  | 'architect'
  | 'chronicler'
  | 'catalyst'
  | 'mythmaker'

export type PlayerRole = 'Artist' | 'Historian' | 'Keeper' | 'Player'

export interface PlayerSeat {
  id: string
  name: string
  color: string
  role: PlayerRole
  isBot: boolean
  personality: BotPersonalityId
}

export type GeographyPreset =
  | 'continent'
  | 'archipelago'
  | 'pangaea'
  | 'twin-continents'
  | 'inland-sea'

export interface GenerationSettings {
  seed: string
  geographyPreset: GeographyPreset
  fantasyLevel: 'low' | 'medium' | 'high'
  disasterIntensity: 'mild' | 'standard' | 'cataclysmic'
}

export interface Card {
  suit: Suit
  value: string
  id: string
}

export interface DeckConfig {
  numberRange: [number, number]
  faceCards: Record<'J' | 'Q' | 'K', boolean>
  aceCount: number
  jokerCount: number
  stagesEnabled: boolean
  selectedStage: StageId
}

export interface PowerData {
  stage: string
  suit?: string
  type?: 'disaster' | 'joker'
  power: string
  description: string
  fantasticalDescription?: string
  examples: string
}

export type TileSlotCategory =
  | 'elevation'
  | 'vegetation'
  | 'hydrology'
  | 'settlement'
  | 'structure'
  | 'resource'
  | 'myth'

export interface TileSlot {
  id: string
  category: TileSlotCategory
  type: string
  name: string
  icon: string
  priority: number // 10–100: higher priority renders in primary center slot
  color?: string
  secondaryColor?: string
  linkedEntityId?: string
  linkedEventId?: string
  moveId?: number
}

export interface DrawRecord {
  id: string
  moveId: number
  card: Card
  timestamp: string
  stage?: StageId
  power?: string
  actionTitle?: string
  presetId?: string
  note: string
  linkedTileIds?: string[]
  linkedEntityIds?: string[]
  epochYear?: string
  playerId?: string
  playerName?: string
  playerColor?: string
  isAutoPlayed?: boolean
  slotChanges?: {
    tileId: string
    slotName: string
    slotIcon: string
    category: TileSlotCategory
  }[]
  relationshipCreated?: {
    sourceId: string
    targetId: string
    label: string
    icon: string
  }
}

export type TerrainType =
  | 'ocean'
  | 'water'
  | 'plains'
  | 'earth'
  | 'forest'
  | 'jungle'
  | 'mountain'
  | 'canyon'
  | 'desert'
  | 'swamp'
  | 'tundra'
  | 'volcano'

export type ReliefType = 'none' | 'hills' | 'mountain' | 'canyon' | 'volcano'

export type FloraType = 'none' | 'forest' | 'jungle' | 'marsh' | 'oasis'

export type TileOverlay =
  | 'none'
  | 'settlement'
  | 'town'
  | 'city'
  | 'capital'
  | 'castle'
  | 'monument'
  | 'ruins'
  | 'cave'
  | 'resource'
  | 'battle'
  | 'myth'
  | 'historic_site'

export type TilePattern = 'solid' | 'diagonal' | 'horizontal' | 'vertical' | 'checkered'

export type TileColoringMode = 'fill' | 'outline' | 'patterned'

export interface MapTile {
  id: string // "col,row"
  col: number
  row: number
  domain?: 'land' | 'water'
  terrain: TerrainType
  relief?: ReliefType
  flora?: FloraType
  secondaryTerrain?: TerrainType
  pattern?: TilePattern
  coloringMode?: TileColoringMode
  customColors?: {
    primary?: string
    secondary?: string
  }
  slots?: TileSlot[]
  overlay: TileOverlay
  hasRiver?: boolean
  hasRoad?: boolean
  territoryId?: string
  label?: string
  notes?: string
  tags: string[]
  linkedEventIds: string[]
  linkedEntityIds: string[]
}

export interface MapState {
  width: number
  height: number
  tiles: Record<string, MapTile>
}

export type EntityCategory = 'species' | 'society' | 'myth'

export interface CompanionSettlementIcons {
  camp: string
  village: string
  town: string
  city: string
  metropolis: string
  architectureStyle?: string
}

export type RelationshipType =
  | 'alliance'
  | 'trade_pact'
  | 'royal_marriage'
  | 'rivalry'
  | 'war'
  | 'vassalage'
  | 'shared_faith'
  | 'cultural_exchange'

export interface EntityRelationship {
  id: string
  targetEntityId: string
  targetEntityName: string
  type: RelationshipType
  label: string
  icon: string
  createdAtMove?: number
  linkedEventId?: string
  description?: string
}

export interface WorldEntity {
  id: string
  name: string
  category: EntityCategory
  stageCreated: StageId
  parentEntityId?: string
  originTileId?: string
  description: string
  traits: string[]
  abilities?: string[]
  status: string
  icon?: string
  color?: string
  secondaryColor?: string
  archetype?: string
  settlementIcons?: CompanionSettlementIcons
  relationships?: string
  diplomaticLinks?: EntityRelationship[]
}

export interface TurnSnapshot {
  moveId: number
  currentStage: StageId
  currentPlayerIndex: number
  map: MapState
  entities: WorldEntity[]
}

export interface WorldState {
  schemaVersion: number
  id: string
  name: string
  createdAt: string
  updatedAt: string
  deckConfig: DeckConfig
  currentStage: StageId
  stageNotes: Record<string, string>
  drawHistory: DrawRecord[]
  map: MapState
  entities: WorldEntity[]
  players: PlayerSeat[]
  currentPlayerIndex: number
  companionMode: CompanionViewMode
  generationSettings: GenerationSettings
  snapshots?: TurnSnapshot[]
}
