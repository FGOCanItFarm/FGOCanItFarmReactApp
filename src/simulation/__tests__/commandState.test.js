/**
 * Unit tests for the read-only CommandState introspection layer (FR-1).
 * Validates the re-run-to-cursor model, legality gating, snapshots, the append
 * fast-path == rebuild equivalence, first-invalid-token flagging, and humanize.
 */
import {
  buildEngineAt, legalNextTokens, engineSnapshot, humanizeToken,
  classifyToken, snapshotAt, clearMemo,
} from '../CommandState';
import { fixtures } from '../__fixtures__/regressionFixtures';

const normal = fixtures.find((f) => f.name === 'normal-farming');
const sim = normal.simInputs;

const opt = (opts, token) => opts.find((o) => o.token === token);

beforeEach(() => clearMemo());

describe('classifyToken', () => {
  test('parses each grammar form', () => {
    expect(classifyToken('a')).toMatchObject({ kind: 'skill', servantIdx: 0, skillIdx: 0, allySlot: null });
    expect(classifyToken('c1')).toMatchObject({ kind: 'skill', servantIdx: 0, skillIdx: 2, allySlot: 1 });
    expect(classifyToken('f3')).toMatchObject({ kind: 'skill', servantIdx: 1, skillIdx: 2, allySlot: 3 });
    expect(classifyToken('4')).toMatchObject({ kind: 'np', slot: 0 });
    expect(classifyToken('6')).toMatchObject({ kind: 'np', slot: 2 });
    expect(classifyToken('j')).toMatchObject({ kind: 'mc', mcIdx: 0, allySlot: null });
    expect(classifyToken('k1')).toMatchObject({ kind: 'mc', mcIdx: 1, allySlot: 1 });
    expect(classifyToken('x12')).toMatchObject({ kind: 'swap', front: 1, back: 2 });
    expect(classifyToken('#')).toMatchObject({ kind: 'endTurn' });
    expect(classifyToken('a[Ch1A]')).toMatchObject({ kind: 'choice', servantIdx: 0, skillIdx: 0, choiceId: 1, optionIdx: 0 });
    expect(classifyToken('a([Ch1B]2)')).toMatchObject({ kind: 'choice', optionIdx: 1, allySlot: 2 });
  });

  test('returns null for unknown tokens (no silent no-op)', () => {
    expect(classifyToken('z')).toBeNull();
    expect(classifyToken('99')).toBeNull();
    expect(classifyToken('')).toBeNull();
  });
});

describe('buildEngineAt', () => {
  test('empty prefix yields a fresh engine at wave 1', () => {
    const r = buildEngineAt(sim, []);
    expect(r.ok).toBe(true);
    expect(r.failedIndex).toBe(-1);
    expect(r.engine.wave).toBe(1);
  });

  test('valid prefix succeeds', () => {
    const r = buildEngineAt(sim, ['a', 'b1', '4']);
    expect(r.ok).toBe(true);
    expect(r.failedIndex).toBe(-1);
  });

  test('flags the FIRST invalid token and stops there', () => {
    // '4 4' — second NP fires on an empty gauge → fails at index 1.
    const r = buildEngineAt(sim, ['4', '4']);
    expect(r.ok).toBe(false);
    expect(r.failedIndex).toBe(1);
  });

  test('unknown token surfaces as a failure (not ignored)', () => {
    const r = buildEngineAt(sim, ['a', 'zz', '4']);
    expect(r.ok).toBe(false);
    expect(r.failedIndex).toBe(1);
  });

  test('append fast-path produces the same state as a full rebuild', () => {
    const tokens = ['a', 'b1', '4', '#'];
    // Incremental append (live engine kept, one executeToken per step).
    let prev = buildEngineAt(sim, []);
    for (let i = 1; i <= tokens.length; i++) {
      prev = buildEngineAt(sim, tokens.slice(0, i), prev);
    }
    // Independent full rebuild from scratch.
    const rebuilt = buildEngineAt(sim, tokens);
    expect(engineSnapshot(prev.engine)).toEqual(engineSnapshot(rebuilt.engine));
    expect(prev.engine.waveStats).toEqual(rebuilt.engine.waveStats);
  });
});

