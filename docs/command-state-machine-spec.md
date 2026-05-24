# Spec: Engine-Driven Command Builder ("State-Machine" Command Input)

> Status: DRAFT for review. This document is the brief to hand to an implementing AI.
> Owner to review/edit before implementation. Nothing here is built yet.

---

## 1. Goal

Replace the static command-input buttons with a builder driven by the **real
simulation engine at runtime**. After the user picks a quest + team:

- Every command token the user adds is executed by the actual engine.
- The UI offers **only the tokens that are currently legal** (skills off
  cooldown, NPs charged ≥100%, end-turn only when the wave is clear, etc.).
- The page shows **live battle state** (NP gauges, cooldowns, wave, per-enemy
  HP) laid out like in-game combat for observability.
- The user can **select which enemy** a single-target skill/NP hits.
- The user can **undo / delete / edit** tokens, with automatic re-validation.

This makes invalid command strings structurally impossible and turns the
command page into a readable combat dashboard.

---

## 2. Grounding: how the engine works today (verified, with file:line)

**Do not assume — these are the facts the implementation must build on.**

### 2.1 Command grammar (`src/simulation/Driver.js`)
- Tokens are whitespace/comma separated: `tokenString.trim().split(/[\s,]+/)` (`Driver.js:42`).
- `executeToken` (`Driver.js:50–111`) matches, in order:
  - `a([Ch1A]2)` choice + ally target — `RE_CHOICE_TARGET` (`:13,:55`)
  - `a[Ch1A]` choice, no target — `RE_CHOICE` (`:14,:63`)
  - `x12` swap frontline 1 ↔ backline 2 (1-indexed; backline index = `+2`) (`:15,:70`)
  - `a1` skill + **ally** target (slot 1–3) (`:16,:80`)
  - `a` skill, no target (`:86`)
  - `j1` / `j` mystic-code skill (±target) (`:17,:92,:97`)
  - `4/5/6` fire NP for frontline slot 0/1/2 — `NP_SLOTS` (`:6,:102`)
  - `#` end turn (`:107`)
  - unknown token → silently returns engine (no-op) (`:110`) ← **note: silent**
- Skill letters map a–i → servant 0/1/2 × skill 0/1/2 (`SKILL_MAP`, `Driver.js:8`).
- **The numeric target suffix is always an ALLY slot.** There is no enemy-target token.

### 2.2 Step granularity
- `Driver.run(str)` calls `reset()` (new `BattleEngine`) then loops `executeToken`,
  returning `false` on the first failure, else the engine (`Driver.js:40–48`).
- `executeToken` is public and executes exactly one token, mutating the engine
  in place. There is **no snapshot/step-state API** — re-running a prefix from
  scratch is the supported way to get "state after token k".

