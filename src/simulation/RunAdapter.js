import { supabase } from '../supabaseClient';
import { Driver } from './Driver';

/**
 * Build the BattleEngine inputs from app state (FR-2): fetch servant `data`,
 * mystic-code `data`, normalise servantEffects, and read the pre-loaded
 * `selectedQuest._fullData`. Single source of truth shared by runSimulation and
 * the CommandState builder (which caches the result so edits don't re-fetch).
 *
 * Throws on unrecoverable inputs (no servants / no quest data / fetch error) so
 * callers can surface the message; runSimulation wraps this in try/catch to
 * preserve its existing `{ success:false, error }` contract.
 *
 * @returns {Promise<{servantDataList, questData, mcData, damageMultiplier}>}
 */
export async function prepareSimInputs({ team, selectedQuest, selectedMysticCode, servantEffects }) {
  const filledSlots = team
    .map((slot, index) => ({ slot, index }))
    .filter(({ slot }) => slot.collectionNo);

  if (filledSlots.length === 0) throw new Error('No servants selected.');

  const uniqueNos = [...new Set(filledSlots.map(({ slot }) => Number(slot.collectionNo)))];
  const { data: servantRows, error: servantError } = await supabase
    .from('servants')
    .select('collection_no, data')
    .in('collection_no', uniqueNos);

  if (servantError) throw new Error(`Servant fetch failed: ${servantError.message}`);

  const servantMap = new Map((servantRows || []).map(r => [String(r.collection_no), r.data]));

  let mcData = { name: '', shortName: '', maxLv: 10, skills: [] };
  if (selectedMysticCode) {
    const { data: mcRow } = await supabase
      .from('mystic_codes')
      .select('data')
      .eq('id', selectedMysticCode)
      .maybeSingle();
    if (mcRow?.data) mcData = mcRow.data;
  }

  if (!selectedQuest?._fullData) {
    throw new Error('No quest data available. Please re-select your quest.');
  }

  const servantDataList = filledSlots.map(({ slot, index }) => {
    const rawData = servantMap.get(String(slot.collectionNo));
    const fx = servantEffects[index] || {};
    const opts = {
      np:             Number(fx.np ?? fx.npLevel ?? 1),
      initialCharge:  Number(fx.initialCharge  ?? 0),
      attack:         Number(fx.attack         ?? 0),
      atkUp:          Number(fx.atkUp          ?? 0),
      artsUp:         Number(fx.artsUp         ?? 0),
      quickUp:        Number(fx.quickUp        ?? 0),
      busterUp:       Number(fx.busterUp       ?? 0),
      npUp:           Number(fx.npUp           ?? 0),
      busterDamageUp: Number(fx.busterDamageUp ?? 0),
      quickDamageUp:  Number(fx.quickDamageUp  ?? 0),
      artsDamageUp:   Number(fx.artsDamageUp   ?? 0),
      append5:        !!(fx.append5 ?? fx.append_5 ?? false),
    };
    return { rawData, opts };
  });

  return {
    servantDataList,
    questData: selectedQuest._fullData,
    mcData,
    damageMultiplier: 1.0,
  };
}

