# World Builder — Headless Multi-Stage Simulation Report

> **Total Permutations Simulated:** `320` (120 Pre-Genesis bare maps + 150 full 4-stage campaigns spanning **2,400 turns** + 50 card/map session stress tests)
> **Invariant Failures:** `0` | **4-Stage Completion Rate:** `150/150 (100%)` | **Runtime:** `4287 ms`

---

## 1. Pre-Genesis Ultra-Bare Map Verification (120 Permutations)

Every starting world must obey the original *World Building* bare-start ruleset (`>= 92%` bare plains, `1–2` mountains, `1–2` forests, `0` rivers/settlements/slots):

| Geography Preset | Runs | Passed | Avg Land % | Avg Bare Plains % | Avg Mountains | Avg Forests | Max Rivers / Settlements |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `continent` | 20 | 20/20 | 51.7% | 96.8% | 2 | 2 | 0 |
| `archipelago` | 20 | 20/20 | 35.8% | 97.7% | 1 | 1 | 0 |
| `inland-sea` | 20 | 20/20 | 59.6% | 97.2% | 2 | 2 | 0 |
| `pangaea` | 20 | 20/20 | 67.9% | 97.5% | 2 | 2 | 0 |
| `highlands` | 20 | 20/20 | 57.9% | 97.1% | 2 | 2 | 0 |
| `twin-continents` | 20 | 20/20 | 53.8% | 96.9% | 2 | 2 | 0 |

---

## 2. Full 4-Stage Headless Campaign Telemetry (150 Realms · 2,400 Turns)

Simulated **150 complete realms** (25 per geography preset) through **Age 1: Genesis → Age 2: Primal → Age 3: Civilization → Age 4: Intrigue** (4 turns per age = 16 turns per realm):

| Metric | Result |
| :--- | :--- |
| Complete 4-Stage Campaigns | **150 / 150** (100%) |
| Total Turns Simulated | **2,400** |
| Lossless JSON Round-Trips Verified | **30 / 30** (100%) |
| Invariant Failures | **0** |
| Avg End-of-Intrigue World Features | **1.8** Mountains · **2.4** Forests · **0.8** Rivers · **7.5** Settlements · **12.1** Named Landmarks · **6.8** Codex Entities |
| Card Flexibility & Map Session Stress | **50 / 50** passed (min `21` examples/draw, min `12` presets/draw) |

---

## 3. Complete Showcase Simulated Worlds (Inspectable End-to-End Outputs)

Below are **3 full simulated worlds** generated headlessly from Pre-Genesis through the end of Age 4: Intrigue, including their **ASCII Cartographic Map**, **Full 4-Age Chronicle**, and **Deterministic 2-Page World Overview**.

### Showcase World #1: Valdoria (Continent)
- **Seed:** `sim-report-continent-0` | **Preset:** `continent` | **Final Stage:** `intrigue` | **Turns:** `16` | **Codex Entities:** `8`

#### ASCII Cartographic Map (`~` Ocean · `.` Plains · `^` Hills · `▲` Mountain · `♣` Forest · `≈` River · `★` Settlement · `♦` Wonder/Site)
```text
     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
   +-----------------------------------------
00 | ~ ~ ~ ~ ~ . . ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
01 | ~ ~ ~ ~ ~ . ★ . . ~ ~ ~ ~ ~ ~ ~ . . ~ ~
02 | ~ ~ ~ . . . . . . ★ . . . . . . . . ~ ~
03 | ~ ~ ~ . . ★ . . ▲ . . . ★ . . . . . ~ ~
04 | ~ ~ ~ . . . . . . . ♦ . . . . . . ~ ~ ~
05 | ~ ~ . . . . . . . . ♦ ♣ . . ♣ . . ~ ~ ~
06 | ~ ~ ~ ~ . . . . ★ . . . . . . . . . . ~
07 | ~ ~ ~ . . . . . . ★ . ♦ . . . . . ~ ~ ~
08 | ~ ~ ~ ♦ . . . ★ . . . . . . . . ~ ~ ~ ~
09 | ~ ~ ~ . . . . . . . . . . . ≈ . . ~ ~ ~
10 | ~ ~ ~ ~ ~ ~ . ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
11 | ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
```

