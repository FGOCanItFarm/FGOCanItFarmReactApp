# FGO Can It Farm — React App

Farming simulator for Fate/Grand Order. Players assemble a 6-servant team, pick a free quest, enter a command string, and run a client-side simulation to see whether the team can full-clear every wave. Successful runs can be shared to a community database.

## Architecture

```
Browser
  └─ React SPA (Create React App)
       ├─ Simulation engine (pure JS, runs in browser — no server round-trip)
       └─ Supabase JS client (anon key, reads servants / quests / runs)

Cloudflare Pages
  ├─ Serves the built React app (build/)
  ├─ functions/api/servants/[id].js  ← Pages Function, proxies Atlas Academy
  └─ functions/api/sync.js           ← Pages Function, on-demand data sync
       GET  /api/sync → status (last_updated, jp_hash)
       POST /api/sync → trigger incremental sync (cooldown + hash-gated)
       Reads SUPABASE_SERVICE_ROLE_KEY from Pages env (server-side only)

shared/atlasSync.js  ← Atlas Academy → Supabase pipeline (single source of truth)
  Used by functions/api/sync.js, worker/src/index.js, and worker/seed.js

Supabase (Postgres + REST + RPC)
  ├─ servants       — game data synced from Atlas Academy
  ├─ quests         — 90++/90+++/90★ free quests with enemy stage data
  ├─ mystic_codes   — MC skill data
  ├─ saved_runs     — community-submitted clear runs
  └─ metadata       — key/value (aa_version JP hash, last_updated)

worker/ (standalone Cloudflare Worker — OPTIONAL, for scheduled cron only)
  └─ Cron job that calls runUpdate from shared/atlasSync.js
     The React app does NOT require this — sync runs as a Pages Function.
```

## Tech Stack

