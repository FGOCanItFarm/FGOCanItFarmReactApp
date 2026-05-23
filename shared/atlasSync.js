// Atlas Academy -> Supabase sync pipeline.
//
// Shared by:
//   - functions/api/sync.js   (Cloudflare Pages Function — on-demand trigger)
//   - worker/src/index.js     (optional standalone Worker — cron, if deployed)
//   - worker/seed.js          (local one-time bulk load)
//
// Pure logic + global fetch/Response only, so it runs in the Workers runtime
// (Pages Functions) and in Node 18+ unchanged.

import { createClient } from '@supabase/supabase-js';

export const AA_BASE = 'https://api.atlasacademy.io';

const MASH_COLLECTION_NO     = 2;
const AOKO_COLLECTION_NO     = 413;
const MELUSINE_FORM_SKILL_ID = 888550;

const NP_DAMAGE_FUNC_TYPES = new Set([
  'damageNp',
  'damageNpPierce',
  'damageNpIndividual',
  'damageNpStateIndividualFix',
  'damageNpIndividualSum',
]);

const KEEP_WAR_TYPES = new Set(['eventQuest', 'permanent']);
const RECOMMEND_LVS  = new Set(['90', '90+', '90++', '90+++', '90★', '90★★', '90★★★']);

// Minimum gap between user-triggered syncs. The trigger endpoint is open (no
// token) so anyone can press "Sync Game Data", but it no-ops if a sync ran
// within this window. Override per-deployment with the RUN_COOLDOWN_MINUTES env.
export const DEFAULT_COOLDOWN_MINUTES = 60;

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithBackoff(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        try { return await res.json(); }
        catch (e) { console.error(`JSONDecodeError for ${url}:`, e.message); return null; }
      }
      console.error(`HTTP ${res.status} for ${url}`);
    } catch (e) {
      console.error(`FetchError for ${url}:`, e.message);
    }
    if (attempt < retries - 1) await sleep(2 ** attempt * 1000);
  }
  return null;
}

