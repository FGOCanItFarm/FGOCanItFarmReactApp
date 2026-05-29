/**
 * FR-5 Phase D: real-data regression matrix.
 *
 * Runs the engine against every real servant fixture × a small fixed set of
 * representative quests + command strings, snapshots the wave damage output.
 * Future engine changes show up as snapshot diffs that need owner sign-off.
 *
 * Ground truth: current engine output (first run records, future runs diff).
 * Explicit ground-truth from external sources (wiki/calc) is NOT introduced —
 * the baseline is what the engine produces today.
 *
 * Command strings are chosen to exercise each servant's signature mechanic
 * once per relevant transform / chooser class:
 *   - Default NP fire: '4'
 *   - Mash Holy Sword chain: '4 b 4'  (NP → S2 while loaded → NP again)
 *   - Kazuradrop class-copy: 'c~1 4'  (S3 on enemy → NP)
 *   - Space Ishtar / Emiya NP chooser: '4' (default card selection)
 *   - BB Dubai choice: 'c[Ch2A] 4' (choose option A, then NP)
 *
 * Jest snapshots are stored in __snapshots__/realDataMatrix.test.js.snap.
 * Run `npx react-scripts test realDataMatrix -- -u` to update intentionally.
 */
import { Driver } from '../Driver';
import { buildSimInputs } from '../__fixtures__/realData';

// ── fixtures to exercise ──────────────────────────────────────────────────────
// [collectionNo, description, commandString, questId, opts?]

const MATRIX = [
  // ── standard NP fire ────────────────────────────────────────────────────────
  [101,  'Rama (Saber) NP1',              '4',    94089601, { np: 1 }],
  [108,  'Altria (Lancer) NP1',           '4',    94095710, { np: 1 }],
  [161,  'Hijikata NP1 (damageNpHpRatio)','4',    94089601, { np: 1 }],
  [248,  'Aśvatthāman NP5',              '4',    94089601, { np: 5 }],
  [66,   'Anne B&M NP1',                  '4',    94089601, { np: 1 }],
  [167,  'Kiara NP1 (classRelation)',     '4',    94100501, { np: 1 }],
  [239,  'Kama NP1 (classRelation)',      '4',    94089601, { np: 1 }],

  // ── SE-scaling NPs ───────────────────────────────────────────────────────────
  [61,   'Elisabeth Halloween NP1',       '4',    94100501, { np: 1 }],
  [57,   'Cu Chulainn (Caster) NP3',      '4',    94089601, { np: 3 }],

  // ── previously-zero-damage NP funcTypes (FR-5 backlog) ───────────────────────
  [257,  'Bartholomew Roberts NP1 (damageNpRare)',                '4', 94089601, { np: 1 }],
  [417,  'Ereshkigal NP1 (damageNpBattlePointPhase)',             '4', 94089601, { np: 1 }],
  [423,  'MHXX Alter NP1 (damageNpAndOrCheckIndividuality)',      '4', 94089601, { np: 1 }],

  // ── Mash Holy Sword chain ────────────────────────────────────────────────────
  [1,    'Mash: NP→S2→NP (Holy Sword)',   '4 b 4', 94089601, { np: 1, initialCharge: 100 }],

  // ── Kazuradrop class-copy ────────────────────────────────────────────────────
  [426,  'Kazuradrop: S3~enemy1 then NP', 'c~1 4', 94089601, { initialCharge: 100 }],

  // ── NP-choice servants ───────────────────────────────────────────────────────
  [268,  'Space Ishtar NP1 (default)',     '4',    94100501, { np: 1 }],
  [421,  'BB Dubai NP1 (default)',         '4',    94100501, { np: 1 }],

  // ── Multi-wave full-clear sequences ─────────────────────────────────────────
  [300,  'Arash w1 die-sub',              '4 #',  94095710, { np: 1 }],
];

// ── helper ───────────────────────────────────────────────────────────────────

function runCase(cn, cmd, questId, opts = {}) {
  const inputs = buildSimInputs({
    servants: [{ collectionNo: cn, opts: { initialCharge: 100, ...opts } }],
    questId,
  });
  const driver = new Driver(inputs);
  const engine = driver.run(cmd);
  if (!engine) return null;

  // Normalise to a stable snapshot shape (drop floating-point noise)
  return Object.fromEntries(
    Object.entries(engine.waveStats).map(([w, ws]) => [
      w,
      {
        damageDealt: Math.round(ws.damageDealt),
        hpRequired:  ws.hpRequired,
        cleared:     ws.damageDealt >= ws.hpRequired,
      },
    ])
  );
}

// ── matrix ───────────────────────────────────────────────────────────────────

describe.each(MATRIX)(
  'cn=%i — %s',
  (cn, _desc, cmd, questId, opts) => {
    test('wave damage snapshot', () => {
      const result = runCase(cn, cmd, questId, opts);
      expect(result).toMatchSnapshot();
    });
  }
);
