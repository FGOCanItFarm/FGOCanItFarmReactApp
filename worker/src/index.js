// Optional standalone Worker. The app no longer requires this — on-demand sync
// runs as a Cloudflare Pages Function (functions/api/sync.js). Deploy this only
// if you want the scheduled (cron) daily sync. All pipeline logic lives in
// ../../shared/atlasSync.js so there is a single source of truth.

import {
  createSupabase,
  evaluateRun,
  runUpdate,
  DEFAULT_COOLDOWN_MINUTES,
  AA_BASE,
} from '../../shared/atlasSync.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      }});
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({ ok: true }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (request.method === 'POST' && url.pathname === '/run') {
      if (env.TRIGGER_TOKEN) {
        const auth = request.headers.get('Authorization') ?? '';
        if (auth !== `Bearer ${env.TRIGGER_TOKEN}`) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      const cooldownMs =
        (Number(env.RUN_COOLDOWN_MINUTES) || DEFAULT_COOLDOWN_MINUTES) * 60_000;
      const supabase = createSupabase(env);
      const decision = await evaluateRun(supabase, cooldownMs);
      if (!decision.run) {
        const headers = { 'Access-Control-Allow-Origin': '*' };
        if (decision.retry_after_seconds) headers['Retry-After'] = String(decision.retry_after_seconds);
        return Response.json(decision, {
          status: decision.status === 'skipped' ? 429 : 200,
          headers,
        });
      }

      ctx.waitUntil(runUpdate(env));
      return Response.json({ status: 'started' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Proxy Atlas Academy servant data for the common servants quick-picker.
    if (request.method === 'GET' && url.pathname.startsWith('/api/servants/')) {
      const parts = url.pathname.split('/');
      const collectionNo = parts[parts.length - 1];
      if (/^\d+$/.test(collectionNo)) {
        const res = await fetch(`${AA_BASE}/nice/JP/servant/${collectionNo}?lang=en`);
        const body = res.ok ? await res.json() : { error: 'not found' };
        return Response.json(body, {
          status: res.ok ? 200 : res.status,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // All other requests — serve the React app static assets.
    // The ASSETS binding handles SPA fallback (index.html for unknown paths).
    return env.ASSETS.fetch(request);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runUpdate(env));
  },
};

export { runUpdate };