#### Full 4-Age Chronicle
| Turn | Age | Card | Action / Event | Tiles | Narrative |
| :---: | :--- | :---: | :--- | :--- | :--- |
| #1 | genesis | `3♥` | Coastal Estuary Bay (Estuary Bay) | `14,9` | [Player 1 · Geomancer] [Silverwash Basin at coordinates (14,9)] The coastal estuary bay was etched onto the primordial canvas, casting long  |
| #2 | genesis | `K♣` | Ironwood Briar Thicket (Ironwood Briar Thicket) | `11,5` | [Player 1 · Geomancer] [Emerald Redwoods at coordinates (11,5)] The ironwood briar thicket was etched onto the primordial canvas, casting lo |
| #3 | genesis | `9♥` | Braided River Delta (River Delta) | `19,7` | [Player 1 · Geomancer] [Silverwash Reach at coordinates (19,7)] The braided river delta was etched onto the primordial canvas, casting long  |
| #4 | genesis | `4♦` | Ocean Surface Currents (Surface Currents) | `18,7` | [Player 1 · Geomancer] [Whispering Massif at coordinates (18,7)] The ocean surface currents was etched onto the primordial canvas, casting l |
| #5 | primal | `Joker` | Nomadic Felt Yurt Camp | `9,7` | [Player 1 · Geomancer] [OakWatch at coordinates (9,7)] A sprawling ring of bleached felt tents was raised on the high steppe, horses tethere |
| #6 | primal | `K♥` | Solstice & Harvest Festival | `10,4` | [Player 1 · Geomancer] [Seasonal Solstice Fellowship at coordinates (10,4)] Clans from across the hills set aside ancient feuds to dance ben |
| #7 | primal | `9♣` | Bog & Magnetite Iron Lodes | `11,7` | [Player 1 · Geomancer] [Bog & Magnetite Iron Lodes at coordinates (11,7)] Smelters coaxed spongy blooms of raw iron from charcoal furnaces,  |
| #8 | primal | `A♣` | Falling Star & Crater Omen | `8,3` | [Player 1 · Geomancer] [Great Deluge] A generational flood inundates (8,3), turning ancient hunting grounds into sunken marshlands and forci |
| #9 | civilization | `2♣` | High Mountain Pass Colony | `9,2` | [Player 1 · Geomancer] [OakHearth at coordinates (9,2)] Settlers claimed the snowbound saddle, turning a treacherous trail into a fortified  |
| #10 | civilization | `J♦` | Cross-Border Trade Charter | `18,7` | [Player 1 · Geomancer] [Cross-Border Trade Charter at coordinates (18,7)] Word spread across the realm of Cross-Border Trade Charter, leavin |
| #11 | civilization | `7♦` | Treaty of the Neutral Sanctuary | `10,4` | [Player 1 · Geomancer] [Treaty of the Neutral Sanctuary at coordinates (10,4)] All warring banners agreed to lay down arms within the White  |
| #12 | civilization | `J♠` | Sky-Citadel & Grand Colossus | `10,5` | [Player 1 · Geomancer] [Iron Fortress at coordinates (10,5)] Suspended among the clouds on anti-gravitic lodestones, the city hovered silent |
| #13 | intrigue | `K♣` | Midnight Royal Assassination | `10,4` | [Player 1 · Geomancer] [Midnight Royal Assassination at coordinates (10,4)] The bell tolled twenty-four times in the dead of night: the old  |
| #14 | intrigue | `7♦` | Sunken Temple Rising From the Sea | `3,8` | [Player 1 · Geomancer] [Sunken Temple Rising From the Sea at coordinates (3,8)] After a night of strange tides, ancient marble steps broke t |
| #15 | intrigue | `3♦` | Arch-Lich Undead Necropolis | `11,7` | [Player 1 · Geomancer] [Arch-Lich Undead Necropolis at coordinates (11,7)] Ghostly green fire flared upon the black towers of the necropolis |
| #16 | intrigue | `A♠` | Unnatural Eclipse & Public Panic | `12,3` | [Player 1 · Geomancer] [Ominous Cataclysm] The Ashen Comet blazes across the sky above (12,3), triggering upheaval and prophetic unrest acro |

<details>
<summary><strong>View Full Synthesized 2-Page World Overview (Valdoria (Continent))</strong></summary>

# 📄 Valdoria (Continent) — 2-Page World Overview
**Seed**: `sim-report-continent-0` · **Current Era**: 4. Intrigue · **Turns**: 16 · **Climate**: 🕊️ Golden Age

## Page 1: Physical Atlas & Iconic Landmarks
> Valdoria (Continent) is a continent realm (52% landmass, 48% seas) dominated by grasslands & meadows (98%) and fen & marshland (1%), with key geographic anchors at Thalassian Capital (12,3), Verdant Lair (11,7), Whispering Massif (18,7). Across 16 recorded turns reaching Age 4: Intrigue, 3 species, 3 societies, and 2 mythic forces have risen—anchored by ⛵ Thalassian League, 👑 Solaris Hegemony, 🔮 Conclave of the Silver Spire. Current geopolitical climate: Golden Age — Flourishing treaties, peace pacts, and thriving settlements unite the lands.

**Cartographic Profile**: 52% Land (124 tiles) / 48% Water (116 tiles) · 🏔️ 1 Peaks · 🌲 3 Forests · 🌊 2 Rivers · 🏘️ 8 Settlements · 🏛️ 7 Landmarks

### Top Named Regions & Landmarks Gazetteer
- **🌟 Thalassian Capital** `(12,3)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Ominous Cataclysm] The Ashen Comet blazes across the sky above (12,3), triggerin…
- **🏛️ Verdant Lair** `(11,7)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Bog & Magnetite Iron Lodes at coordinates (11,7)] Smelters coaxed spongy blooms…
- **🌊➡️ Whispering Massif** `(18,7)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [Whispering Massif at coordinates (18,7)] The ocean surface currents was etched o…
- **🏔️ OakHearth** `(9,2)` [Grasslands & Meadows]: [Player 1 · Geomancer] [OakHearth at coordinates (9,2)] Settlers claimed the snowbound saddle, turning a…
- **🗡️👑 Midnight Royal Assassination** `(10,4)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Seasonal Solstice Fellowship at coordinates (10,4)] Clans from across the hills…
- **✨🏛️ Iron Fortress** `(10,5)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Iron Fortress at coordinates (10,5)] Suspended among the clouds on anti-gravitic…
- **⛺ OakWatch** `(9,7)` [Grasslands & Meadows]: [Player 1 · Geomancer] [OakWatch at coordinates (9,7)] A sprawling ring of bleached felt tents was raise…
- **🏛️ Frostpeak Lair** `(3,8)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Sunken Temple Rising From the Sea at coordinates (3,8)] After a night of strange…

