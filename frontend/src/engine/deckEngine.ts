import { Card, DeckConfig, PowerData, StageId, Suit } from './types'

export const SUITS: Suit[] = ['♠', '♥', '♣', '♦']
export const JOKER = 'Joker'

export const STAGES: { id: StageId; name: string; number: number; eraLabel: string }[] = [
  { id: 'genesis', name: 'Genesis', number: 1, eraLabel: 'Dawn of Time (Pre-History)' },
  { id: 'primal', name: 'Primal', number: 2, eraLabel: 'Mythic Antiquity (Age of Origins)' },
  { id: 'civilization', name: 'Civilization', number: 3, eraLabel: 'Age of Kingdoms & Empires' },
  { id: 'intrigue', name: 'Intrigue', number: 4, eraLabel: 'Modern Era (Recent Decades)' },
]

export const STAGE_POWERS: Record<StageId, Record<string, { name: string; id: string }>> = {
  genesis: {
    '♠': { name: 'Earth', id: '(♠)---earth' },
    '♥': { name: 'Water', id: '(♥)---water' },
    '♣': { name: 'Plant', id: '(♣)---plant' },
    '♦': { name: 'Feature', id: '(♦)---feature' },
  },
  primal: {
    '♠': { name: 'Settlement', id: '(♠)---settlement' },
    '♥': { name: 'Tradition', id: '(♥)---tradition' },
    '♣': { name: 'Resource', id: '(♣)---resource' },
    '♦': { name: 'Skill', id: '(♦)---skill' },
  },
  civilization: {
    '♠': { name: 'Construction', id: '(♠)---construction' },
    '♥': { name: 'Enlightenment', id: '(♥)---enlightenment' },
    '♣': { name: 'Expansion', id: '(♣)---expansion' },
    '♦': { name: 'Diplomacy', id: '(♦)---diplomacy' },
  },
  intrigue: {
    '♠': { name: 'Conflict', id: '(♠)---conflict' },
    '♥': { name: 'Cooperation', id: '(♥)---cooperation' },
    '♣': { name: 'Scheme', id: '(♣)---scheme' },
    '♦': { name: 'Myth', id: '(♦)---myth' },
  },
}

export const STAGE_PRE_SETUP: Record<StageId, string> = {
  genesis:
    'Before starting this stage, make sure you already have some basic terrain features such as coastlines for your continent(s) and maybe a river, or a mountain or two.',
  primal:
    'Before starting this stage, each player should create a species, describing them and naming them and deciding where on the map they originated from.',
  civilization:
    'Before starting this stage, each player should create some societies within the different species which might grow and expand during this stage into kingdoms or empires.',
  intrigue:
    'Before this stage, you should make sure to give names to cities, nations, and societies. And deliberate on their aspects that you have developed over the last two stages. Noting the power, influence, armies, government, economy, etc of the different societies in the world.',
}

export const SUIT_TO_POWER_NAME: Record<StageId, Record<string, string>> = {
  genesis: {
    '♠': 'earth',
    '♥': 'water',
    '♣': 'plant',
    '♦': 'feature',
  },
  primal: {
    '♠': 'settlement',
    '♥': 'tradition',
    '♣': 'resource',
    '♦': 'skill',
  },
  civilization: {
    '♠': 'construction',
    '♥': 'enlightenment',
    '♣': 'expansion',
    '♦': 'diplomacy',
  },
  intrigue: {
    '♠': 'conflict',
    '♥': 'cooperation',
    '♣': 'scheme',
    '♦': 'myth',
  },
}

export const DEFAULT_CARD_COLORS: Record<string, string> = {
  '♠': 'text-gray-900 dark:text-gray-100',
  '♥': 'text-red-600 dark:text-red-400',
  '♣': 'text-gray-900 dark:text-gray-100',
  '♦': 'text-red-600 dark:text-red-400',
  joker: 'text-purple-600 dark:text-purple-400',
}

export const DEFAULT_DECK_CONFIG: DeckConfig = {
  numberRange: [2, 10],
  faceCards: { J: true, Q: true, K: true },
  aceCount: 4,
  jokerCount: 2,
  stagesEnabled: true,
  selectedStage: 'genesis',
}

export const SHORT_GAME_DECK_CONFIG: Omit<DeckConfig, 'stagesEnabled' | 'selectedStage'> = {
  numberRange: [2, 6],
  faceCards: { J: false, Q: false, K: true },
  aceCount: 2,
  jokerCount: 1,
}

