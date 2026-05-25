/**
 * FR-9: divergence detection between a stored saved-run summary and a re-sim.
 */
import { reconcileWaveResults } from '../RunAdapter';

const wave = (outcome, dmg, perEnemy) => ({
  outcome, damage_at_10: dmg,
  ...(perEnemy ? { per_enemy: perEnemy } : {}),
});

describe('FR-9 reconcileWaveResults', () => {
  test('identical summaries do not diverge', () => {
    const w = { wave1: wave('guaranteed', 100000) };
    expect(reconcileWaveResults(w, w).diverged).toBe(false);
  });

  test('small damage drift within tolerance is not a divergence', () => {
    const a = { wave1: wave('guaranteed', 100000) };
    const b = { wave1: wave('guaranteed', 100500) }; // +0.5%
    expect(reconcileWaveResults(a, b).diverged).toBe(false);
  });

  test('outcome change is a divergence', () => {
    const a = { wave1: wave('guaranteed', 100000) };
    const b = { wave1: wave('rng', 100000) };
    const r = reconcileWaveResults(a, b);
    expect(r.diverged).toBe(true);
    expect(r.diffs.wave1.field).toBe('outcome');
  });

  test('damage drift beyond tolerance is a divergence', () => {
    const a = { wave1: wave('guaranteed', 100000) };
    const b = { wave1: wave('guaranteed', 130000) }; // +30%
    const r = reconcileWaveResults(a, b);
    expect(r.diverged).toBe(true);
    expect(r.diffs.wave1.field).toBe('damage_at_10');
  });

  test('per-enemy damage drift is caught (FR-8 granular)', () => {
    const pe = (d) => [{ index: 0, damage_taken: d }];
    const a = { wave1: wave('guaranteed', 100000, pe(50000)) };
    const b = { wave1: wave('guaranteed', 100000, pe(70000)) };
    const r = reconcileWaveResults(a, b);
    expect(r.diverged).toBe(true);
    expect(r.diffs.wave1.field).toBe('per_enemy[0].damage_taken');
  });

  test('a missing wave on either side diverges', () => {
    const a = { wave1: wave('guaranteed', 1), wave2: wave('guaranteed', 1) };
    const b = { wave1: wave('guaranteed', 1) };
    expect(reconcileWaveResults(a, b).diverged).toBe(true);
  });
});