---

## Page 2: Peoples, Powers & The Four Ages Digest
### Major Species, Societies & Mythic Forces
- **⛵ Thalassian League** (society · Expanding @ `(12,3)`) — *Free Harbor Charter · Cartographers Guild · Gold Standard Coinage*: A confederation of free port cities ruled by elected admirals and trade syndicates.
- **👑 Solaris Hegemony** (society · Expanding @ `(8,6)`) — *Imperial Highway Network · Codified Law · Tribute Provinces*: A centralized empire famed for stone highways, disciplined legions, and monumental aqueducts.
- **🔮 Conclave of the Silver Spire** (society · Expanding @ `(7,8)`) — *Great Library · Ley-Line Observatories · Arcane Apprenticeships*: A realm governed by arch-scholars and astronomers from floating and terraced citadels.
- **🛡️ Dawnwatch Humans** (species · Flourishing @ `(6,1)`) — *Seasonal Solstice Fellowship · Bog Iron Extraction*: Prominent species of Valdoria (Continent).
- **🏛️ The Sunken Star-Citadel (Frostpeak)** (myth · Active @ `(3,8)`) — *Precursor Glyphs · Abyssal Guardians · Tidal Anomaly*: A pre-history spire submerged beneath the waves whose bells still toll before great storms.
- **🏛️ The Sunken Star-Citadel (Verdant)** (myth · Active @ `(11,7)`) — *Precursor Glyphs · Abyssal Guardians · Tidal Anomaly*: A pre-history spire submerged beneath the waves whose bells still toll before great storms.
- **⛏️ Ironpeak Delvers** (species · Flourishing @ `(9,2)`) — *species*: Prominent species of Valdoria (Continent).
- **🧝 Sylvan Star-Elves** (species · Flourishing @ `(5,3)`) — *species*: Prominent species of Valdoria (Continent).

### Active Diplomatic Web & Fault Lines
- **⛵ Thalassian League** ↔ **👑 Solaris Hegemony** [Cross-Border Trade Charter]: Thalassian League and Solaris Hegemony maintain a Cross-Border Trade Charter relation.

### Condensed Four Ages Chronicle
#### Age 1: Genesis (4 turns · Age of steady creation and expansion)
- **Turn #1 — Coastal Estuary Bay (Estuary Bay)** `(14,9)`: [Player 1 · Geomancer] [Silverwash Basin at coordinates (14,9)] The coastal estuary bay was etched onto the p…
- **Turn #2 — Ironwood Briar Thicket (Ironwood Briar Thicket)** `(11,5)`: [Player 1 · Geomancer] [Emerald Redwoods at coordinates (11,5)] The ironwood briar thicket was etched onto th…
- **Turn #3 — Braided River Delta (River Delta)** `(19,7)`: [Player 1 · Geomancer] [Silverwash Reach at coordinates (19,7)] The braided river delta was etched onto the p…
#### Age 2: Primal (4 turns · Marked by 1 major upheaval)
- **Turn #5 — Nomadic Felt Yurt Camp** `(9,7)`: [Player 1 · Geomancer] [OakWatch at coordinates (9,7)] A sprawling ring of bleached felt tents was raised on…
- **Turn #6 — Solstice & Harvest Festival** `(10,4)`: [Player 1 · Geomancer] [Seasonal Solstice Fellowship at coordinates (10,4)] Clans from across the hills set a…
- **Turn #8 — Falling Star & Crater Omen** `(8,3)`: [Player 1 · Geomancer] [Great Deluge] A generational flood inundates (8,3), turning ancient hunting grounds i…
#### Age 3: Civilization (4 turns · Defined by 1 contested struggle)
- **Turn #10 — Cross-Border Trade Charter** `(18,7)`: [Player 1 · Geomancer] [Cross-Border Trade Charter at coordinates (18,7)] Word spread across the realm of Cro…
- **Turn #11 — Treaty of the Neutral Sanctuary** `(10,4)`: [Player 1 · Geomancer] [Treaty of the Neutral Sanctuary at coordinates (10,4)] All warring banners agreed to…
- **Turn #12 — Sky-Citadel & Grand Colossus** `(10,5)`: [Player 1 · Geomancer] [Iron Fortress at coordinates (10,5)] Suspended among the clouds on anti-gravitic lode…
#### Age 4: Intrigue (4 turns · Marked by 1 major upheaval)
- **Turn #13 — Midnight Royal Assassination** `(10,4)`: [Player 1 · Geomancer] [Midnight Royal Assassination at coordinates (10,4)] The bell tolled twenty-four times…
- **Turn #15 — Arch-Lich Undead Necropolis** `(11,7)`: [Player 1 · Geomancer] [Arch-Lich Undead Necropolis at coordinates (11,7)] Ghostly green fire flared upon the…
- **Turn #16 — Unnatural Eclipse & Public Panic** `(12,3)`: [Player 1 · Geomancer] [Ominous Cataclysm] The Ashen Comet blazes across the sky above (12,3), triggering uph…

</details>

---

### Showcase World #2: The Shattered Isles (Archipelago)
- **Seed:** `sim-report-archipelago-0` | **Preset:** `archipelago` | **Final Stage:** `intrigue` | **Turns:** `16` | **Codex Entities:** `6`

