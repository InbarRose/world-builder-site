# World Builder Studio Catalog — SOLID Multi-Shard & Graphic Sub-Leaf Guide

This directory (`frontend/src/data/catalog/`) is the **SOLID Data-Driven Content, Asset & Weights Taxonomy (v2.0.0)** for the World Builder Studio (ADR-026).

> **Note**: This catalog governs the **World Studio, Codex, Map Assets, and Bot Weights** (`frontend/src/data/catalog/`). It intentionally leaves the canonical rulebook data in `frontend/public/data/*.json` untouched.

---

## 1. Core Design Philosophy (SOLID & Zero-AI Surgical Authoring)

1. **No Primitive `"icon"` Field in JSON — Structured `"graphic"` Sub-Leaf**:
   Every entity, preset, symbol, relationship, trait, ability, and bot personality defines a rich **`"graphic"` sub-JSON leaf** referencing the **Graphics Assets Manifest (`assets/manifest.json`)** along with visual rendering parameters:
   ```json
   "graphic": {
     "assetId": "mountain-peak",
     "fallbackAssetId": "crater-impact",
     "glyph": "☄️",
     "primaryColor": "#78716c",
     "secondaryColor": "#fef08a",
     "params": {
       "strokeWidth": 1.3,
       "fillOpacity": 0.15,
       "scale": 1.0
     }
   }
   ```
2. **Multi-Shard Partitioning (`shards: string[]`) — Open/Closed Principle**:
   Every directory has a `manifest.json` whose entries declare a `shards: string[]` array (e.g., `./earth/part1-mountains-and-hills.json`, `./earth/part2-canyons-cliffs-and-craters.json`, `./earth/part3-deserts-mesas-and-volcanoes.json`).
   - Because `catalogLoader.ts` uses `import.meta.glob('../data/catalog/**/*.json', { eager: true })`, you can split any file into `part1.json`, `part2.json`, `part3.json` or add new category shard files Simply by adding the filename to `manifest.json`—**zero TypeScript imports or engine edits required**.

---

## 2. Directory & Shard Taxonomy

```text
frontend/src/data/catalog/
├── manifest.json                                           # Root v2.0.0 catalog manifest
├── README.md                                               # This Human Authoring Guide
├── assets/                                                 # Graphics Assets Registry & Visual Palettes
│   ├── manifest.json                                       # Asset categories, shards & conceptFallbacks
│   ├── earth/part1-core.json                               # Earth vector asset definitions
│   ├── water/part1-core.json                               # Water vector asset definitions
│   ├── plant/part1-core.json                               # Plant vector asset definitions
│   ├── feature/part1-core.json                             # Feature vector asset definitions
│   ├── settlement/part1-core.json                          # Settlement vector asset definitions
│   ├── construction/part1-core.json                        # Construction vector asset definitions
│   └── palettes/visual-palettes.json                       # Color swatches, slot palettes & icon sets
├── stages/                                                 # Multi-Shard Stage Action Presets
│   ├── manifest.json                                       # Index of stages & disaster shards
│   ├── disasters/part1-cataclysms.json                     # Stage / universal upheaval presets
│   ├── genesis/
│   │   ├── manifest.json                                   # 1. Genesis Stage multi-shard manifest
│   │   ├── earth/
│   │   │   ├── part1-mountains-and-hills.json              # ♠ Earth Part 1: Mountains, Ranges, Hills
│   │   │   ├── part2-canyons-cliffs-and-craters.json       # ♠ Earth Part 2: Canyons, Cliffs, Caves, Meteor Crater
│   │   │   └── part3-deserts-mesas-and-volcanoes.json      # ♠ Earth Part 3: Deserts, Mesas, Volcanoes
│   │   ├── water/
│   │   │   ├── part1-rivers-and-waterfalls.json            # ♥ Water Part 1: Rivers, Deltas, Waterfalls
│   │   │   ├── part2-lakes-swamps-and-marshes.json         # ♥ Water Part 2: Lakes, Tarns, Swamps, Marshes
│   │   │   └── part3-coastal-glaciers-and-currents.json    # ♥ Water Part 3: Fjords, Glaciers, Maelstroms
│   │   ├── plant/
│   │   │   ├── part1-forests-and-taiga.json                # ♣ Plant Part 1: Deciduous, Taiga, Redwoods
│   │   │   ├── part2-jungles-and-groves.json               # ♣ Plant Part 2: Jungles, Bamboo, Fungal
│   │   │   └── part3-grasslands-and-wetlands.json          # ♣ Plant Part 3: Steppes, Savannas, Meadows
│   │   └── feature/
│   │       ├── part1-geothermal-craters-and-lava.json      # ♦ Feature Part 1: Geysers, Craters, Lava
│   │       ├── part2-winds-and-resources.json              # ♦ Feature Part 2: Gales, Minerals, Gems
│   │       └── part3-landmarks-and-wonders.json            # ♦ Feature Part 3: Megaliths, Ruins, Ley-Lines
│   ├── primal/
│   │   ├── manifest.json
│   │   ├── settlements/part1-habitations.json              # ♠ Settlements
│   │   ├── traditions/part1-customs.json                   # ♥ Traditions
│   │   ├── resources/part1-flora-fauna-minerals.json       # ♣ Resources
│   │   └── skills/part1-masteries.json                     # ♦ Skills
│   ├── civilization/
│   │   ├── manifest.json
│   │   ├── constructions/part1-monuments-and-infra.json    # ♠ Constructions
│   │   ├── enlightenment/part1-civic-and-science.json      # ♥ Enlightenment
│   │   ├── expansion/part1-colonies-and-routes.json        # ♣ Expansion
│   │   └── diplomacy/part1-treaties-and-pacts.json         # ♦ Diplomacy
│   └── intrigue/
│       ├── manifest.json
│       ├── conflict/part1-wars-and-upheavals.json          # ♠ Conflict
│       ├── cooperation/part1-alliances-and-aid.json        # ♥ Cooperation
│       ├── scheme/part1-plots-and-cabals.json              # ♣ Scheme
│       └── myth/part1-legends-and-awakenings.json          # ♦ Myth & Mystery
├── codex/                                                  # Multi-Shard Codex Entities & Modular Blocks
│   ├── manifest.json
│   ├── species/
│   │   ├── part1-core-ancestries.json                      # Core playable ancestries
│   │   └── part2-elemental-and-fey.json                    # Elemental, fey & exotic folk
│   ├── societies/part1-realms-and-leagues.json
│   ├── myths/part1-calamities-and-legends.json
│   ├── relationships/part1-diplomatic-ties.json
│   ├── traits/
│   │   ├── part1-traditions-and-governance.json
│   │   └── part2-economy-and-craft.json
│   └── abilities/
│       ├── part1-magic-and-adaptations.json
│       └── part2-warfare-and-mastery.json
└── weights/                                                # Externalized Bot Personalities & Affinity Matrix
    ├── manifest.json
    ├── personalities/part1-council-archetypes.json
    └── affinity/part1-synergy-and-antiaffinity-rules.json
```

