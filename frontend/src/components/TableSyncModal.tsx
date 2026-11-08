import { useState } from 'react'
import {
  Radio,
  Users,
  Tv,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  Wifi,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { PlayerSeat } from '../engine/types'
import {
  PeerNodeInfo,
  PeerRole,
  normalizeRoomCode,
} from '../engine/peerSyncEngine'

interface TableSyncModalProps {
  isOpen: boolean
  onClose: () => void
  isSyncActive: boolean
  roomCode: string
  peerRole: PeerRole
  displayName: string
  claimedSeatId?: string
  connectedPeers: PeerNodeInfo[]
  syncStats: { packetsSent: number; packetsReceived: number; revision: number }
  players: PlayerSeat[]
  onStartSync: (options: {
    roomCode: string
    role: PeerRole
    displayName: string
    claimedSeatId?: string
  }) => void
  onStopSync: () => void
  onPushManualSync: () => void
  onCreateWebRtcOffer?: () => Promise<string>
  onAcceptWebRtcOffer?: (offerToken: string) => Promise<string>
  onAcceptWebRtcAnswer?: (answerToken: string) => Promise<void>
}

export function TableSyncModal({
  isOpen,
  onClose,
  isSyncActive,
  roomCode,
  peerRole,
  displayName,
  claimedSeatId,
  connectedPeers,
  syncStats,
  players,
  onStartSync,
  onStopSync,
  onPushManualSync,
  onCreateWebRtcOffer,
  onAcceptWebRtcOffer,
  onAcceptWebRtcAnswer,
}: TableSyncModalProps) {
  const [inputRoomCode, setInputRoomCode] = useState(roomCode)
  const [selectedRole, setSelectedRole] = useState<PeerRole>(peerRole)
  const [inputName, setInputName] = useState(displayName || 'Tabletop Facilitator')
  const [selectedSeatId, setSelectedSeatId] = useState<string>(
    claimedSeatId || players[0]?.id || ''
  )
  const [copiedRoom, setCopiedRoom] = useState(false)
  const [showWebRtcPanel, setShowWebRtcPanel] = useState(false)
  const [webrtcOfferToken, setWebrtcOfferToken] = useState('')
  const [webrtcRemoteOfferInput, setWebrtcRemoteOfferInput] = useState('')
  const [webrtcGeneratedAnswer, setWebrtcGeneratedAnswer] = useState('')
  const [webrtcAnswerInput, setWebrtcAnswerInput] = useState('')
  const [webrtcStatus, setWebrtcStatus] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCopyRoomCode = () => {
    const code = normalizeRoomCode(isSyncActive ? roomCode : inputRoomCode)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {})
    }
    setCopiedRoom(true)
    setTimeout(() => setCopiedRoom(false), 2000)
  }

  const handleOpenSecondScreen = (targetRole: 'spectator' | 'co-creator') => {
    const activeCode = normalizeRoomCode(isSyncActive ? roomCode : inputRoomCode)
    if (!isSyncActive) {
      onStartSync({
        roomCode: activeCode,
        role: 'host',
        displayName: inputName,
        claimedSeatId: selectedSeatId,
      })
    }
    const url = new URL(window.location.href)
    url.searchParams.set('syncRoom', activeCode)
    url.searchParams.set('syncRole', targetRole)
    url.searchParams.delete('view')
    url.searchParams.delete('menu')
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
  }

  const handleGenerateOffer = async () => {
    if (!onCreateWebRtcOffer) return
    try {
      setWebrtcStatus('Generating WebRTC SDP Offer token...')
      const token = await onCreateWebRtcOffer()
      setWebrtcOfferToken(token)
      setWebrtcStatus('Offer token ready! Copy and send to your co-creator.')
    } catch (err) {
      setWebrtcStatus(
        err instanceof Error ? err.message : 'Unable to generate WebRTC offer.'
      )
    }
  }

  const handleAcceptOffer = async () => {
    if (!onAcceptWebRtcOffer || !webrtcRemoteOfferInput.trim()) return
    try {
      setWebrtcStatus('Generating WebRTC Answer token...')
      const answer = await onAcceptWebRtcOffer(webrtcRemoteOfferInput)
      setWebrtcGeneratedAnswer(answer)
      setWebrtcStatus('Answer token ready! Send this back to the Host.')
    } catch (err) {
      setWebrtcStatus(
        err instanceof Error ? err.message : 'Invalid WebRTC offer token.'
      )
    }
  }

  const handleCompleteHandshake = async () => {
    if (!onAcceptWebRtcAnswer || !webrtcAnswerInput.trim()) return
    try {
      await onAcceptWebRtcAnswer(webrtcAnswerInput)
      setWebrtcStatus('Direct P2P WebRTC DataChannel established!')
    } catch (err) {
      setWebrtcStatus(
        err instanceof Error ? err.message : 'Failed to complete WebRTC handshake.'
      )
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Real-Time Table Peer Synchronization"
    >
      <div className="card p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-2xl border-primary/30">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-xl ${
                isSyncActive
                  ? 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/40'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              <Radio className={`h-5 w-5 ${isSyncActive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  Real-Time Table & Second-Screen Sync
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isSyncActive
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isSyncActive ? `● Live (${roomCode})` : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Synchronize card draws, map stamps, turn handoffs, and Codex lore across a second TV/projector screen or co-creator seats with zero server login.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="Close Table Sync Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            1. Select Your Tabletop Screen Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(
              [
                {
                  id: 'host' as PeerRole,
                  title: 'Conclave Host',
                  icon: '👑',
                  desc: 'Primary GM / Facilitator screen. Broadcasts card draws, turns, and map stamps.',
                },
                {
                  id: 'co-creator' as PeerRole,
                  title: 'Co-Creator Seat',
                  icon: '✍️',
                  desc: 'Claim a player seat, receive live table updates, and contribute map & lore edits.',
                },
                {
                  id: 'spectator' as PeerRole,
                  title: 'Tabletop TV View',
                  icon: '📺',
                  desc: 'Second-screen projector/TV display that follows active cards and map spotlights.',
                },
              ] as const
            ).map((r) => {
              const active = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                    active
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{r.icon}</span>
                    {active && (
                      <span className="text-[10px] font-bold text-primary uppercase">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold">{r.title}</div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {r.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Room Code & Seat Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border">
          <div>
            <label
              htmlFor="sync-room-code-input"
              className="text-[11px] font-bold text-muted-foreground block mb-1"
            >
              Conclave Room Code
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="sync-room-code-input"
                type="text"
                value={isSyncActive ? roomCode : inputRoomCode}
                disabled={isSyncActive}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder="CONCLAVE-4821"
                className="input h-8 text-xs font-mono font-bold px-2.5 flex-1 uppercase"
              />
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="btn-outline h-8 px-2 text-xs flex items-center gap-1 shrink-0"
                title="Copy Room Code"
              >
                {copiedRoom ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="sync-display-name-input"
              className="text-[11px] font-bold text-muted-foreground block mb-1"
            >
              Your Display Name
            </label>
            <input
              id="sync-display-name-input"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. GM Mercer"
              className="input h-8 text-xs px-2.5 w-full"
            />
          </div>

          <div>
            <label
              htmlFor="sync-seat-select"
              className="text-[11px] font-bold text-muted-foreground block mb-1"
            >
              Claimed Tabletop Seat
            </label>
            <select
              id="sync-seat-select"
              value={selectedSeatId}
              onChange={(e) => setSelectedSeatId(e.target.value)}
              className="input h-8 text-xs py-0 px-2 w-full"
            >
              <option value="">All Seats (Facilitator)</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {!isSyncActive ? (
              <button
                type="button"
                onClick={() =>
                  onStartSync({
                    roomCode: normalizeRoomCode(inputRoomCode),
                    role: selectedRole,
                    displayName: inputName,
                    claimedSeatId: selectedSeatId || undefined,
                  })
                }
                className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Wifi className="h-4 w-4" />
                <span>Start Live Table Sync</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onPushManualSync}
                  className="btn-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Broadcast World Now</span>
                </button>
                <button
                  type="button"
                  onClick={onStopSync}
                  className="btn-outline px-3 py-2 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  Disconnect Room
                </button>
              </>
            )}
          </div>

          {/* 1-Click Second Screen Launchers */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenSecondScreen('spectator')}
              className="btn-outline px-3 py-2 text-xs font-semibold flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
              title="Open a synchronized Tabletop TV / Projector Spectator window"
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Open TV Spectator Window</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </button>
          </div>
        </div>

        {/* Connected Peers & Telemetry Box */}
        <div className="p-3.5 rounded-xl bg-card border border-border space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>Connected Table Screens ({connectedPeers.length + (isSyncActive ? 1 : 0)})</span>
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Rev #{syncStats.revision} · ↑{syncStats.packetsSent} ↓{syncStats.packetsReceived} pkts
            </span>
          </div>

          {connectedPeers.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/60 flex items-center justify-between">
              <span>
                {isSyncActive
                  ? 'Listening on room channel. Open a second window or connect another tab with the same room code!'
                  : 'Start Live Table Sync to broadcast changes in real time across tabs, second monitors, or WebRTC peers.'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {connectedPeers.map((peer) => {
                const seat = players.find((p) => p.id === peer.claimedSeatId)
                return (
                  <div
                    key={peer.peerId}
                    className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>{peer.displayName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/15 text-primary uppercase font-bold">
                          {peer.role}
                        </span>
                      </div>
                      {seat && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Seat: {seat.name} ({seat.role})
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {peer.transport}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Serverless Cross-Device WebRTC Pairing (Collapsible) */}
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowWebRtcPanel((v) => !v)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>
              {showWebRtcPanel
                ? 'Hide Cross-Device WebRTC Pairing Tokens'
                : 'Pair Separate Laptop/Tablet via Serverless WebRTC Token'}
            </span>
          </button>

          {showWebRtcPanel && (
            <div className="mt-3 p-3.5 rounded-xl bg-muted/30 border border-border space-y-3 text-xs">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Same-device windows sync automatically via <code className="font-mono">BroadcastChannel</code>. To link a separate tablet or laptop without a backend server, exchange a WebRTC Offer &amp; Answer token below:
              </p>

              {webrtcStatus && (
                <div className="p-2 rounded bg-primary/10 border border-primary/30 text-primary font-medium text-[11px] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>{webrtcStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Host Side */}
                <div className="space-y-2 p-2.5 rounded-lg bg-background border border-border">
                  <div className="font-bold text-[11px]">Step A (Host): Create Invite Token</div>
                  <button
                    type="button"
                    onClick={handleGenerateOffer}
                    className="btn-outline w-full py-1 text-xs font-semibold"
                  >
                    1. Generate Offer Token
                  </button>
                  {webrtcOfferToken && (
                    <textarea
                      readOnly
                      value={webrtcOfferToken}
                      className="input w-full h-14 text-[10px] font-mono p-1.5"
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                  )}
                  <input
                    type="text"
                    value={webrtcAnswerInput}
                    onChange={(e) => setWebrtcAnswerInput(e.target.value)}
                    placeholder="3. Paste Peer's Answer Token here..."
                    className="input h-7 text-[11px] px-2 w-full font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCompleteHandshake}
                    disabled={!webrtcAnswerInput.trim()}
                    className="btn-primary w-full py-1 text-xs font-semibold disabled:opacity-50"
                  >
                    Connect Peer
                  </button>
                </div>

                {/* Peer Side */}
                <div className="space-y-2 p-2.5 rounded-lg bg-background border border-border">
                  <div className="font-bold text-[11px]">Step B (Tablet/Peer): Accept Invite</div>
                  <input
                    type="text"
                    value={webrtcRemoteOfferInput}
                    onChange={(e) => setWebrtcRemoteOfferInput(e.target.value)}
                    placeholder="2. Paste Host's Offer Token here..."
                    className="input h-7 text-[11px] px-2 w-full font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAcceptOffer}
                    disabled={!webrtcRemoteOfferInput.trim()}
                    className="btn-outline w-full py-1 text-xs font-semibold disabled:opacity-50"
                  >
                    Generate Answer Token
                  </button>
                  {webrtcGeneratedAnswer && (
                    <textarea
                      readOnly
                      value={webrtcGeneratedAnswer}
                      className="input w-full h-14 text-[10px] font-mono p-1.5"
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
