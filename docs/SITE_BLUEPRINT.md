---
id: SITE_BLUEPRINT
title: Full Text-Only Site Blueprint
version: 2.0.0
status: reference
---

# 🧭 world-builder-site — Text-Only Blueprint

This document captures the **complete conceptual and structural blueprint** of the project, integrating all design decisions, gameplay logic, and feature specifications gathered through collaborative iteration.  
It serves as a reference model for both developers and designers to understand *what the site is and how it should behave*, independent of implementation details.

---

## 1. Core Concept

**World Builder** is a narrative world-creation tool gamified through a card-based system.  
Players collaboratively (or solo) draw cards from a virtual deck, each representing world events, changes, or creations.  
These outcomes vary depending on the *Age* of the world — evolving from primordial beginnings to advanced civilizations.

The app digitizes this experience while preserving tabletop storytelling spirit, allowing:

- Procedural generation via draws.
- Map/grid visualization of the world.
- Persistent timelines of events.
- Optional collaboration.
- Optional AI-assisted generation.

---

## 2. Gameplay & Simulation Model

### 2.1 Game Flow

1. **Setup**
   - Player selects:
     - Game length (which determines deck range).
     - Starting age.
     - Map size (default: 20x12 tiles).
   - Deck configuration:
     - Min: 1 number card of each suit, 1 face of each suit, 1 ace, 0 jokers.
     - Max: full 54-card deck (2 jokers).
     - Premium: multi-deck extended world support.

2. **Play Loop**
   - Each draw = a “turn” (`move_id` increments sequentially).
   - Card → effect derived from Age ruleset.
   - Player records resulting event (text).
   - Optionally, selects map tiles or species/civilizations affected.
   - History timeline automatically updates.

3. **Ages**
   - Each Age defines:
     - Suit meanings.
     - Value interpretations (2–10, J/Q/K, A, Joker).
     - Possible effects (terrain, species, conflict, culture, etc.).
   - Players can progress to the next Age after completing threshold draws.

4. **Session Save**
   - Anonymous: Local temporary data (sessionStorage).
   - Authenticated: Supabase persistent world record.
   - Shared sessions: Linked via Game ID, updated in near-real-time (polling or SSE).

---

## 3. Site Structure Overview

| Area | Description | Access |
|------|--------------|--------|
| **Home / Rules** | Wiki-like documentation of all rules and systems | Public |
| **Play Area** | Card draw simulator + event logging | Public / Authenticated |
| **Timeline View** | Chronological list of events with filters | Authenticated |
| **Map Canvas** | Interactive grid to visualize and annotate world state | Authenticated |
| **Session Manager** | Create, load, or invite collaborators to sessions | Authenticated |
| **AI Tools (Coming Soon)** | Generate world elements or simulate other players | Premium |

---

## 4. Navigation & Layout

### 4.1 Primary Layout

- Top navbar:
  - Logo → Home
  - Tabs: Rules | Play | Map | Timeline | Session | AI (coming soon)
  - Login / Profile (right-aligned)

- Responsive design:
  - Sidebar appears on small screens for rules navigation.
  - Map view uses maximum available viewport.

### 4.2 UI Sections

| Section | Description |
|----------|--------------|
| **Rules Page** | Navigable wiki with cross-links between Ages, Stages, and System sections. |
| **Card Draw Panel** | Central card-drawing UI with animation and quick reference display. |
| **Event Log / Notes** | Text area for recording each event result; linked to move_id. |
| **Map Canvas** | Grid visualization; tiles configurable and interactive. |
| **Timeline** | Displays chronological sequence of actions, expandable per entry. |
| **Settings Drawer** | For game options (deck configuration, map size, theme). |

---

## 5. Map Canvas Design

### 5.1 Grid Properties

- Default grid: 20 x 12 tiles (configurable).
- Each tile:
  - Background color (2-color pattern: solid, horizontal, vertical, diagonal, checkered).
  - Icon overlay (terrain or symbol).
  - Corner indicators (settlement, event marker, etc.).
  - Hover: shows associated history entries and tags (species, event summaries).

### 5.2 Tile Metadata

Each tile can contain multiple entries:

```json
{
  "tile_id": "10,4",
  "terrain": "forest",
  "overlays": ["river", "settlement"],
  "tags": ["Elf Tribe", "Battle of Silverwood"],
  "linked_events": [17, 24],
  "color_pattern": ["#2d5a27", "#a4b88a", "diagonal"]
}
```

### 5.3 Interaction

- Click = select / deselect.
- Hover = display popup with tile details.
- Drag = select multiple tiles.
- Context menu (right-click) = “Add event / settlement / note”.

“Coming Soon” placeholder for AI-based map generation.

## 6. Data Model Concepts

### 6.1 Entities

| Entity | Description |
|---|---|
| World | Root object containing metadata, stages, and timelines. |
| Stage / Age | Defines rules and card meanings. |
| Card | Represents a single drawn card (suit + value). |
| Event | Result of a card draw — narrative + metadata. |
| Species / Civilization | User-defined persistent entities linked to tiles and events. |
| Tile | Smallest spatial unit; references events and tags. |
| Session | Authenticated game instance with users and world data. |

