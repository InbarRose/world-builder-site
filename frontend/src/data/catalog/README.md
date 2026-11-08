# World Builder Content Catalog — Human Authoring Guide

This directory (`frontend/src/data/catalog/`) is the **Data-Driven Content Taxonomy** for the World Builder Studio (ADR-025).

All stage action presets, whiteboard cartographic symbols, playable species, civilizations, myths, modular traits/abilities, and bot personalities live in small, focused JSON files organized by domain and stage. **You do not need generative AI or complex TypeScript edits to add new content.**

---

## 1. Directory & File Taxonomy

```text
frontend/src/data/catalog/
├── manifest.json                         # Root catalog manifest & schema version
├── README.md                             # This Human Authoring Guide
├── stages/
│   ├── manifest.json                     # Index of all 4 stages & disaster file
│   ├── disasters.json                    # Stage / universal disaster & upheaval presets
│   ├── genesis/
│   │   ├── manifest.json                 # 1. Genesis Stage manifest
│   │   ├── earth.json                    # ♠ Earth presets (Mountains, Canyons, Meteor Crater, etc.)
│   │   ├── water.json                    # ♥ Water presets (Rivers, Lakes, Waterfalls, Glaciers, etc.)
│   │   ├── plant.json                    # ♣ Plant presets (Forests, Jungles, Grasslands, Marshes, etc.)
│   │   └── feature.json                  # ♦ Feature presets (Geysers, Craters, Winds, Lava, Landmarks)
│   ├── primal/
│   │   ├── manifest.json                 # 2. Primal Stage manifest
│   │   ├── settlements.json              # ♠ Settlements (Camps, Hamlets, Longhouses, Keeps)
│   │   ├── traditions.json               # ♥ Cultural Traditions (Solar Cult, Shieldwall, etc.)
│   │   ├── resources.json                # ♣ Resources (Warhorses, Wheat, Bog Iron, Timber)
│   │   └── skills.json                   # ♦ Species Skills (Archery, Tracking, Navigation, Masonry)
│   ├── civilization/
│   │   ├── manifest.json                 # 3. Civilization Stage manifest
│   │   ├── constructions.json            # ♠ Constructions (Castles, Citadels, Bridges, Aqueducts)
│   │   ├── enlightenment.json            # ♥ Enlightenment (Republics, Legal Codes, Medicine)
│   │   ├── expansion.json                # ♣ Expansion (Colonies, Armadas, Granaries)
│   │   └── diplomacy.json                # ♦ Diplomacy (Royal Marriages, Defense Leagues, Trade Pacts)
│   └── intrigue/
│       ├── manifest.json                 # 4. Intrigue Stage manifest
│       ├── conflict.json                 # ♠ Conflict (Wars, Sieges, Rebellions, Blockades)
│       ├── cooperation.json              # ♥ Cooperation (Coalitions, Famine Relief, Leagues)
│       ├── scheme.json                   # ♣ Scheme (Assassinations, Cabals, Espionage, Coups)
│       └── myth.json                     # ♦ Myth & Mystery (Dragons, Archliches, Sunken Cities)
├── codex/
│   ├── manifest.json                     # Codex entities & modular traits index
│   ├── species.json                      # Playable races & ancestries
│   ├── societies.json                    # Civilizations, nations & realms
│   ├── myths.json                        # Calamities, schemes & legends
│   ├── relationships.json                # Diplomatic & historical relationship archetypes
│   ├── traits.json                       # Modular cultural tradition & trait blocks
│   ├── abilities.json                    # Modular power & skill blocks
│   └── palettes.json                     # Color swatches, icon galleries & settlement icon sets
├── symbols/
│   ├── manifest.json                     # Whiteboard cartographic symbol index & concept fallbacks
│   ├── earth.json                        # Earth cartographic symbols
│   ├── water.json                        # Water cartographic symbols
│   ├── plant.json                        # Plant cartographic symbols
│   ├── feature.json                      # Feature cartographic symbols
│   ├── settlement.json                   # Settlement cartographic symbols
│   └── construction.json                 # Construction cartographic symbols
└── bots/
    ├── manifest.json                     # Bot personalities & affinity profiles index
    └── personalities.json                # Bot personalities & default affinity weights
```