export function createSupabase(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Guardrail Parser Pipeline
// ---------------------------------------------------------------------------

function extractNpCard(data) {
  const nps = [...(data.noblePhantasms ?? [])].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  return nps.length > 0 ? (nps[nps.length - 1].card ?? null) : null;
}

function extractAttackType(data) {
  const nps = [...(data.noblePhantasms ?? [])].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  if (nps.length === 0) return 'support';
  for (const fn of nps[nps.length - 1].functions ?? []) {
    if (NP_DAMAGE_FUNC_TYPES.has(fn.funcType)) {
      const t = fn.funcTargetType ?? '';
      if (t === 'enemy') return 'attackEnemyOne';
      if (t === 'enemyAll' || t === 'enemyFull') return 'attackEnemyAll';
    }
  }
  return 'support';
}

function extractFaceUrl(data) {
  const ascension = data?.extraAssets?.faces?.ascension ?? {};
  for (const key of ['4', '3', '2', '1']) {
    if (ascension[key]) return ascension[key];
  }
  const vals = Object.values(ascension);
  return vals.length > 0 ? vals[0] : null;
}

function runGuardrailPipeline(data) {
  const collectionNo = data.collectionNo;
  const nps      = [...(data.noblePhantasms ?? [])].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  const npCardSet = new Set(nps.map(np => np.card).filter(Boolean));
  const npCards   = [...npCardSet].sort();
  const variable  = npCards.length > 1;

  const result = {
    np_card:          variable ? null : extractNpCard(data),
    np_card_variable: variable,
    np_card_options:  variable ? npCards : null,
    attack_type:      extractAttackType(data),
    is_enemy_only:    data.isEnemy ?? false,
    form_transition:  null,
    parser_flags:     {},
    face_url:         extractFaceUrl(data),
  };

  const transformSkills = (data.skills ?? []).filter(s =>
    (s.functions ?? []).some(f => f.funcType === 'transformServant')
  );
  if (transformSkills.length === 1) {
    result.form_transition = 'irreversible';
    result.parser_flags.has_transform_servant = true;
  } else if (transformSkills.length > 1) {
    result.form_transition = 'reversible';
    result.parser_flags.has_transform_servant = true;
  }

  if (collectionNo === MASH_COLLECTION_NO) {
    result.parser_flags.mash_ortinax = true;
  }

  for (const skill of data.skills ?? []) {
    if (skill.id === MELUSINE_FORM_SKILL_ID) {
      result.form_transition = 'irreversible';
      result.parser_flags.melusine_form_skill = true;
    }
  }

  const gated = (data.skills ?? []).filter(s => (s.condLimitCount ?? 0) > 0).map(s => s.id);
  if (gated.length > 0) result.parser_flags.ascension_gated_skill_ids = gated;

  if (variable) result.parser_flags.requires_choice = true;

  if (collectionNo === AOKO_COLLECTION_NO) result.parser_flags.is_aoko = true;

  return result;
}

// ---------------------------------------------------------------------------
// Servants
// ---------------------------------------------------------------------------

async function upsertServant(supabase, data, aaHash) {
  const parsed = runGuardrailPipeline(data);
  const { error } = await supabase.from('servants').upsert({
    collection_no:    data.collectionNo,
    name:             data.name ?? '',
    class_name:       data.className ?? '',
    rarity:           data.rarity ?? 0,
    np_card:          parsed.np_card,
    np_card_variable: parsed.np_card_variable,
    np_card_options:  parsed.np_card_options,
    attack_type:      parsed.attack_type,
    is_enemy_only:    parsed.is_enemy_only,
    form_transition:  parsed.form_transition,
    parser_flags:     parsed.parser_flags,
    face_url:         parsed.face_url,
    aa_data_hash:     aaHash,
    data,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'collection_no' });
  if (error) throw new Error(`Upsert servant ${data.collectionNo}: ${error.message}`);
}

async function retrieveServants(supabase) {
  const basicList = await fetchWithBackoff(`${AA_BASE}/export/JP/basic_servant.json`);
  if (!basicList) { console.error('Failed to fetch basic_servant.json'); return { checked: 0, updated: 0 }; }

  let checked = 0, updated = 0;
  for (const entry of basicList) {
    const collectionNo = entry.collectionNo;
    const aaHash       = entry.hash ?? '';
    if (!collectionNo) continue;
    checked++;

    const { data: existing } = await supabase
      .from('servants').select('aa_data_hash')
      .eq('collection_no', collectionNo).maybeSingle();

    if (existing?.aa_data_hash === aaHash) { console.log(`Servant ${collectionNo}: hash unchanged, skipping`); continue; }

    const data = await fetchWithBackoff(`${AA_BASE}/nice/JP/servant/${collectionNo}?lore=true&expand=true&lang=en`);
    if (!data) { console.error(`Failed to fetch servant ${collectionNo}`); await sleep(500); continue; }

    await upsertServant(supabase, data, aaHash);
    updated++;
    console.log(`Upserted servant ${collectionNo}`);
    await sleep(500);
  }
  return { checked, updated };
}

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

async function upsertQuest(supabase, data, warId, warName) {
  const questId = data.id;
  const stages  = data.stages ?? [];
  if (!questId || stages.length === 0 || !stages[0].enemies) { console.error(`Quest ${questId}: missing id or empty enemies`); return; }
  const { error } = await supabase.from('quests').upsert({
    id: questId, name: data.name ?? '', war_id: warId, war_name: warName,
    recommend_lv: data.recommendLv ?? '', consume: data.consume ?? 0,
    after_clear: data.afterClear ?? '', opened_at: data.openedAt,
    data, updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw new Error(`Upsert quest ${questId}: ${error.message}`);
  console.log(`Upserted quest ${questId}`);
}

async function retrieveQuests(supabase) {
  const basicWars = await fetchWithBackoff(`${AA_BASE}/export/JP/basic_war.json`);
  if (!basicWars) { console.error('Failed to fetch basic_war.json'); return 0; }

  const warIds = basicWars.filter(w => KEEP_WAR_TYPES.has(w.type)).map(w => w.id);
  console.log(`Processing ${warIds.length} wars`);

  const queue = [];
  for (const warId of warIds) {
    const warData = await fetchWithBackoff(`${AA_BASE}/nice/JP/war/${warId}?lang=en`);
    if (!warData) { console.error(`Failed to fetch war ${warId}`); await sleep(300); continue; }
    const warName = warData.longName || warData.name || '';
    for (const spot of warData.spots ?? []) {
      for (const quest of spot.quests ?? []) {
        if (RECOMMEND_LVS.has(quest.recommendLv) && quest.consume === 40 && quest.afterClear === 'repeatLast')
          queue.push([quest.id, warId, warName]);
      }
    }
    await sleep(300);
  }
  console.log(`Found ${queue.length} qualifying quests`);

  let updated = 0;
  for (const [questId, warId, warName] of queue) {
    const data = await fetchWithBackoff(`${AA_BASE}/nice/JP/quest/${questId}/1?lang=en`);
    if (!data) { console.error(`Failed to fetch quest ${questId}`); await sleep(300); continue; }
    await upsertQuest(supabase, data, warId, warName);
    updated++;
    await sleep(300);
  }
  return updated;
}

// ---------------------------------------------------------------------------
// Mystic Codes
// ---------------------------------------------------------------------------

async function retrieveMysticCodes(supabase) {
  const basicList = await fetchWithBackoff(`${AA_BASE}/export/JP/basic_mystic_code.json`);
  if (!basicList) { console.error('Failed to fetch basic_mystic_code.json'); return 0; }

  let updated = 0;
  for (const entry of basicList) {
    const mcId   = entry.id;
    const aaHash = entry.hash ?? '';
    if (!mcId) continue;

    const { data: existing } = await supabase
      .from('mystic_codes').select('aa_data_hash').eq('id', mcId).maybeSingle();
    if (existing?.aa_data_hash === aaHash) { console.log(`Mystic code ${mcId}: hash unchanged, skipping`); continue; }

    const data = await fetchWithBackoff(`${AA_BASE}/nice/JP/MC/${mcId}?lang=en`);
    if (!data) { console.error(`Failed to fetch mystic code ${mcId}`); await sleep(300); continue; }

    const { error } = await supabase.from('mystic_codes').upsert({
      id: mcId, name: data.name ?? '', aa_data_hash: aaHash, data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) throw new Error(`Upsert mystic code ${mcId}: ${error.message}`);
    updated++;
    console.log(`Upserted mystic code ${mcId}`);
    await sleep(300);
  }
  return updated;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

async function updateJpHash(supabase) {
  const info = await fetchWithBackoff(`${AA_BASE}/info`);
  if (!info) { console.error('Failed to fetch /info'); return ''; }
  const jpHash = info?.JP?.hash ?? '';
  const { error } = await supabase.from('metadata').upsert({
    key: 'aa_version',
    value: { jp_hash: jpHash, updated_at: new Date().toISOString() },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });
  if (error) throw new Error(`Update JP hash: ${error.message}`);
  console.log(`Stored JP hash: ${jpHash}`);
  return jpHash;
}

// ---------------------------------------------------------------------------
// Run gating — shared cooldown + freshness check for trigger endpoints
// ---------------------------------------------------------------------------

// Decides whether a user-triggered sync should actually run. Cheap: one Supabase
// read + (when due) one Atlas Academy /info fetch — so spamming the trigger
// can't cause a full walk. Returns { run, status, reason, retry_after_seconds }.
export async function evaluateRun(supabase, cooldownMs) {
  const { data: meta } = await supabase
    .from('metadata').select('value').eq('key', 'aa_version').maybeSingle();
  const value     = meta?.value ?? {};
  const lastRunAt = value.updated_at ? new Date(value.updated_at).getTime() : 0;
  const elapsed   = Date.now() - lastRunAt;

  if (lastRunAt && elapsed < cooldownMs) {
    return {
      run: false,
      status: 'skipped',
      reason: 'recently_synced',
      retry_after_seconds: Math.ceil((cooldownMs - elapsed) / 1000),
    };
  }

  // Cooldown has passed — only do real work if Atlas Academy actually has a new
  // version. This keeps the common "nothing changed" case to ~2 subrequests.
  const info       = await fetchWithBackoff(`${AA_BASE}/info`);
  const remoteHash = info?.JP?.hash ?? '';
  if (remoteHash && value.jp_hash && remoteHash === value.jp_hash) {
    return { run: false, status: 'up_to_date', reason: 'no_new_version' };
  }

  return { run: true, status: 'started' };
}

// ---------------------------------------------------------------------------
// Core update flow
// ---------------------------------------------------------------------------

export async function runUpdate(env) {
  const supabase = createSupabase(env);

  const start = Date.now();
  console.log('=== Starting update run ===');

  const newJpHash                          = await updateJpHash(supabase);
  const { checked: servantsChecked,
          updated: servantsUpdated }        = await retrieveServants(supabase);
  const questsUpdated                      = await retrieveQuests(supabase);
  const mcUpdated                          = await retrieveMysticCodes(supabase);

  const summary = {
    servants_checked:     servantsChecked,
    servants_updated:     servantsUpdated,
    quests_updated:       questsUpdated,
    mystic_codes_updated: mcUpdated,
    new_jp_hash:          newJpHash,
    duration_seconds:     +((Date.now() - start) / 1000).toFixed(2),
  };
  console.log('Update complete:', JSON.stringify(summary));
  return summary;
}