### 2.3 State available for legality checks
- Skill ready: `engine.servants[i].skills.skillAvailable(num)` (1-based) (`Skills.js:87`).
- Cooldowns: `engine.servants[i].skills.cooldowns` `{1,2,3}` + `maxCooldowns` (`Skills.js:4–5`).
- NP gauge: `engine.servants[i].npGauge`; NP usable iff `getNpgauge() >= 99` (`BattleEngine.js:246`).
- MC ready: `engine.mc.cooldowns[idx] === 0` (`BattleEngine.js:236`).
- Wave/enemies: `engine.wave`, `engine.totalWaves`, `engine.enemies[]` (each Enemy has `hp`, `maxHp`).
- End turn legal: mirror `endTurn()` (`BattleEngine.js:111`) — only meaningful once enemies are dead.
- Frontline = `servants[0..2]`; backline = `servants[3..]` (can't act until swapped in).

### 2.4 Targeting & choices
- `applyEffect` switches on `effect.funcTargetType` (`BattleEngine.js:184–191`):
  `self | enemyAll | enemy | ptOther | ptAll | ptOne`.
  - **`ptOne`** = needs an explicit ally target. Others auto-resolve.
- **Choice tokens parse but do nothing**: `_pendingChoice` is set then ignored
  during effect application (`BattleEngine.js:229–231`). Choice-aware effects are
  NOT implemented (comment `:228` names Space Ishtar / Emiya as future work).

### 2.5 Single-target enemy is hardcoded
- `useNp` always targets the **highest-HP living enemy** (`BattleEngine.js:260–263`).
- Single-target-enemy skills (`funcTargetType === 'enemy'`) route through the
  ally-target param (`applyEffect :187`), so the grammar can't pick an enemy.

### 2.6 Transforms are ad-hoc, NOT general
- Only Aoko (`id 413`) transforms — `transformAoko` swaps the whole `Servant`
  object for `superAokoData` (`BattleEngine.js:96–105,:295`); Super-Aoko cleanup
  for `id 4132` (`:296`).
- The generic `transformServant` effect handler is a **no-op** (`BattleEngine.js:420`).
- `Skills.getSkillByNum` stores **arrays of skill variants per num** and returns
  the last (latest) one, with a single special case for Melusine `id 888550`
  via a `melusineSkill` flag (`Skills.js:66–74`). This is the natural seam for
  state-conditional skill selection.
- Parser flags exist: `parser_flags.has_transform_servant`, `mash_ortinax`
  (`shared/atlasSync.js`), and `np_card_variable` / `np_card_options` already
  capture servants whose NP card changes.
- **Mash "Holy Sword Loaded" (skill 2 + NP swap, 3 turns, S2 cooldown −5) is NOT
  modeled at all.** Newer servants (≈ id > 460) with form/stance/gender changes
  are also unmodeled.

### 2.7 Stats logged today
- Only aggregate per wave: `waveStats[wave] = { hpRequired, damageDealt }`
  (`BattleEngine.js:64–70`).
- Per-hit NP refund (`npPerHit`) is **computed but not logged** (`BattleEngine.js:387–395`).
- `servantsAtWaveEnd[wave]` captures `{slot, collectionNo, npGauge}` (`:73–77`).
- **Per-enemy damage and per-hit refund logging do NOT currently exist** and must be added.

---

## 3. Decisions (locked with owner)

1. **Enemy targeting:** EXTEND THE ENGINE now (grammar + `useNp`/skill enemy target).
   Touching `Driver.js` / `BattleEngine.js` is approved for this work.
2. **Transforms:** Build a ROBUST, GENERAL transform/form/stance/gender-change
   system — not per-id hacks. Must cover Mash, the Aoko cases, and the newer
   servants (≈ id > 460) with form/stance/gender changes that alter skills/NP.
3. **Saved runs:** Store the token string + granular stats (damage per enemy per
   wave, NP refund per enemy/per hit per wave, etc.), and **re-run the sim** to
   reconstruct. Persist computed results so the community can spot
   discrepancies; on mismatch/error, allow a **bug-report submission**.
4. **Rollout:** Owner will feed this spec to an AI. (Recommended internal order:
   read-only introspection → engine extensions → UI overhaul; see §9.)

---

## 4. Functional requirements

### FR-1 Engine introspection (read-only)
- New module `src/simulation/CommandState.js` (additive; does not modify engine logic):
  - `buildEngineAt(simInputs, tokens) → { engine, ok, failedIndex }`
    - Runs `driver.run(tokens.join(' '))`; if it returns `false`, re-step to find
      the first failing index. Memoize by `tokens.join(' ')`.
  - `legalNextTokens(engine) → Array<TokenOption>` where
    `TokenOption = { token, kind, targetClass, servantSlot, skillNum, label, reason }`
    - `kind ∈ skill | np | mc | swap | endTurn | choice`
    - `targetClass ∈ none | self | ally | team | enemyOne | enemyAll | choice`
    - For disabled options also return them with `reason` (e.g., "CD 2t", "NP 71%")
      so the UI can grey them with a tooltip rather than hide them.
  - `engineSnapshot(engine) → UiState` (plain serialisable object):
    - `front: [{ slot, collectionNo, name, faceUrl, npGauge, cooldowns:[c1,c2,c3], maxCooldowns, skills:[{num,name,targetClass,available}] }]`
    - `back: [...]`
    - `enemies: [{ index, name, className, hp, maxHp }]`
    - `wave`, `totalWaves`, `cleared` (all enemies dead)
  - `humanizeToken(token, engine|snapshot) → string` — reverse translation, e.g.
    `c1` → "S1 · Skill 3 → ally Castoria", `4` → "S1 NP", `#` → "End turn",
    `x12` → "Swap front 1 ↔ back 2", `a[Ch1A]` → "S1 · Skill 1 (choice A)",
    `4e2` (new, see FR-4) → "S1 NP → enemy 2".

### FR-2 RunAdapter refactor
- Extract the existing "build Driver inputs" code (Supabase fetch of servant
  `data`, MC `data`, `servantEffects` normalisation, `selectedQuest._fullData`)
  into an exported `prepareSimInputs({ team, selectedQuest, selectedMysticCode, servantEffects }) → simInputs`.
- `runSimulation` and the new `CommandState` module both consume `prepareSimInputs`
  (single source of truth; no logic drift). `RunAdapter.js` is explicitly allowed
  to change.

### FR-3 Token list generation by target class
- Drive option generation from `funcTargetType` of each skill's functions (read
  via `servant.skills.getSkillByNum(num).functions[]`) and from MC skills.