export async function runSimulation({ team, commands, selectedQuest, selectedMysticCode, servantEffects }) {
  try {
    const simInputs = await prepareSimInputs({ team, selectedQuest, selectedMysticCode, servantEffects });
    const driver = new Driver(simInputs);

    const engine = driver.run(commands.join(' '));
    if (engine === false) {
      return { success: false, error: 'Simulation failed: invalid token sequence or skill error.' };
    }

    const waves = {};
    for (const [waveKey, waveData] of Object.entries(engine.waveStats)) {
      const { hpRequired, damageDealt } = waveData;
      const damage_at_09 = damageDealt * 0.9;
      const damage_at_10 = damageDealt;
      const damage_at_11 = damageDealt * 1.1;

      let outcome, clear_probability;
      if (damage_at_09 >= hpRequired) {
        outcome = 'guaranteed';
        clear_probability = 1.0;
      } else if (damage_at_10 >= hpRequired) {
        outcome = 'rng';
        clear_probability = 0.5;
      } else {
        outcome = 'impossible';
        clear_probability = 0.0;
      }

      waves[waveKey] = {
        hp_required: hpRequired,
        damage_at_09,
        damage_at_10,
        damage_at_11,
        outcome,
        clear_probability,
        min_multiplier_needed: damage_at_10 > 0 ? hpRequired / damage_at_10 : null,
        // FR-8: per-enemy granular stats (camelCase engine → snake_case UI)
        per_enemy: (waveData.enemies || []).map(e => ({
          index: e.index,
          name: e.name,
          max_hp: e.maxHp,
          damage_taken: e.damageTaken,
          np_refund: e.npRefund,
        })),
      };
    }

    const waveProbs = Object.values(waves).map(w => w.clear_probability);
    const overall_clear_probability = waveProbs.length > 0 ? Math.min(...waveProbs) : 0;

    return {
      success: true,
      quest_cleared: engine.questCleared,
      wave_reached: engine.wave,
      total_waves: engine.totalWaves,
      servants_at_wave_end: Object.fromEntries(
        Object.entries(engine.servantsAtWaveEnd).map(([wave, servants]) => [
          wave,
          servants.map(({ slot, collectionNo, npGauge }) => ({ slot, collectionNo, np_gauge: npGauge })),
        ])
      ),
      stats: { waves, overall_clear_probability },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * FR-9: reconcile a stored saved-run summary (saved_runs.wave_results) against a
 * freshly re-simulated one, to detect engine drift. Compares each wave's outcome
 * and damage (within a relative tolerance) plus per-enemy damage when both carry
 * the FR-8 granular `per_enemy` data. Returns the diverging waves/fields so the
 * UI can surface a discrepancy and offer a bug report.
 *
 * @param {object} stored - stats.waves shape persisted at submit time
 * @param {object} fresh  - stats.waves from a re-run of the same token string
 * @param {number} tol    - relative damage tolerance (default 1%)
 */
export function reconcileWaveResults(stored = {}, fresh = {}, tol = 0.01) {
  const diffs = {};
  const near = (a, b) => {
    const max = Math.max(Math.abs(a), Math.abs(b), 1);
    return Math.abs(a - b) / max <= tol;
  };
  const waveKeys = new Set([...Object.keys(stored), ...Object.keys(fresh)]);
  for (const w of waveKeys) {
    const s = stored[w];
    const f = fresh[w];
    if (!s || !f) { diffs[w] = { field: 'wave', stored: s ?? null, fresh: f ?? null }; continue; }
    if (s.outcome !== f.outcome) {
      diffs[w] = { field: 'outcome', stored: s.outcome, fresh: f.outcome };
    } else if (!near(Number(s.damage_at_10 ?? 0), Number(f.damage_at_10 ?? 0))) {
      diffs[w] = { field: 'damage_at_10', stored: s.damage_at_10, fresh: f.damage_at_10 };
    } else if (Array.isArray(s.per_enemy) && Array.isArray(f.per_enemy)) {
      for (let i = 0; i < Math.max(s.per_enemy.length, f.per_enemy.length); i++) {
        const se = s.per_enemy[i];
        const fe = f.per_enemy[i];
        if (!se || !fe || !near(Number(se.damage_taken ?? 0), Number(fe.damage_taken ?? 0))) {
          diffs[w] = { field: `per_enemy[${i}].damage_taken`, stored: se?.damage_taken ?? null, fresh: fe?.damage_taken ?? null };
          break;
        }
      }
    }
  }
  return { diverged: Object.keys(diffs).length > 0, diffs };
}

/**
 * FR-9: re-simulate a stored saved-run row (no app state needed) so its summary
 * can be reconciled against the live engine. Reconstructs team / NP levels /
 * quest / mystic code from the row, fetches the quest blob, and reuses
 * runSimulation. Returns the same shape as runSimulation (incl. stats.waves).
 *
 * @param {{servant_collection_nos:number[], np_levels:number[], token_string:string,
 *          quest_id:number, mystic_code_id?:number|null}} run
 */
export async function resimulateSavedRun(run) {
  const colls = run.servant_collection_nos || [];
  const team = Array.from({ length: 6 }, (_, i) => ({
    collectionNo: colls[i] != null ? String(colls[i]) : '',
  }));
  const servantEffects = Array.from({ length: 6 }, (_, i) => ({
    np: Number(run.np_levels?.[i] ?? 1),
  }));

  const { data: qRow, error: qErr } = await supabase
    .from('quests').select('data').eq('id', run.quest_id).maybeSingle();
  if (qErr) return { success: false, error: qErr.message };
  if (!qRow?.data) return { success: false, error: `Quest ${run.quest_id} data not found.` };

  const selectedQuest = { id: run.quest_id, _fullData: qRow.data };
  const selectedMysticCode = run.mystic_code_id != null ? { id: run.mystic_code_id } : null;
  const commands = (run.token_string || '').split(/\s+/).filter(Boolean);

  return runSimulation({ team, commands, selectedQuest, selectedMysticCode, servantEffects });
}
