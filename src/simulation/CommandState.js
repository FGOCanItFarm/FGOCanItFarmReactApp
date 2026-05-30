/**
 * CommandState — read-only engine introspection for the command builder (FR-1).
 *
 * This module NEVER mutates engine logic. It drives the builder by:
 *   - buildEngineAt:   produce the engine state after a token prefix
 *                      (forward-only; append fast-path + rebuild-and-replay).
 *   - legalNextTokens: the tokens that are currently legal, plus disabled
 *                      options with a reason (for greyed buttons + tooltips).
 *   - engineSnapshot:  a plain serialisable view of combat state for the UI.
 *   - humanizeToken:   reverse-translate a token into a readable label.
 *
 * FORWARD-ONLY (spec §2.2): the engine has no rewind. Appending one token keeps
 * the live engine and does a single executeToken; any other edit discards the
 * engine and replays the prefix from a fresh one. Callers MUST cache simInputs
 * (see RunAdapter.prepareSimInputs) so rebuild+replay is pure in-memory.
 */
import { Driver } from './Driver';

// Mirrors Driver.js token grammar (kept in sync intentionally).
const SKILL_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
const MC_LETTERS = ['j', 'k', 'l'];
const NP_SLOTS = { 4: 0, 5: 1, 6: 2 };

const RE_CHOICE_TARGET = /^([a-i])\(\[Ch(\d+)([A-C])\](\d)\)$/; // a([Ch1A]2)
const RE_CHOICE = /^([a-i])\[Ch(\d+)([A-C])\]$/;                 // a[Ch1A]
const RE_SWAP = /^x(\d)(\d)$/;                                   // x12
const RE_NP_TARGET = /^([456])e(\d+)$/;                          // 4e2 (FR-4)
const RE_SKILL_ENEMY = /^([a-i])~(\d+)$/;                        // a~2 (FR-4)
const RE_SKILL_TARGET = /^([a-i])(\d)$/;                          // a1
const RE_MC_TARGET = /^([jkl])(\d)$/;                             // j1
const RE_FOCUS = /^@(\d+)$/;                                      // @2 (sticky focus, FR-10)

/**
 * Parse one token into a structural descriptor WITHOUT executing it.
 * Returns null for tokens outside the current grammar (used to surface invalid
 * manual edits — see FR-6 — instead of the engine's silent no-op at Driver.js).
 * Phase 2 will extend this with the enemy-target delimiter `~`.
 */
export function classifyToken(token) {
  let m;
  if ((m = RE_FOCUS.exec(token))) {
    return { kind: 'focus', enemyTarget: parseInt(m[1], 10) };
  }
  if ((m = RE_CHOICE_TARGET.exec(token))) {
    const idx = SKILL_LETTERS.indexOf(m[1]);
    return { kind: 'choice', servantIdx: Math.floor(idx / 3), skillIdx: idx % 3,
      choiceId: parseInt(m[2], 10), optionIdx: m[3].charCodeAt(0) - 65, allySlot: parseInt(m[4], 10) };
  }
  if ((m = RE_CHOICE.exec(token))) {
    const idx = SKILL_LETTERS.indexOf(m[1]);
    return { kind: 'choice', servantIdx: Math.floor(idx / 3), skillIdx: idx % 3,
      choiceId: parseInt(m[2], 10), optionIdx: m[3].charCodeAt(0) - 65, allySlot: null };
  }
  if ((m = RE_SWAP.exec(token))) {
    return { kind: 'swap', front: parseInt(m[1], 10), back: parseInt(m[2], 10) };
  }
  if ((m = RE_NP_TARGET.exec(token))) {
    return { kind: 'np', slot: NP_SLOTS[m[1]], enemyTarget: parseInt(m[2], 10) };
  }
  if ((m = RE_SKILL_ENEMY.exec(token))) {
    const idx = SKILL_LETTERS.indexOf(m[1]);
    return { kind: 'skill', servantIdx: Math.floor(idx / 3), skillIdx: idx % 3, enemyTarget: parseInt(m[2], 10), allySlot: null };
  }
  if ((m = RE_SKILL_TARGET.exec(token)) && SKILL_LETTERS.includes(m[1])) {
    const idx = SKILL_LETTERS.indexOf(m[1]);
    return { kind: 'skill', servantIdx: Math.floor(idx / 3), skillIdx: idx % 3, allySlot: parseInt(m[2], 10) };
  }
  if (token.length === 1 && SKILL_LETTERS.includes(token)) {
    const idx = SKILL_LETTERS.indexOf(token);
    return { kind: 'skill', servantIdx: Math.floor(idx / 3), skillIdx: idx % 3, allySlot: null };
  }
  if ((m = RE_MC_TARGET.exec(token))) {
    return { kind: 'mc', mcIdx: MC_LETTERS.indexOf(m[1]), allySlot: parseInt(m[2], 10) };
  }
  if (token.length === 1 && MC_LETTERS.includes(token)) {
    return { kind: 'mc', mcIdx: MC_LETTERS.indexOf(token), allySlot: null };
  }
  if (token in NP_SLOTS) {
    return { kind: 'np', slot: NP_SLOTS[token] };
  }
  if (token === '#') return { kind: 'endTurn' };
  return null;
}