- **React 18** + Create React App (`react-scripts 5`)
- **MUI v5** (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`)
- **React Router v6** — `HashRouter` (required for Cloudflare Pages SPA routing)
- **Supabase JS v2** (`@supabase/supabase-js`)
- **react-beautiful-dnd** — drag-and-drop team slots
- **axios** — used only in `CommonServantsGrid.js` for the Atlas Academy proxy

## File Structure

```
fgocanitfarmreactapp/
├─ public/                      Static assets served as-is
│   ├─ class-icons/             Class icon PNGs (saber.png, archer.png, …)
│   │                           Fallback in FilterSection.js if missing
│   ├─ AoE.webp / SingleTarget.webp / Support.webp
│   └─ index.html
├─ src/
│   ├─ App.js                   Root component; all global state lives here
│   ├─ supabaseClient.js        Supabase client init (anon key)
│   ├─ ui-vars.css              CSS custom property palette — ALWAYS use these
│   ├─ index.js                 MUI ThemeProvider + dark theme definition
│   │
│   ├─ simulation/              Client-side simulation engine — do not modify
│   │   ├─ Driver.js            Entry point: parses command string, runs turns
│   │   ├─ BattleEngine.js      Turn loop, NP gauge tracking, wave transitions
│   │   ├─ Servant.js           Servant stats, skills, NP setup
│   │   ├─ NP.js                NP damage calculation
│   │   ├─ Skills.js            Skill effect application
│   │   ├─ Buffs.js             Buff/debuff stack management
│   │   ├─ Enemy.js             Enemy HP / class / attribute
│   │   ├─ Quest.js             Quest/wave/enemy setup
│   │   ├─ MysticCode.js        MC skill parsing
│   │   ├─ Stats.js             Base stat tables
│   │   ├─ gameData.js          Static game constants (class multipliers, …)
│   │   └─ RunAdapter.js        Bridge: fetches Supabase data → runs Driver
│   │                           → returns structured results for the UI
│   │
│   └─ components/
│       ├─ Sidebar.js           Left nav (192 px wide, fixed)
│       ├─ TeamSelectionPage.js Servant grid + filter panel + team slots
│       ├─ FilterSection.js     Class / rarity / NP type / attack type filters
│       ├─ ServantSelection.js  Scrollable servant card list
│       ├─ ServantAvatar.js     40×40 face icon with NP-card colour background
│       ├─ CommonServantsGrid.js Quick-picker for 5 popular support servants
│       │                        Fetches via /api/servants/:id → Atlas Academy
│       ├─ SelectedServantDetails.js NP level / append / grail sliders
│       ├─ StickyTeamBar.js     Bottom-fixed 6-slot team bar + servant detail panel
│       ├─ TeamSection.js       Drag-and-drop reorder within StickyTeamBar
│       ├─ QuestSelectionPage.js Thin wrapper around QuestSelection
│       ├─ QuestSelection.js    Quest search + wave enemy preview
│       ├─ MysticCodeSelection.js MC picker
│       ├─ SimpleMysticCodeSelection.js Compact MC picker used in CommandInputPage
│       ├─ MysticCodeCommand.js  MC skill command buttons
│       ├─ CommandInputPage.js  Main simulation page:
│       │                        readiness chips, textarea, Run button,
│       │                        SimulationStats, Submit-to-Community panel
│       ├─ CommandInputMenu.js  Token palette / command builder UI
│       ├─ SourceTargetCommandInput.js Skill-target picker
│       ├─ SimulationStats.js   Collapsible wave result cards (colour-coded)
│       ├─ SearchPage.js        Community runs browser:
│       │                        quest picker → saved_runs query → RunCards
│       ├─ DataUpdateButton.js  Any user can trigger GET/POST /api/sync;
│       │                        shows last-updated age + cooldown notices
│       ├─ Instructions.js      Landing / help page
│       ├─ ResultsTable.js      Simple results table (legacy)
│       └─ SummaryCard.js       Single-stat summary chip
│
├─ shared/
│   └─ atlasSync.js             Atlas Academy → Supabase sync pipeline
│                               Single source of truth; imported by
│                               functions/api/sync.js, worker/, and seed.js
│                               Bulk hash-diffs servants/MCs before fetching
│                               full data — O(1) Supabase reads per sync
│
├─ functions/                   Cloudflare Pages Functions (edge, server-side)
│   └─ api/
│       ├─ servants/[id].js     Proxies GET /api/servants/:id → Atlas Academy
│       │                       Needed by CommonServantsGrid quick-picker
│       └─ sync.js              GET  → sync status (last_updated, jp_hash)
│                               POST → trigger incremental sync
│                               Requires SUPABASE_SERVICE_ROLE_KEY Pages env var
│
└─ worker/                      Standalone Cloudflare Worker (OPTIONAL — cron only)
    ├─ src/index.js             Thin handler; imports pipeline from shared/
    │                           Cron (daily) + POST /run for manual trigger
    ├─ seed.js                  One-time local bulk load (no request limits)
    │                           Run with: cd worker && npm run seed
    └─ wrangler.toml            Worker config; cron = "0 0 * * *"
```

## Global State (App.js)

All state is owned by `App.js` and passed down as props. There is no Redux / context.

| State | Type | Purpose |
|---|---|---|
| `team` | `[{collectionNo, ...effects}]` × 6 | Current 6-slot team |
| `servants` | `Servant[]` | Full roster from Supabase |
| `filteredServants` | `Servant[]` | After filter/search |
| `commands` | `string[]` | Token array (e.g. `['1','4','2','5']`) |
| `selectedQuest` | `Quest\|null` | Has `._fullData` after selection |
| `selectedMysticCode` | `MC\|null` | |
| `servantEffects` | `Effect[]` × 6 | NP level, append5, grail, CE, etc. |
| `simulationResult` | `Result\|null` | Output of `RunAdapter.runSimulation()` |
| `simulating` | `boolean` | True while simulation is running |

Persisted to `localStorage`: `team`, `commands`, `selectedQuest`, `selectedMysticCode`, `servantEffects`.

## Simulation Flow

```
User clicks Run
  → App.handleSubmit()
  → RunAdapter.runSimulation({ team, commands, selectedQuest, selectedMysticCode, servantEffects })
      1. Validate selectedQuest._fullData exists
      2. Fetch servant raw data from Supabase: .from('servants').select('collection_no, data').in(...)
      3. Fetch mystic code from Supabase: .from('mystic_codes').select('data').eq('id', ...)
      4. Normalise servantEffects (append_5 → append5, np/npLevel alias)
      5. new Driver(servantDataList, mcData, questData)
      6. driver.run(commands.join(' '))
      7. Read engine.waveStats → compute damage_at_09/10/11, outcome, clear_probability
      8. Read engine.servantsAtWaveEnd → normalise npGauge → np_gauge
      9. Return { success, quest_cleared, wave_reached, total_waves,
                  servants_at_wave_end, stats: { waves, overall_clear_probability } }
  → App sets simulationResult
  → CommandInputPage renders SimulationStats
```

### engine.waveStats shape
```js
{ 'wave1': { hpRequired: number, damageDealt: number }, … }
```

### RunAdapter return shape
```js
{
  success: boolean,
  quest_cleared: boolean,
  wave_reached: number,
  total_waves: number,
  servants_at_wave_end: { 'wave1': [{ slot, collectionNo, np_gauge }], … },
  stats: {
    overall_clear_probability: number,   // 0–1
    waves: {
      'wave1': {
        hp_required: number,
        damage_at_09: number,
        damage_at_10: number,
        damage_at_11: number,
        outcome: 'guaranteed' | 'rng' | 'impossible',
        clear_probability: number,
        min_multiplier_needed: number | null,
        per_enemy: [                          // FR-8 granular stats
          { index: number, name: string, max_hp: number,
            damage_taken: number, np_refund: number },
        ],
      },
    },
  },
}
```

## Supabase Tables

### `servants`
| Column | Type | Notes |
|---|---|---|
| `collection_no` | int PK | Atlas Academy collection number |
| `name` | text | |
| `class_name` | text | lowercase (saber, archer, …) |
| `rarity` | int | |
| `np_card` | text | buster / arts / quick / null if variable |
| `np_card_variable` | bool | |
| `np_card_options` | text[] | When variable |
| `attack_type` | text | attackEnemyOne / attackEnemyAll / support |
| `is_enemy_only` | bool | |
| `face_url` | text | CDN URL for servant face icon |
| `form_transition` | text | null / 'irreversible' / 'reversible' — transform servants (FR-5) |
| `parser_flags` | jsonb | mash_ortinax, has_transform_servant, melusine_form_skill, … |
| `data` | jsonb | **Trimmed** nice servant object — see "Data Blob Trimming" |
| `aa_data_hash` | text | Bulk hash-diffed to skip unchanged servants on sync |
| `updated_at` | timestamptz | |

### `quests`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | Atlas Academy quest ID |
| `name` | text | |
| `war_id` | int | |
| `war_name` | text | |
| `recommend_lv` | text | '90++', '90+++', '90★', '90★★', '90★★★' |
| `consume` | int | AP cost (always 40 for qualifying quests) |
| `after_clear` | text | 'repeatLast' for repeatable farming nodes |
| `opened_at` | timestamptz | |
| `enemy_classes` | text[] | Distinct enemy classes across waves (quest-browser filters) |
| `enemy_attributes` | text[] | Distinct enemy attributes |
| `enemy_traits` | text[] | Distinct enemy trait names |
| `wave_count` | int | Number of waves |
| `wave_hps` | int[] | Total HP per wave |
| `data` | jsonb | **Trimmed** nice quest object (~45× smaller) — see "Data Blob Trimming" |
| `updated_at` | timestamptz | |

> A quest id can have several enemy-spawn **variations** (`data.availableEnemyHashes`);
> the stored blob is one of them (`data.enemyHash`). Fixtures/tests must note which.

### `mystic_codes`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `name` | text | |
| `data` | jsonb | Full Atlas Academy MC object |

### `saved_runs`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `quest_id` | int | FK → quests |
| `servant_collection_nos` | int[] | |
| `np_levels` | int[] | Parallel to servant array |
| `total_np_cost` | int | Number of NP tokens fired |
| `token_string` | text | Raw command string |
| `wave_results` | jsonb | Per-wave stats at time of submission |
| `submitted_at` | timestamptz | |

### `metadata`
| Column | Notes |
|---|---|
| `key` | 'aa_version' |
| `value` | `{ jp_hash, updated_at }` |

### Supabase RLS
All four read-tables need an anon SELECT policy for the app to work:
```sql
CREATE POLICY "anon_select" ON servants     FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select" ON quests       FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select" ON metadata     FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select" ON mystic_codes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select" ON saved_runs   FOR SELECT TO anon USING (true);
```
`submit_run` is an RPC function; its own security definer controls write access.

## Supabase Access (Claude Code sessions)

Claude Code on the web has a **Supabase MCP server connector** configured for the
FGO-can-it-farm project — read access to the live DB (inspect schema, run SELECT
queries) with no credentials checked into the repo. Use it for schema/data
lookups. Caveat: MCP results flow into the model's context, so don't pull large
`data` blobs (servants/quests) through it — `curl` PostgREST to a file, or rely
on the trimmed rows.

## Data Blob Trimming (sync pipeline)

`shared/atlasSync.js` trims each `data` blob before upsert so the engine gets
exactly what it needs and rows stay small/copyable. **Trimming is a whitelist of
what the engine reads — never drop a field the simulation consumes (silent damage
corruption).** Re-seed semantics differ: **quests** are re-upserted every sync
(`retrieveQuests` has no hash-skip) so they re-trim on the next sync;
**servants/MCs** are hash-skipped, so a servant-trim change needs a full
`npm run seed` (or hash bust) to apply to existing rows.

> **Immediate next step — re-seed servants:** the current servant trim (max-level
> skills, NPs whole, `ascensionAdd`/`svtChange` kept, `extraAssets`→faces) is
> committed but applies only to new upserts. **Truncate the `servants` table, then
> run `cd worker && npm run seed`** — it re-fetches every servant from Atlas
> Academy and applies the new trim on upsert.

### Servants — `stripServantData`
- **Drops** (flavour/material/growth): profile, ascensionMaterials, skillMaterials,
  appendSkillMaterials, costumeMaterials, coin, charaScripts, extraPassive,
  valentineEquip/Script, bondEquip(s)/bondEquipOwner/bondGifts/bondGrowth,
  expGrowth, expFeed, growthCurve, limits.
- **`extraAssets` → `{ faces }` only** (face thumbnails; full art dropped).
  `face_url` is also extracted into its own column.
- **Keeps `ascensionAdd` + `svtChange`** — required by FR-5 (ascension-dependent
  attribute/skill effects; e.g. Mash reads as 4★ Shielder, Melusine 312).
- **Skills collapsed to max level**: each active skill's `coolDown`, function
  `svals`, and buff `svals` are reduced to the single entry the engine selects
  (`Skills.safeSval` / coolDown picker read index 9, else last — `Skills.js:12-24`).
  All skill *variants* and functions are kept; only per-level arrays shrink.
- **NoblePhantasms kept WHOLE** — NP damage indexes `svals`/`svals2..svals5` by NP
  level and reads NP-buff `svals[9]`, so the full 5 NP-level × 5 OC grid must
  survive. classPassive/appendPassive untouched (passives read `svals[0]`).

### Quests — `stripQuestData`
Keeps only `individuality[].id` + per-enemy `{name, hp, deathRate, state,
svt.{className, attribute, traits[].id}}` (+ `enemyHash`/`availableEnemyHashes`).
~45× smaller. Runs after `extractEnemyMeta` (which reads full stages for the
`enemy_*`/`wave_*` columns), so trimming is safe.

> **90** class-vulnerability — `classAdvantageMod` (PARTIALLY WIRED):** the
> engine reads an optional per-enemy `classAdvantageMod` map
> (`{ attackerClassName: multiplier }`) that **overrides** the normal
> class-advantage multiplier — e.g. `{ saber: 5 }` makes Saber attackers deal 5×
> instead of 2× (the "Anti-Saber Defense Vulnerability" 90** gimmick).
> `Quest.js` → `Enemy.classAdvantageMod`, applied in
> `BattleEngine._classMultiplier` (used by both NP-damage paths). **Pending:**
> `stripQuestData` does NOT yet extract this from the Atlas enemy vulnerability
> buff (enemy `skills`/buffs are trimmed away), so it only fires where a row
> carries the field. The fixture `real/quests/94100501.json` is hand-annotated
> (Great Dragon, Vritra → `{saber:5}`) to exercise the engine; production needs
> the trim to parse the buff (blocked on the raw Atlas buff shape).

### Field read-map traps (verified against `src/simulation/*`)
- Engine-read servant fields: `collectionNo, name, className, classId, gender,
  attribute, rarity, traits[].id, atkGrowth, skills, noblePhantasms, classPassive`.
- `atkGrowth` is indexed at a **rarity-dependent** level (1→54, 2→59, 3→64, 4→79,
  5→89; `Stats.js`) — keep the array through index 89.
- `traits[].id` is read; `traits[].name` is not.

## Testing & Regression Fixtures

Run with `npm test` (or `CI=true npx react-scripts test --watchAll=false`).
`src/simulation/__tests__/`:
- `regression.test.js` — golden **snapshot** of wave outcomes for known token
  strings; the differential safety net for engine changes (FR-4/5/8). Update
  deliberately with `jest -u` and call out intentional changes.
- `commandState.test.js` — FR-1 introspection (legality, snapshots, humanize).
- `servantTrim.test.js` / `realQuestFixture.test.js` — guard the data trims
  (projection + `safeSval` equivalence; trimmed quest through `Quest.js`).

Fixtures:
- `__fixtures__/regressionFixtures.js` — **synthetic** blobs; always-on baseline,
  no external data.
- `__fixtures__/real/{servants,quests,mysticCodes}/<id>.json` — **real** Atlas
  blobs committed for high-fidelity tests + new-user command examples, loaded via
  `__fixtures__/realData.js` (`buildSimInputs`/`loadServant`/`loadQuest`/
  `loadMysticCode`). Owner-provided Python engine tests are being translated into
  Jest tests against these.

## Command Builder Roadmap

`docs/command-state-machine-spec.md` is the authoritative brief (FR-1…FR-9) for
the engine-driven command builder. Implemented: Phase 0 (FR-1 `CommandState.js`,
FR-2 `prepareSimInputs`, snapshot-tested); **FR-4 enemy targeting** (`4e2`/`a~2`
grammar, `useNp(servant, enemyTargetIdx)`, back-compat); **FR-8 granular
per-enemy stats** (`waveStats[wave].enemies[] = {index,name,maxHp,damageTaken,
npRefund}`, exposed as `stats.waves[w].per_enemy` by RunAdapter); **FR-5 (Mash
only)** as a contained special case (see Simulation Engine — Rules). Still open:
FR-5 general registry, FR-3/6/7 builder UI, FR-9 saved-run format. Extend the
regression suite before each engine change.

## Environment Variables

### React app (set in Cloudflare Pages → Settings → Environment variables)
| Variable | Used for |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL (build-time baked in) |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon/public key (browser-safe) |
| `REACT_APP_WORKER_URL` | Optional. Defaults to `''` (relative). Set to `http://localhost:8787` for local dev against `wrangler dev` |

### Cloudflare Pages (set in Pages → Settings → Environment variables)
| Variable | Notes |
|---|---|
| `SUPABASE_URL` | Same project URL — server-side, used by `functions/api/sync.js` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Mark as Secret/encrypted.** Bypasses RLS; never sent to browser (no `REACT_APP_` prefix) |
| `RUN_COOLDOWN_MINUTES` | Optional. Default 60. Min gap between user-triggered syncs. |

### Worker (optional — only if deploying the cron Worker)
Set via `wrangler secret put` from `worker/` directory:
| Variable | Used for |
|---|---|
| `SUPABASE_URL` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above |
| `TRIGGER_TOKEN` | Optional. If set, POST /run requires `Authorization: Bearer <token>` |
| `RUN_COOLDOWN_MINUTES` | Optional. Default 60. |

## Development

```bash
# Install root dependencies (required — shared/atlasSync.js resolves from here)
npm install

# Start dev server (port 3000)
npm start

# Build production bundle
npm run build

# Run tests
npm test

# One-time initial DB population (takes several minutes; no request-count limits)
# Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in worker/.dev.vars
cd worker && npm install && npm run seed
```

## Deployment

The app auto-deploys to Cloudflare Pages on every push to `main`. Cloudflare Pages handles:
- Building (`npm run build`)
- Serving `build/` as static assets
- Running `functions/` as edge functions (including `functions/api/sync.js`)

Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (as a Secret) in Pages → Settings → Environment variables so `POST /api/sync` can write to the database.

To also deploy the optional cron Worker:
```bash
npm run deploy:worker   # builds React then runs wrangler deploy from worker/
```

## CSS Variables

All colours must use the custom properties defined in `src/ui-vars.css`. Never hardcode colour values.

| Variable | Value | Use |
|---|---|---|
| `--color-bg` | `#0e1220` | Page background |
| `--color-surface` | `#1a2035` | Cards, modals |
| `--color-surface-2` | `#202840` | Nested surfaces |
| `--color-gold` | `#c9a843` | Primary accent (MUI primary) |
| `--color-gold-dim` | `rgba(201,168,67,0.12)` | Gold tinted backgrounds |
| `--color-border-active` | `rgba(201,168,67,0.6)` | Active borders |
| `--color-success` | `#4caf72` | Guaranteed wave clear |
| `--color-error` | `#e05454` | Impossible wave |
| `--color-text` | `#e8ecf4` | Body text |
| `--color-text-dim` | `#8899bb` | Secondary text |

For tinted backgrounds from a variable use `color-mix`:
```css
background: color-mix(in srgb, var(--color-success) 8%, transparent);
border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
```

## Simulation Engine — Rules

`src/simulation/` files (except `RunAdapter.js`) are the core engine. When modifying:
- Do NOT change logic in `Driver.js`, `BattleEngine.js`, `Servant.js`, `NP.js`, `Skills.js`, `Buffs.js`, `Enemy.js`, `Quest.js`, `Stats.js`, `gameData.js` **without owner approval** (FR-4/5/8 are owner-approved engine extensions — see Command Builder Roadmap).
- `RunAdapter.js` is the integration layer — safe to modify
- The engine uses camelCase internally (`npGauge`); `RunAdapter` normalises to snake_case (`np_gauge`) before returning to the UI
- **Append Skill 5 (cooldown reduction) defaults ON:** the first use of each
  active skill has its cooldown reduced by 1 turn (`Skills.setSkillCooldown`,
  clamped at 0). It is enabled by default for every servant (`Servant` opt
  `append5` defaults `true`; `RunAdapter` treats a missing flag as `true`; the
  team-bar / detail toggles render checked unless explicitly unticked) because
  Append 5 is near-universal at the farming endgame and its absence caused
  legitimate command sequences to abort on a skill that should have been
  off-cooldown. Untick the per-servant "Append 5" box to disable.
- **NP card normalisation:** Atlas renumbered NP card ids; the `data` blob now stores numeric strings (`"1"`=Arts, `"2"`=Buster, `"3"`=Quick) on each `noblePhantasm.card` — NOT the named form the engine's card-mod / `npGain` lookups expect. `NP.parseNoblePhantasms` normalises every `card` to the named key on load (`NP.js`). Synthetic fixtures that already use named cards pass through unchanged. (Before this, every real-data Buster/Quick NP was silently scored as Arts.)
- **NP refund / hit distribution:** the NP-card refund rate lives under `noblePhantasm.npGain.np` (Atlas also exposes equal per-card keys); `NP.getNpgain` reads `npGain.np` (falls back to the card key for synthetic fixtures). Refund + damage spread + per-hit overkill (1.5×) use `noblePhantasm.npDistribution`. `_distributeHits` resolves both against the **fired** NP's `newId`, so an NP swap (Mash's Holy Sword) uses the right NP's gain/distribution, not the default last NP.
- **Baseline `Value/1000` NP-damage approximation (FR-5):** damage NPs whose true multiplier scales on a condition the engine doesn't track are billed at their flat `Value/1000` floor (situational Correction omitted — a conservative *under*-bill, never a false clear). Covers `damageNpHpratioLow` (own-HP scaling: Hijikata, Aśvatthāman), `damageNpRare` (enemy rarity: Bartholomew Roberts 257), `damageNpBattlePointPhase` (accrued battle points: Ereshkigal 417), and `damageNpAndOrCheckIndividuality` (AND-trait bonus: MHXX Alter 423). Both `NP.getNpDamageValues` and the `BattleEngine.useNp` dispatch list must list a damage funcType, or its NP silently deals **0 damage**.
- **Mash "Holy Sword" transform (FR-5, contained special case — owner-approved):** Mash (`collectionNo 1`) is the one modelled transform servant. `Servant.js` treats her as the upgraded 5★ Paladin (ATK 10835 @ Lv90, `attribute: human`); Atlas still encodes the base 4★ Shielder. `BattleEngine.useNp` resolves her active NP through the `script.tdTypeChangeIDs` group (`NP.tdTypeChangeNewId`): default = Lord Chaldeas (Arts, defensive, id 800107); after firing it loads the `聖剣装填` buff, her active NP becomes the offensive Holy Sword (Buster AoE, id 800108). `BattleEngine.useSkill` models her Holy-Sword S2 ("Purple Bullet…", absent from trimmed data) as a star-fuelled NP charge (assume 50 crit stars × 4% → +200%) plus +100% NP strength (3T), skipping the base-S2 effects while loaded. New transform servants should graduate to the declarative registry (FR-5), not more `id === N` branches.

## Key Invariants

- `selectedQuest._fullData` is populated at quest-selection time by `QuestSelection.js`; `RunAdapter` reads it directly — no re-fetch
- `team` is always length 6; empty slots have `collectionNo: ''`
- `servantEffects` is always length 6 (parallel to `team`)
- Command grammar (see `Driver.js`): `a`–`i` = frontline servant skills (`a/b/c`→servant 1, `d/e/f`→servant 2, `g/h/i`→servant 3); `j`/`k`/`l` = mystic-code skills; `4`/`5`/`6` = fire NP for frontline slot 1/2/3; `a1` = skill targeting ally slot 1–3; `a~2` = skill targeting enemy 2 (1-based, FR-4); `4e2`/`5e2`/`6e2` = fire NP at enemy 2 (1-based, FR-4; bare `4`/`5`/`6` keep the highest-HP default); `x12` = swap frontline 1 ↔ backline 2; `#` = end turn; `a[Ch1A]` / `a([Ch1A]2)` = choice tokens (parsed but currently inert). NP tokens (`4`/`5`/`6`) are counted for `total_np_cost` in saved runs. Unknown tokens are silently ignored (`Driver.js:110`).
- The `supabase` export from `supabaseClient.js` is always defined (uses placeholder URL if env vars missing); check `supabaseMisconfigured` export if you need to warn the user
