/**
 * Step-through scrubber data: snapshotAt over command prefixes yields evolving
 * battle state, and the snapshot now carries active buffs (the observability the
 * CombatDashboard stepper renders). Memoisation is internal to CommandState.
 */
import { buildSimInputs } from '../__fixtures__/realData';
import { snapshotAt } from '../CommandState';

// Lord Logres (461) + Koyanskaya/Oberon on the 90** node. `b` = her S2 team ATK
// buff; `a` = S1 (per-turn charge passive). Mirrors the seeded run prefix.
const inputs = () => buildSimInputs({
  servants: [
    { collectionNo: 461, opts: { np: 5, initialCharge: 20, attack: 2400 } },
    { collectionNo: 314, opts: {} }, { collectionNo: 314, opts: {} }, { collectionNo: 316, opts: {} },
  ],
  questId: 94100501, mysticCodeId: 440,
});

const snap = (tokens) => snapshotAt(inputs(), tokens).snapshot;

test('every snapshot exposes a buffs array on allies and enemies', () => {
  const s = snap([]);
  expect(Array.isArray(s.front[0].buffs)).toBe(true);
  expect(Array.isArray(s.enemies[0].buffs)).toBe(true);
});

test('a team ATK-up skill (b) adds buffs that were absent at the start', () => {
  const before = snap([]);
  const after = snap(['b']);
  // Lord Logres carries class passives at start; the skill adds more named buffs.
  expect(after.front[0].buffs.length).toBeGreaterThan(before.front[0].buffs.length);
  expect(after.front[0].buffs.some((bf) => /ATK Up/i.test(bf.name))).toBe(true);
});

test('prefixes are distinct snapshots (NP gauge / buffs evolve as you step)', () => {
  const s0 = snap([]);
  const s2 = snap(['a', 'b']);
  const changed =
    s0.front[0].npGauge !== s2.front[0].npGauge ||
    JSON.stringify(s0.front[0].buffs) !== JSON.stringify(s2.front[0].buffs);
  expect(changed).toBe(true);
});
