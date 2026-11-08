/**
 * peerSyncEngine.ts
 * Phase 21: Real-Time Table Peer Synchronization & Multi-Touch Geometry Engine (ADR-027).
 *
 * Enables zero-server collaborative Session Zero table synchronization across:
 * 1. Instant Second-Screen / Multi-Window Table Sync (BroadcastChannel + storage event fallback)
 *    for running a GM/Facilitator view on one screen and a Tabletop TV Spectator or Co-Creator
 *    view in another window.
 * 2. Serverless WebRTC DataChannel P2P pairing via copy-paste SDP Invite/Answer tokens.
 * 3. Deterministic revision conflict resolution & pure multi-touch pinch/pan math for tablets.
 */

import { Card, WorldState } from './types'

export type PeerRole = 'host' | 'co-creator' | 'spectator'

export type SyncMessageType =
  | 'HEARTBEAT'
  | 'WORLD_STATE_SYNC'
  | 'CARD_DRAWN'
  | 'TILE_SPOTLIGHT'
  | 'TURN_HANDOFF'
  | 'REQUEST_SYNC'

export interface PeerNodeInfo {
  peerId: string
  displayName: string
  role: PeerRole
  claimedSeatId?: string
  lastSeen: number
  transport: 'broadcast' | 'webrtc' | 'storage'
}

export interface SyncEnvelope {
  id: string
  roomCode: string
  senderId: string
  senderName: string
  senderRole: PeerRole
  type: SyncMessageType
  timestamp: number
  revision: number
  payload: {
    world?: WorldState
    drawnCard?: Card | null
    powerName?: string
    spotlightTileId?: string
    activeSeatName?: string
    claimedSeatId?: string
  }
}

export interface TouchPoint {
  x: number
  y: number
}

/**
 * Generates a human-friendly tabletop room code (e.g., "CONCLAVE-4821").
 */
export function generateRoomCode(seed?: string): string {
  if (seed) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 9000
    }
    const code = Math.abs(hash) + 1000
    return `CONCLAVE-${code}`
  }
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `CONCLAVE-${randomDigits}`
}

/**
 * Normalizes user-entered room codes ("4821" -> "CONCLAVE-4821", "conclave-4821" -> "CONCLAVE-4821").
 */
export function normalizeRoomCode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (!cleaned) return 'CONCLAVE-1000'
  if (/^\d{4}$/.test(cleaned)) {
    return `CONCLAVE-${cleaned}`
  }
  if (!cleaned.startsWith('CONCLAVE-') && /^\d+$/.test(cleaned)) {
    return `CONCLAVE-${cleaned.slice(0, 4)}`
  }
  return cleaned
}

/**
 * Deterministic conflict resolution for incoming world state sync packets.
 * Prevents stale packets or lower revisions from overwriting newer local edits.
 */
export function shouldAcceptIncomingWorldSync(
  localWorld: WorldState,
  incomingWorld: WorldState,
  incomingRevision: number,
  localRevision: number
): boolean {
  if (!incomingWorld || !incomingWorld.id) return false
  if (incomingRevision > localRevision) return true
  if (incomingRevision < localRevision) return false

  // Tie-break by drawHistory length and updatedAt timestamp
  const localDraws = localWorld.drawHistory?.length ?? 0
  const incomingDraws = incomingWorld.drawHistory?.length ?? 0
  if (incomingDraws !== localDraws) {
    return incomingDraws > localDraws
  }
  return (incomingWorld.updatedAt ?? 0) >= (localWorld.updatedAt ?? 0)
}

/**
 * Computes Euclidean distance between two touch points (for pinch-to-zoom).
 */
export function getTouchDistance(p1: TouchPoint, p2: TouchPoint): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.hypot(dx, dy)
}

/**
 * Computes the midpoint between two touch points (for two-finger pan).
 */