- Map to `targetClass`; the UI decides interaction:
  - `self`/`team`/`enemyAll`/`none` → fire immediately (base token).
  - `ally` (ptOne) → ally picker → append ally slot suffix `1..3`.
  - `enemyOne` → enemy picker → append enemy suffix (FR-4).
  - `choice` → existing `ChoiceSelector` flow (emits `[ChNX]`).
- If the owner provides their original target-classification function, adapt it
  here instead of re-deriving.

### FR-4 Enemy targeting (ENGINE EXTENSION — approved)
- Extend grammar with an explicit enemy target. Proposed, non-colliding syntax:
  - NP: `4e2` = fire S1 NP at enemy index 2 (1-based). Bare `4` keeps the
    highest-HP default (back-compat).
  - Single-target-enemy skill: `a~2` or reuse a distinct delimiter that does not
    collide with the ally-target `a1` form. **Pick one delimiter and document it.**
- `BattleEngine.useNp(servant, enemyTarget = null)` and the enemy-skill path must
  honor an explicit target, falling back to highest-HP when null.
- The Driver must parse the new suffix and pass the chosen `Enemy`.
- Back-compat: all existing saved token strings must still parse and behave
  identically.

### FR-5 Transform / form-change system (ENGINE EXTENSION — approved)
- Replace per-id hacks with a general mechanism. Requirements:
  - A servant can have **multiple skill/NP variant sets** keyed by an active
    "form/stance/state" (e.g., Mash "Holy Sword Loaded", gender/stance changes).
  - A transform is **triggered** by a state/buff (often granted by the servant's
    own NP or skill), has a **duration** (e.g., 3 turns) and **reverts**.
  - While active, `getSkillByNum` and NP resolution must return the **variant for
    the current state**; cooldown side-effects (e.g., Mash S2 −5) must apply.
  - Must be **data-driven**: keyed off Atlas data (`script`, conditional
    `noblePhantasms`, skill `num` arrays, `funcType: transformServant`,
    `ascensionAdd`/form data) + `parser_flags`. The implementing AI must research
    how Atlas encodes these for: Mash (id 1), Aoko (413/4132), Melusine (888550),
    and the newer form/stance/gender-change servants (≈ id > 460 — enumerate them
    from the data during implementation).
  - Generalise the existing seams: `Skills.getSkillByNum` variant selection and
    the `transformServant` effect handler (currently a no-op). Prefer a
    lightweight "active variant" selector over Aoko's full-object swap where
    possible; keep Aoko working.
  - The introspection layer (FR-1) reads post-token state, so once the engine
    transforms correctly the dashboard reflects it **live for free**.

### FR-6 Undo / delete / edit
- Command array is the single source of truth; engine re-runs from scratch on any
  change (deterministic, sub-ms; memoized).