// ─── Read-only resolution helpers (no engine side effects) ──────────────────

/**
 * The skill variant that Skills.getSkillByNum WOULD return, but WITHOUT its
 * Melusine first-use side effect (it sets `melusineSkill = true`). The builder
 * must be able to inspect state without consuming a one-time form change.
 * Phase 3 replaces getSkillByNum with a pure activeSkill seam; until then this
 * mirrors current selection logic read-only.
 */
function peekSkill(servant, num) {
  const variants = servant.skills.skills[num];
  if (!variants || variants.length === 0) return null;
  if (!servant.skills.melusineSkill && variants[0]?.id === 888550) return variants[0];
  return variants[variants.length - 1];
}

/** Map a list of skill/NP functions to the single interaction-driving class. */
function targetClassForFunctions(functions = []) {
  let ally = false, enemyOne = false, enemyAll = false, team = false, self = false;
  for (const f of functions) {
    switch (f.funcTargetType) {
      case 'ptOne': ally = true; break;
      case 'enemy': enemyOne = true; break;
      case 'enemyAll': enemyAll = true; break;
      case 'ptAll': case 'ptOther': team = true; break;
      case 'self': self = true; break;
      default: break;
    }
  }
  if (ally) return 'ally';
  if (enemyOne) return 'enemyOne';
  if (enemyAll) return 'enemyAll';
  if (team) return 'team';
  if (self) return 'self';
  return 'none';
}

/** NP target class without side effects (NP.getNpById is a pure read). */
function npTargetClass(servant) {
  const np = servant.nps?.getNpById?.();
  if (!np) return 'none';
  for (const f of np.functions || []) {
    if (['damageNp', 'damageNpPierce', 'damageNpIndividual', 'damageNpIndividualSum',
      'damageNpStateIndividualFix'].includes(f.funcType)) {
      return f.funcTargetType === 'enemyAll' ? 'enemyAll' : 'enemyOne';
    }
  }
  return 'team'; // support NP (charge/buff party), no damage func
}

// ─── buildEngineAt (FR-1) ───────────────────────────────────────────────────

// Memoised immutable snapshots, scoped per simInputs (the cached quest+team
// context) so identical token strings across different teams never collide.
// Live engines are never cached (they mutate on append); only the read-only
// snapshot view is. WeakMap lets memo for a discarded simInputs be GC'd.
let _snapshotMemo = new WeakMap();

function _memoFor(simInputs) {
  let m = _snapshotMemo.get(simInputs);
  if (!m) { m = new Map(); _snapshotMemo.set(simInputs, m); }
  return m;
}

/** Reset the snapshot memo (mainly for tests). */
export function clearMemo() { _snapshotMemo = new WeakMap(); }

function isAppendOf(prevTokens, tokens) {
  if (!prevTokens || tokens.length !== prevTokens.length + 1) return false;
  for (let i = 0; i < prevTokens.length; i++) if (prevTokens[i] !== tokens[i]) return false;
  return true;
}

/** One forward step. Returns true on success, false on failure / invalid token. */
function stepToken(driver, token) {
  if (classifyToken(token) === null) return false; // unknown token → invalid (not silent)
  try {
    return driver.executeToken(token) !== false;
  } catch (e) {
    return false; // malformed manual edit (e.g. out-of-range target) → invalid
  }
}