export function getTouchMidpoint(p1: TouchPoint, p2: TouchPoint): TouchPoint {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

/**
 * Pure pinch-to-zoom calculation clamped between minZoom and maxZoom.
 */
export function computePinchZoomDelta(
  prevDistance: number,
  nextDistance: number,
  currentZoom: number,
  minZoom = 0.5,
  maxZoom = 2.5
): number {
  if (prevDistance <= 0 || nextDistance <= 0) return currentZoom
  const scaleRatio = nextDistance / prevDistance
  const dampedRatio = 1 + (scaleRatio - 1) * 0.85
  const nextZoom = currentZoom * dampedRatio
  return Math.round(Math.min(maxZoom, Math.max(minZoom, nextZoom)) * 100) / 100
}

/**
 * Pure two-finger pan camera offset calculation.
 */
export function computeTwoFingerPanDelta(
  prevMidpoint: TouchPoint,
  nextMidpoint: TouchPoint,
  currentCamera: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: Math.round(currentCamera.x + (nextMidpoint.x - prevMidpoint.x)),
    y: Math.round(currentCamera.y + (nextMidpoint.y - prevMidpoint.y)),
  }
}

const STORAGE_SYNC_KEY_PREFIX = 'wb_conclave_sync_'

export interface TablePeerCallbacks {
  onWorldSync?: (
    world: WorldState,
    envelope: SyncEnvelope
  ) => void
  onCardDrawn?: (
    card: Card | null,
    powerName: string | undefined,
    envelope: SyncEnvelope
  ) => void
  onTileSpotlight?: (tileId: string, envelope: SyncEnvelope) => void
  onPeersChanged?: (peers: PeerNodeInfo[]) => void
  onRequestSync?: (envelope: SyncEnvelope) => void
}

/**
 * Manages live zero-server tabletop synchronization across browser tabs/windows
 * (BroadcastChannel + storage events) and optional WebRTC DataChannels.
 */
export class TablePeerSession {
  public readonly peerId: string
  public readonly roomCode: string
  private displayName: string
  private role: PeerRole
  private claimedSeatId?: string
  private revision = 1
  private channel: BroadcastChannel | null = null
  private peers: Map<string, PeerNodeInfo> = new Map()
  private callbacks: TablePeerCallbacks
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private storageListener: ((e: StorageEvent) => void) | null = null
  private rtcPeer: RTCPeerConnection | null = null
  private rtcDataChannel: RTCDataChannel | null = null
  private packetsSent = 0
  private packetsReceived = 0

  constructor(options: {
    roomCode: string
    displayName: string
    role: PeerRole
    claimedSeatId?: string
    callbacks?: TablePeerCallbacks
  }) {
    this.peerId = `peer_${Math.random().toString(36).slice(2, 9)}`
    this.roomCode = normalizeRoomCode(options.roomCode)
    this.displayName = options.displayName.trim() || 'Tabletop Peer'
    this.role = options.role
    this.claimedSeatId = options.claimedSeatId
    this.callbacks = options.callbacks || {}
  }