- Operations: undo (pop last), delete-at-index, insert, clear.
- After any edit, re-validate by stepping. The **first token that makes `run()`
  fail** is highlighted; tokens after it are shown "invalidated" (greyed) but NOT
  silently dropped, so the user can fix the sequence.
- Render the command as a row of chips, each with name (via `humanizeToken`) and
  an ✕.
- Fix the **silent unknown-token no-op** (`Driver.js:110`) for builder use: the
  UI should never produce unknown tokens, but invalid manual edits must surface
  as errors, not be ignored.

### FR-7 In-combat dashboard UI
- New command-page layout mimicking in-game combat:
  - **Enemies on the LEFT** — HP bars + name/class; **clickable** to set the
    enemy target for the next `enemyOne` action.
  - **Frontline allies on the RIGHT** — face, NP gauge %, 3 cooldown pips, NP
    button state.
  - **Command palette / current state in the middle** — buttons from
    `legalNextTokens`; disabled options greyed with reason tooltips.
  - Command chips (FR-6) and Run/Submit below.
- Replace the current oversized builder. Keep the right-docked Team panel and the
  dark theme; do not regress existing features (skills/NP/MC/swap, choice
  servants, ally targeting).

### FR-8 Granular stats logging (ENGINE EXTENSION)
- Add per-enemy, per-wave logging: damage dealt to each enemy per wave, and NP
  refund per enemy / per hit / per wave (hook into `recordNpDamage` and
  `_applyNpDamage` / `_applyNpOddDamage` where `npPerHit` is computed,
  `BattleEngine.js:345,381,387–395`). Expose via the engine for RunAdapter.

### FR-9 Saved-run format + bug reports
- Saved run = `{ quest_id, servant_collection_nos, np_levels, token_string,
  summary }` where `summary` holds the granular stats (FR-8) and computed
  outcome. Reconstruct full detail by re-simulating the token string on view.
- On view, if a re-sim result **diverges** from the stored summary (engine
  changed) or errors, surface it and offer a **bug-report submission** (capture
  token string, team, quest id, stored vs recomputed results).
- DB: reuse `saved_runs.token_string`; reduce/replace the heavy `wave_results`
  blob with the compact `summary`. Add a `bug_reports` table or reuse an existing
  channel (decide during implementation).

---

## 5. Non-functional requirements
- Determinism: identical inputs → identical state; safe to re-run for undo/view.
- Performance: memoize `buildEngineAt` by token string; only the last prefix
  changes on append. Target < 16ms per keystroke for typical teams.
- No regressions to the simulation results for existing saved runs (verify with
  a snapshot test over a set of known token strings before/after engine changes).
- Engine changes confined to `Driver.js`, `BattleEngine.js`, `Skills.js`,
  `Servant.js`, `NP.js` as needed; keep changes additive and well-commented.

---

## 6. Current problems / risks / unknowns (the AI must resolve)
1. **Choice effects are inert** — `_pendingChoice` is ignored. Choice-aware effect
   dispatch must be implemented for choice servants to actually matter (Space
   Ishtar, Emiya, Kukulkan, etc.). Decide scope with owner if large.
2. **Transform data model is unknown** — must research how Atlas encodes
   form/stance/gender changes and conditional skills/NPs; enumerate affected
   servants (≈ id > 460). High complexity; design the general model first.
3. **Enemy-target delimiter** — choose syntax that cannot collide with existing
   `a1` (ally) / `x12` (swap) / `4` (NP) tokens; document and keep back-compat.
4. **Granular stats not logged today** — must be added without slowing the sim.
5. **Silent unknown-token** behavior must change for the builder without breaking
   `run()` callers.
6. **Back-compat of saved runs** — old token strings must parse and reproduce
   identical results after grammar/engine changes (regression suite required).
7. **Mash class/rarity** display is a UI special-case today; the transform work
   should make her kit correct from data instead of hardcoding.

---

## 7. Acceptance criteria
- NP buttons enable exactly when gauge ≥ 100%; greyed with "NP x%" otherwise.
- A used skill greys the same turn and re-enables after its real cooldown.
- End Turn is clickable only when all wave enemies are dead.
- Clicking an enemy sets the target; a single-target NP/skill then hits that
  enemy (verified by damage distribution), default highest-HP when none chosen.
