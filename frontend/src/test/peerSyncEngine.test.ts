import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  generateRoomCode,
  normalizeRoomCode,
  shouldAcceptIncomingWorldSync,
  getTouchDistance,
  getTouchMidpoint,
  computePinchZoomDelta,
  computeTwoFingerPanDelta,
  TablePeerSession,
  SyncEnvelope,
} from '../engine/peerSyncEngine'
import { createNewWorld } from '../engine/storageService'

describe('Phase 21: Real-Time Table Peer Synchronization & Multi-Touch Geometry (peerSyncEngine)', () => {
  let hostSession: TablePeerSession | null = null
  let peerSession: TablePeerSession | null = null

  beforeEach(() => {
    hostSession = null
    peerSession = null
  })

  afterEach(() => {
    hostSession?.stop()
    peerSession?.stop()
  })

  it('generates and normalizes tabletop Conclave room codes deterministically', () => {
    const seededA = generateRoomCode('world-seed-alpha')
    const seededB = generateRoomCode('world-seed-alpha')
    expect(seededA).toBe(seededB)
    expect(seededA).toMatch(/^CONCLAVE-\d{4}$/)

    expect(normalizeRoomCode('4821')).toBe('CONCLAVE-4821')
    expect(normalizeRoomCode('conclave-9012')).toBe('CONCLAVE-9012')
    expect(normalizeRoomCode('  7733  ')).toBe('CONCLAVE-7733')
  })

  it('resolves world state conflicts deterministically by revision and draw history', () => {
    const localWorld = createNewWorld('Local Realm')
    const incomingWorld = {
      ...localWorld,
      name: 'Synced Realm',
      updatedAt: (localWorld.updatedAt ?? 1000) + 500,
    }

    // Higher revision always wins
    expect(shouldAcceptIncomingWorldSync(localWorld, incomingWorld, 5, 3)).toBe(true)
    // Lower revision is rejected
    expect(shouldAcceptIncomingWorldSync(localWorld, incomingWorld, 2, 4)).toBe(false)
    // Equal revision tie-breaks by drawHistory length and updatedAt
    expect(shouldAcceptIncomingWorldSync(localWorld, incomingWorld, 4, 4)).toBe(true)
  })

  it('computes multi-touch pinch-to-zoom and two-finger pan deltas accurately', () => {
    const p1 = { x: 100, y: 100 }
    const p2 = { x: 200, y: 100 }
    expect(getTouchDistance(p1, p2)).toBe(100)
    expect(getTouchMidpoint(p1, p2)).toEqual({ x: 150, y: 100 })

    // Spreading fingers apart (100 -> 150) zooms in
    const zoomedIn = computePinchZoomDelta(100, 150, 1.0, 0.4, 2.5)
    expect(zoomedIn).toBeGreaterThan(1.0)
    expect(zoomedIn).toBeLessThanOrEqual(2.5)

    // Pinching fingers together (150 -> 75) zooms out
    const zoomedOut = computePinchZoomDelta(150, 75, 1.0, 0.4, 2.5)
    expect(zoomedOut).toBeLessThan(1.0)
    expect(zoomedOut).toBeGreaterThanOrEqual(0.4)

    // Two-finger pan shifts camera by midpoint delta
    const panned = computeTwoFingerPanDelta(
      { x: 150, y: 100 },
      { x: 185, y: 125 },
      { x: 10, y: -20 }
    )
    expect(panned).toEqual({ x: 45, y: 5 })
  })

  it('synchronizes world state, card draws, and tile spotlights between Host and Spectator sessions', () => {
    const roomCode = 'CONCLAVE-5544'
    let receivedWorldName = ''
    let receivedCardId = ''
    let receivedSpotlightTile = ''
    let peerCount = 0

    hostSession = new TablePeerSession({
      roomCode,
      displayName: 'GM Host',
      role: 'host',
    })

    peerSession = new TablePeerSession({
      roomCode,
      displayName: 'TV Spectator',
      role: 'spectator',
      callbacks: {
        onWorldSync: (world) => {
          receivedWorldName = world.name
        },
        onCardDrawn: (card) => {
          receivedCardId = card?.id || ''
        },
        onTileSpotlight: (tileId) => {
          receivedSpotlightTile = tileId
        },
        onPeersChanged: (peers) => {
          peerCount = peers.length
        },
      },
    })

    hostSession.start()
    peerSession.start()

    const sharedWorld = createNewWorld('Chronicles of Eldoria')
    const syncEnvelope: SyncEnvelope = {
      id: 'msg_test_1',
      roomCode,
      senderId: hostSession.peerId,
      senderName: 'GM Host',
      senderRole: 'host',
      type: 'WORLD_STATE_SYNC',
      timestamp: Date.now(),
      revision: 2,
      payload: {
        world: sharedWorld,
        drawnCard: { id: 'card_spade_A', suit: '♠', value: 'A' },
        powerName: 'Shape the Land',
      },
    }

    peerSession.handleIncomingEnvelope(syncEnvelope, 'broadcast')
    expect(receivedWorldName).toBe('Chronicles of Eldoria')
    expect(receivedCardId).toBe('card_spade_A')
    expect(peerCount).toBe(1)
    expect(peerSession.getConnectedPeers()[0].displayName).toBe('GM Host')

    // Tile spotlight sync
    peerSession.handleIncomingEnvelope(
      {
        id: 'msg_test_2',
        roomCode,
        senderId: hostSession.peerId,
        senderName: 'GM Host',
        senderRole: 'host',
        type: 'TILE_SPOTLIGHT',
        timestamp: Date.now(),
        revision: 3,
        payload: {
          spotlightTileId: '7,4',
        },
      },
      'broadcast'
    )
    expect(receivedSpotlightTile).toBe('7,4')

    // Spectator read-only guard: spectator cannot increment revision by broadcasting world state
    const revBefore = peerSession.getRevision()
    peerSession.broadcastWorldState(sharedWorld)
    expect(peerSession.getRevision()).toBe(revBefore)
  })
})
