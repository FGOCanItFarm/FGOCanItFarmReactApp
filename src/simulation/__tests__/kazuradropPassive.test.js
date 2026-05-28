/**
 * Kazuradrop (collectionNo 426) class passive 同属嫌悪 A.
 *
 * Atlas encodes this passive as 13 per-class `upDamage` rows plus a Sakura-series
 * row, each gated by `tvals` (e.g. [100] = Saber, [2925] = Sakura-series). Two
 * historical bugs caused the entire passive to silently no-op:
 *
 *   1. `Servant.applyPassiveBuffs` hardcoded `tvals: []` when pushing each passive
 *      buff onto the active list, dropping the trait condition.
 *   2. `Buffs.processServantBuffs` only routed buffs into `powerMod` when the
 *      English name included "STR Up" / "Strength Up". The four JP-only rows
 *      (Avenger / MoonCancer / AlterEgo / Pretender) and the Sakura-series row
 *      (威力アップ〔サクラシリーズ系〕) were never matched.
 *
 * These tests pin the fix: tvals survive passive load, and powerMod resolves
 * +75% vs Saber and +30% vs Sakura-series targets.
 */
import { Servant } from '../Servant';
import { loadServant } from '../__fixtures__/realData';

const SABER_TRAIT  = 100;
const SAKURA_TRAIT = 2925;

function buildKazuradrop() {
  return new Servant(loadServant(426), { attack: 0 });
}

describe('Kazuradrop class passive — tval-gated power mods', () => {
  test('Saber-class enemy receives +75% damage (tval 100)', () => {
    const kazu = buildKazuradrop();
    kazu.buffs.processServantBuffs();
    expect(kazu.powerMod[SABER_TRAIT]).toBe(750);

    const saberTarget = { traits: [SABER_TRAIT] };
    expect(kazu.stats.getPowerMod(saberTarget)).toBeCloseTo(0.75, 5);
  });

  test('Sakura-series enemy receives +30% damage (tval 2925)', () => {
    const kazu = buildKazuradrop();
    kazu.buffs.processServantBuffs();
    expect(kazu.powerMod[SAKURA_TRAIT]).toBe(300);

    const sakuraTarget = { traits: [SAKURA_TRAIT] };
    expect(kazu.stats.getPowerMod(sakuraTarget)).toBeCloseTo(0.30, 5);
  });

  test('all 13 per-class anti-class entries are loaded', () => {
    const kazu = buildKazuradrop();
    kazu.buffs.processServantBuffs();
    // Saber, Archer, Lancer, Rider, Caster, Assassin, Berserker, Ruler,
    // Avenger, MoonCancer, AlterEgo, Foreigner, Pretender.
    const classTraits = [100, 101, 102, 103, 104, 105, 106, 108, 110, 115, 109, 117, 120];
    for (const tval of classTraits) {
      expect(kazu.powerMod[tval]).toBe(750);
    }
  });

  test('non-matching trait does not pick up the power mod', () => {
    const kazu = buildKazuradrop();
    kazu.buffs.processServantBuffs();
    const inert = { traits: [9999] };
    expect(kazu.stats.getPowerMod(inert)).toBe(0);
  });
});