#### ASCII Cartographic Map (`~` Ocean · `.` Plains · `^` Hills · `▲` Mountain · `♣` Forest · `≈` River · `★` Settlement · `♦` Wonder/Site)
```text
     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
   +-----------------------------------------
00 | ~ ~ ~ . ~ ~ . . . ~ ~ ~ . ~ . . ~ ~ ~ ~
01 | ~ ~ ~ ~ ♣ . . . ~ ~ ~ . . ~ ~ ~ ~ ~ ~ ~
02 | ~ ~ ~ ~ ~ ~ . . ~ ~ ~ . . ~ ~ ~ . . . .
03 | ~ ~ ~ ~ ~ . ~ . ~ ~ ~ ~ ★ . . . . . . ★
04 | ~ ~ ~ . . ~ ~ ~ ~ ~ ~ . . . . . . . ~ ~
05 | ~ ~ ~ ~ ~ . ~ ~ ~ . ★ . ♦ . ~ ~ ~ ~ ~ ~
06 | ~ ~ ~ ~ ~ ~ ~ ~ ~ . . . . . ~ ~ ~ ~ ~ ~
07 | ~ ~ ~ ~ ~ ~ ~ . . . . . . . . ~ ~ ~ . .
08 | ~ ~ ~ ~ ~ ~ ~ ~ ~ . . . . ~ ~ ~ ~ ~ ~ ~
09 | ~ ~ ~ . . ~ ~ ~ . . ~ . ~ ~ ~ ~ ~ ~ ~ ~
10 | ~ ~ . . . ~ ~ ~ ~ . . . . ~ ~ ~ ~ ~ ~ ~
11 | ~ ~ . . ★ ~ ~ ~ ~ ~ . ★ . . . . ~ ~ ~ ~
```

#### Full 4-Age Chronicle
| Turn | Age | Card | Action / Event | Tiles | Narrative |
| :---: | :--- | :---: | :--- | :--- | :--- |
| #1 | genesis | `Q♥` | Geothermal Mineral Hot Spring (Mineral Hot Spring) | `18,8` | [Player 1 · Geomancer] [Silverwash Bay at coordinates (18,8)] The geothermal mineral hot spring was etched onto the primordial canvas, casti |
| #2 | genesis | `7♥` | Coastal Ice Shelf (Ice Shelf) | `1,3` | [Player 1 · Geomancer] [Silverwash Reach at coordinates (1,3)] The coastal ice shelf was etched onto the primordial canvas, casting long sha |
| #3 | genesis | `2♦` | Superheated Geyser Fountain (Geyser Fountain) | `11,3` | [Player 1 · Geomancer] [Whispering Pinnacle at coordinates (11,3)] The superheated geyser fountain was etched onto the primordial canvas, ca |
| #4 | genesis | `10♥` | Peat Moss Bog (Peat Bog) | `7,4` | [Player 1 · Geomancer] [Silverwash Rapids at coordinates (7,4)] The peat moss bog was etched onto the primordial canvas, casting long shadow |
| #5 | primal | `6♦` | Forest Herbalists & Antidote Brewers | `16,0` | [Player 1 · Geomancer] [Forest Herbalists & Antidote Brewers at coordinates (16,0)] With salves of willow bark and spider-silk stitching, th |
| #6 | primal | `8♠` | Crossroads Market Town | `4,11` | [Player 1 · Geomancer] [OakHamlet at coordinates (4,11)] Clay-brick storehouses and open-air barter plazas drew traders from three river val |
| #7 | primal | `Q♠` | Treehouse Canopy Village | `10,5` | [Player 1 · Geomancer] [OakHaven at coordinates (10,5)] High above the mossy floor, lanterns swayed between ancient oaks as the Canopy Folk  |
| #8 | primal | `8♦` | Wayfinder Navigators & Shipwrights | `12,5` | [Player 1 · Geomancer] [Wayfinder Navigators & Shipwrights at coordinates (12,5)] Guided by the rising of the Seven Sisters, their outrigger |
| #9 | civilization | `4♠` | High Feudal Castle Keep | `10,5` | [Player 1 · Geomancer] [Iron Citadel at coordinates (10,5)] Towering stone keeps rose above the cliffs, their heraldic banners snapping in t |
| #10 | civilization | `6♦` | Treaty of the Neutral Sanctuary | `11,11` | [Player 1 · Geomancer] [Treaty of the Neutral Sanctuary at coordinates (11,11)] All warring banners agreed to lay down arms within the White |
| #11 | civilization | `7♣` | Imperial Province Conquest & Tribute | `11,11` | [Player 1 · Geomancer] [OakHaven at coordinates (11,11)] The vanquished rulers laid their crowns at the feet of the victorious emperor, acce |
| #12 | civilization | `2♠` | Mountain Bastion Citadel | `7,4` | [Player 1 · Geomancer] [Iron Citadel at coordinates (7,4)] Perched upon a jagged granite fang, the citadel looked down upon three kingdoms,  |
| #13 | intrigue | `9♠` | Rogue Mercenary Company | `4,7` | [Player 1 · Geomancer] [Rogue Mercenary Company at coordinates (4,7)] The Iron Wolves marched out of the border war unpaid and seized a weal |
| #14 | intrigue | `8♠` | Popular Uprising & Civil War | `12,3` | [Player 1 · Geomancer] [Popular Uprising & Civil War at coordinates (12,3)] Word spread across the realm of Popular Uprising & Civil War, le |
| #15 | intrigue | `6♠` | Rogue Mercenary Company | `14,6` | [Player 1 · Geomancer] [Rogue Mercenary Company at coordinates (14,6)] The Iron Wolves marched out of the border war unpaid and seized a wea |
| #16 | intrigue | `Joker` | Corsair & Pirate Armada Raids | `1,3` | [Player 1 · Geomancer] [Corsair & Pirate Armada Raids at coordinates (1,3)] Black-sailed galleys swept the straits, forcing coastal cities t |

