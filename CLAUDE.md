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
  └─ functions/api/servants/[id].js  ← Pages Function, proxies Atlas Academy

Supabase (Postgres + REST + RPC)
  ├─ servants       — game data synced from Atlas Academy
  ├─ quests         — 90/90+/90++ free quests with enemy stage data
  ├─ mystic_codes   — MC skill data
  ├─ saved_runs     — community-submitted clear runs
  └─ metadata       — key/value (aa_version JP hash, last_updated)

worker/ (standalone Cloudflare Worker — optional, for data sync only)
  └─ Cron job + POST /run that pulls Atlas Academy → Supabase
     Not needed for the React app to function.
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
│       ├─ DataUpdateButton.js  Admin: triggers worker data sync, shows status
│       ├─ Instructions.js      Landing / help page
│       ├─ ResultsTable.js      Simple results table (legacy)
│       └─ SummaryCard.js       Single-stat summary chip
│
├─ functions/                   Cloudflare Pages Functions (edge, server-side)
│   └─ api/servants/[id].js     Proxies GET /api/servants/:id → Atlas Academy
│                               Needed by CommonServantsGrid quick-picker
│
└─ worker/                      Standalone Cloudflare Worker (data sync only)
    ├─ src/index.js             Cron + POST /run → pulls AA data → Supabase
    │                           Also has GET /health and an asset fallback
    │                           for an all-in-one deployment (optional)
    └─ wrangler.toml            Worker config; [assets] points to ../build
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
| `parser_flags` | jsonb | mash_ortinax, has_transform_servant, … |
| `data` | jsonb | Full Atlas Academy nice servant object |
| `aa_data_hash` | text | Used by worker to skip unchanged servants |

### `quests`
| Column | Type | Notes |
|---|---|---|
| `id` | int PK | Atlas Academy quest ID |
| `name` | text | |
| `war_name` | text | |
| `recommend_lv` | text | '90', '90+', '90++', '90+++', '90★', '90★★', '90★★★' |
| `consume` | int | AP cost (always 40 for qualifying quests) |
| `opened_at` | timestamptz | |
| `data` | jsonb | Full Atlas Academy nice quest object (used by simulation) |

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

## Environment Variables

### React app (set in Cloudflare Pages → Settings → Environment variables)
| Variable | Used for |
|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL (build-time baked in) |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon/public key (browser-safe) |
| `REACT_APP_WORKER_URL` | Optional. Defaults to `''` (relative). Set to `http://localhost:8787` for local dev against `wrangler dev` |

### Worker (set via `wrangler secret put` from `worker/` directory)
| Variable | Used for |
|---|---|
| `SUPABASE_URL` | Same project URL — but used server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — can bypass RLS, never expose to browser |
| `TRIGGER_TOKEN` | Optional. If set, POST /run requires `Authorization: Bearer <token>` |

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm start

# Build production bundle
npm run build

# Run tests
npm test
```

For local dev with the worker running too:
```bash
# Terminal 1
REACT_APP_WORKER_URL=http://localhost:8787 npm start

# Terminal 2 — requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in worker/.dev.vars
cd worker && wrangler dev
```

## Deployment

The app auto-deploys to Cloudflare Pages on every push to `main`. Cloudflare Pages handles:
- Building (`npm run build`)
- Serving `build/` as static assets
- Running `functions/` as edge functions

To also deploy the data-sync Worker (optional, for the cron job):
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
- Do NOT change logic in `Driver.js`, `BattleEngine.js`, `Servant.js`, `NP.js`, `Skills.js`, `Buffs.js`, `Enemy.js`, `Quest.js`, `Stats.js`, `gameData.js`
- `RunAdapter.js` is the integration layer — safe to modify
- The engine uses camelCase internally (`npGauge`); `RunAdapter` normalises to snake_case (`np_gauge`) before returning to the UI

## Key Invariants

- `selectedQuest._fullData` is populated at quest-selection time by `QuestSelection.js`; `RunAdapter` reads it directly — no re-fetch
- `team` is always length 6; empty slots have `collectionNo: ''`
- `servantEffects` is always length 6 (parallel to `team`)
- Command tokens: `'1'–'6'` are servant skills (1-3 = servant 1, 4-6 = servant 2, etc. — see Driver.js for full spec); `'4'`, `'5'`, `'6'` doubled as NP tokens in `handleSubmitRun` count
- The `supabase` export from `supabaseClient.js` is always defined (uses placeholder URL if env vars missing); check `supabaseMisconfigured` export if you need to warn the user
