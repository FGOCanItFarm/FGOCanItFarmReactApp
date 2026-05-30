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

const RECOMMEND_LVS = new Set(['90++', '90+++', '90★', '90★★', '90★★★']);

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
  // Prefer the base (1st ascension) face — the iconic, most recognisable look.
  // Final-ascension art (4) is often a dramatic redesign that's hard to ID.
  for (const key of ['1', '2', '3', '4']) {
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

// Trim the servant nice object before storing. The simulation engine reads only
// collectionNo, name, className, classId, gender, attribute, rarity, traits,
// atkGrowth, skills, noblePhantasms, classPassive — but per product decision we
// also keep lightweight stat/display fields (atk/hp base+growth, cards,
// cardDetails, hitsDistribution, star*) and ascensionAdd (some servants' chosen
// ascension changes attribute/skill effects, e.g. Melusine 312). skills and
// noblePhantasms are kept WHOLE (their svals/buff arrays are damage-critical).
// We drop the heavy flavour/material/growth-curve fields below and reduce
// extraAssets to just the face thumbnails (full art is the biggest offender;
// face_url is also extracted into its own column).
const SERVANT_DROP_FIELDS = [
  'profile', 'ascensionMaterials', 'skillMaterials', 'appendSkillMaterials',
  'costumeMaterials', 'coin', 'charaScripts', 'extraPassive',
  'valentineEquip', 'valentineScript', 'bondEquip', 'bondEquips',
  'bondEquipOwner', 'bondGifts', 'bondGrowth', 'expGrowth', 'expFeed',
  'growthCurve', 'limits',
];

// Mirror the engine's per-level selection so we can store only the max-level
// numbers. Skills.safeSval (Skills.js:12-16) and the coolDown picker
// (Skills.js:21-24) both read index 9 when an array has >9 entries, else the
// last element. Collapsing a skill's coolDown / function svals / buff svals to
// that single entry is therefore identical to the engine at runtime — every
// skill variant and function is kept, just the level-10 values.
function collapseLevelArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  return [arr.length > 9 ? arr[9] : arr[arr.length - 1]];
}

// Active-skill trim ONLY. noblePhantasms are left whole: NP damage indexes
// svals/svals2..svals5 by NP level and reads NP-buff svals at [9], so the full
// 5 NP-level × 5 overcharge grid must survive. classPassive/appendPassive are
// also left whole (passives read svals[0], not [9]).
function trimSkillsToMaxLevel(skills) {
  if (!Array.isArray(skills)) return skills;
  return skills.map((skill) => ({
    ...skill,
    coolDown: collapseLevelArray(skill.coolDown),
    functions: (skill.functions || []).map((func) => ({
      ...func,
      svals: collapseLevelArray(func.svals),
      buffs: (func.buffs || []).map((buff) => ({
        ...buff,
        svals: collapseLevelArray(buff.svals),
      })),
    })),
  }));
}

export function stripServantData(data) {
  const out = { ...data };
  for (const key of SERVANT_DROP_FIELDS) delete out[key];
  // Keep only the small face/thumbnail icons; drop full-size art
  // (charaGraph/charaFigure*/narrowFigure/commands/status/spriteModel/…).
  if (out.extraAssets && typeof out.extraAssets === 'object') {
    out.extraAssets = out.extraAssets.faces ? { faces: out.extraAssets.faces } : {};
  }
  if (Array.isArray(out.skills)) out.skills = trimSkillsToMaxLevel(out.skills);
  return out;
}

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
    data:             stripServantData(data),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'collection_no' });
  if (error) throw new Error(`Upsert servant ${data.collectionNo}: ${error.message}`);
}