<details>
<summary><strong>View Full Synthesized 2-Page World Overview (The Shattered Isles (Archipelago))</strong></summary>

# 📄 The Shattered Isles (Archipelago) — 2-Page World Overview
**Seed**: `sim-report-archipelago-0` · **Current Era**: 4. Intrigue · **Turns**: 16 · **Climate**: 🌋 Age of Chaos

## Page 1: Physical Atlas & Iconic Landmarks
> The Shattered Isles (Archipelago) is a archipelago realm (36% landmass, 64% seas) dominated by grasslands & meadows (99%) and alpine peaks (1%), with key geographic anchors at Iron Citadel (10,5), Thalassian Capital (12,3), OakHaven (11,11). Across 16 recorded turns reaching Age 4: Intrigue, 3 species, 3 societies, and 0 mythic forces have risen—anchored by ⛵ Thalassian League, 🔮 Conclave of the Silver Spire, 👑 Solaris Hegemony. Current geopolitical climate: Age of Chaos — Cataclysms and widespread strife have unraveled the established order.

**Cartographic Profile**: 36% Land (86 tiles) / 64% Water (154 tiles) · 🏔️ 1 Peaks · 🌲 1 Forests · 🌊 3 Rivers · 🏘️ 8 Settlements · 🏛️ 10 Landmarks

### Top Named Regions & Landmarks Gazetteer
- **🌳 Iron Citadel** `(10,5)` [Alpine Peaks]: [Player 1 · Geomancer] [OakHaven at coordinates (10,5)] High above the mossy floor, lanterns swayed betw…
- **🌟 Thalassian Capital** `(12,3)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Popular Uprising & Civil War at coordinates (12,3)] Word spread across the realm…
- **⚔️👑 OakHaven** `(11,11)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Treaty of the Neutral Sanctuary at coordinates (11,11)] All warring banners agre…
- **⛰️🏰 Iron Citadel** `(7,4)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [Silverwash Rapids at coordinates (7,4)] The peat moss bog was etched onto the pr…
- **🪨 Ironpeak Cradle** `(14,6)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [Rogue Mercenary Company at coordinates (14,6)] The Iron Wolves marched out of th…
- **⚔️ Silverwash Reach** `(1,3)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [Silverwash Reach at coordinates (1,3)] The coastal ice shelf was etched onto the…
- **🏘️ OakHamlet** `(4,11)` [Grasslands & Meadows]: [Player 1 · Geomancer] [OakHamlet at coordinates (4,11)] Clay-brick storehouses and open-air barter plaz…
- **👑 Conclave Capital** `(9,1)` [Coastal Sea / Shallows]: Notable settlement in the coastal sea / shallows province at (9,1).

---

## Page 2: Peoples, Powers & The Four Ages Digest
### Major Species, Societies & Mythic Forces
- **⛵ Thalassian League** (society · Expanding @ `(12,3)`) — *Free Harbor Charter · Cartographers Guild · Gold Standard Coinage*: A confederation of free port cities ruled by elected admirals and trade syndicates.
- **🔮 Conclave of the Silver Spire** (society · Expanding @ `(9,1)`) — *Great Library · Ley-Line Observatories · Arcane Apprenticeships*: A realm governed by arch-scholars and astronomers from floating and terraced citadels.
- **👑 Solaris Hegemony** (society · Expanding @ `(19,3)`) — *Imperial Highway Network · Codified Law · Tribute Provinces*: A centralized empire famed for stone highways, disciplined legions, and monumental aqueducts.
- **🧝 Sylvan Star-Elves** (species · Flourishing @ `(6,10)`) — *Forest Herbalists & Antidote Brewers · Wayfinder Navigators & Shipwrights*: Prominent species of The Shattered Isles (Archipelago).
- **⛏️ Ironpeak Delvers** (species · Flourishing @ `(14,6)`) — *species*: Prominent species of The Shattered Isles (Archipelago).
- **🛡️ Dawnwatch Humans** (species · Flourishing @ `(11,11)`) — *species*: Prominent species of The Shattered Isles (Archipelago).

### Active Diplomatic Web & Fault Lines
- **👑 Solaris Hegemony** ↔ **⛵ Thalassian League** [War of Ironpeak Cradle]: Solaris Hegemony and Thalassian League maintain a War of Ironpeak Cradle relation.
- **🔮 Conclave of the Silver Spire** ↔ **⛵ Thalassian League** [War of Whispering]: Conclave of the Silver Spire and Thalassian League maintain a War of Whispering relation.
- **🔮 Conclave of the Silver Spire** ↔ **⛵ Thalassian League** [Treaty of the Neutral Sanctuary]: Conclave of the Silver Spire and Thalassian League maintain a Treaty of the Neutral Sanctuary…

### Condensed Four Ages Chronicle
#### Age 1: Genesis (4 turns · Age of steady creation and expansion)
- **Turn #1 — Geothermal Mineral Hot Spring (Mineral Hot Spring)** `(18,8)`: [Player 1 · Geomancer] [Silverwash Bay at coordinates (18,8)] The geothermal mineral hot spring was etched on…
- **Turn #2 — Coastal Ice Shelf (Ice Shelf)** `(1,3)`: [Player 1 · Geomancer] [Silverwash Reach at coordinates (1,3)] The coastal ice shelf was etched onto the prim…
- **Turn #3 — Superheated Geyser Fountain (Geyser Fountain)** `(11,3)`: [Player 1 · Geomancer] [Whispering Pinnacle at coordinates (11,3)] The superheated geyser fountain was etched…
#### Age 2: Primal (4 turns · Defined by 1 contested struggle)
- **Turn #5 — Forest Herbalists & Antidote Brewers** `(16,0)`: [Player 1 · Geomancer] [Forest Herbalists & Antidote Brewers at coordinates (16,0)] With salves of willow bar…
- **Turn #6 — Crossroads Market Town** `(4,11)`: [Player 1 · Geomancer] [OakHamlet at coordinates (4,11)] Clay-brick storehouses and open-air barter plazas dr…
- **Turn #7 — Treehouse Canopy Village** `(10,5)`: [Player 1 · Geomancer] [OakHaven at coordinates (10,5)] High above the mossy floor, lanterns swayed between a…
#### Age 3: Civilization (4 turns · Defined by 3 contested struggles)
- **Turn #9 — High Feudal Castle Keep** `(10,5)`: [Player 1 · Geomancer] [Iron Citadel at coordinates (10,5)] Towering stone keeps rose above the cliffs, their…
- **Turn #10 — Treaty of the Neutral Sanctuary** `(11,11)`: [Player 1 · Geomancer] [Treaty of the Neutral Sanctuary at coordinates (11,11)] All warring banners agreed to…
- **Turn #11 — Imperial Province Conquest & Tribute** `(11,11)`: [Player 1 · Geomancer] [OakHaven at coordinates (11,11)] The vanquished rulers laid their crowns at the feet…
#### Age 4: Intrigue (4 turns · Defined by 4 contested struggles)
- **Turn #13 — Rogue Mercenary Company** `(4,7)`: [Player 1 · Geomancer] [Rogue Mercenary Company at coordinates (4,7)] The Iron Wolves marched out of the bord…
- **Turn #14 — Popular Uprising & Civil War** `(12,3)`: [Player 1 · Geomancer] [Popular Uprising & Civil War at coordinates (12,3)] Word spread across the realm of P…
- **Turn #16 — Corsair & Pirate Armada Raids** `(1,3)`: [Player 1 · Geomancer] [Corsair & Pirate Armada Raids at coordinates (1,3)] Black-sailed galleys swept the st…

</details>

---

### Showcase World #3: Twin Realms of Sol & Vesper (Twin Continents)
- **Seed:** `sim-report-twin-continents-0` | **Preset:** `twin-continents` | **Final Stage:** `intrigue` | **Turns:** `16` | **Codex Entities:** `7`

#### ASCII Cartographic Map (`~` Ocean · `.` Plains · `^` Hills · `▲` Mountain · `♣` Forest · `≈` River · `★` Settlement · `♦` Wonder/Site)
```text
     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9
   +-----------------------------------------
