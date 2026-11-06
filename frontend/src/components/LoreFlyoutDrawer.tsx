import { X, MapPin, Award, Users, FileText, Compass, ExternalLink } from 'lucide-react'
import { WorldState } from '../engine/types'
import { computeEntityAchievements, getEntityDiplomaticRelations } from '../engine/narrativeEngine'

interface LoreFlyoutDrawerProps {
  entityId: string | null
  world: WorldState
  onClose: () => void
  onNavigateToTile: (tileId: string) => void
  onNavigateToEntity: (entityId: string) => void
}

export function LoreFlyoutDrawer({
  entityId,
  world,
  onClose,
  onNavigateToTile,
  onNavigateToEntity,
}: LoreFlyoutDrawerProps) {
  if (!entityId) return null

  const entity = world.entities.find((e) => e.id === entityId)
  if (!entity) return null

  const featsByEntity = computeEntityAchievements(world)
  const feats = featsByEntity[entity.id] || []
  const relations = getEntityDiplomaticRelations(entity, world.entities)

  // Find all tiles claimed or linked to this entity
  const claimedTiles = Object.values(world.map.tiles).filter(
    (t) => t.territoryId === entity.id || t.linkedEntityIds.includes(entity.id)
  )

  // Find all timeline turns involving this entity
  const involvedTurns = world.drawHistory.filter(
    (rec) =>
      rec.linkedEntityIds?.includes(entity.id) ||
      rec.note.toLowerCase().includes(entity.name.toLowerCase())
  )

  return (
    <div
      role="dialog"
      aria-label={`Dossier for ${entity.name}`}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card/95 backdrop-blur-md border-l border-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-muted/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl p-2 rounded-xl bg-background border border-border shadow-sm shrink-0">
            {entity.icon || '📜'}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold truncate">{entity.name}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="capitalize">{entity.category}</span>
              <span>·</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {entity.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Dossier"
          className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Description */}
        {entity.description && (
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              Lore & History
            </span>
            <p className="leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60 font-serif">
              {entity.description}
            </p>
          </div>
        )}

        {/* Traits */}
        {entity.traits && entity.traits.length > 0 && (
          <div className="space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
              Distinguishing Traits
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entity.traits.map((tr) => (
                <span
                  key={tr}
                  className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium"
                >
                  {tr}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Historical Feats & Epoch Deeds */}
        {feats.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] flex items-center gap-1">
              <Award className="h-3 w-3 text-amber-500" />
              <span>Historical Feats & Epoch Deeds</span>
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {feats.map((feat) => (
                <div
                  key={feat.id}
                  className={`p-2 rounded-lg border flex items-center gap-2 ${feat.badgeColor}`}
                >
                  <span className="text-base">{feat.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold">{feat.title}</div>
                    <div className="text-[10px] opacity-80">{feat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diplomatic Relations Web */}
        {relations.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] flex items-center gap-1">
              <Users className="h-3 w-3 text-primary" />
              <span>Diplomatic Standing & Treaties</span>
            </span>
            <div className="space-y-1.5">
              {relations.map((rel) => (
                <div
                  key={rel.targetId}
                  className="p-2 rounded-lg bg-background border border-border flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() => onNavigateToEntity(rel.targetId)}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors text-left"
                  >
                    <span>{rel.icon}</span>
                    <span className="font-semibold">{rel.targetName}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rel.harmonyScore > 20
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : rel.harmonyScore < -20
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {rel.label} ({rel.harmonyScore > 0 ? `+${rel.harmonyScore}` : rel.harmonyScore})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claimed Provinces / Map Coordinates */}
        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            <span>Territorial Provinces & Coordinates ({claimedTiles.length})</span>
          </span>
          {claimedTiles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {claimedTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onNavigateToTile(tile.id)}
                  className="px-2 py-1 rounded bg-background border border-border hover:border-primary text-xs font-mono flex items-center gap-1 transition-colors"
                  title={`Navigate map camera to (${tile.col}, ${tile.row})`}
                >
                  <Compass className="h-3 w-3 text-muted-foreground" />
                  <span>({tile.col}, {tile.row})</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic text-[11px]">
              No claimed territory tiles yet. Open World Map to paint or assign provinces.
            </p>
          )}
        </div>

        {/* Chronicle Involvement */}
        {involvedTurns.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] flex items-center gap-1">
              <FileText className="h-3 w-3 text-primary" />
              <span>Chronicle Involvement ({involvedTurns.length})</span>
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {involvedTurns.map((turn) => (
                <div
                  key={turn.id}
                  className="p-2 rounded bg-muted/40 border border-border/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-primary">Move #{turn.moveId} · {turn.power}</span>
                    <span className="text-muted-foreground">{turn.epochYear}</span>
                  </div>
                  <p className="line-clamp-2 text-foreground/90 font-serif">{turn.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-outline px-3 py-1.5 text-xs font-semibold"
        >
          Close Dossier
        </button>
      </div>
    </div>
  )
}
