/**
 * Kazuradrop (collectionNo 426) class passive 同属嫌悪 A ("Same-Kind Hatred").
 *
 * Atlas encodes this as 13 per-class `upDamage` rows + one Sakura-series row.
 * Each class row is double-gated:
 *   - `script.INDIVIDUALITIE.id` (e.g. 100=Saber): self must carry that class trait.
 *   - `tvals` / `ckOpIndv` (same id): target must carry that class trait.
 * The detail reads literally: "if self is [Saber] class, increase damage vs
 * [Saber] class." All 13 rows exist for her S3 class-change gimmick — only the
 * row matching her *current* class is meant to fire. The Sakura row has no
 * INDIVIDUALITIE — it always applies vs Sakura-series targets.
 *
 * Two historical bugs caused the whole passive to silently no-op:
 *   1. `Servant.applyPassiveBuffs` dropped `tvals`, `script` and
 *      `originalScript`, so the self-class gate was wiped and the buff applied
 *      unconditionally to anyone.
 *   2. `Buffs.processServantBuffs` only routed buffs to `powerMod` when the
 *      English name matched "STR Up" / "Strength Up"; the JP-only rows
 *      (Avenger / MoonCancer / AlterEgo / Pretender / Sakura) were dropped.
 *
 * Fix: propagate tvals + script through passive load, gate on buff `type ===
 * 'upDamage'`, and let the INDIVIDUALITIE check pass via the servant's own
 * traits (not just battle fields). Future class-change S3 will swap her class
 * trait (109 ↔ target class id) and the matching row activates.
 */
import { Servant } from '../Servant';
import { loadServant } from '../__fixtures__/realData';

const ALTEREGO_TRAIT = 109;
const SABER_TRAIT    = 100;
const SAKURA_TRAIT   = 2925;

function buildKazuradrop() {
  return new Servant(loadServant(426), { attack: 0 });
}

describe('Kazuradrop class passive — self-gated by current class', () => {
  test('AlterEgo (default) row fires vs AlterEgo enemy (+75%)', () => {
    const kazu = buildKazuradrop();
    expect(kazu.traits).toContain(ALTEREGO_TRAIT);
    kazu.buffs.processServantBuffs();
    expect(kazu.powerMod[ALTEREGO_TRAIT]).toBe(750);

    const alterEgoTarget = { traits: [ALTEREGO_TRAIT] };
    expect(kazu.stats.getPowerMod(alterEgoTarget)).toBeCloseTo(0.75, 5);
  });

  test('Saber row is suppressed — self is not Saber', () => {
    const kazu = buildKazuradrop();
    expect(kazu.traits).not.toContain(SABER_TRAIT);
    kazu.buffs.processServantBuffs();
    expect(kazu.powerMod[SABER_TRAIT]).toBeUndefined();

    const saberTarget = { traits: [SABER_TRAIT] };
    expect(kazu.stats.getPowerMod(saberTarget)).toBe(0);
  });

  test('Sakura-series row fires vs Sakura-series enemy (+30%, no self-class gate)', () => {
    const kazu = buildKazuradrop();
    kazu.buffs.processServantBuffs();
    expect(kazu.powerMod[SAKURA_TRAIT]).toBe(300);

    const sakuraTarget = { traits: [SAKURA_TRAIT] };
    expect(kazu.stats.getPowerMod(sakuraTarget)).toBeCloseTo(0.30, 5);
  });

  test('only the matching same-class row is active; the other 12 stay dormant', () => {
    const kazu = buildKazuradrop();
    kazu.buffs.processServantBuffs();
    const otherClassTraits = [100, 101, 102, 103, 104, 105, 106, 108, 110, 115, 117, 120];
    for (const tval of otherClassTraits) {
      expect(kazu.powerMod[tval]).toBeUndefined();
    }
  });

  test('class-change to Saber (swap 109→100) activates the Saber row', () => {
    const kazu = buildKazuradrop();
    // Simulate what S3 「月の蛹」 would do: drop the AlterEgo class trait, add Saber.
    kazu.traits = kazu.traits.filter((t) => t !== ALTEREGO_TRAIT).concat(SABER_TRAIT);
    kazu.buffs.processServantBuffs();

    expect(kazu.powerMod[SABER_TRAIT]).toBe(750);
    expect(kazu.powerMod[ALTEREGO_TRAIT]).toBeUndefined();
    expect(kazu.stats.getPowerMod({ traits: [SABER_TRAIT] })).toBeCloseTo(0.75, 5);
    expect(kazu.stats.getPowerMod({ traits: [ALTEREGO_TRAIT] })).toBe(0);
  });
});