### 6.2 Example (simplified schema)

```json
{
  "world_id": "wld_abc123",
  "title": "Emerald Vale",
  "created_at": "2025-10-14T12:00:00Z",
  "ages": [
    {"name": "Primordial", "ruleset": "rules/age_1.json"}
  ],
  "timeline": [
    {"move_id": 0, "card": "2H", "age": 1, "event": "Mountains rise from the depths."}
  ],
  "map": { "grid_size": [20,12], "tiles": [...] }
}
```

## 7. Functional Components

| Component | Description | State Type |
|---|---|---|
| Deck Manager | Handles draw probability, card availability, shuffle/reset. | Persistent |
| Game Engine | Applies stage rules to drawn cards, generates effects. | Persistent |
| History Manager | Records all events, manages timeline. | Persistent |
| Map Manager | Handles grid rendering and tile interactions. | Client + Persistent |
| Session Manager | Authentication, save/load, invitation handling. | Server |
| AI Interface (Future) | Autonomous card draws or content generation. | Server |

## 8. Modes of Operation

- Anonymous Mode — No login. Temporary session in browser memory.
- Authenticated Mode — Saved progress, collaboration support.
- Premium Mode (Coming Soon) — AI features and multi-deck worlds.

## 9. Collaboration Logic

Each session has a Game ID and a list of participants.

Updates are written to Supabase and visible to others on refresh or via polling.

Turn order can be sequential or host-controlled override.

“Host Control Panel” allows assigning the next active player.

## 10. Timeline & History

Each move logged with incrementing move_id.

Timeline can be filtered by:

- Age
- Civilization
- Tile(s)
- Event Type

Timeline is scrollable, exportable to text or JSON.

Optional PDF export (later phase).

## 11. Authentication & Security

- Email/password and magic link auth (supabase).
- OAuth (Google/GitHub) in later phase.
- Role-based: anonymous, authenticated, premium.
- Supabase handles session tokens.
- Frontend checks token validity before any write operation.
- All sessions private by default unless explicitly shared.

## 12. Export / Import Features

Export formats:

- PNG map snapshot.
- TXT or JSON timeline.
- PDF (later integration).

Import formats:

- JSON-based world state (for reloading or sharing).
- Future: allow merging worlds.

## 13. AI Roadmap (Premium Feature)

| Feature | Description | Phase |
|---|---|---|
| AI Player | Acts as autonomous collaborator, generating events. | 4 |
| AI Auto-World | Generates early Ages automatically before play. | 4 |
| AI Map Generator | Suggests or draws terrain and structures. | 5 |
| AI Lore Generator | Creates background stories for civilizations. | 5 |

## 14. UX / Design Standards

- Minimalist fantasy-inspired style.
- Icons: game-icons.net (licensed CC-BY).
- Primary tile sizes: 64px (default), scalable to 128px.
- Font pair: Inter (UI) + EB Garamond (display titles).
- Color themes toggleable (light/dark/fantasy).
- Use Tailwind and shadcn/ui components.

## 15. Technical & Security Considerations

- Serverless backend functions (Vercel) connected to Supabase.
- Client-side only in anonymous mode; backend in authenticated mode.
- Input sanitation on all user text (markdown-safe).
- JWT token rotation (24h).
- Private session by default.
- Supabase RLS (Row Level Security) enforced.

## 16. Implementation Priorities

- Phase 0: Scaffold & Docs (✅ in progress)
- Phase 1: Deck + Engine API
- Phase 2: UI integration (Rules, Draws, Timeline, Map)
- Phase 3: Auth + Collaboration
- Phase 4: AI & Premium Tools

## 17. Example Flow

User enters anonymously → clicks “Start Quick Game.”

Chooses “Short Game” → deck auto-configures.

Draws card → “8 of Hearts” → “A river forms through the valley.”

Records description, assigns to tiles (5,6) and (5,7).

Timeline adds entry, map updates.

User saves session → upgrades to authenticated account.

Later, invites friend to continue world creation.

## 18. Notes for Developers

- All logic around suits/values is data-driven (JSON rule definitions).
- Use modular structure: /engine/cards.py, /engine/ages.py, /engine/events.py.
- Separate frontend state from backend persistence via typed API.
- Maintain clean separation: frontend = presentation, backend = logic.

## 19. Future Enhancements

- Mobile-first UX polish.
- In-app lore viewer.
- Rule customizer and community sharing.
- Procedural map generation.
- AI narrative summarizer.

## 20. Conclusion

This blueprint defines what the app does, how it behaves, and how it should feel.
It serves as a permanent reference for the project vision — not to be rewritten by agents, but to guide implementation decisions and maintain fidelity to the original concept.

### Tasks

- Keep this blueprint in sync with actual implementation.
- Do not alter rules/game logic through automation.
- Reference this file in PROJECT_CONTEXT.md and onboarding docs.

---

✅ **Purpose:**

This is the authoritative, *content-agnostic blueprint* — it doesn’t describe your *world rules*, only the *system* to express them.
It should be included in `/docs/` and referenced in both `PROJECT_CONTEXT.md` and `PROJECT_PLAN.md`.

---
