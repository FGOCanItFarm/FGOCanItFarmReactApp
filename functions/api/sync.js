// Cloudflare Pages Function: on-demand Atlas Academy -> Supabase sync.
//
// Ships with the Pages deployment — no separate Worker to deploy. Reads the
// service-role key from Pages env vars (server-side only; never sent to the
// browser since it lacks the REACT_APP_ prefix).
//
// Required Pages environment variables:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (mark as a Secret / encrypted)
//   RUN_COOLDOWN_MINUTES        (optional, default 60)
//
// Routes (same origin as the app):
//   GET  /api/sync  -> status: { ok, last_updated, jp_hash, cooldown_minutes }
//   POST /api/sync  -> trigger: { status: 'started' | 'skipped' | 'up_to_date' }
//
// NOTE: Cloudflare's per-invocation subrequest cap (50 free / 1000 paid) means
// a full cold-start population may not finish here — use `npm run seed` in
// worker/ for the initial bulk load. This endpoint is best for incremental
// top-ups once the database is populated.

import {
  createSupabase,
  evaluateRun,
  runUpdate,
  DEFAULT_COOLDOWN_MINUTES,
} from '../../shared/atlasSync.js';

const CORS = { 'Access-Control-Allow-Origin': '*' };

function missingEnv(env) {
  return !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY;
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      ...CORS,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestGet({ env }) {
  if (missingEnv(env)) {
    return Response.json({ ok: false, error: 'sync_not_configured' }, { status: 503, headers: CORS });
  }
  const supabase = createSupabase(env);
  const { data: meta } = await supabase
    .from('metadata').select('value').eq('key', 'aa_version').maybeSingle();
  const value = meta?.value ?? {};
  return Response.json({
    ok: true,
    last_updated: value.updated_at ?? null,
    jp_hash: value.jp_hash ?? null,
    cooldown_minutes: Number(env.RUN_COOLDOWN_MINUTES) || DEFAULT_COOLDOWN_MINUTES,
  }, { headers: CORS });
}

export async function onRequestPost({ env, waitUntil }) {
  if (missingEnv(env)) {
    return Response.json({ status: 'error', reason: 'sync_not_configured' }, { status: 503, headers: CORS });
  }

  const cooldownMs =
    (Number(env.RUN_COOLDOWN_MINUTES) || DEFAULT_COOLDOWN_MINUTES) * 60_000;
  const supabase = createSupabase(env);
  const decision = await evaluateRun(supabase, cooldownMs);

  if (!decision.run) {
    const status = decision.status === 'skipped' ? 429 : 200;
    const headers = { ...CORS };
    if (decision.retry_after_seconds) headers['Retry-After'] = String(decision.retry_after_seconds);
    return Response.json(decision, { status, headers });
  }

  // Run in the background so the user gets an immediate response.
  waitUntil(runUpdate(env));
  return Response.json({ status: 'started' }, { headers: CORS });
}