async function retrieveServants(supabase) {
  // One request gets every servant + their AA hash.
  const basicList = await fetchWithBackoff(`${AA_BASE}/export/JP/basic_servant.json`);
  if (!basicList) { console.error('Failed to fetch basic_servant.json'); return { checked: 0, updated: 0 }; }

  // One bulk read instead of one-per-servant — collapses 400+ Supabase calls to 1.
  const { data: storedList } = await supabase
    .from('servants').select('collection_no, aa_data_hash');
  const storedHashes = new Map((storedList ?? []).map(r => [r.collection_no, r.aa_data_hash]));

  const toUpdate = basicList.filter(e => e.collectionNo && storedHashes.get(e.collectionNo) !== (e.hash ?? ''));
  console.log(`Servants: ${basicList.length} total, ${toUpdate.length} changed`);

  for (const entry of toUpdate) {
    // expand=true keeps inline skill/NP function+buff detail (engine needs it);
    // lore is dropped — profile text is large and never read by the simulation.
    const data = await fetchWithBackoff(
      `${AA_BASE}/nice/JP/servant/${entry.collectionNo}?expand=true&lang=en`
    );
    if (!data) { console.error(`Failed to fetch servant ${entry.collectionNo}`); await sleep(500); continue; }
    await upsertServant(supabase, data, entry.hash ?? '');
    console.log(`Upserted servant ${entry.collectionNo}`);
    await sleep(500);
  }
  return { checked: basicList.length, updated: toUpdate.length };
}

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

// Collect the distinct enemy classes, attributes, and trait names across every
// wave so the quest browser can filter on them without loading the full data
// blob. Same field paths the simulation uses (Quest.js): enemy.svt.className /
// .attribute / .traits[].name.
function extractEnemyMeta(stages) {
  const classes    = new Set();
  const attributes = new Set();
  const traits     = new Set();
  const waveHps    = [];
  for (const stage of stages ?? []) {
    let stageHp = 0;
    for (const enemy of stage.enemies ?? []) {
      const svt = enemy.svt ?? {};
      if (svt.className) classes.add(svt.className);
      if (svt.attribute) attributes.add(svt.attribute);
      for (const t of svt.traits ?? []) {
        if (t?.name) traits.add(t.name);
      }
      stageHp += Number(enemy.hp) || 0;
    }
    waveHps.push(stageHp);
  }
  return {
    enemy_classes:    [...classes],
    enemy_attributes: [...attributes],
    enemy_traits:     [...traits],
    wave_count:       waveHps.length,
    wave_hps:         waveHps,
  };
}

// The simulation (Quest.js) reads only individuality[].id and, per enemy,
// name/hp/deathRate/state + svt.{className,attribute,traits[].id}. enemyMeta is
// extracted from the FULL stages in upsertQuest BEFORE this runs, so dropping
// everything else (drops, enemy ai/skills/noblePhantasm/deck/enemyScript, all
// cosmetic svt fields, and top-level metadata that already lives in its own
// columns) is safe and shrinks the blob ~20×. enemyHash/availableEnemyHashes are
// kept (tiny) so a stored quest records which wave-variation spawn it represents.
function stripQuestData(data) {
  return {
    id:                   data.id,
    name:                 data.name ?? '',
    recommendLv:          data.recommendLv ?? '',
    enemyHash:            data.enemyHash ?? null,
    availableEnemyHashes: data.availableEnemyHashes ?? null,
    individuality:        data.individuality ?? [],
    stages: (data.stages ?? []).map(stage => ({
      enemies: (stage.enemies ?? []).map(e => ({
        name:      e.name,
        hp:        e.hp,
        deathRate: e.deathRate,
        state:     e.state ?? null,
        svt: {
          className: e.svt?.className,
          attribute: e.svt?.attribute,
          traits:    (e.svt?.traits ?? []).map(t => ({ id: t.id })),
        },
      })),
    })),
  };
}

