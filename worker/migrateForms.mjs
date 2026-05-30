// One-off, NON-destructive migration: add the derived `forms[]` to each existing
// servants.data row (keeps ascensionAdd and everything else untouched), so the
// per-form engine/UI work lights up on live data without a full Atlas re-seed.
// Idempotent: re-running only rewrites rows whose forms[] would change.
//
// Usage (from worker/):  node migrateForms.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { extractForms } from '../shared/atlasSync.js';

const here = dirname(fileURLToPath(import.meta.url));
function loadDevVars() {
  try {
    const raw = readFileSync(join(here, '.dev.vars'), 'utf8');
    const vars = {};
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('='); if (eq === -1) continue;
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      vars[t.slice(0, eq).trim()] = v;
    }
    return vars;
  } catch { return {}; }
}
const fv = loadDevVars();
const url = process.env.SUPABASE_URL || fv.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || fv.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const dryRun = process.argv.includes('--dry');

const supabase = createClient(url, key, { auth: { persistSession: false } });
const PAGE = 500;
let from = 0, scanned = 0, updated = 0, multi = 0;
for (;;) {
  const { data, error } = await supabase
    .from('servants').select('collection_no, data')
    .order('collection_no').range(from, from + PAGE - 1);
  if (error) { console.error('select failed', error); process.exit(1); }
  if (!data || data.length === 0) break;

  for (const row of data) {
    scanned++;
    const d = row.data || {};
    const forms = extractForms(d);
    if (forms.length) multi++;
    if (JSON.stringify(d.forms || []) === JSON.stringify(forms)) continue; // already current
    if (dryRun) { updated++; continue; }
    const { error: upErr } = await supabase
      .from('servants').update({ data: { ...d, forms } }).eq('collection_no', row.collection_no);
    if (upErr) { console.error(`update ${row.collection_no} failed`, upErr); process.exit(1); }
    updated++;
  }
  from += PAGE;
  process.stdout.write(`\rscanned ${scanned} · ${dryRun ? 'would update' : 'updated'} ${updated} · multi-form ${multi}`);
}
console.log(`\nDone${dryRun ? ' (dry run)' : ''}. scanned ${scanned}, ${dryRun ? 'would update' : 'updated'} ${updated}, multi-form ${multi}.`);
