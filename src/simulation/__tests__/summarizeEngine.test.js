/**
 * Guards the pure summarizeEngine post-processing extracted from runSimulation
 * (shared with offline example-run seeding) — same shape, incl. FR-8 per_enemy.
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';
import { summarizeEngine } from '../RunAdapter';

test('summarizeEngine produces the saved-run summary shape from a finished engine', () => {
  // paladin_mash full clear.
  const team = [
    { collectionNo: 1, opts: { np: 3, initialCharge: 50, attack: 2000 } },
    { collectionNo: 16, opts: { np: 5, initialCharge: 20, attack: 2400, npUp: 0.80 } },
    { collectionNo: 150, opts: {} }, { collectionNo: 316, opts: {} }, { collectionNo: 314, opts: {} },
  ];
  const inputs = buildSimInputs({ servants: team, questId: 94095710, mysticCodeId: 210 });
  const engine = new Driver(inputs).run('a b1 f g h i1 4 5 # x31 d e1 g1 i1 4 # b f1 j 4 #');
  const summary = summarizeEngine(engine);

  expect(summary.success).toBe(true);
  expect(summary.quest_cleared).toBe(true);
  const waves = summary.stats.waves;
  expect(Object.keys(waves)).toHaveLength(3);
  for (const w of Object.values(waves)) {
    expect(w).toMatchObject({ hp_required: expect.any(Number), outcome: expect.any(String) });
    expect(Array.isArray(w.per_enemy)).toBe(true);
    expect(w.per_enemy[0]).toMatchObject({ index: 0, name: expect.any(String), damage_taken: expect.any(Number) });
  }
  expect(summary.stats.overall_clear_probability).toBe(1);
});
