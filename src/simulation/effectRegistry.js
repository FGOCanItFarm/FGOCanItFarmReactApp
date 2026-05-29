/**
 * Effect handler registry: funcType → (engine, effect, target) → void
 *
 * Add a new mechanic with registerEffect(funcType, handler). BattleEngine's
 * applyEffect calls getEffectHandler(funcType) instead of indexing a local map,
 * so new handlers can be added here (or from transforms.js) without editing
 * the dispatch switch in BattleEngine.
 *
 * Handler signature: (engine: BattleEngine, effect: object, target: Servant|Enemy) => void
 */

const _registry = new Map();

export function registerEffect(funcType, handler) {
  _registry.set(funcType, handler);
}

export function getEffectHandler(funcType) {
  return _registry.get(funcType) ?? null;
}

// ── Core buff application ─────────────────────────────────────────────────────

registerEffect('addState',      (eng, eff, tgt) => eng.applyBuff(tgt, eng.extractState(eff)));
registerEffect('addStateShort', (eng, eff, tgt) => eng.applyBuff(tgt, eng.extractState(eff)));

// ── NP gauge ──────────────────────────────────────────────────────────────────

registerEffect('gainNp', (eng, eff, tgt) => {
  const { value } = eng.extractState(eff);
  if (value) tgt.setNpgauge(value / 100);
});

// Charges own NP proportional to count(living allies), capped at Value2.
// GainNpTargetPassiveIndividuality:1 is a boolean flag meaning "use passive
// individuality filter" — the faction filter (Illya, Sakura series, etc.) is
// not resolvable from trimmed servant data. We count ALL living servants and
// cap at Value2, which gives the correct maximum for a full faction team.
// Used by: Kazuradrop (Sakura-type), Kurohime, Miyu (Illya-type).
// svals: { Value: chargePerAlly (× 0.01%), Value2: max ally count cap }
registerEffect('gainNpTargetSum', (eng, eff, tgt) => {
  const svals        = Array.isArray(eff.svals) ? eff.svals[0] : eff.svals ?? {};
  const chargeEach   = (svals.Value ?? 0) / 100;
  const maxCount     = svals.Value2 ?? Infinity;
  if (!chargeEach) return;
  const count = Math.min(eng.servants.filter(s => !s.kill).length, maxCount);
  tgt.setNpgauge(chargeEach * count);
});

// Charges own NP proportional to count(matching individuality traits on living enemies).
// Used by: Elisabeth (Halloween/base), MHXX Alter.
// svals: { Value: chargePerTrait (× 0.01%), Value2: traitId to count on enemies }
registerEffect('gainNpIndividualSum', (eng, eff, tgt) => {
  const svals        = Array.isArray(eff.svals) ? eff.svals[0] : eff.svals ?? {};
  const chargeEach   = (svals.Value ?? 0) / 100;
  const traitId      = svals.Value2 ?? null;
  if (!chargeEach) return;
  let count = 0;
  for (const enemy of eng.enemies) {
    if (enemy.hp > 0) count += enemy.traits.filter(t => t === Number(traitId)).length;
  }
  tgt.setNpgauge(chargeEach * count);
});

// Charges own NP proportional to count(own active buffs, regardless of type).
// Used by: Kingprotea (stack-based), Van Gogh, Lady Avalon, Chloe.
// svals: { Value: chargePerBuff (× 0.01%) }
registerEffect('gainNpBuffIndividualSum', (eng, eff, tgt) => {
  const svals = Array.isArray(eff.svals) ? eff.svals[0] : eff.svals ?? {};
  const chargePerBuff = (svals.Value ?? 0) / 100;
  if (!chargePerBuff) return;
  tgt.setNpgauge(chargePerBuff * tgt.buffs.buffs.length);
});

registerEffect('gainMultiplyNp', (eng, eff, tgt) => tgt.setNpgauge(tgt.getNpgauge()));

// ── Skill cooldown ────────────────────────────────────────────────────────────

registerEffect('shortenSkill', (eng, eff, tgt) => {
  const val = (Array.isArray(eff.svals) ? eff.svals[0] : eff.svals)?.Value ?? 0;
  tgt.skills.decrementCooldowns(val);
});

// ── Field ─────────────────────────────────────────────────────────────────────

registerEffect('addFieldChangeToField', (eng, eff) => {
  eng.addField(eng.extractState(eff));
});

// ── Servant state ─────────────────────────────────────────────────────────────

// no-op: NP swap (Mash, Melusine form) handled per-servant via useNp / transforms.js
registerEffect('transformServant', () => {});

registerEffect('forceInstantDeath', (eng, eff, tgt) => { tgt.kill = true; });

registerEffect('instantDeath', (eng, eff, tgt) => {
  const rate   = (Array.isArray(eff.svals) ? eff.svals[0] : eff.svals)?.Rate ?? 0;
  const chance = rate / 1000;
  if (chance * (tgt.deathRate / 1000) > 0.5) tgt.setHp(tgt.hp);
});
