/**
 * Derive the multiplicative damage factors from an FR-8 NP-trace entry
 * (BattleEngine._traceNp) for the dashboard's per-enemy contribution view.
 *
 * NP damage is the PRODUCT of these factors:
 *   base(ATK · NPmult · 0.23 · roll) × class × attribute × cardType × cardBuffs
 *   × ATK× × (NPdmg+power)× × superEffective
 * so a pie (additive parts of a whole) misleads. We expose each factor's
 * multiplier and its "drop if removed" weight (1 − 1/mult), which is honest for
 * a multiplicative model and drives a per-factor marginal bar.
 */
const CARD_NAME = { buster: 'Buster', arts: 'Arts', quick: 'Quick' };

export function damageFactors(entry) {
  const b = entry?.breakdown;
  if (!b) return { factors: [], base: 0, total: entry?.total ?? 0 };
  const card = CARD_NAME[entry.card] || 'Card';
  const factors = [
    ['Class',          b.classAdv ?? 1],
    ['Attribute',      b.attribute ?? 1],
    [`${card} card`,   b.card ?? 1],
    [`${card} buffs`,  1 + (b.cardMod ?? 0)],
    ['ATK up',         1 + (b.atkMod ?? 0)],
    ['NP dmg + power', 1 + (b.npDmgMod ?? 0) + (b.powerMod ?? 0)],
    ['Super-effective', b.superEffective ?? 1],
  ]
    .map(([label, mult]) => ({ label, mult, dropPct: 1 - 1 / mult }))
    // Drop neutral (×1) factors so the view only shows what actually moved damage.
    .filter((f) => Math.abs(f.mult - 1) > 1e-6);

  const base = (b.baseAtk ?? 0) * (b.npMult ?? 0) * 0.23 * (b.rollMultiplier ?? 1);
  return { factors, base, total: entry?.total ?? 0 };
}
