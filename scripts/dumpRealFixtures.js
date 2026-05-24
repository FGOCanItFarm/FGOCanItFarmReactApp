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
 * USAGE:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/dumpRealFixtures.js
 *   (SUPABASE_ANON_KEY also works — the read tables have an anon SELECT policy.)
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
const TARGETS = [
  { kind: 'servants',    table: 'servants',     idCol: 'collection_no', dir: 'servants' },
  { kind: 'quests',      table: 'quests',       idCol: 'id',            dir: 'quests' },
  { kind: 'mcs',         table: 'mystic_codes', idCol: 'id',            dir: 'mysticCodes' },
];

function parseArg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) return fallback;
  return process.argv[i + 1].split(',').map((n) => Number(n.trim())).filter(Boolean);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL / SUPABASE_(SERVICE_ROLE|ANON)_KEY env vars.');
    process.exit(1);
  }
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const ids = {
    servants: parseArg('servants', DEFAULTS.servants),
    quests: parseArg('quests', DEFAULTS.quests),
    mcs: parseArg('mcs', DEFAULTS.mcs),
  };

  let written = 0;
  for (const { kind, table, idCol, dir } of TARGETS) {
    const wanted = ids[kind];
    if (!wanted.length) continue;
    const { data: rows, error } = await supabase
      .from(table).select(`${idCol}, data`).in(idCol, wanted);
    if (error) throw new Error(`${table} fetch: ${error.message}`);

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
