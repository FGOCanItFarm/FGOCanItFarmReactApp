/**
 * Jest translations of the owner-provided Python engine tests
 * (traverse_api_input fixtures). Each runs the real Driver against committed
 * real Atlas blobs (src/simulation/__fixtures__/real/**) and asserts the
 * documented outcome. The Python harness `traverse_api_input(servants, mc_id,
 * quest_id, commands)` maps to: buildSimInputs(...) → new Driver(...) →
 * driver.run(commands.join(' ')).
 *
 * Python team dicts carry flat effect keys (attack, atkUp, np, npUp, append_5…);
 * toOpts() normalises them to the Servant constructor's opts shape (the same
 * mapping RunAdapter.prepareSimInputs applies to servantEffects).
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';

/** Map a Python team dict to { collectionNo, opts } for buildSimInputs. */
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
      append5:        !!(t.append5 ?? t.append_5 ?? false),
    },
  };
}

/** Mirror of the Python traverse_api_input: build inputs and run the engine. */
function traverseApiInput(team, mcId, questId, commands) {
  const inputs = buildSimInputs({
    servants: team.filter((t) => t.collectionNo).map(toServant),
    questId,
    mysticCodeId: mcId,
  });
  const driver = new Driver(inputs);
  const engine = driver.run(commands.join(' '));
  if (engine === false) {
    throw new Error('Simulation failed: invalid token sequence or skill error.');
  }
  return engine;
}

describe('traverse_api_input — real-data engine runs', () => {
  // test_implantable_stacking_debuff1: SE (Super Effective) via Roman trait, 2 waves
  test('implantable stacking debuff (314/314/280/316, MC 20, quest 94089601)', () => {
    const team = [
      { collectionNo: 314 },
      { collectionNo: 314 },
      { collectionNo: 280, attack: 2400, atkUp: 0.15, artsUp: 0.10, quickUp: 0.10, busterUp: 0.10, npUp: 0.90, initialCharge: 50, busterDamageUp: 0.20, quickDamageUp: 0.20, artsDamageUp: 0.20, append_5: true },
      { collectionNo: 316, attack: 200, atkUp: 0, artsUp: 0, artsDamageUp: 20, initialCharge: 0, append_5: false },
    ];
    const commands = ['b3', 'c3', 'e3', 'f3', 'i', 'a3', 'd3', '6', '#', 'h', 'i', 'g', 'j', 'x11', 'a', 'b3', 'c3', '6', '#'];
    expect(() => traverseApiInput(team, 20, 94089601, commands)).not.toThrow();
  });

  // test_traverse_api_input_runs_without_error
  test('runs without error (373/426/421/426, MC 20, quest 94095710)', () => {
    const team = [
      { collectionNo: 373 },
      { collectionNo: 426, attack: 2400, atkUp: 15, artsUp: 10, quickUp: 10, busterUp: 10, npUp: 10, initialCharge: 50, busterDamageUp: 20, quickDamageUp: 20, artsDamageUp: 20, append_5: true },
      { collectionNo: 421 },
      { collectionNo: 426, attack: 200, atkUp: 0, artsUp: 0, artsDamageUp: 20, initialCharge: 0, append_5: false },
    ];
    const commands = ['a', 'd', 'g1', 'h', 'b', 'c', '4', '#', 'e', 'f', 'i1', 'x23', 'g1', '5', '#', 'h', 'i1', '4', '#', 'Swap Servants', 'x14'];
    expect(() => traverseApiInput(team, 20, 94095710, commands)).not.toThrow();
  });

  // test_traverse_api_input_90starstar_saber_5x_advantage
  test('90** saber 5x advantage (461/314/314/316, MC 440, quest 94100501)', () => {
    const team = [
      { collectionNo: 461, attack: 2400, np: 5, atkUp: 10, artsUp: 10, quickUp: 10, busterUp: 10, npUp: 80, initialCharge: 20, busterDamageUp: 20, quickDamageUp: 20, artsDamageUp: 20 },
      { collectionNo: 314 },
      { collectionNo: 314 },
      { collectionNo: 316 },
    ];
    const commands = [
      'a', 'b', 'c', 'd1', 'e1', 'f1', 'g1', 'b', 'h1', 'i1', '4', '#',
      'a', 'x23', 'h1', 'g', '4', '#',
      'i1', 'k1', '4', '#',
    ];
    expect(() => traverseApiInput(team, 440, 94100501, commands)).not.toThrow();
  });

  // test_paladin_mash: Mash (Shielder) present + Arash (16) sacrifices, all waves clear
  test('paladin mash (1/16/150/316/314, MC 210, quest 94095710)', () => {
    const team = [
      { collectionNo: 1, attack: 2000, initialCharge: 50, np: 3 },
      { collectionNo: 16, lvl: 100, attack: 2400, initialCharge: 20, np: 5, npUp: 80, oc: 1 },
      { collectionNo: 150 },
      { collectionNo: 316 },
      { collectionNo: 314 },
    ];
    const commands = [
      'a', 'b1', 'f', 'g', 'h', 'i1', '4', '5', '#',
      'x31', 'd', 'e1', 'g1', 'i1', '4', '#',
      'b', 'f1', 'j', '4', '#',
    ];
    const engine = traverseApiInput(team, 210, 94095710, commands);

    const finalIds = engine.servants.map((s) => s.id);

    const paladinMash = engine.servants.find((s) => s.id === 1);
    expect(paladinMash).toBeDefined();
    expect((paladinMash.className || '').toLowerCase()).toBe('shielder');

    // All waves cleared (wave advanced past the last)
    expect(engine.wave).toBeGreaterThan(engine.totalWaves);

    // Arash (16) self-sacrificed and was removed from the party
    expect(finalIds).not.toContain(16);
  });
});
