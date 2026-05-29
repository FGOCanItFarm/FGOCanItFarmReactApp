/**
 * FR-5 backlog: silent zero-damage NPs.
 *
 * Three damage funcTypes were absent from BOTH the NP damage dispatch list in
 * BattleEngine.useNp and from NP.getNpDamageValues, so the matching servants'
 * NPs fell through to the no-op `else` branch and dealt 0 damage:
 *
 *   - damageNpRare                   → Bartholomew Roberts (cn=257), enemyAll
 *   - damageNpBattlePointPhase       → Ereshkigal (cn=417), enemyAll
 *   - damageNpAndOrCheckIndividuality → MHXX Alter (cn=423), single enemy
 *
 * Fix mirrors the C-1 damageNpHpratioLow approach: each is billed at the plain
 * Value/1000 baseline (situational Correction bonuses intentionally omitted —
 * conservative under-bill). This test guards against the 0-damage bug returning.
 */
import { BattleEngine } from '../BattleEngine';
import { buildSimInputs } from '../__fixtures__/realData';

function makeEngine(servants, questId) {
  return new BattleEngine(buildSimInputs({ servants, questId }));
}

const CASES = [
  ['Bartholomew Roberts (cn=257) — damageNpRare', 257],
  ['Ereshkigal (cn=417) — damageNpBattlePointPhase', 417],
  ['MHXX Alter (cn=423) — damageNpAndOrCheckIndividuality', 423],
];

describe('FR-5 — NPs that previously dealt 0 damage now deal real damage', () => {
  test.each(CASES)('%s', (_label, collectionNo) => {
    const eng = makeEngine(
      [{ collectionNo, opts: { initialCharge: 100, np: 1 } }],
      94089601,
    );
    const servant = eng.servants[0];
    servant.buffs.processServantBuffs();
    expect(servant.stats.getBaseAtk()).toBeGreaterThan(0);

    eng.useNp(servant);
    // A NP1 baseline-multiplier NP into a 90++ wave clears five figures of damage;
    // before the fix this was exactly 0.
    expect(eng.waveStats[1].damageDealt).toBeGreaterThan(10000);
  });
});