00 | . ~ . . . . ~ ~ ~ ~ ~ ~ ~ . . ~ ~ ~ ~ ~
01 | . ~ . . ♣ . . ~ ~ ~ ~ ~ . ~ . . ~ ~ ~ ~
02 | ~ ~ ~ . ★ . . . ~ ~ ~ ~ ~ . . ~ ~ . ~ ~
03 | . . . . . . . ~ ~ ~ ~ ~ ~ ~ . ~ . . . ~
04 | . . . . . . . . ~ ~ ~ ~ . . ~ ~ ~ . . .
05 | . . . . . . . . ~ ~ ~ ~ . ~ ~ ~ ~ . . .
06 | . . . ~ ~ ♣ ♣ . ~ ~ ~ ~ . ~ ~ ~ ~ . ~ ~
07 | ~ ~ ~ ~ ~ . . . ~ ~ ~ ~ . ★ . . . . ★ .
08 | ~ ~ ~ ~ ~ ~ . . ~ ~ ~ . . . . . . . . .
09 | ~ ♦ . ~ ~ ~ . ~ ~ ~ . . ♦ . . ★ . . . ~
10 | ~ ~ . . ~ . ~ . ~ ~ ★ . ★ . . . . . . .
11 | ~ . . . ~ ~ . . ~ ~ . . . . . . . . . ~
```

#### Full 4-Age Chronicle
| Turn | Age | Card | Action / Event | Tiles | Narrative |
| :---: | :--- | :---: | :--- | :--- | :--- |
| #1 | genesis | `Joker` | Flat-Topped Mesa Bluff (Flat Mesa Bluff) | `19,7` | [Player 1 · Geomancer] [Sun Spire at coordinates (19,7)] The flat-topped mesa bluff was etched onto the primordial canvas, casting long shad |
| #2 | genesis | `8♠` | Cliffside Grotto Mouth (Cliff Grotto) | `1,9` | [Player 1 · Geomancer] [Sun Crag at coordinates (1,9)] The cliffside grotto mouth was etched onto the primordial canvas, casting long shadow |
| #3 | genesis | `9♣` | Pine & Fir Taiga (Pine & Fir Taiga) | `5,6` | [Player 1 · Geomancer] [Emerald Taiga at coordinates (5,6)] The pine & fir taiga was etched onto the primordial canvas, casting long shadows |
| #4 | genesis | `5♦` | Molten Magma Fissure (Magma Fissure) | `5,8` | [Player 1 · Geomancer] [Whispering Ridge at coordinates (5,8)] The molten magma fissure was etched onto the primordial canvas, casting long  |
| #5 | primal | `Q♥` | Oral Bards & Campfire Chronicles | `0,11` | [Player 1 · Geomancer] [Whispering Astral Communion at coordinates (0,11)] Before ink or parchment existed, the Flame-Singers carried the me |
| #6 | primal | `5♥` | Sun & Dawn Fire Faith | `14,4` | [Player 1 · Geomancer] [Solar Fire Priesthood at coordinates (14,4)] At every sunrise, priests climbed the highest peak to kindle the sacred |
| #7 | primal | `A♦` | Spreading Plague & Blight | `10,9` | [Player 1 · Geomancer] [Great Deluge] A generational flood inundates (10,9), turning ancient hunting grounds into sunken marshlands and forc |
| #8 | primal | `10♠` | Coastal Stilt Fishing Village | `15,0` | [Player 1 · Geomancer] [OakPueblo at coordinates (15,0)] Rope bridges connected a thriving network of stilt platforms standing proud above t |
| #9 | civilization | `7♣` | Maritime Trade Island Colony | `0,11` | [Player 1 · Geomancer] [OakCrossing at coordinates (0,11)] A fleet of three-masted ships dropped anchor in the turquoise bay, raising the ro |
| #10 | civilization | `8♦` | Transnational Scholarly Fellowship | `12,10` | [Player 1 · Geomancer] [Transnational Scholarly Fellowship at coordinates (12,10)] Bearing the wax seal of the Academy, natural philosophers |
| #11 | civilization | `5♥` | Merchant & Craft Guild Leagues | `1,9` | [Player 1 · Geomancer] [Merchant & Craft Guild Leagues at coordinates (1,9)] Guild stamps guaranteed the purity of silver and the temper of  |
| #12 | civilization | `6♥` | Merchant & Craft Guild Leagues | `5,8` | [Player 1 · Geomancer] [Merchant & Craft Guild Leagues at coordinates (5,8)] Guild stamps guaranteed the purity of silver and the temper of  |
| #13 | intrigue | `A♦` | Unnatural Eclipse & Public Panic | `12,10` | [Player 1 · Geomancer] [Ominous Cataclysm] The Sapphire Comet blazes across the sky above (12,10), triggering upheaval and prophetic unrest  |
| #14 | intrigue | `2♦` | Sunken Temple of the Sea-Gods | `4,2` | [Player 1 · Geomancer] [Sunken Temple of the Sea-Gods at coordinates (4,2)] At lowest ebb, dripping marble pillars and cyclopean temples aro |
| #15 | intrigue | `Joker` | Privateer Naval Blockade | `12,9` | [Player 1 · Geomancer] [Privateer Naval Blockade at coordinates (12,9)] Corsair galleons formed a deadly cordon across the harbor narrows, b |
| #16 | intrigue | `6♣` | Palace Guard Military Coup | `13,7` | [Player 1 · Geomancer] [Palace Guard Military Coup at coordinates (13,7)] Halberds gleaming in the torchlight, the elite guard encircled the |

<details>
<summary><strong>View Full Synthesized 2-Page World Overview (Twin Realms of Sol & Vesper (Twin Continents))</strong></summary>

# 📄 Twin Realms of Sol & Vesper (Twin Continents) — 2-Page World Overview
**Seed**: `sim-report-twin-continents-0` · **Current Era**: 4. Intrigue · **Turns**: 16 · **Climate**: 🛡️ Pax & Stability

## Page 1: Physical Atlas & Iconic Landmarks
> Twin Realms of Sol & Vesper (Twin Continents) is a twin-continents realm (54% landmass, 46% seas) dominated by grasslands & meadows (96%) and alpine peaks (2%), with key geographic anchors at Ironpeak Cradle (12,10), OakCrossing (0,11), Conclave Capital (13,7). Across 16 recorded turns reaching Age 4: Intrigue, 3 species, 3 societies, and 1 mythic forces have risen—anchored by 🔮 Conclave of the Silver Spire, ⛵ Thalassian League, 👑 Solaris Hegemony. Current geopolitical climate: Pax & Stability — Order and civil progress prevail across the established realms.

**Cartographic Profile**: 54% Land (130 tiles) / 46% Water (110 tiles) · 🏔️ 3 Peaks · 🌲 3 Forests · 🌊 0 Rivers · 🏘️ 8 Settlements · 🏛️ 9 Landmarks

### Top Named Regions & Landmarks Gazetteer
- **☄️ Ironpeak Cradle** `(12,10)` [Alpine Peaks]: [Player 1 · Geomancer] [Transnational Scholarly Fellowship at coordinates (12,10)] Bearing the wax seal…
- **🏝️⚓ OakCrossing** `(0,11)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [Whispering Astral Communion at coordinates (0,11)] Before ink or parchment exist…
- **👑 Conclave Capital** `(13,7)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Palace Guard Military Coup at coordinates (13,7)] Halberds gleaming in the torch…
- **🏛️ Dawnwatch Cradle** `(4,2)` [Grasslands & Meadows]: [Player 1 · Geomancer] [Sunken Temple of the Sea-Gods at coordinates (4,2)] At lowest ebb, dripping marb…
- **🪙⚒️ Whispering Ridge** `(5,8)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [Whispering Ridge at coordinates (5,8)] The molten magma fissure was etched onto…
- **🪙⚒️ Sun Crag** `(1,9)` [Alpine Peaks]: [Player 1 · Geomancer] [Sun Crag at coordinates (1,9)] The cliffside grotto mouth was etched onto the pr…
- **🛶🛖 OakPueblo** `(15,0)` [Coastal Sea / Shallows]: [Player 1 · Geomancer] [OakPueblo at coordinates (15,0)] Rope bridges connected a thriving network of st…
- **🏔️ Solaris Capital** `(18,7)` [Grasslands & Meadows]: Notable settlement in the grasslands & meadows province at (18,7).