- Mash: after NP, skill 2 and NP visibly swap for 3 turns then revert; S2
  cooldown reduced by 5; reflected live in the dashboard.
- At least 2 newer form/stance/gender-change servants verified end-to-end.
- Undo/delete re-validates; first invalid token is flagged, not silently dropped.
- Saved run stores token+summary; re-sim reproduces it; divergence offers a bug
  report.
- Regression suite: a set of known token strings produce identical wave outcomes
  before and after the engine changes (except where transforms intentionally fix
  prior wrong results — call those out).

---

## 8. Suggested phasing (internal)
1. **Phase 0 — Introspection (no behavior change):** FR-2 refactor + FR-1
   `CommandState` + read-only observability strip on the current builder. Lowest
   risk; proves the re-run-to-cursor model.
2. **Phase 1 — Builder logic:** FR-3 token generation, FR-6 undo/delete/edit,
   `humanizeToken`, command chips.
3. **Phase 2 — Engine extensions:** FR-4 enemy targeting, FR-8 granular stats,
   choice-effect dispatch (problem #1). Add regression suite first.
4. **Phase 3 — Transform system:** FR-5 (research → general model → Mash → newer
   servants). Biggest unknown; isolate behind tests.
5. **Phase 4 — UI overhaul:** FR-7 in-combat dashboard.
6. **Phase 5 — Saved runs:** FR-9 format change + bug reports.

---

## 9. AI prompt (paste to the implementing agent)

> You are implementing an engine-driven command builder for a client-side FGO
> farming simulator (React 18 + CRA, simulation in `src/simulation/`). Read this
> spec in full. Work in phases (§8); open a PR per phase with a regression run.
>
> Constraints & facts: the engine executes one token at a time
> (`Driver.executeToken`) and `run()` is deterministic — get "state after token k"
> by re-running the token prefix from scratch (memoize). The command grammar,
> exposed state, targeting rules, hardcoded highest-HP enemy targeting, inert
> choice handling, ad-hoc Aoko-only transforms, and aggregate-only stats are
> documented in §2 with file:line — verify each before coding.
>
> Approved to modify the otherwise off-limits engine files (`Driver.js`,
> `BattleEngine.js`, `Skills.js`, `Servant.js`, `NP.js`) for: enemy targeting
> (FR-4), a general transform/form/stance/gender-change system (FR-5), granular
> stats (FR-8), and choice-effect dispatch (problem #1). Keep changes additive,
> commented, and back-compatible: all existing saved token strings must parse and
> reproduce identical wave outcomes (build a regression suite of known strings
> FIRST and run it after every engine change; call out any intentional result
> changes from transform fixes).
>
> Deliver: (1) `prepareSimInputs` extracted in `RunAdapter.js`; (2) a read-only
> `src/simulation/CommandState.js` exposing `buildEngineAt`, `legalNextTokens`,
> `engineSnapshot`, `humanizeToken`; (3) undo/delete/edit with first-invalid-token
> flagging; (4) the enemy-target grammar (choose a non-colliding delimiter, keep
> bare `4` = highest-HP); (5) the data-driven transform system (research how Atlas
> encodes forms/conditional skills/NPs; enumerate affected servants ≈ id > 460;
> generalise `getSkillByNum` variant selection + the `transformServant` no-op
> handler; keep Aoko working; make Mash correct from data); (6) the in-combat
> dashboard (enemies left/clickable, allies right with NP/CD, state-driven
> palette); (7) saved-run = token + granular summary with re-sim reconstruction
> and a bug-report path on divergence. Meet every item in §7.
>
> Before the transform phase, produce a short written design of the transform
> data model and the affected-servant list, and get owner sign-off.

---

## 10. Open questions for the owner
- Enemy-target delimiter preference (e.g., `4e2` for NP, `a~2` for skills)?
- Choice-effect dispatch: in scope for this work, or a separate task?
- `bug_reports`: new Supabase table vs. existing channel? Who can submit (anon)?
- Keep `wave_results` column for back-compat or migrate fully to `summary`?
