/**
 * Unit tests for stripServantData (shared/atlasSync.js) — the servant data-blob
 * trim applied before Supabase upsert. Verifies the field keep/drop policy, the
 * extraAssets→faces reduction, and (critically) that collapsing skill per-level
 * arrays to the max-level entry is identical to what the engine's Skills.safeSval
 * selects at runtime, while noblePhantasms keep their full level/OC grid.
 */
import { stripServantData } from '../../../shared/atlasSync';
import { Skills } from '../Skills';

const tenLevels = (key) =>
  Array.from({ length: 10 }, (_, i) => ({ [key]: i + 1, Value: (i + 1) * 100 }));

const sample = () => ({
  collectionNo: 461, name: 'Lord Logres', className: 'saber', classId: 1,
  gender: 'female', attribute: 'star', rarity: 5, lvMax: 90,
  traits: [{ id: 2000 }], atkGrowth: Array.from({ length: 120 }, (_, i) => i),
  hpGrowth: [1, 2], cards: ['arts'], cardDetails: {}, hitsDistribution: {},
  starGen: 102, instantDeathChance: 175,
  ascensionAdd: { attribute: { ascension: {} } },
  appendPassive: [{ num: 1 }],
  skills: [{
    id: 1, num: 1, name: 'S1', coolDown: [7, 7, 7, 6, 6, 6, 5, 5, 5, 5],
    functions: [{
      funcType: 'addState', funcTargetType: 'self', functvals: [], funcquestTvals: [],
      svals: tenLevels('Rate'),
      buffs: [{ name: 'Atk Up', tvals: [], svals: tenLevels('Value') }],
    }],
  }],
  noblePhantasms: [{
    id: 9, card: 'arts', npGain: { arts: [1000] }, npDistribution: [100],
    functions: [{ funcType: 'damageNp', funcTargetType: 'enemyAll', svals: tenLevels('Value'), svals2: tenLevels('Value'), buffs: [] }],
  }],
  classPassive: [{ id: 100, name: 'Magic Resistance', functions: [{ funcType: 'addState', svals: [{ Value: 10 }], buffs: [{ name: 'MR' }] }] }],
  extraAssets: { faces: { ascension: { 1: 'face.png' } }, charaGraph: { ascension: { 1: 'big.png' } }, commands: {} },
  // ── fields that must be dropped ──
  profile: { x: 1 }, skillMaterials: {}, ascensionMaterials: {}, appendSkillMaterials: {},
  costumeMaterials: {}, coin: {}, charaScripts: [1], extraPassive: [1, 2],
  valentineEquip: [1], valentineScript: [1], bondEquip: 1, bondEquips: [1],
  bondEquipOwner: 1, bondGifts: {}, bondGrowth: [1], expGrowth: [1], expFeed: [1],
  growthCurve: 15, limits: [1],
});

describe('stripServantData', () => {
  const orig = sample();
  const out = stripServantData(sample());

  test('keeps engine-read and product/forward-looking fields', () => {
    for (const k of [
      'collectionNo', 'name', 'className', 'classId', 'gender', 'attribute',
      'rarity', 'traits', 'atkGrowth', 'skills', 'noblePhantasms', 'classPassive',
      'appendPassive', 'cards', 'hpGrowth', 'ascensionAdd',
    ]) expect(out).toHaveProperty(k);
  });

  test('drops heavy flavour / material / growth-curve fields', () => {
    for (const k of [
      'profile', 'skillMaterials', 'ascensionMaterials', 'appendSkillMaterials',
      'costumeMaterials', 'coin', 'charaScripts', 'extraPassive', 'valentineEquip',
      'valentineScript', 'bondEquip', 'bondEquips', 'bondEquipOwner', 'bondGifts',
      'bondGrowth', 'expGrowth', 'expFeed', 'growthCurve', 'limits',
    ]) expect(out).not.toHaveProperty(k);
  });

  test('reduces extraAssets to face thumbnails only', () => {
    expect(Object.keys(out.extraAssets)).toEqual(['faces']);
    expect(out.extraAssets.faces).toEqual(orig.extraAssets.faces);
  });

  test('collapses skill coolDown / svals / buff svals to the engine-selected entry', () => {
    const f = out.skills[0].functions[0];
    expect(out.skills[0].coolDown).toEqual([orig.skills[0].coolDown[9]]);
    expect(f.svals).toEqual([orig.skills[0].functions[0].svals[9]]);
    expect(f.buffs[0].svals).toEqual([orig.skills[0].functions[0].buffs[0].svals[9]]);
    // runtime-equivalence: the engine reads the same value from trimmed vs full
    expect(Skills.safeSval(f.svals)).toEqual(Skills.safeSval(orig.skills[0].functions[0].svals));
    expect(Skills.safeSval(f.buffs[0].svals)).toEqual(Skills.safeSval(orig.skills[0].functions[0].buffs[0].svals));
  });

  test('leaves noblePhantasms and classPassive level arrays intact', () => {
    expect(out.noblePhantasms[0].functions[0].svals).toHaveLength(10);
    expect(out.noblePhantasms[0].functions[0].svals2).toHaveLength(10);
    expect(out.classPassive[0].functions[0].svals).toEqual(orig.classPassive[0].functions[0].svals);
  });

  test('does not mutate its input', () => {
    const input = sample();
    stripServantData(input);
    expect(input).toHaveProperty('profile');
    expect(input.skills[0].functions[0].svals).toHaveLength(10);
    expect(Object.keys(input.extraAssets)).toHaveLength(3);
  });
});