---

## Page 2: Peoples, Powers & The Four Ages Digest
### Major Species, Societies & Mythic Forces
- **🔮 Conclave of the Silver Spire** (society · Expanding @ `(13,7)`) — *Great Library · Ley-Line Observatories · Arcane Apprenticeships*: A realm governed by arch-scholars and astronomers from floating and terraced citadels.
- **⛵ Thalassian League** (society · Expanding @ `(15,9)`) — *Free Harbor Charter · Cartographers Guild · Gold Standard Coinage*: A confederation of free port cities ruled by elected admirals and trade syndicates.
- **👑 Solaris Hegemony** (society · Expanding @ `(18,7)`) — *Imperial Highway Network · Codified Law · Tribute Provinces*: A centralized empire famed for stone highways, disciplined legions, and monumental aqueducts.
- **🏛️ The Sunken Star-Citadel (Frostpeak)** (myth · Active @ `(4,2)`) — *Precursor Glyphs · Abyssal Guardians · Tidal Anomaly*: A pre-history spire submerged beneath the waves whose bells still toll before great storms.
- **⛏️ Ironpeak Delvers** (species · Flourishing @ `(12,10)`) — *Whispering Astral Communion*: Prominent species of Twin Realms of Sol & Vesper (Twin Continents).
- **🛡️ Dawnwatch Humans** (species · Flourishing @ `(4,2)`) — *Solar Fire Priesthood*: Prominent species of Twin Realms of Sol & Vesper (Twin Continents).
- **🧝 Sylvan Star-Elves** (species · Flourishing @ `(10,10)`) — *species*: Prominent species of Twin Realms of Sol & Vesper (Twin Continents).