describe('legalNextTokens', () => {
  test('NP is legal iff gauge >= 99%; greyed with a reason otherwise', () => {
    const start = legalNextTokens(buildEngineAt(sim, []).engine);
    expect(opt(start, '4').available).toBe(true); // initialCharge 100

    const afterNp = legalNextTokens(buildEngineAt(sim, ['4']).engine);
    const np1 = opt(afterNp, '4');
    expect(np1.available).toBe(false);
    expect(np1.reason).toMatch(/^NP \d+%$/);
  });

  test('a used skill greys the same turn with a cooldown reason', () => {
    const after = legalNextTokens(buildEngineAt(sim, ['a']).engine);
    const a = opt(after, 'a');
    expect(a.available).toBe(false);
    expect(a.reason).toMatch(/^CD \d+t$/);
    // sibling skills remain available
    expect(opt(after, 'b').available).toBe(true);
  });

  test('End Turn is legal only when all wave enemies are dead', () => {
    expect(opt(legalNextTokens(buildEngineAt(sim, []).engine), '#').available).toBe(false);
    expect(opt(legalNextTokens(buildEngineAt(sim, ['4']).engine), '#').available).toBe(true);
  });

  test('swaps appear only when a backline exists', () => {
    const start = legalNextTokens(buildEngineAt(sim, []).engine);
    expect(opt(start, 'x31')).toBeTruthy(); // 4 servants → front3 ↔ back1 valid
  });

  test('skill target classes are derived from funcTargetType', () => {
    const start = legalNextTokens(buildEngineAt(sim, []).engine);
    expect(opt(start, 'a').targetClass).toBe('self');     // self ATK
    expect(opt(start, 'b').targetClass).toBe('ally');      // ptOne charge
    expect(opt(start, 'c').targetClass).toBe('team');      // ptAll arts
    expect(opt(start, '4').targetClass).toBe('enemyAll');  // AoE NP
    expect(opt(start, '6').targetClass).toBe('enemyOne');  // ST NP
  });
});

describe('engineSnapshot', () => {
  test('captures front/back/enemies/wave shape', () => {
    const snap = engineSnapshot(buildEngineAt(sim, []).engine);
    expect(snap.front).toHaveLength(3);
    expect(snap.back).toHaveLength(1);
    expect(snap.enemies).toHaveLength(3);
    expect(snap.wave).toBe(1);
    expect(snap.totalWaves).toBe(3);
    expect(snap.cleared).toBe(false);
    expect(snap.front[0]).toMatchObject({ slot: 0, collectionNo: 1001, npGauge: 100 });
    expect(snap.front[0].cooldowns).toEqual([0, 0, 0]);
    expect(snap.enemies[0]).toMatchObject({ index: 1, maxHp: 1500 });
  });

  test('reflects post-NP state (gauge spent, wave damage)', () => {
    const snap = engineSnapshot(buildEngineAt(sim, ['4']).engine);
    expect(snap.cleared).toBe(true);          // wave 1 enemies dead
    expect(snap.front[0].npGauge).toBeLessThan(99);
  });

  test('peekSkill does NOT consume the Melusine first-use form (read-only)', () => {
    const mel = fixtures.find((f) => f.name === 'melusine-form-seam').simInputs;
    const r = buildEngineAt(mel, []);
    // Two snapshots in a row must be identical — snapshotting must not mutate.
    expect(engineSnapshot(r.engine)).toEqual(engineSnapshot(r.engine));
    expect(r.engine.servants[0].skills.melusineSkill).toBe(false);
  });
});

describe('humanizeToken', () => {
  test('produces readable labels using live servant names', () => {
    const eng = buildEngineAt(sim, []).engine;
    expect(humanizeToken('c1', eng)).toBe('S1 · Skill 3 → ally AoE Caster');
    expect(humanizeToken('b', eng)).toBe('S1 · Skill 2');
    expect(humanizeToken('4', eng)).toBe('S1 NP');
    expect(humanizeToken('#', eng)).toBe('End turn');
    expect(humanizeToken('x12', eng)).toBe('Swap front 1 ↔ back 2');
    expect(humanizeToken('a[Ch1A]', eng)).toBe('S1 · Skill 1 (choice A)');
    expect(humanizeToken('zz', eng)).toBe('Invalid: zz');
  });

  test('accepts a serialised snapshot as the name source', () => {
    const snap = engineSnapshot(buildEngineAt(sim, []).engine);
    expect(humanizeToken('e1', snap)).toBe('S2 · Skill 2 → ally AoE Caster');
  });
});

describe('snapshotAt memo', () => {
  test('same token string across different simInputs does not collide', () => {
    const aoko = fixtures.find((f) => f.name === 'aoko-transform').simInputs;
    const sNormal = snapshotAt(sim, ['4', '#']);
    const sAoko = snapshotAt(aoko, ['4', '#']);
    // Normal slot 0 stays collectionNo 1001; Aoko transforms to 4132.
    expect(sNormal.snapshot.front[0].collectionNo).toBe(1001);
    expect(sAoko.snapshot.front[0].collectionNo).toBe(4132);
  });
});

describe('Driver strict (FR-6) — unknown tokens fail the run', () => {
  const { Driver } = require('../Driver');

  test('Driver.run returns false on an unknown token mid-sequence', () => {
    const result = new Driver(sim).run('a Swap Servants b');
    expect(result).toBe(false);
  });

  test('Driver.run still succeeds on an all-valid sequence', () => {
    const result = new Driver(sim).run('a b c');
    expect(result).not.toBe(false);
  });
});
