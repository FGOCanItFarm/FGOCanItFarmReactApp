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
