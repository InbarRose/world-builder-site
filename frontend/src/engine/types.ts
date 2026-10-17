export type Suit = '♠' | '♥' | '♣' | '♦' | ''

export type StageId = 'genesis' | 'primal' | 'civilization' | 'intrigue'

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

export interface DrawRecord {
  id: string
  moveId: number
  card: Card
  timestamp: string
  stage?: StageId
  power?: string
  note: string
  linkedTileIds?: string[]
  linkedEntityIds?: string[]
  epochYear?: string
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

export type TileOverlay =
  | 'none'
  | 'settlement'
  | 'city'
  | 'castle'
  | 'monument'
  | 'ruins'
  | 'cave'
  | 'resource'
  | 'battle'
  | 'myth'

export type TilePattern = 'solid' | 'diagonal' | 'horizontal' | 'vertical' | 'checkered'

export interface MapTile {
  id: string // "col,row"
  col: number
  row: number
  terrain: TerrainType
  secondaryTerrain?: TerrainType
  pattern?: TilePattern
  overlay: TileOverlay
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

export interface WorldEntity {
  id: string
  name: string
  category: EntityCategory
  stageCreated: StageId
  originTileId?: string
  description: string
  traits: string[]
  status: string
}

export interface WorldState {
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
}