async function upsertQuest(supabase, data, warId, warName) {
  const questId = data.id;
  const stages  = data.stages ?? [];
  if (!questId || stages.length === 0 || !stages[0].enemies) { console.error(`Quest ${questId}: missing id or empty enemies`); return; }
  // The nice quest carries its CANONICAL war (`warId`/`warLongName`). Prefer it
  // over the war we happened to scan it under: comeback campaigns (CBC, etc.)
  // re-run old quests, so the scan war's longName ("CBC 2025 …") mislabels them
  // (and a quest in several wars would otherwise win non-deterministically).
  const canonicalWarId   = data.warId ?? warId;
  const canonicalWarName = data.warLongName ?? data.warName ?? warName;
  const enemyMeta = extractEnemyMeta(stages);
  const { error } = await supabase.from('quests').upsert({
    id: questId, name: data.name ?? '', war_id: canonicalWarId, war_name: canonicalWarName,
    recommend_lv: data.recommendLv ?? '', consume: data.consume ?? 0,
    after_clear: data.afterClear ?? '', opened_at: data.openedAt,
    ...enemyMeta,
    data: stripQuestData(data), updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw new Error(`Upsert quest ${questId}: ${error.message}`);
  console.log(`Upserted quest ${questId}`);
}

async function retrieveQuests(supabase) {
  const basicWars = await fetchWithBackoff(`${AA_BASE}/export/JP/basic_war.json`);
  if (!basicWars) { console.error('Failed to fetch basic_war.json'); return 0; }

  // Wars in basic_war.json have no category/type string — only an `id`, a
  // `flags` array, and an `eventId`. There is no reliable war-level flag for
  // "has farmable quests", so we walk every war and rely on the precise
  // quest-level filter below (recommendLv ∈ RECOMMEND_LVS, 40 AP, repeatable)
  // to pick out the farming nodes. Wars with no qualifying quests add nothing.
  const warIds = basicWars.map(w => w.id).filter(id => id != null);
  console.log(`Processing ${warIds.length} wars`);

  const queue = [];
  let scanned = 0;
  for (const warId of warIds) {
    const warData = await fetchWithBackoff(`${AA_BASE}/nice/JP/war/${warId}?lang=en`);
    scanned++;
    if (!warData) { console.error(`Failed to fetch war ${warId}`); await sleep(300); continue; }
    const warName = warData.longName || warData.name || '';
    let foundHere = 0;
    for (const spot of warData.spots ?? []) {
      for (const quest of spot.quests ?? []) {
        // Handle both nice-format strings ('repeatLast') and raw numeric values (3).
        // Handle both nice ('consume') and raw ('actConsume') field names.
        const apCost      = quest.consume ?? quest.actConsume;
        const isRepeatable = quest.afterClear === 'repeatLast' || quest.afterClear === 3;
        if (RECOMMEND_LVS.has(quest.recommendLv) && apCost === 40 && isRepeatable) {
          queue.push([quest.id, warId, warName]);
          foundHere++;
        }
      }
    }
    console.log(`War ${warId} [${scanned}/${warIds.length}]: ${foundHere} farmable quest(s)`);
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

  // Bulk hash read — same pattern as servants.
  const { data: storedList } = await supabase
    .from('mystic_codes').select('id, aa_data_hash');
  const storedHashes = new Map((storedList ?? []).map(r => [r.id, r.aa_data_hash]));

  const toUpdate = basicList.filter(e => e.id && storedHashes.get(e.id) !== (e.hash ?? ''));
  console.log(`Mystic codes: ${basicList.length} total, ${toUpdate.length} changed`);

  for (const entry of toUpdate) {
    const data = await fetchWithBackoff(`${AA_BASE}/nice/JP/MC/${entry.id}?lang=en`);
    if (!data) { console.error(`Failed to fetch mystic code ${entry.id}`); await sleep(300); continue; }
    const { error } = await supabase.from('mystic_codes').upsert({
      id: entry.id, name: data.name ?? '', aa_data_hash: entry.hash ?? '', data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) throw new Error(`Upsert mystic code ${entry.id}: ${error.message}`);
    console.log(`Upserted mystic code ${entry.id}`);
    await sleep(300);
  }
  return toUpdate.length;
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