  public start(): void {
    const channelName = `world-builder-conclave-${this.roomCode}`

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(channelName)
        this.channel.onmessage = (event: MessageEvent<SyncEnvelope>) => {
          if (event?.data) {
            this.handleIncomingEnvelope(event.data, 'broadcast')
          }
        }
      } catch {
        // Fallback to storage listener when BroadcastChannel is unavailable
      }
    }

    if (typeof window !== 'undefined') {
      this.storageListener = (e: StorageEvent) => {
        if (e.key === `${STORAGE_SYNC_KEY_PREFIX}${this.roomCode}` && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as SyncEnvelope
            this.handleIncomingEnvelope(parsed, 'storage')
          } catch {
            // Ignore malformed storage packets
          }
        }
      }
      window.addEventListener('storage', this.storageListener)
    }

    this.sendHeartbeat()
    if (this.role !== 'host') {
      this.requestFullSync()
    }

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
      this.pruneStalePeers()
    }, 5000)
  }

  public stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    if (typeof window !== 'undefined' && this.storageListener) {
      window.removeEventListener('storage', this.storageListener)
      this.storageListener = null
    }
    if (this.rtcDataChannel) {
      this.rtcDataChannel.close()
      this.rtcDataChannel = null
    }
    if (this.rtcPeer) {
      this.rtcPeer.close()
      this.rtcPeer = null
    }
  }

  public updateIdentity(updates: {
    displayName?: string
    role?: PeerRole
    claimedSeatId?: string
  }): void {
    if (updates.displayName !== undefined) this.displayName = updates.displayName
    if (updates.role !== undefined) this.role = updates.role
    if (updates.claimedSeatId !== undefined) this.claimedSeatId = updates.claimedSeatId
    this.sendHeartbeat()
  }

  public getRole(): PeerRole {
    return this.role
  }

  public getClaimedSeatId(): string | undefined {
    return this.claimedSeatId
  }

  public getRevision(): number {
    return this.revision
  }

  public getConnectedPeers(): PeerNodeInfo[] {
    return Array.from(this.peers.values())
  }

  public getStats(): { packetsSent: number; packetsReceived: number; revision: number } {
    return {
      packetsSent: this.packetsSent,
      packetsReceived: this.packetsReceived,
      revision: this.revision,
    }
  }

  public sendHeartbeat(): void {
    this.dispatchEnvelope('HEARTBEAT', {
      claimedSeatId: this.claimedSeatId,
    })
  }

  public requestFullSync(): void {
    this.dispatchEnvelope('REQUEST_SYNC', {})
  }

  public broadcastWorldState(
    world: WorldState,
    drawnCard?: Card | null,
    powerName?: string
  ): void {
    if (this.role === 'spectator') return
    this.revision += 1
    this.dispatchEnvelope('WORLD_STATE_SYNC', {
      world,
      drawnCard,
      powerName,
    })
  }

  public broadcastCardDrawn(card: Card | null, powerName?: string): void {
    if (this.role === 'spectator') return
    this.revision += 1
    this.dispatchEnvelope('CARD_DRAWN', {
      drawnCard: card,
      powerName,
    })
  }

  public broadcastTileSpotlight(tileId: string): void {
    this.dispatchEnvelope('TILE_SPOTLIGHT', {
      spotlightTileId: tileId,
    })
  }

  /**
   * Serverless WebRTC Offer Generator: encodes SDP offer into a base64 token
   * that a second tablet/laptop can paste to connect directly.
   */
  public async createWebRtcOfferToken(): Promise<string> {
    if (typeof RTCPeerConnection === 'undefined') {
      throw new Error('WebRTC is not supported in this browser environment.')
    }
    this.rtcPeer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    const dc = this.rtcPeer.createDataChannel('conclave-sync')
    this.bindDataChannel(dc)

    const offer = await this.rtcPeer.createOffer()
    await this.rtcPeer.setLocalDescription(offer)

    await this.waitForIceGathering(this.rtcPeer)
    const payload = JSON.stringify({
      roomCode: this.roomCode,
      sdp: this.rtcPeer.localDescription,
    })
    return btoa(payload)
  }

  /**
   * Accepts a host's WebRTC Offer Token and returns a base64 Answer Token.
   */
  public async acceptWebRtcOfferAndCreateAnswer(offerToken: string): Promise<string> {
    if (typeof RTCPeerConnection === 'undefined') {
      throw new Error('WebRTC is not supported in this browser environment.')
    }
    const decoded = JSON.parse(atob(offerToken.trim()))
    this.rtcPeer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    this.rtcPeer.ondatachannel = (event) => {
      this.bindDataChannel(event.channel)
    }

    await this.rtcPeer.setRemoteDescription(new RTCSessionDescription(decoded.sdp))
    const answer = await this.rtcPeer.createAnswer()
    await this.rtcPeer.setLocalDescription(answer)
    await this.waitForIceGathering(this.rtcPeer)

    const payload = JSON.stringify({
      roomCode: this.roomCode,
      sdp: this.rtcPeer.localDescription,
    })
    return btoa(payload)
  }

  /**
   * Completes the WebRTC handshake on the Host using the peer's Answer Token.
   */
  public async acceptWebRtcAnswerToken(answerToken: string): Promise<void> {
    if (!this.rtcPeer) {
      throw new Error('No pending WebRTC offer found.')
    }
    const decoded = JSON.parse(atob(answerToken.trim()))
    await this.rtcPeer.setRemoteDescription(new RTCSessionDescription(decoded.sdp))
  }

  private bindDataChannel(dc: RTCDataChannel): void {
    this.rtcDataChannel = dc
    dc.onopen = () => {
      this.sendHeartbeat()
    }
    dc.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data) as SyncEnvelope
        this.handleIncomingEnvelope(envelope, 'webrtc')
      } catch {
        // Ignore malformed frame
      }
    }
  }

  private waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
    if (pc.iceGatheringState === 'complete') return Promise.resolve()
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, 1500)
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeout)
          resolve()
        }
      }
    })
  }

  private dispatchEnvelope(
    type: SyncMessageType,
    payload: SyncEnvelope['payload']
  ): void {
    const envelope: SyncEnvelope = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      roomCode: this.roomCode,
      senderId: this.peerId,
      senderName: this.displayName,
      senderRole: this.role,
      type,
      timestamp: Date.now(),
      revision: this.revision,
      payload,
    }

    this.packetsSent += 1

    if (this.channel) {
      try {
        this.channel.postMessage(envelope)
      } catch {
        // Ignore closed channel errors
      }
    }

    if (this.rtcDataChannel && this.rtcDataChannel.readyState === 'open') {
      try {
        this.rtcDataChannel.send(JSON.stringify(envelope))
      } catch {
        // Ignore RTC send error
      }
    }

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          `${STORAGE_SYNC_KEY_PREFIX}${this.roomCode}`,
          JSON.stringify(envelope)
        )
      } catch {
        // Ignore storage quota warnings on sync key
      }
    }
  }

  /**
   * Publicly accessible for unit testing or direct loopback injection.
   */
  public handleIncomingEnvelope(
    envelope: SyncEnvelope,
    transport: 'broadcast' | 'webrtc' | 'storage' = 'broadcast'
  ): void {
    if (!envelope || envelope.senderId === this.peerId) return
    if (envelope.roomCode !== this.roomCode) return

    this.packetsReceived += 1

    if (envelope.revision > this.revision) {
      this.revision = envelope.revision
    }

    const existingPeer = this.peers.get(envelope.senderId)
    const updatedPeer: PeerNodeInfo = {
      peerId: envelope.senderId,
      displayName: envelope.senderName,
      role: envelope.senderRole,
      claimedSeatId: envelope.payload.claimedSeatId ?? existingPeer?.claimedSeatId,
      lastSeen: Date.now(),
      transport,
    }
    this.peers.set(envelope.senderId, updatedPeer)
    this.callbacks.onPeersChanged?.(this.getConnectedPeers())

    switch (envelope.type) {
      case 'WORLD_STATE_SYNC':
        if (envelope.payload.world) {
          this.callbacks.onWorldSync?.(envelope.payload.world, envelope)
        }
        if (envelope.payload.drawnCard !== undefined) {
          this.callbacks.onCardDrawn?.(
            envelope.payload.drawnCard,
            envelope.payload.powerName,
            envelope
          )
        }
        break
      case 'CARD_DRAWN':
        this.callbacks.onCardDrawn?.(
          envelope.payload.drawnCard ?? null,
          envelope.payload.powerName,
          envelope
        )
        break
      case 'TILE_SPOTLIGHT':
        if (envelope.payload.spotlightTileId) {
          this.callbacks.onTileSpotlight?.(envelope.payload.spotlightTileId, envelope)
        }
        break
      case 'REQUEST_SYNC':
        this.callbacks.onRequestSync?.(envelope)
        break
      default:
        break
    }
  }

  private pruneStalePeers(): void {
    const now = Date.now()
    let changed = false
    for (const [id, peer] of this.peers.entries()) {
      if (now - peer.lastSeen > 18000) {
        this.peers.delete(id)
        changed = true
      }
    }
    if (changed) {
      this.callbacks.onPeersChanged?.(this.getConnectedPeers())
    }
  }
}
