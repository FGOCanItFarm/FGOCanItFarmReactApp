/**
 * FR-9 round-trip: a re-simulation of the same inputs must reconcile as a MATCH
 * against the stored summary, and genuine drift must be caught. Exercises the
 * deterministic core the saved-run feature relies on (summarizeEngine →
 * reconcileWaveResults) against REAL engine output — the DB reconstruction in
 * resimulateSavedRun is verified separately against the live database.
 *
 * Acceptance (spec §7): "Saved run stores token+summary; re-sim reproduces it;
 * divergence offers a bug report."
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';
import { summarizeEngine, reconcileWaveResults } from '../RunAdapter';

// paladin_mash full clear (same inputs as summarizeEngine.test.js): 3 waves,
// per_enemy populated, deterministic.
const TEAM = [
  { collectionNo: 1,   opts: { np: 3, initialCharge: 50, attack: 2000 } },
  { collectionNo: 16,  opts: { np: 5, initialCharge: 20, attack: 2400, npUp: 0.80 } },
  { collectionNo: 150, opts: {} },
  { collectionNo: 316, opts: {} },
  { collectionNo: 314, opts: {} },
];
const QUEST_ID = 94095710;
const MC_ID = 210;
const TOKENS = 'a b1 f g h i1 4 5 # x31 d e1 g1 i1 4 # b f1 j 4 #';

const summarize = () => {
  const inputs = buildSimInputs({ servants: TEAM, questId: QUEST_ID, mysticCodeId: MC_ID });
  return summarizeEngine(new Driver(inputs).run(TOKENS));
};

// Engine wave keys are numeric strings ("1","2","3"); the spec doc's "wave1" is
// illustrative. Resolve the first wave key dynamically.
const firstWaveKey = (waves) => Object.keys(waves)[0];

describe('FR-9 round-trip — re-sim reproduces the stored summary', () => {
  test('a re-sim of identical inputs reconciles as a match (no false divergence)', () => {
    const stored = summarize();
    const fresh = summarize();
    const waves = stored.stats.waves;

    // Sanity: a real multi-wave clear with FR-8 per_enemy data on the path.
    expect(stored.quest_cleared).toBe(true);
    expect(Object.keys(waves).length).toBeGreaterThan(1);
    expect(waves[firstWaveKey(waves)].per_enemy.length).toBeGreaterThan(0);

    const { diverged, diffs } = reconcileWaveResults(waves, fresh.stats.waves);
    expect(diffs).toEqual({});
    expect(diverged).toBe(false);
  });
});

describe('FR-9 round-trip — drift is caught on real summary shape', () => {
  const clone = (o) => JSON.parse(JSON.stringify(o));

  test('a damage drop past tolerance diverges on damage_at_10', () => {
    const stored = summarize().stats.waves;
    const w = firstWaveKey(stored);
    const fresh = clone(stored);
    fresh[w].damage_at_10 *= 0.5; // -50%, well past the 1% tolerance

    const { diverged, diffs } = reconcileWaveResults(stored, fresh);
    expect(diverged).toBe(true);
    expect(diffs[w].field).toBe('damage_at_10');
  });

  test('a flipped outcome diverges on outcome', () => {
    const stored = summarize().stats.waves;
    const w = firstWaveKey(stored);
    const fresh = clone(stored);
    fresh[w].outcome = fresh[w].outcome === 'guaranteed' ? 'impossible' : 'guaranteed';

    const { diverged, diffs } = reconcileWaveResults(stored, fresh);
    expect(diverged).toBe(true);
    expect(diffs[w].field).toBe('outcome');
  });

  test('a per-enemy damage drift diverges on that enemy (FR-8 granular)', () => {
    const stored = summarize().stats.waves;
    const w = firstWaveKey(stored);
    const fresh = clone(stored);
    fresh[w].per_enemy[0].damage_taken *= 0.5;

    const { diverged, diffs } = reconcileWaveResults(stored, fresh);
    expect(diverged).toBe(true);
    expect(diffs[w].field).toBe('per_enemy[0].damage_taken');
  });
});
