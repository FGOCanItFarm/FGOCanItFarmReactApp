/**
 * FR-10 sticky enemy focus (`@N`): selects the default single-target enemy for
 * subsequent bare NPs/skills. Per-action suffix (`6e3`) still overrides without
 * changing the focus; out-of-range / dead focus falls back to highest-HP; AoE
 * NPs ignore it. Verified through the FR-8 per-enemy damage log. Reuses the
 * synthetic `normal-farming` fixture (slot-3 single-target NP, 3 equal-HP enemies
 * → highest-HP default = index 0).
 */
import { Driver } from '../Driver';
import { fixtures } from '../__fixtures__/regressionFixtures';

const normal = fixtures.find((f) => f.name === 'normal-farming').simInputs;

function run(tokenString) {
  const engine = new Driver(normal).run(tokenString);
  expect(engine).not.toBe(false);
  return engine;
}
const damaged = (tok) => run(tok).waveStats[1].enemies.filter((e) => e.damageTaken > 0).map((e) => e.index);

describe('FR-10 @N sticky focus', () => {
  test('@2 directs a later bare NP to enemy 2 (→ index 1)', () => {
    expect(damaged('@2 6')).toEqual([1]);
  });

  test('@3 then bare NP hits index 2', () => {
    expect(damaged('@3 6')).toEqual([2]);
  });

  test('a per-action override (6e3) wins over the focus for that action', () => {
    expect(damaged('@2 6e3')).toEqual([2]);
  });

  test('@N is a selection, not a turn — it never aborts the run', () => {
    expect(run('@2').focusEnemyIdx).toBe(1);
  });

  test('out-of-range focus falls back to highest-HP (index 0)', () => {
    expect(damaged('@9 6')).toEqual([0]);
  });

  test('AoE NP ignores the focus (still hits every enemy)', () => {
    expect(damaged('@2 4')).toEqual([0, 1, 2]);
  });

  test('focus resets when the wave advances', () => {
    const eng = run('@2');
    expect(eng.focusEnemyIdx).toBe(1);
    eng.getNextWave();
    expect(eng.focusEnemyIdx).toBeNull();
  });
});