---

## 3. Surgical Example: Adding `"Meteor Crater"` to Genesis Earth

Open `frontend/src/data/catalog/stages/genesis/earth/part2-canyons-cliffs-and-craters.json` and append:

```json
  {
    "id": "gen_earth_meteor_crater",
    "name": "Meteor Crater",
    "description": "Colossal impact basin scarred into the bedrock with a shattered rim and central meteorite peak.",
    "terrainChange": "canyon",
    "reliefChange": "crag",
    "graphic": {
      "assetId": null,
      "fallbackAssetId": "crater-impact",
      "glyph": "☄️",
      "primaryColor": "#78716c",
      "secondaryColor": "#fef08a",
      "params": {
        "strokeWidth": 1.3,
        "fillOpacity": 0.15,
        "scale": 1
      }
    },
    "creativePrompt": "Did this ancient meteor impact leave behind star-metal ore or awaken something slumbering beneath the crust?",
    "exampleNarrative": "The Starfall Meteor Crater spans five leagues across, its vitrified stone rim encircling a central spire of sky-iron."
  }
```

### How the `graphic` Sub-Leaf & Context Inheritance Work:
1. **`graphic.assetId` vs `graphic.fallbackAssetId`**:
   - If you have a dedicated graphic in `assets/manifest.json`, set `"assetId": "<asset-id>"`.
   - If you do **not** have a dedicated graphic for your new preset, set `"assetId": null` and set `"fallbackAssetId": "crater-impact"` (or any existing asset ID in `assets/`).
   - Even if both `assetId` and `fallbackAssetId` are `null`, `inferDefaultGraphicForPreset()` inspects your preset's terrain/relief/keywords and selects an existing graphic automatically.
2. **Visual Parameters (`primaryColor`, `secondaryColor`, `params`)**:
   - Customize colors, stroke width, fill opacity, and scale directly inside the `graphic` sub-leaf.
3. **Automatic Shard & Context Inheritance**:
   - Because the file is listed under `♠` Earth in `stages/genesis/manifest.json`, `stage: "genesis"`, `suit: "♠"`, `slotCategory: "elevation"`, and `slotPriority: 70` are inherited automatically.
