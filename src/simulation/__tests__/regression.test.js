/**
 * Engine regression suite (spec §5, §7).
 *
 * Runs each fixture's known token strings through the real Driver and snapshots
 * the wave outcome. These golden snapshots are the differential safety net for
 * every later engine change: refactors (prepareSimInputs extraction, the
 * activeSkill/activeNp resolve seam) MUST reproduce identical snapshots.
 * Intentional behavior changes (choice-effect dispatch, transform fixes) update
 * snapshots deliberately via `jest -u` and are called out in the PR.
 */
import { Driver } from '../Driver';
import { fixtures } from '../__fixtures__/regressionFixtures';

/** Normalise an engine into a stable, serialisable outcome for snapshotting. */
function summarize(engine) {
  if (engine === false) return { ok: false };
  const waveStats = {};
  for (const [w, v] of Object.entries(engine.waveStats)) {
    waveStats[w] = { hpRequired: Math.round(v.hpRequired), damageDealt: Math.round(v.damageDealt) };
  }
  return {
    ok: true,
    wave: engine.wave,
    totalWaves: engine.totalWaves,
    questCleared: engine.questCleared,
    waveStats,
    servantsAtWaveEnd: engine.servantsAtWaveEnd,
  };
}

describe('engine regression (golden snapshots)', () => {
  for (const fx of fixtures) {
    describe(fx.name, () => {
      for (const tokenString of fx.tokenStrings) {
        test(`tokens: "${tokenString}"`, () => {
          const driver = new Driver(fx.simInputs);
          const engine = driver.run(tokenString);
          expect(summarize(engine)).toMatchSnapshot();
        });
      }
    });
  }
});
