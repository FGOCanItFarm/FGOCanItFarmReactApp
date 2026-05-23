// One-time / on-demand Supabase seeder.
//
// Runs the SAME Atlas Academy -> Supabase pipeline the Cloudflare Worker uses
// (worker/src/index.js `runUpdate`), but locally via Node. This keeps the
// service-role key on your machine instead of exposing a public POST /run.
//
// Usage:
//   npm install            # at the repo root — installs @supabase used by
//                          # ../shared/atlasSync.js
//   cd worker && npm install
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
//
// Or put those two values in worker/.dev.vars (KEY=value, one per line) and run:
//   npm run seed
//
// Safe to re-run: servants and mystic codes are skipped when their Atlas
// Academy hash is unchanged, so repeat runs only fetch what actually changed.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runUpdate } from '../shared/atlasSync.js';

const here = dirname(fileURLToPath(import.meta.url));

function loadDevVars() {
  try {
    const raw = readFileSync(join(here, '.dev.vars'), 'utf8');
    const vars = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
    return vars;
  } catch {
    return {};
  }
}

const fileVars = loadDevVars();
const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || fileVars.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY || fileVars.SUPABASE_SERVICE_ROLE_KEY,
};

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Set them as environment variables or in worker/.dev.vars before running.'
  );
  process.exit(1);
}

console.log('Seeding Supabase from Atlas Academy. This can take several minutes...');

runUpdate(env)
  .then((summary) => {
    console.log('Done:', JSON.stringify(summary, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
