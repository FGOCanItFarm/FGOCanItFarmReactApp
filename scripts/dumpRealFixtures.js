#!/usr/bin/env node
/**
 * dumpRealFixtures.js — write per-id REAL game-data fixtures from Supabase.
 *
 * Unlike captureFixtures.js (which bundles whole runs into one generated file),
 * this writes the individual blobs that __fixtures__/realData.js loads on demand:
 *
 *   src/simulation/__fixtures__/real/servants/<collectionNo>.json
 *   src/simulation/__fixtures__/real/quests/<questId>.json
 *   src/simulation/__fixtures__/real/mysticCodes/<mcId>.json
 *
 * Each file is the raw `data` JSONB column — exactly the shape the engine
 * consumes (loadServant/loadQuest/loadMysticCode pass it straight to Driver).
 * Run locally so the (large) blobs never travel through a model context.
 *
 * USAGE (remote/Supabase):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/dumpRealFixtures.js
 *   (SUPABASE_ANON_KEY also works — the read tables have an anon SELECT policy.)
 *
 * USAGE (local table dumps — no network):
 *   node scripts/dumpRealFixtures.js --local
 *   Reads src/data/{servants,quests,mystic_codes}_rows.json (arrays of rows with
 *   the id column + `data` blob, exactly as exported from Supabase).
 *
 *   Defaults to the ids the apiInputTests.test.js suite needs. Override with:
 *     node scripts/dumpRealFixtures.js --servants 1,16,150 --quests 94095710 --mcs 210
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY;

// Defaults: everything apiInputTests.test.js loads.
const DEFAULTS = {
  servants: [1, 16, 150, 280, 314, 316, 373, 421, 426, 461],
  quests: [94089601, 94095710, 94100501],
  mcs: [20, 210, 440],
};

const REAL_DIR = path.join(__dirname, '..', 'src', 'simulation', '__fixtures__', 'real');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const TARGETS = [
  { kind: 'servants', table: 'servants',     idCol: 'collection_no', dir: 'servants',    rows: 'servants_rows.json' },
  { kind: 'quests',   table: 'quests',       idCol: 'id',            dir: 'quests',      rows: 'quests_rows.json' },
  { kind: 'mcs',      table: 'mystic_codes', idCol: 'id',            dir: 'mysticCodes', rows: 'mystic_codes_rows.json' },
];

function parseArg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) return fallback;
  return process.argv[i + 1].split(',').map((n) => Number(n.trim())).filter(Boolean);
}

const LOCAL = process.argv.includes('--local');

async function fetchRows(supabase, { table, idCol, rows }, wanted) {
  if (LOCAL) {
    const file = path.join(DATA_DIR, rows);
    if (!fs.existsSync(file)) throw new Error(`Local dump not found: ${file}`);
    const all = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(all) ? all : (all.rows || []);
  }
  const { data, error } = await supabase
    .from(table).select(`${idCol}, data`).in(idCol, wanted);
  if (error) throw new Error(`${table} fetch: ${error.message}`);
  return data || [];
}

async function main() {
  let supabase = null;
  if (!LOCAL) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Missing SUPABASE_URL / SUPABASE_(SERVICE_ROLE|ANON)_KEY env vars (or pass --local).');
      process.exit(1);
    }
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  const ids = {
    servants: parseArg('servants', DEFAULTS.servants),
    quests: parseArg('quests', DEFAULTS.quests),
    mcs: parseArg('mcs', DEFAULTS.mcs),
  };

  let written = 0;
  for (const target of TARGETS) {
    const { kind, idCol, dir } = target;
    const wanted = ids[kind];
    if (!wanted.length) continue;
    const rows = await fetchRows(supabase, target, wanted);

    const found = new Map((rows || []).map((r) => [Number(r[idCol]), r.data]));
    const outDir = path.join(REAL_DIR, dir);
    fs.mkdirSync(outDir, { recursive: true });

    for (const id of wanted) {
      const blob = found.get(id);
      if (!blob) { console.warn(`  MISSING ${table} ${id} — skipped`); continue; }
      fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(blob));
      written++;
      console.log(`  wrote real/${dir}/${id}.json`);
    }
  }
  console.log(`\nDone — ${written} fixture file(s) written. Run: CI=true npm test -- apiInputTests`);
}

main().catch((err) => { console.error(err); process.exit(1); });