export function createDeck(
  config: Pick<DeckConfig, 'numberRange' | 'faceCards' | 'aceCount' | 'jokerCount'>
): Card[] {
  const newDeck: Card[] = []
  const [minNum, maxNum] = config.numberRange

  for (const suit of SUITS) {
    for (let i = minNum; i <= maxNum; i++) {
      const value = i.toString()
      newDeck.push({ suit, value, id: `${suit}-${value}` })
    }

    for (const [face, included] of Object.entries(config.faceCards)) {
      if (included) {
        newDeck.push({ suit, value: face, id: `${suit}-${face}` })
      }
    }
  }

  const acesPerSuit = Math.floor(config.aceCount / SUITS.length)
  const extraAces = config.aceCount % SUITS.length
  for (let i = 0; i < SUITS.length; i++) {
    const count = acesPerSuit + (i < extraAces ? 1 : 0)
    for (let j = 0; j < count; j++) {
      newDeck.push({ suit: SUITS[i], value: 'A', id: `${SUITS[i]}-A-${j}` })
    }
  }

  for (let i = 0; i < config.jokerCount; i++) {
    newDeck.push({ suit: '', value: JOKER, id: `joker-${i}` })
  }

  return newDeck
}

export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function buildShuffledDeck(
  config: Pick<DeckConfig, 'numberRange' | 'faceCards' | 'aceCount' | 'jokerCount'>,
  rng: () => number = Math.random
): Card[] {
  return shuffleDeck(createDeck(config), rng)
}

export function isFantasticalCard(card: Card | null): boolean {
  if (!card) return false
  return ['J', 'Q', 'K', JOKER].includes(card.value)
}

export function getNextStage(currentStage: StageId): StageId | null {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage)
  if (currentIndex === -1 || currentIndex >= STAGES.length - 1) {
    return null
  }
  return STAGES[currentIndex + 1].id
}

export function calculateEpochYear(stage: StageId | undefined, moveNumber: number): string {
  switch (stage) {
    case 'genesis':
      return `Eon I · Mythic Cycle ${moveNumber}`
    case 'primal':
      return `Age of Dawn · ~${Math.max(3000, 12000 - moveNumber * 250).toLocaleString()} B.C.E.`
    case 'civilization':
      return `Imperial Era · Year ${100 + moveNumber * 45} A.F.`
    case 'intrigue':
      return `Present Reckoning · Year ${1000 + moveNumber * 2} A.F.`
    default:
      return `Turn ${moveNumber}`
  }
}

export function getCardDisplay(
  card: Card,
  cardColors: Record<string, string> = DEFAULT_CARD_COLORS
): { display: string; color: string; bgColor: string } {
  if (card.value === JOKER) {
    const jokerColor = cardColors['joker'] || DEFAULT_CARD_COLORS.joker
    return { display: JOKER, color: jokerColor, bgColor: 'bg-white dark:bg-gray-800' }
  }

  const suitKey = card.suit as string
  const colorClass =
    cardColors[suitKey] ||
    (['♠', '♣'].includes(card.suit)
      ? 'text-gray-900 dark:text-gray-100'
      : 'text-red-600 dark:text-red-400')

  return {
    display: card.suit ? `${card.value}${card.suit}` : card.value,
    color: colorClass,
    bgColor: 'bg-white dark:bg-gray-800',
  }
}

export async function loadCardColors(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/data/stage-colors.json')
    if (response.ok) {
      const data = await response.json()
      return data.cardColors || DEFAULT_CARD_COLORS
    }
  } catch (error) {
    console.error('Error loading card colors:', error)
  }
  return DEFAULT_CARD_COLORS
}

export async function loadPowerData(stage: StageId, card: Card): Promise<PowerData | null> {
  try {
    if (card.value === JOKER) {
      const response = await fetch(`/data/${stage}-joker.json`)
      if (response.ok) {
        return await response.json()
      }
    } else if (card.value === 'A') {
      const response = await fetch(`/data/${stage}-disaster.json`)
      if (response.ok) {
        return await response.json()
      }
    } else {
      const powerName = SUIT_TO_POWER_NAME[stage]?.[card.suit]
      if (powerName) {
        const response = await fetch(`/data/${stage}-${powerName}.json`)
        if (response.ok) {
          return await response.json()
        }
      }
    }
  } catch (error) {
    console.error('Error loading power data:', error)
  }
  return null
}
