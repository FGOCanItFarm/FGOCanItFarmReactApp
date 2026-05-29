#!/usr/bin/env node
/**
 * Download all servant rows from Supabase and write them as individual JSON files.
 * Output: src/simulation/__fixtures__/real/servants/<collection_no>.json
 *
 * Usage:
 *   REACT_APP_SUPABASE_URL=... REACT_APP_SUPABASE_ANON_KEY=... node scripts/downloadServants.js
 *
 * Or put those vars in a .env file in the project root (they're already gitignored).
 *
 * The script pages through all servants (Supabase default limit is 1000/request)
 * and writes one file per servant using collection_no as the filename.
 * Files already committed to git are not overwritten unless --force is passed.
 */

const fs = require('fs');
const path = require('path');

// Load .env if present (no dependency on dotenv — manual parse)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const OUT_DIR = path.join(__dirname, '..', 'src', 'simulation', '__fixtures__', 'real', 'servants');
const FORCE = process.argv.includes('--force');
const PAGE_SIZE = 200;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY');
  console.error('Set them in your .env file or pass as environment variables.');
  process.exit(1);
}

async function fetchPage(from, to) {
  const url = `${SUPABASE_URL}/rest/v1/servants?select=collection_no,data&order=collection_no.asc`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Range: `${from}-${to}`,
      'Range-Unit': 'items',
      Prefer: 'count=none',
    },
  });
  if (!res.ok) throw new Error(`Supabase error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let offset = 0;
  let total = 0;
  let skipped = 0;

  while (true) {
    const rows = await fetchPage(offset, offset + PAGE_SIZE - 1);
    if (!rows.length) break;

    for (const row of rows) {
      const file = path.join(OUT_DIR, `${row.collection_no}.json`);
      if (!FORCE && fs.existsSync(file)) {
        skipped++;
        continue;
      }
      fs.writeFileSync(file, JSON.stringify(row.data, null, 2));
      total++;
    }

    console.log(`Downloaded ${offset + rows.length} servants so far…`);
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`Done. Wrote ${total} files, skipped ${skipped} existing (use --force to overwrite).`);
}

main().catch(err => { console.error(err); process.exit(1); });