/**
 * Build the engine after `tokens` (forward-only, never rewind).
 * @param {object} simInputs - cached BattleEngine config (see prepareSimInputs)
 * @param {string[]} tokens
 * @param {object|null} prev - previous result `{ tokens, engine, driver, ok }`
 *        for the append fast-path
 * @returns {{ engine, driver, tokens, ok, failedIndex }}
 *          failedIndex = index of the first token that failed, or -1
 */
export function buildEngineAt(simInputs, tokens, prev = null) {
  const memo = _memoFor(simInputs);

  // Append fast-path: exactly one new token on a still-valid prefix.
  if (prev && prev.ok && prev.engine && prev.driver && isAppendOf(prev.tokens, tokens)) {
    const ok = stepToken(prev.driver, tokens[tokens.length - 1]);
    const res = { engine: prev.engine, driver: prev.driver, tokens, ok, failedIndex: ok ? -1 : tokens.length - 1 };
    memo.set(tokens.join(' '), { ok: res.ok, failedIndex: res.failedIndex, snapshot: engineSnapshot(res.engine) });
    return res;
  }

  // Rebuild path: fresh engine, replay 0..k forward, capture first failure.
  const driver = new Driver(simInputs);
  driver.reset();
  let failedIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (!stepToken(driver, tokens[i])) { failedIndex = i; break; }
  }
  const res = { engine: driver.engine, driver, tokens, ok: failedIndex === -1, failedIndex };
  memo.set(tokens.join(' '), { ok: res.ok, failedIndex: res.failedIndex, snapshot: engineSnapshot(res.engine) });
  return res;
}

/** Cheap memoised read-only snapshot for a token prefix (rebuilds if uncached). */
export function snapshotAt(simInputs, tokens, prev = null) {
  const key = tokens.join(' ');
  const memo = _memoFor(simInputs);
  if (memo.has(key)) return memo.get(key);
  buildEngineAt(simInputs, tokens, prev);
  return memo.get(key);
}

// ─── legalNextTokens (FR-1 / FR-3) ──────────────────────────────────────────

/**
 * Enumerate the next-token options for the live engine. Disabled options are
 * included with `available:false` + a `reason` so the UI can grey them.
 * @returns {Array<{token, kind, targetClass, servantSlot, skillNum, label, reason, available}>}
 */
export function legalNextTokens(engine) {
  const options = [];
  if (!engine) return options;
  const front = engine.servants.slice(0, 3);

  // Skills (frontline only — backline can't act until swapped in).
  front.forEach((servant, slot) => {
    if (!servant) return;
    for (let num = 1; num <= 3; num++) {
      const skill = peekSkill(servant, num);
      if (!skill) continue;
      const targetClass = targetClassForFunctions(skill.functions);
      const available = servant.skills.skillAvailable(num);
      const cd = servant.skills.cooldowns[num];
      options.push({
        token: SKILL_LETTERS[slot * 3 + (num - 1)],
        kind: 'skill', targetClass, servantSlot: slot, skillNum: num,
        label: `S${slot + 1} · Skill ${num}`,
        available,
        reason: available ? null : `CD ${cd}t`,
      });
    }
  });

  // NPs (frontline). Mirrors useNp's `getNpgauge() < 99` gate.
  front.forEach((servant, slot) => {
    if (!servant) return;
    const gauge = servant.getNpgauge();
    const available = gauge >= 99;
    options.push({
      token: String(slot + 4), // 4/5/6
      kind: 'np', targetClass: npTargetClass(servant), servantSlot: slot, skillNum: null,
      label: `S${slot + 1} NP`,
      available,
      reason: available ? null : `NP ${Math.floor(gauge)}%`,
    });
  });

  // Mystic Code skills.
  if (engine.mc && engine.mc.skills) {
    engine.mc.skills.forEach((skill, mcIdx) => {
      const cd = engine.mc.cooldowns[mcIdx] ?? 0;
      const available = cd === 0;
      options.push({
        token: MC_LETTERS[mcIdx],
        kind: 'mc', targetClass: targetClassForFunctions(skill.functions), servantSlot: null, skillNum: mcIdx + 1,
        label: `MC · Skill ${mcIdx + 1}`,
        available,
        reason: available ? null : `CD ${cd}t`,
      });
    });
  }

  // Swaps (only when a backline exists). Front 1..3 ↔ each backline slot.
  if (engine.servants.length > 3) {
    for (let f = 1; f <= 3; f++) {
      if (!engine.servants[f - 1]) continue;
      for (let backIdx = 3; backIdx < engine.servants.length; backIdx++) {
        const b = backIdx - 2; // back number used by the x token (index = +2)
        options.push({
          token: `x${f}${b}`,
          kind: 'swap', targetClass: 'none', servantSlot: f - 1, skillNum: null,
          label: `Swap front ${f} ↔ back ${b}`,
          available: true, reason: null,
        });
      }
    }
  }

  // End turn — legal only once every wave enemy is dead (mirrors endTurn()).
  const cleared = engine.enemies.every((e) => e.hp <= 0);
  options.push({
    token: '#', kind: 'endTurn', targetClass: 'none', servantSlot: null, skillNum: null,
    label: 'End turn', available: cleared, reason: cleared ? null : 'enemies alive',
  });

  return options;
}

