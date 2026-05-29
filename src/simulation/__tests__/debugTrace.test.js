/**
 * Verbose runtime trace (result.debug): wave rosters + per-NP damage breakdowns,
 * generated every run for debugging / bug reports. MUST stay out of stats.waves
 * (the only thing submit_run persists to Supabase).
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';
import { summarizeEngine } from '../RunAdapter';

const run = () => {
  const inputs = buildSimInputs({
    servants: [
      { collectionNo: 1, opts: { np: 3, initialCharge: 50, attack: 2000 } },
      { collectionNo: 16, opts: { np: 5, initialCharge: 20, attack: 2400, npUp: 0.80 } },
      { collectionNo: 150, opts: {} }, { collectionNo: 316, opts: {} }, { collectionNo: 314, opts: {} },
    ],
    questId: 94095710, mysticCodeId: 210,
  });
  return summarizeEngine(new Driver(inputs).run('a b1 f g h i1 4 5 # x31 d e1 g1 i1 4 # b f1 j 4 #'));
};

test('debug trace is generated with wave rosters and NP breakdowns', () => {
  const { debug } = run();
  expect(Array.isArray(debug)).toBe(true);

  const waveEvents = debug.filter(e => e.type === 'wave');
  const npEvents = debug.filter(e => e.type === 'np');
  expect(waveEvents.length).toBeGreaterThan(0);
  expect(npEvents.length).toBeGreaterThan(0);

  // Wave roster carries class / attribute / traits (not in the persisted summary).
  expect(waveEvents[0].enemies[0]).toMatchObject({
    name: expect.any(String), className: expect.any(String), traits: expect.any(Array),
  });
  // NP entry carries the full multiplier breakdown + per-hit + buffs.
  const np = npEvents[0];
  expect(np.breakdown).toMatchObject({ baseAtk: expect.any(Number), npMult: expect.any(Number), classAdv: expect.any(Number) });
  expect(Array.isArray(np.perHit)).toBe(true);
  expect(Array.isArray(np.activeBuffs)).toBe(true);
});

test('trace fields are NOT inside stats.waves (never persisted)', () => {
  const { stats } = run();
  const persisted = JSON.stringify(stats.waves);
  expect(persisted).not.toContain('activeBuffs');
  expect(persisted).not.toContain('breakdown');
  expect(persisted).not.toContain('perHit');
});
