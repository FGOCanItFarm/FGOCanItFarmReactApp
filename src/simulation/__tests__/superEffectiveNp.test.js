/**
 * Guards the single-trait super-effective fix in BattleEngine._applyNpOddDamage.
 *
 * damageNpIndividual / damageNpStateIndividualFix carry a flat SE multiplier
 * (Correction/1000) vs a single Target trait. That bonus was read but never
 * applied (seMod only grew inside `if (npCorrId)`, null for the single-trait
 * form), so SE NPs silently dealt base damage.
 *
 * Kukulcan (373): NP is damageNpIndividual with Target=201, Correction=1500
 * (x1.5). The wave-1 enemy of quest 94095710 (金剛巨人像) is berserker + earth
 * and carries trait 201, so her NP must deal x1.5 the no-SE baseline.
 */
import { BattleEngine } from '../BattleEngine';
import { buildSimInputs } from '../__fixtures__/realData';

test('Kukulcan (373) NP applies the x1.5 single-trait SE vs trait 201', () => {
  const inputs = buildSimInputs({
    servants: [{ collectionNo: 373, opts: { initialCharge: 100 } }],
    questId: 94095710, mysticCodeId: 20,
  });
  const eng = new BattleEngine(inputs);
  const k = eng.servants[0];
  k.buffs.processServantBuffs();
  const target = eng.enemies[0];
  expect(target.traits).toContain(201);          // SE trait present
  expect(target.getClass()).toBe('berserker');   // foreigner -> berserker = x2 class

  // Recreate the no-SE baseline from the live formula components, then assert
  // the engine bills exactly the x1.5 SE on top.
  const [npMult] = k.nps.getNpDamageValues(k.stats.getOcLevel(), k.stats.getNpLevel(), null);
  target.buffs.processEnemyBuffs();
  const baseNoSe =
    k.stats.getBaseAtk() * npMult *
    1.5 /* buster cardDamageValue */ * (1 + k.stats.getBUp()) *
    eng._classMultiplier(k, target) * k.stats.getAttributeModifier(target) * 0.23 *
    (1 + k.stats.getAtkMod() - target.getDef()) *
    (1 + k.stats.getNpDamageMod() + k.stats.getPowerMod(target));

  eng.useNp(k);
  const dealt = eng.waveStats[1].damageDealt;

  expect(dealt).toBeCloseTo(baseNoSe * 1.5, 0);   // SE applied
  expect(dealt).toBeGreaterThan(baseNoSe * 1.49); // and it is NOT the no-SE value
});
