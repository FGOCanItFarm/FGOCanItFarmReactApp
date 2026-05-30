/**
 * damageFactors derives the multiplicative factors from a real NP-trace entry,
 * and base × product(factor.mult) reconstructs the trace's total (the formula
 * is multiplicative), so the per-enemy breakdown is faithful.
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';
import { damageFactors } from '../damageBreakdown';

test('factors multiply back to the NP total (Lord Logres 90** wave 1)', () => {
  const team = [
    { collectionNo: 461, opts: { np: 5, initialCharge: 20, attack: 2400, atkUp: 0.10, artsUp: 0.10, quickUp: 0.10, busterUp: 0.10, npUp: 0.80, busterDamageUp: 0.20, quickDamageUp: 0.20, artsDamageUp: 0.20 } },
    { collectionNo: 314, opts: {} }, { collectionNo: 314, opts: {} }, { collectionNo: 316, opts: {} },
  ];
  const eng = new Driver(buildSimInputs({ servants: team, questId: 94100501, mysticCodeId: 440, damageMultiplier: 1.1 }))
    .run('a b c d1 e1 f1 g1 b h1 i1 4');
  const npHit = eng.trace.filter((e) => e.type === 'np').pop();
  expect(npHit).toBeTruthy();

  const { factors, base, total } = damageFactors(npHit);
  expect(factors.length).toBeGreaterThan(0);
  // Class is x2 for Saber->Lancer (no 5x on wave 1).
  expect(factors.find((f) => f.label === 'Class').mult).toBeCloseTo(2, 5);

  const product = factors.reduce((acc, f) => acc * f.mult, base);
  expect(product).toBeCloseTo(total, 0);          // multiplicative reconstruction
  expect(npHit.card).toBe('buster');
});

test('returns empty for a missing breakdown', () => {
  expect(damageFactors(null).factors).toEqual([]);
  expect(damageFactors({ total: 5 }).total).toBe(5);
});