// ─── engineSnapshot (FR-1) ──────────────────────────────────────────────────

function servantSnapshot(servant, slot) {
  if (!servant) return null;
  // Net stat totals: fold configured effects (seeded into user* fields) + live
  // buffs into the servant's derived mods. Idempotent recompute on the throwaway
  // replay engine; guarded so fixture stubs without a full Buffs don't throw.
  let stats = null;
  try {
    servant.buffs?.processServantBuffs?.();
    stats = {
      atkUp: servant.atkMod ?? 0,
      busterUp: servant.bUp ?? 0,
      artsUp: servant.aUp ?? 0,
      quickUp: servant.qUp ?? 0,
      busterDmgUp: servant.busterCardDamageUp ?? 0,
      artsDmgUp: servant.artsCardDamageUp ?? 0,
      quickDmgUp: servant.quickCardDamageUp ?? 0,
      npDmgUp: servant.npDamageMod ?? 0,
      npGen: (servant.npGainMod ?? 1) - 1,
      oc: servant.ocLevel ?? 1,
    };
  } catch { stats = null; }
  return {
    slot,
    collectionNo: servant.id,
    name: servant.name,
    faceUrl: servant.data?.face_url ?? null,
    npGauge: Math.round(servant.npGauge * 10) / 10,
    stats,
    cooldowns: [servant.skills.cooldowns[1], servant.skills.cooldowns[2], servant.skills.cooldowns[3]],
    maxCooldowns: [servant.skills.maxCooldowns[1], servant.skills.maxCooldowns[2], servant.skills.maxCooldowns[3]],
    // Active buffs for the step-through view (name · value · turns; -1 turns = permanent).
    buffs: (servant.buffs?.buffs ?? [])
      .filter((b) => b && b.buff)
      .map((b) => ({ name: b.buff, value: b.value ?? 0, turns: b.turns ?? -1 })),
    skills: [1, 2, 3].map((num) => {
      const sk = peekSkill(servant, num);
      return {
        num,
        name: sk?.name ?? null,
        targetClass: sk ? targetClassForFunctions(sk.functions) : 'none',
        available: servant.skills.skillAvailable(num),
      };
    }),
  };
}

/** Plain serialisable combat state for the dashboard UI. */
export function engineSnapshot(engine) {
  if (!engine) return null;
  return {
    front: engine.servants.slice(0, 3).map((s, i) => servantSnapshot(s, i)),
    back: engine.servants.slice(3).map((s, i) => servantSnapshot(s, i + 3)),
    enemies: engine.enemies.map((e, idx) => ({
      index: idx + 1, name: e.name, className: e.className, hp: e.hp, maxHp: e.maxHp,
      focused: engine.focusEnemyIdx === idx, // FR-10 sticky `@N` target
      // Debuffs landed on this enemy (DEF Down, card-resist down, etc.).
      buffs: (e.buffs?.buffs ?? [])
        .filter((b) => b && b.buff)
        .map((b) => ({ name: b.buff, value: b.value ?? 0, turns: b.turns ?? -1 })),
    })),
    focusEnemyIdx: engine.focusEnemyIdx ?? null,
    wave: engine.wave,
    totalWaves: engine.totalWaves,
    cleared: engine.enemies.every((e) => e.hp <= 0),
  };
}

// ─── humanizeToken (FR-1) ───────────────────────────────────────────────────

