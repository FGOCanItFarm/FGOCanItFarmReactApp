/**
 * Jest translations of the owner-provided Python engine tests
 * (traverse_api_input fixtures), committed verbatim under
 * src/simulation/__fixtures__/real/**. Each assembles the Driver inputs and runs
 * the command string through the engine.
 *
 * Contract (matches the Python): traverse_api_input must not raise. Tests #1–#3
 * assert only that — Driver.run() may return false (a controlled abort) without
 * being a test failure, exactly as the Python returns a driver_state without
 * raising. test_paladin_mash additionally asserts the run fully clears.
 *
 * Team dicts use the Python's flat decimal effect keys (atkUp: 0.15 = 15%);
 * toServant() maps them to the Servant constructor opts. append_5 is deprecated
 * (the app now takes an explicit initialCharge) so it is intentionally ignored.
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';

function toServant(t) {
  return {
    collectionNo: t.collectionNo,
    opts: {
      np:             Number(t.np ?? t.npLevel ?? 1),
      initialCharge:  Number(t.initialCharge  ?? 0),
      attack:         Number(t.attack         ?? 0),
      atkUp:          Number(t.atkUp          ?? 0),
      artsUp:         Number(t.artsUp         ?? 0),
      quickUp:        Number(t.quickUp        ?? 0),
      busterUp:       Number(t.busterUp       ?? 0),
      npUp:           Number(t.npUp           ?? 0),
      busterDamageUp: Number(t.busterDamageUp ?? 0),
      quickDamageUp:  Number(t.quickDamageUp  ?? 0),
      artsDamageUp:   Number(t.artsDamageUp   ?? 0),
    },
  };
}

function runTokens(team, mcId, questId, commands) {
  const inputs = buildSimInputs({
    servants: team.filter((t) => t.collectionNo).map(toServant),
    questId,
    mysticCodeId: mcId,
  });
  return new Driver(inputs).run(commands.join(' '));
}

describe('traverse_api_input — real-data engine runs', () => {
  // test_implantable_stacking_debuff1: SE (Super Effective) via Roman trait, 2 waves
  test('implantable stacking debuff (314/314/280/316, MC 20, quest 94089601)', () => {
    const team = [
      { collectionNo: 314 },
      { collectionNo: 314 },
      { collectionNo: 280, attack: 2400, atkUp: 0.15, artsUp: 0.10, quickUp: 0.10, busterUp: 0.10, npUp: 0.90, initialCharge: 50, busterDamageUp: 0.20, quickDamageUp: 0.20, artsDamageUp: 0.20 },
      { collectionNo: 316, attack: 200, atkUp: 0, artsUp: 0, artsDamageUp: 0.20, initialCharge: 0 },
    ];
    const commands = ['b3', 'c3', 'e3', 'f3', 'i', 'a3', 'd3', '6', '#', 'h', 'i', 'g', 'j', 'x11', 'a', 'b3', 'c3', '6', '#'];
    expect(() => runTokens(team, 20, 94089601, commands)).not.toThrow();
  });

  // test_traverse_api_input_runs_without_error
  test('runs without error (373/426/421/426, MC 20, quest 94095710)', () => {
    const team = [
      { collectionNo: 373 },
      { collectionNo: 426, attack: 2400, atkUp: 0.15, artsUp: 0.10, quickUp: 0.10, busterUp: 0.10, npUp: 0.10, initialCharge: 50, busterDamageUp: 0.20, quickDamageUp: 0.20, artsDamageUp: 0.20 },
      { collectionNo: 421 },
      { collectionNo: 426, attack: 200, atkUp: 0, artsUp: 0, artsDamageUp: 0.20, initialCharge: 0 },
    ];
    const commands = ['a', 'd', 'g1', 'h', 'b', 'c', '4', '#', 'e', 'f', 'i1', 'x23', 'g1', '5', '#', 'h', 'i1', '4', '#', 'Swap Servants', 'x14'];
    expect(() => runTokens(team, 20, 94095710, commands)).not.toThrow();
  });

  // test_traverse_api_input_90starstar_saber_5x_advantage
  test('90** saber 5x advantage (461/314/314/316, MC 440, quest 94100501)', () => {
    const team = [
      { collectionNo: 461, attack: 2400, np: 5, atkUp: 0.10, artsUp: 0.10, quickUp: 0.10, busterUp: 0.10, npUp: 0.80, initialCharge: 20, busterDamageUp: 0.20, quickDamageUp: 0.20, artsDamageUp: 0.20 },
      { collectionNo: 314 },
      { collectionNo: 314 },
      { collectionNo: 316 },
    ];
    const commands = [
      'a', 'b', 'c', 'd1', 'e1', 'f1', 'g1', 'b', 'h1', 'i1', '4', '#',
      'a', 'x23', 'h1', 'g', '4', '#',
      'i1', 'k1', '4', '#',
    ];
    expect(() => runTokens(team, 440, 94100501, commands)).not.toThrow();
  });

  // test_paladin_mash: Mash (Shielder) present, all waves cleared, Arash (16) sacrificed.
  // Mash's NP swaps from the defensive Lord Chaldeas (Arts) to the offensive Holy
  // Sword (Buster) once she loads "聖剣装填" by firing her NP — see BattleEngine.useNp.
  test('paladin mash (1/16/150/316/314, MC 210, quest 94095710)', () => {
    const team = [
      { collectionNo: 1, attack: 2000, initialCharge: 50, np: 3 },
      { collectionNo: 16, attack: 2400, initialCharge: 20, np: 5, npUp: 0.80 },
      { collectionNo: 150 },
      { collectionNo: 316 },
      { collectionNo: 314 },
    ];
    const commands = [
      'a', 'b1', 'f', 'g', 'h', 'i1', '4', '5', '#',
      'x31', 'd', 'e1', 'g1', 'i1', '4', '#',
      'b', 'f1', 'j', '4', '#',
    ];
    const engine = runTokens(team, 210, 94095710, commands);
    expect(engine).not.toBe(false);

    const paladinMash = engine.servants.find((s) => s.id === 1);
    expect(paladinMash).toBeDefined();
    expect((paladinMash.className || '').toLowerCase()).toBe('shielder');

    // All waves cleared (the JS engine flags this via questCleared on the final
    // wave rather than incrementing wave past totalWaves like the Python harness).
    expect(engine.questCleared).toBe(true);

    // Arash (16) self-sacrificed and was removed from the party
    expect(engine.servants.map((s) => s.id)).not.toContain(16);
  });

  // FR-8: granular per-enemy / per-wave stats logging (reuses the paladin_mash
  // full clear so every wave is processed and every enemy is killed).
  test('granular per-enemy stats are logged (FR-8)', () => {
    const team = [
      { collectionNo: 1, attack: 2000, initialCharge: 50, np: 3 },
      { collectionNo: 16, attack: 2400, initialCharge: 20, np: 5, npUp: 0.80 },
      { collectionNo: 150 },
      { collectionNo: 316 },
      { collectionNo: 314 },
    ];
    const commands = [
      'a', 'b1', 'f', 'g', 'h', 'i1', '4', '5', '#',
      'x31', 'd', 'e1', 'g1', 'i1', '4', '#',
      'b', 'f1', 'j', '4', '#',
    ];
    const engine = runTokens(team, 210, 94095710, commands);
    expect(engine.questCleared).toBe(true);

    for (const wave of Object.values(engine.waveStats)) {
      // Per-enemy array is index-aligned to the wave's enemies.
      expect(Array.isArray(wave.enemies)).toBe(true);
      expect(wave.enemies.length).toBeGreaterThan(0);

      // Per-enemy damage sums to the wave aggregate.
      const sum = wave.enemies.reduce((s, e) => s + e.damageTaken, 0);
      expect(sum).toBeCloseTo(wave.damageDealt, 3);

      // A full clear means every enemy took at least its max HP (overkill).
      for (const e of wave.enemies) {
        expect(e).toMatchObject({ name: expect.any(String), maxHp: expect.any(Number) });
        expect(e.damageTaken).toBeGreaterThanOrEqual(e.maxHp);
      }
    }
  });
});
