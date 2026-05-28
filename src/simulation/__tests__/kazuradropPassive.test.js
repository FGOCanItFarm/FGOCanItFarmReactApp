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
import { Driver } from '../Driver';
import { loadServant, buildSimInputs } from '../__fixtures__/realData';

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

  // Simulates S3 「月の蛹」: push an overwriteBattleclass buff carrying the new
  // class so applyBattleClassOverride swaps className / classId / class-trait
  // at processServantBuffs time. Direct mutation of `traits` no longer works
  // because the override path now resets traits from _baseTraits each call.
  function classSwap(servant, className, classId, classTrait) {
    servant.buffs.addBuff({
      buff: 'クラス変化',
      type: 'overwriteBattleclass',
      targetClassName: className,
      targetClassId:   classId,
      targetClassTrait: classTrait,
      turns: 3,
      value: 0,
    });
  }

  test('class-change to Saber via overwriteBattleclass activates the Saber row', () => {
    const kazu = buildKazuradrop();
    classSwap(kazu, 'saber', 1, SABER_TRAIT);
    kazu.buffs.processServantBuffs();

    expect(kazu.className).toBe('saber');
    expect(kazu.traits).toContain(SABER_TRAIT);
    expect(kazu.traits).not.toContain(ALTEREGO_TRAIT);
    expect(kazu.powerMod[SABER_TRAIT]).toBe(750);
    expect(kazu.powerMod[ALTEREGO_TRAIT]).toBeUndefined();
    expect(kazu.stats.getPowerMod({ traits: [SABER_TRAIT] })).toBeCloseTo(0.75, 5);
    expect(kazu.stats.getPowerMod({ traits: [ALTEREGO_TRAIT] })).toBe(0);
  });

  test('override decays — class reverts and AlterEgo row reactivates', () => {
    const kazu = buildKazuradrop();
    classSwap(kazu, 'saber', 1, SABER_TRAIT);
    kazu.buffs.processServantBuffs();
    expect(kazu.className).toBe('saber');

    // Burn the buff's 3 turns to 0; decrementBuffs drops it.
    kazu.buffs.decrementBuffs();
    kazu.buffs.decrementBuffs();
    kazu.buffs.decrementBuffs();
    kazu.buffs.processServantBuffs();

    expect(kazu.className).toBe('alterEgo');
    expect(kazu.traits).toContain(ALTEREGO_TRAIT);
    expect(kazu.traits).not.toContain(SABER_TRAIT);
    expect(kazu.powerMod[ALTEREGO_TRAIT]).toBe(750);
    expect(kazu.powerMod[SABER_TRAIT]).toBeUndefined();
  });

  // Kazuradrop has 13 anti-class rows. Beast has no row (she cannot class-change
  // to Beast) and Shielder (107) likewise has no row — every other playable
  // class id should activate cleanly when swapped in via S3.
  describe.each([
    ['saber',      'saber',      1,  100],
    ['lancer',     'lancer',     2,  101],
    ['archer',     'archer',     3,  102],
    ['rider',      'rider',      4,  103],
    ['caster',     'caster',     5,  104],
    ['assassin',   'assassin',   6,  105],
    ['berserker',  'berserker',  7,  106],
    ['ruler',      'ruler',      9,  108],
    ['avenger',    'avenger',    11, 110],
    ['alterEgo',   'alterEgo',   10, 109],
    ['moonCancer', 'moonCancer', 23, 115],
    ['foreigner',  'foreigner',  25, 117],
    ['pretender',  'pretender',  28, 120],
  ])('class-change to %s', (_label, className, classId, classTrait) => {
    test('activates only that row; all others remain dormant', () => {
      const kazu = buildKazuradrop();
      classSwap(kazu, className, classId, classTrait);
      kazu.buffs.processServantBuffs();

      expect(kazu.className).toBe(className);
      expect(kazu.powerMod[classTrait]).toBe(750);
      expect(kazu.stats.getPowerMod({ traits: [classTrait] })).toBeCloseTo(0.75, 5);

      const everyOtherClass = [100, 101, 102, 103, 104, 105, 106, 108, 109, 110, 115, 117, 120]
        .filter((t) => t !== classTrait);
      for (const other of everyOtherClass) {
        expect(kazu.powerMod[other]).toBeUndefined();
      }
    });
  });
});

// End-to-end via the Driver: Kazuradrop S3 「月の蛹」 (`c~1` — third skill of slot
// 1, targeting enemy 1) on quest 94089601 whose first wave is all Assassins.
// The skill includes an `addState/overwriteBattleclass` function on self; the
// engine reads the pinned enemy's class, attaches it to the buff, and the next
// processServantBuffs swaps her className/classId/class-trait. Her anti-class
// passive then routes +75% into powerMod[105] (classAssassin).
describe('Kazuradrop S3 「月の蛹」 — overwriteBattleclass end-to-end', () => {
  test('targeting an Assassin enemy makes her an Assassin and arms the Assassin row', () => {
    const inputs = buildSimInputs({
      servants: [
        { collectionNo: 426, opts: { initialCharge: 100 } },
        { collectionNo: 314 },
        { collectionNo: 314 },
      ],
      questId: 94089601,
      mysticCodeId: 20,
    });
    const driver = new Driver(inputs);
    const engine = driver.run('c~1');
    expect(engine).not.toBe(false);

    const kazu = engine.servants[0];
    expect(kazu.id).toBe(426);

    // After S3 fires, an overwriteBattleclass buff carrying the Assassin enemy's
    // class is on her active list.
    const override = kazu.buffs.buffs.find(b => b.type === 'overwriteBattleclass');
    expect(override).toBeDefined();
    expect(override.targetClassName).toBe('assassin');
    expect(override.targetClassTrait).toBe(105);

    // The recompute swaps her effective class to Assassin.
    kazu.buffs.processServantBuffs();
    expect(kazu.className).toBe('assassin');
    expect(kazu.traits).toContain(105);
    expect(kazu.traits).not.toContain(ALTEREGO_TRAIT);

    // Same-class passive row now powers up vs Assassin targets.
    expect(kazu.powerMod[105]).toBe(750);
    expect(kazu.stats.getPowerMod({ traits: [105] })).toBeCloseTo(0.75, 5);
  });
});
