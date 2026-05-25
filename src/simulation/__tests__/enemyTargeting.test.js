/**
 * FR-4 enemy targeting: `4e2` / `6e2` fire an NP at an explicit (1-based) enemy,
 * `a~2` targets a skill at an enemy. Bare `4`/`6` keep the highest-HP default
 * (back-compat). Verified through the FR-8 per-enemy damage log.
 */
import { Driver } from '../Driver';
import { fixtures } from '../__fixtures__/regressionFixtures';

const normal = fixtures.find((f) => f.name === 'normal-farming').simInputs;

/** Which wave-1 enemy indices took NP damage. */
function damagedIndices(tokenString) {
  const engine = new Driver(normal).run(tokenString);
  expect(engine).not.toBe(false);
  return engine.waveStats[1].enemies
    .filter((e) => e.damageTaken > 0)
    .map((e) => e.index);
}

describe('FR-4 enemy targeting', () => {
  // Slot-3 servant ('6') has a single-target NP; all wave-1 enemies share HP, so
  // the highest-HP default resolves to index 0.
  test('bare NP targets the highest-HP enemy (index 0)', () => {
    expect(damagedIndices('6')).toEqual([0]);
  });

  test('"6e2" fires the slot-3 NP at enemy index 2 (1-based) → index 1', () => {
    expect(damagedIndices('6e2')).toEqual([1]);
  });

  test('"6e3" targets enemy index 3 → index 2', () => {
    expect(damagedIndices('6e3')).toEqual([2]);
  });

  test('out-of-range enemy target falls back to the highest-HP default', () => {
    expect(damagedIndices('6e9')).toEqual([0]);
  });

  test('existing tokens without a target are unchanged (back-compat)', () => {
    // AoE NP from slot 1 ('4') still hits every enemy.
    expect(damagedIndices('4')).toEqual([0, 1, 2]);
  });
});
