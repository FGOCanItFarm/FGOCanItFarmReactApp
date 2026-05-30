/**
 * Guards two NP-gauge bugs (90** Lord Logres run):
 *  A) Per-turn NP charge (Lord Logres S1, "NP Gain Each Turn") is applied at the
 *     START of the next wave, NOT at wave end — so the captured "NP gauge at wave
 *     end" is pre-regen (LL fires -> 0, +20% party -> 20 at wave-1 end, NOT 70).
 *  B) Party NP charge / buffs (ptAll/ptOther) hit the FRONTLINE only — a backline
 *     servant (Oberon, benched in wave 1) must not gain the wave-1 NP party
 *     charge, so after swap-in it ends wave 2 at 40, not 60.
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';

const team = [
  { collectionNo: 461, opts: { np: 5, initialCharge: 20, attack: 2400, atkUp: 0.10, artsUp: 0.10, quickUp: 0.10, busterUp: 0.10, npUp: 0.80, busterDamageUp: 0.20, quickDamageUp: 0.20, artsDamageUp: 0.20 } },
  { collectionNo: 314, opts: {} }, { collectionNo: 314, opts: {} }, { collectionNo: 316, opts: {} },
];
const gauges = () => new Driver(buildSimInputs({ servants: team, questId: 94100501, mysticCodeId: 440, damageMultiplier: 1.1 }))
  .run('a b c d1 e1 f1 g1 b h1 i1 4 # a x31 h1 g 4 # i1 k1 4 #').servantsAtWaveEnd;

test('wave-end gauge is pre per-turn-regen (LL = 20, not 70, at wave-1 end)', () => {
  const g = gauges();
  expect(g['1'][0]).toMatchObject({ collectionNo: 461, npGauge: 20 });
  expect(g['1'][1].npGauge).toBe(20); // Koyanskaya frontline: +20% party charge
  expect(g['1'][2].npGauge).toBe(20);
});

test('party charge does not reach the backline (Oberon ends wave 2 at 40, not 60)', () => {
  const g = gauges();
  expect(g['2'][2]).toMatchObject({ collectionNo: 316, npGauge: 40 });
  expect(g['2'][1]).toMatchObject({ collectionNo: 314, npGauge: 60 }); // kept Koyanskaya
});
