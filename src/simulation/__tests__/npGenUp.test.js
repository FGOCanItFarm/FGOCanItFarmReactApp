/**
 * User-input NP Gen Up (npGenUp, decimal) raises the NP gauge-gain rate
 * (npGainMod), distinct from NP Damage Up (npUp). Defaults to 0 (no change).
 */
import { Servant } from '../Servant';
import { loadServant } from '../__fixtures__/realData';

test('npGenUp adds to npGainMod; default leaves it at 1', () => {
  const base = new Servant(loadServant(461), {});
  base.buffs.processServantBuffs();
  expect(base.stats.getNpGainMod()).toBe(1);

  const boosted = new Servant(loadServant(461), { npGenUp: 0.5 });
  boosted.buffs.processServantBuffs();
  expect(boosted.stats.getNpGainMod()).toBeCloseTo(1.5, 5);
});

test('npGenUp is independent of npUp (NP damage)', () => {
  const s = new Servant(loadServant(461), { npUp: 0.8, npGenUp: 0.2 });
  s.buffs.processServantBuffs();
  expect(s.stats.getNpGainMod()).toBeCloseTo(1.2, 5);   // gauge gain
  expect(s.stats.getNpDamageMod()).toBeCloseTo(0.8, 5); // damage
});
