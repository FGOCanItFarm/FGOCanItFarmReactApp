/**
 * FR-3 (token resolution by target class) + FR-6 (edit/validate) builder controller.
 */
import {
  legalNextTokens, buildEngineAt, resolveToken, needsTarget, validateSequence, editOps,
} from '../CommandState';
import { fixtures } from '../__fixtures__/regressionFixtures';

const sim = fixtures.find((f) => f.name === 'normal-farming').simInputs;
const opt = (opts, token) => opts.find((o) => o.token === token);

describe('FR-3 resolveToken', () => {
  const start = legalNextTokens(buildEngineAt(sim, []).engine);

  test('self/team/none options fire immediately (base token)', () => {
    expect(resolveToken(opt(start, 'a'))).toBe('a');     // self
    expect(resolveToken(opt(start, 'c'))).toBe('c');     // ptAll → team
    expect(resolveToken(opt(start, '#'))).toBe('#');     // endTurn → none
  });

  test('enemyAll NP fires immediately', () => {
    expect(resolveToken(opt(start, '4'))).toBe('4');     // AoE NP
  });

  test('ally skill appends the ally slot', () => {
    expect(needsTarget(opt(start, 'b'))).toBe(true);     // ptOne charge
    expect(resolveToken(opt(start, 'b'), { allySlot: 2 })).toBe('b2');
  });

  test('enemyOne NP appends the enemy suffix (FR-4)', () => {
    const six = opt(start, '6');                          // ST NP
    expect(needsTarget(six)).toBe(true);
    expect(resolveToken(six, { enemyIndex: 2 })).toBe('6e2');
  });

  test('an unresolved target returns the base token (caller must pick)', () => {
    expect(resolveToken(opt(start, 'b'))).toBe('b');
  });
});

describe('FR-6 validateSequence + editOps', () => {
  test('a valid sequence reports no failure', () => {
    const v = validateSequence(sim, ['a', 'b1', '4']);
    expect(v.ok).toBe(true);
    expect(v.failedIndex).toBe(-1);
    expect(v.tokenStates.every((s) => s.valid)).toBe(true);
  });

  test('flags the first failing token and greys the rest', () => {
    // '4 4' — second NP fires on an empty gauge → fails at index 1.
    const v = validateSequence(sim, ['4', '4', '#']);
    expect(v.ok).toBe(false);
    expect(v.failedIndex).toBe(1);
    expect(v.tokenStates[0]).toMatchObject({ valid: true, failed: false });
    expect(v.tokenStates[1]).toMatchObject({ valid: false, failed: true });
    expect(v.tokenStates[2]).toMatchObject({ valid: false, failed: false }); // invalidated, not dropped
  });

  test('edit ops keep the array as the source of truth', () => {
    expect(editOps.append(['a'], 'b')).toEqual(['a', 'b']);
    expect(editOps.pop(['a', 'b'])).toEqual(['a']);
    expect(editOps.deleteAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
    expect(editOps.insertAt(['a', 'c'], 1, 'b')).toEqual(['a', 'b', 'c']);
    expect(editOps.replaceAt(['a', 'x', 'c'], 1, 'b')).toEqual(['a', 'b', 'c']);
    expect(editOps.clear(['a', 'b'])).toEqual([]);
  });
});