### Active Diplomatic Web & Fault Lines
- **🔮 Conclave of the Silver Spire** ↔ **⛵ Thalassian League** [War of Amber]: Conclave of the Silver Spire and Thalassian League maintain a War of Amber relation.
- **🔮 Conclave of the Silver Spire** ↔ **⛵ Thalassian League** [Transnational Scholarly Fellowship]: Conclave of the Silver Spire and Thalassian League maintain a Transnational Scholarly Fellowsh…

### Condensed Four Ages Chronicle
#### Age 1: Genesis (4 turns · Age of steady creation and expansion)
- **Turn #1 — Flat-Topped Mesa Bluff (Flat Mesa Bluff)** `(19,7)`: [Player 1 · Geomancer] [Sun Spire at coordinates (19,7)] The flat-topped mesa bluff was etched onto the primo…
- **Turn #2 — Cliffside Grotto Mouth (Cliff Grotto)** `(1,9)`: [Player 1 · Geomancer] [Sun Crag at coordinates (1,9)] The cliffside grotto mouth was etched onto the primord…
- **Turn #3 — Pine & Fir Taiga (Pine & Fir Taiga)** `(5,6)`: [Player 1 · Geomancer] [Emerald Taiga at coordinates (5,6)] The pine & fir taiga was etched onto the primordi…
#### Age 2: Primal (4 turns · Marked by 1 major upheaval)
- **Turn #5 — Oral Bards & Campfire Chronicles** `(0,11)`: [Player 1 · Geomancer] [Whispering Astral Communion at coordinates (0,11)] Before ink or parchment existed, t…
- **Turn #6 — Sun & Dawn Fire Faith** `(14,4)`: [Player 1 · Geomancer] [Solar Fire Priesthood at coordinates (14,4)] At every sunrise, priests climbed the hi…
- **Turn #7 — Spreading Plague & Blight** `(10,9)`: [Player 1 · Geomancer] [Great Deluge] A generational flood inundates (10,9), turning ancient hunting grounds…
#### Age 3: Civilization (4 turns · Defined by 1 contested struggle)
- **Turn #9 — Maritime Trade Island Colony** `(0,11)`: [Player 1 · Geomancer] [OakCrossing at coordinates (0,11)] A fleet of three-masted ships dropped anchor in th…
- **Turn #10 — Transnational Scholarly Fellowship** `(12,10)`: [Player 1 · Geomancer] [Transnational Scholarly Fellowship at coordinates (12,10)] Bearing the wax seal of th…
- **Turn #11 — Merchant & Craft Guild Leagues** `(1,9)`: [Player 1 · Geomancer] [Merchant & Craft Guild Leagues at coordinates (1,9)] Guild stamps guaranteed the puri…
#### Age 4: Intrigue (4 turns · Marked by 1 major upheaval)
- **Turn #13 — Unnatural Eclipse & Public Panic** `(12,10)`: [Player 1 · Geomancer] [Ominous Cataclysm] The Sapphire Comet blazes across the sky above (12,10), triggering…
- **Turn #14 — Sunken Temple of the Sea-Gods** `(4,2)`: [Player 1 · Geomancer] [Sunken Temple of the Sea-Gods at coordinates (4,2)] At lowest ebb, dripping marble pi…
- **Turn #15 — Privateer Naval Blockade** `(12,9)`: [Player 1 · Geomancer] [Privateer Naval Blockade at coordinates (12,9)] Corsair galleons formed a deadly cord…

</details>

---
