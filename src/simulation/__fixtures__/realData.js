/**
 * Loader for REAL game-data fixtures committed under real/{servants,quests,
 * mysticCodes}/<id>.json. These blobs are the exact shape the engine consumes
 * (Atlas-nice servant / quest / mystic-code objects = the Supabase `data`
 * column), so they feed the Driver with zero transformation. They also serve as
 * worked examples of the command grammar for new users.
 *
 * Translated Python tests call buildSimInputs(...) to assemble the same
 * `simInputs` object that RunAdapter.prepareSimInputs produces, then run the
 * real Driver and assert the documented outcome.
 *
 * Test-only (Node/Jest) — uses fs so a missing blob fails loudly with the path
 * to add, and so it never enters the app's webpack bundle.
 *
 * NOTE: if incoming blobs are wrapped (e.g. `{ data: {...} }`) or differ from
 * Atlas-nice, adapt unwrap() below — verified once the first real sample lands.
 */
import fs from 'fs';
import path from 'path';

const REAL_DIR = path.join(__dirname, 'real');

function unwrap(json) {
  // Accept either a bare servant/quest object or a `{ collection_no/id, data }`
  // Supabase row; the engine wants the inner object.
  if (json && typeof json === 'object' && json.data && !json.collectionNo && !json.stages && !json.skills) {
    return json.data;
  }
  return json;
}

function loadJson(sub, id) {
  const file = path.join(REAL_DIR, sub, `${id}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing real fixture: real/${sub}/${id}.json — add the blob under ` +
      `src/simulation/__fixtures__/real/${sub}/`
    );
  }
  return unwrap(JSON.parse(fs.readFileSync(file, 'utf8')));
}

export const loadServant = (collectionNo) => loadJson('servants', collectionNo);
export const loadQuest = (questId) => loadJson('quests', questId);
export const loadMysticCode = (mcId) => loadJson('mysticCodes', mcId);

const EMPTY_MC = { name: '', shortName: '', maxLv: 10, skills: [] };

/**
 * Assemble engine inputs from real blobs.
 * @param {{servants:Array<{collectionNo:number,opts?:object}>, questId:number,
 *          mysticCodeId?:number|null, superAokoId?:number|null,
 *          damageMultiplier?:number}} cfg
 */
export function buildSimInputs({ servants, questId, mysticCodeId = null, superAokoId = null, damageMultiplier = 1.0 }) {
  const simInputs = {
    servantDataList: servants.map((s) => ({ rawData: loadServant(s.collectionNo), opts: s.opts || {} })),
    questData: loadQuest(questId),
    mcData: mysticCodeId != null ? loadMysticCode(mysticCodeId) : EMPTY_MC,
    damageMultiplier,
  };
  if (superAokoId != null) simInputs.superAokoData = loadServant(superAokoId);
  return simInputs;
}
