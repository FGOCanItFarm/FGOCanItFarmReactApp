#!/usr/bin/env node
/**
 * captureFixtures.js — enrich the engine regression suite with REAL game data.
 *
 * The hand-authored fixtures in src/simulation/__fixtures__/regressionFixtures.js
 * exercise the engine's code paths, but locking the behavior of REAL servants
 * (Aoko, Melusine, Mash, the form-changers) is stronger. This script reads a
 * manifest of known-good runs, fetches the matching servant / quest / mystic-code
 * `data` blobs from Supabase, assembles them into the same `simInputs` shape the
 * engine consumes, and writes:
 *
 *   src/simulation/__fixtures__/real/realFixtures.generated.json
 *
 * regressionFixtures.js auto-loads that file when present, so the captured runs
 * join the golden-snapshot suite with no further wiring. The file is gitignored
 * by default — commit it deliberately if you want the captured runs shared.
 *
 * USAGE:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/captureFixtures.js [path/to/manifest.json]
 *
 *   (SUPABASE_ANON_KEY works too if the read tables have an anon SELECT policy.)
 *   Defaults to scripts/fixtures.manifest.json. A starter manifest is written
 *   on first run if none exists.
 *
 * MANIFEST SHAPE (array of runs):
 *   [{
 *     "name": "ascle-castoria-90plus",
 *     "questId": 94086801,
 *     "mysticCodeId": 260,
 *     "servants": [
 *       { "collectionNo": 314, "opts": { "np": 1, "initialCharge": 50 } },
 *       { "collectionNo": 284, "opts": { "np": 5, "append5": true } }
 *     ],
 *     "tokenStrings": ["a b c 4 #", "f e 5 #"]
 *   }]
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY;

const MANIFEST_PATH = process.argv[2] || path.join(__dirname, 'fixtures.manifest.json');
const OUT_DIR = path.join(__dirname, '..', 'src', 'simulation', '__fixtures__', 'real');
const OUT_FILE = path.join(OUT_DIR, 'realFixtures.generated.json');

const STARTER_MANIFEST = [
  {
    name: 'EXAMPLE-rename-me',
    questId: 0,
    mysticCodeId: null,
    servants: [{ collectionNo: 1, opts: { np: 1, initialCharge: 0 } }],
    tokenStrings: ['4 #'],
  },
];

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(STARTER_MANIFEST, null, 2));
    console.log(`No manifest found — wrote a starter to ${MANIFEST_PATH}. Edit it and re-run.`);
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL / SUPABASE_(SERVICE_ROLE|ANON)_KEY env vars.');
    process.exit(1);
  }

  // Lazy require so the script gives a clean error if deps aren't installed.
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const fixtures = [];

  for (const run of manifest) {
    const collectionNos = [...new Set(run.servants.map((s) => Number(s.collectionNo)))];

    const { data: servantRows, error: sErr } = await supabase
      .from('servants').select('collection_no, data').in('collection_no', collectionNos);
    if (sErr) throw new Error(`[${run.name}] servant fetch: ${sErr.message}`);
    const servantMap = new Map((servantRows || []).map((r) => [String(r.collection_no), r.data]));

    const { data: questRow, error: qErr } = await supabase
      .from('quests').select('data').eq('id', run.questId).maybeSingle();
    if (qErr) throw new Error(`[${run.name}] quest fetch: ${qErr.message}`);
    if (!questRow?.data) throw new Error(`[${run.name}] quest ${run.questId} not found`);

    let mcData = { name: '', shortName: '', maxLv: 10, skills: [] };
    if (run.mysticCodeId != null) {
      const { data: mcRow, error: mErr } = await supabase
        .from('mystic_codes').select('data').eq('id', run.mysticCodeId).maybeSingle();
      if (mErr) throw new Error(`[${run.name}] mystic code fetch: ${mErr.message}`);
      if (mcRow?.data) mcData = mcRow.data;
    }

    const servantDataList = run.servants.map((s) => {
      const rawData = servantMap.get(String(s.collectionNo));
      if (!rawData) throw new Error(`[${run.name}] servant ${s.collectionNo} not found`);
      return { rawData, opts: s.opts || {} };
    });

    fixtures.push({
      name: run.name,
      simInputs: { servantDataList, questData: questRow.data, mcData, damageMultiplier: 1.0 },
      tokenStrings: run.tokenStrings || [],
    });
    console.log(`captured: ${run.name} (${servantDataList.length} servants, quest ${run.questId})`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(fixtures, null, 2));
  console.log(`\nWrote ${fixtures.length} fixture(s) → ${OUT_FILE}`);
  console.log('Run `CI=true npm test -- regression -u` to (re)generate golden snapshots.');
}

main().catch((err) => { console.error(err); process.exit(1); });