function frontOf(source) {
  if (!source) return [];
  if (Array.isArray(source.front)) return source.front;        // snapshot
  if (Array.isArray(source.servants)) return source.servants;  // engine
  return [];
}

const nameAt = (front, slot) => front[slot]?.name ?? `slot ${slot + 1}`;

/** Reverse-translate a token to a readable label, using live servant names. */
export function humanizeToken(token, engineOrSnapshot) {
  const front = frontOf(engineOrSnapshot);
  const desc = classifyToken(token);
  if (!desc) return `Invalid: ${token}`;

  switch (desc.kind) {
    case 'skill': {
      const base = `S${desc.servantIdx + 1} · Skill ${desc.skillIdx + 1}`;
      if (desc.enemyTarget) return `${base} → enemy ${desc.enemyTarget}`;
      return desc.allySlot ? `${base} → ally ${nameAt(front, desc.allySlot - 1)}` : base;
    }
    case 'choice': {
      const letter = String.fromCharCode(65 + desc.optionIdx);
      const base = `S${desc.servantIdx + 1} · Skill ${desc.skillIdx + 1} (choice ${letter})`;
      return desc.allySlot ? `${base} → ally ${nameAt(front, desc.allySlot - 1)}` : base;
    }
    case 'swap':
      return `Swap front ${desc.front} ↔ back ${desc.back}`;
    case 'mc': {
      const base = `MC · Skill ${desc.mcIdx + 1}`;
      return desc.allySlot ? `${base} → ally ${nameAt(front, desc.allySlot - 1)}` : base;
    }
    case 'np':
      return desc.enemyTarget ? `S${desc.slot + 1} NP → enemy ${desc.enemyTarget}` : `S${desc.slot + 1} NP`;
    case 'focus':
      return `Focus → enemy ${desc.enemyTarget}`;
    case 'endTurn':
      return 'End turn';
    default:
      return `Invalid: ${token}`;
  }
}

// ─── Command builder controller (FR-3 token resolution, FR-6 edit/validate) ──

/**
 * FR-3: combine a `legalNextTokens` option with the user's picked target into a
 * concrete token. `self`/`team`/`enemyAll`/`none` fire immediately (base token);
 * `ally` appends the ally slot (`a` → `a2`); `enemyOne` appends the enemy suffix
 * (`6` → `6e2` for NPs, `a` → `a~2` for skills).
 * @param {{token:string, kind:string, targetClass:string}} option
 * @param {{allySlot?:number, enemyIndex?:number}} target
 */
export function resolveToken(option, target = {}) {
  const { token, kind, targetClass } = option;
  if (targetClass === 'ally' && target.allySlot != null) {
    return `${token}${target.allySlot}`;
  }
  if (targetClass === 'enemyOne' && target.enemyIndex != null) {
    return kind === 'np' ? `${token}e${target.enemyIndex}` : `${token}~${target.enemyIndex}`;
  }
  return token; // immediate, or target not yet picked
}

/** True when an option needs a follow-up target pick before it resolves. */
export function needsTarget(option) {
  return option.targetClass === 'ally' || option.targetClass === 'enemyOne';
}

/**
 * FR-6: forward-only re-validation of an edited token array. Returns the first
 * token index that makes the run fail (-1 if all valid) and a per-token state so
 * the UI can mark the failing token and grey everything after it (without
 * silently dropping). The command array remains the single source of truth.
 */
export function validateSequence(simInputs, tokens) {
  const { ok, failedIndex } = buildEngineAt(simInputs, tokens);
  return {
    ok,
    failedIndex,
    tokenStates: tokens.map((token, i) => ({
      token,
      valid: failedIndex === -1 || i < failedIndex,
      failed: i === failedIndex,
    })),
  };
}

/**
 * FR-6: pure edit operations on the command array (the single source of truth).
 * The UI re-validates with validateSequence after any edit.
 */
export const editOps = {
  append:    (tokens, token)      => [...tokens, token],
  pop:       (tokens)            => tokens.slice(0, -1),
  deleteAt:  (tokens, i)         => tokens.filter((_, j) => j !== i),
  insertAt:  (tokens, i, token)  => [...tokens.slice(0, i), token, ...tokens.slice(i)],
  replaceAt: (tokens, i, token)  => tokens.map((t, j) => (j === i ? token : t)),
  clear:     ()                  => [],
};