---

## 2. How to Add a New Stage Preset (Surgical Example: `"Meteor Crater"`)

Suppose you want to add a new preset to **Genesis -> Earth (`♠`)** called **"Meteor Crater"**.

1. Open `frontend/src/data/catalog/stages/genesis/earth.json`.
2. Append a small JSON object to the array:

```json
  {
    "id": "gen_earth_meteor_crater",
    "name": "Meteor Crater",
    "icon": "☄️",
    "description": "Colossal impact basin scarred into the bedrock with a shattered rim and central meteorite peak.",
    "terrainChange": "canyon",
    "reliefChange": "crag",
    "graphicFallback": "crater-impact",
    "creativePrompt": "Did this ancient meteor impact leave behind star-metal ore or awaken something slumbering beneath the crust?",
    "exampleNarrative": "The Starfall Meteor Crater spans five leagues across, its vitrified stone rim encircling a central spire of sky-iron."
  }
```

### What Happens Automatically?
- **Context Inheritance**: Because you placed it inside `stages/genesis/earth.json`, the loader (`catalogLoader.ts`) automatically sets `stage: "genesis"`, `suit: "♠"`, `isFantastical: false`, `isDisaster: false`, `slotCategory: "elevation"`, and `slotPriority: 70` (you can override any of these if you wish).
- **Graphic Reuse (`graphicFallback`)**: You did not need to draw a new SVG graphic! Setting `"graphicFallback": "crater-impact"` (or `"cartographicSymbol": "crater-impact"`) tells the map canvas, tile inspector, and SVG exporter to render the existing `"crater-impact"` whiteboard vector graphic.
- **Zero-Config Graphic Inference**: Even if you omit both `cartographicSymbol` and `graphicFallback`, `inferDefaultGraphicForPreset()` inspects the preset's keywords/terrain/relief and selects a matching existing graphic automatically.
- **Automatic Studio, Bot & Compendium Integration**:
  - Appears immediately in the **Studio Turn Drafting Workshop** under Genesis -> Earth (`♠`).
  - Automatically indexed in the **Tabletop Presets & Tropes Compendium (`📖 Compendium`)** with search and filters.
  - Automatically scored by the **Bot Affinity Engine** (`affinityEngine.ts`) and available for **Auto-Play Bots** (`autoPlayEngine.ts`).

---

## 3. How to Add a New Whiteboard Symbol (With or Without New SVG Art)

Open the appropriate category file in `frontend/src/data/catalog/symbols/<category>.json` (e.g., `symbols/earth.json`) and append an entry:

```json
  {
    "id": "earth-meteor-basin",
    "name": "Starfall Meteor Basin",
    "concept": "crater",
    "conceptLabel": "Craters & Calderas",
    "variantName": "Meteor Basin",
    "icon": "☄️",
    "description": "Shattered impact ring with central meteorite spire.",
    "graphicFallback": "crater-impact",
    "tags": ["crater", "meteor", "earth", "impact"]
  }
```

- If you do **not** write custom SVG code in `cartographicSymbolEngine.tsx`, the engine automatically checks:
  1. `"graphicFallback"` on your symbol JSON (e.g. `"crater-impact"`),
  2. `conceptFallbacks` in `symbols/manifest.json` (e.g. `"crater"` -> `"crater-impact"`),
  3. Category-level fallback.

---

## 4. How to Add Codex Species, Societies, Myths, Traditions, or Skills

- **New Playable Race / Species**: Add an entry to `codex/species.json`.
- **New Civilization / Realm**: Add an entry to `codex/societies.json`.
- **New Myth / Calamity**: Add an entry to `codex/myths.json`.
- **New Cultural Tradition / Trait**: Add `{ "label": "...", "icon": "...", "description": "..." }` to a category group in `codex/traits.json`.
- **New Skill / Ability**: Add `{ "label": "...", "icon": "...", "description": "..." }` to a category group in `codex/abilities.json`.
