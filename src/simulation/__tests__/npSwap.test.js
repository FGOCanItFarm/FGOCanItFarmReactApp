/**
 * NP-swap mechanism (FR-5). Atlas marks NP transforms with
 * `script.tdTypeChangeIDs` on each member of the swap group, and the active
 * member is selected by a `tdTypeChange*` family state buff (tdTypeChange,
 * tdTypeChangeArts, tdTypeChangeBuster, tdTypeChangeQuick).
 *
 * These tests pin the now-generic resolver in NP.tdTypeChangeNewId. Mash's
 * end-to-end NP swap (default Lord Chaldeas → 「聖剣装填」 → Holy Sword) is
 * exercised by apiInputTests.test.js (paladin_mash). Here we cover:
 *   - resolver picks ids[0] when no tdTypeChange* buff is active;
 *   - resolver picks ids[1] when ANY tdTypeChange* buff is active;
 *   - servants without a swap group return null (the engine falls back to the
 *     default-last NP).
 *
 * 3-NP groups (Emiya 11, Space Ishtar 268, BB Dubai 421 S3) need per-variant
 * choice plumbing — covered when FR-3 choice tokens land.
 */
import { NP } from '../NP';

function makeNps({ withGroup = true } = {}) {
  const base = [
    { id: 800101, card: '1', script: {} },
    { id: 800196, card: '1', script: {} },
    { id: 800197, card: '1', script: {} },
  ];
  if (withGroup) {
    base.push({ id: 800107, card: '1', script: { tdTypeChangeIDs: [800107, 800108] } });
    base.push({ id: 800108, card: '2', script: { tdTypeChangeIDs: [800107, 800108] } });
  }
  return new NP(base);
}

describe('NP.tdTypeChangeNewId — generic NP-swap resolver', () => {
  test('returns null when the servant has no tdTypeChangeIDs group', () => {
    const nps = makeNps({ withGroup: false });
    expect(nps.tdTypeChangeNewId([])).toBeNull();
    expect(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeBuster' }])).toBeNull();
  });

  test('with no tdTypeChange* buff active, resolves to ids[0] (the default)', () => {
    const nps = makeNps();
    const defaultNewId = nps.tdTypeChangeNewId([]);
    expect(defaultNewId).not.toBeNull();
    expect(nps.getNpById(defaultNewId).id).toBe(800107);
  });

  test('generic tdTypeChange flips to ids[1] (Mash 2-NP self-loaded pattern)', () => {
    // Mash 1's own swap uses `tdTypeChangeBuster` (which is the card-key path
    // below). The bare `tdTypeChange` covers any future 2-NP servant that
    // arms swap without naming a card.
    const nps = makeNps();
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChange' }])).id).toBe(800108);
  });

  test('suffixed tdTypeChange{Arts,Buster,Quick} resolves by card-key', () => {
    // In makeNps the swap pair is 800107 (card "1"=arts) ↔ 800108 (card "2"=buster).
    const nps = makeNps();
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeArts' }])).id).toBe(800107);
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeBuster' }])).id).toBe(800108);
  });

  test('buff with explicit targetNpId wins over card-key lookup (BB Dubai path)', () => {
    // BB Dubai's two NPs are both card=arts; selection comes from
    // selectTreasureDeviceInfo embedding the chosen NP id directly.
    const nps = makeNps();
    const id = nps.tdTypeChangeNewId([{ type: 'tdTypeChangeArts', targetNpId: 800108 }]);
    expect(nps.getNpById(id).id).toBe(800108);
  });

  test('non-tdTypeChange buffs do not arm the swap', () => {
    const nps = makeNps();
    const newId = nps.tdTypeChangeNewId([
      { type: 'upAtk' },
      { type: 'upNpdamage' },
      { type: 'downDefence' },
    ]);
    expect(nps.getNpById(newId).id).toBe(800107);
  });

  test('3-NP groups resolve by card-key (Space Ishtar / Emiya pattern)', () => {
    const nps = new NP([
      { id: 1100901, card: '1', script: { tdTypeChangeIDs: [1100901, 1100997, 1100998] } },
      { id: 1100997, card: '2', script: { tdTypeChangeIDs: [1100901, 1100997, 1100998] } },
      { id: 1100998, card: '3', script: { tdTypeChangeIDs: [1100901, 1100997, 1100998] } },
    ]);
    // No swap buff → default to ids[0] (Arts variant 1100901).
    expect(nps.getNpById(nps.tdTypeChangeNewId([])).id).toBe(1100901);
    // Each card-keyed buff picks the matching group member.
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeArts' }])).id).toBe(1100901);
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeBuster' }])).id).toBe(1100997);
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeQuick' }])).id).toBe(1100998);
  });
});

// End-to-end via Driver: BB Dubai (421) S3 「Golden Capital on the Moon EX」
// carries `script.selectTreasureDeviceInfo` mapping option A → NP 2300601
// (攻撃タイプ / Attack) and option B → NP 2300698 (防御タイプ / Defense).
// Both NPs are card='1' (arts), so card-key resolution can't disambiguate —
// the engine has to use the embedded targetNpId from the chooser script.
describe('BB Dubai S3 NP-type chooser — selectTreasureDeviceInfo routing', () => {
  // Lazy-require so the synthetic resolver tests above stay fixture-free.
  const { Driver } = require('../Driver');
  const { buildSimInputs } = require('../__fixtures__/realData');

  function runBbS3(token) {
    const inputs = buildSimInputs({
      servants: [
        { collectionNo: 421, opts: { initialCharge: 100 } },
        { collectionNo: 314 },
        { collectionNo: 314 },
      ],
      questId: 94089601,
      mysticCodeId: 20,
    });
    const driver = new Driver(inputs);
    const engine = driver.run(token);
    return engine;
  }

  test('[Ch2A] arms the Attack-mode NP (2300601)', () => {
    const engine = runBbS3('c[Ch2A]');
    expect(engine).not.toBe(false);
    const bb = engine.servants[0];
    const swap = bb.buffs.buffs.filter(b => typeof b.type === 'string'
      && b.type.startsWith('tdTypeChange') && b.type !== 'tdTypeChange');
    // Exactly one suffixed variant fires (the other one is skipped by
    // _shouldSkipChoiceEffect); the generic tdTypeChange always fires too.
    expect(swap.length).toBe(1);
    expect(swap[0].targetNpId).toBe(2300601);

    const newId = bb.nps.tdTypeChangeNewId(bb.buffs.buffs);
    expect(bb.nps.getNpById(newId).id).toBe(2300601);
  });

  test('[Ch2B] arms the Defense-mode NP (2300698)', () => {
    const engine = runBbS3('c[Ch2B]');
    expect(engine).not.toBe(false);
    const bb = engine.servants[0];
    const swap = bb.buffs.buffs.filter(b => typeof b.type === 'string'
      && b.type.startsWith('tdTypeChange') && b.type !== 'tdTypeChange');
    expect(swap.length).toBe(1);
    expect(swap[0].targetNpId).toBe(2300698);

    const newId = bb.nps.tdTypeChangeNewId(bb.buffs.buffs);
    expect(bb.nps.getNpById(newId).id).toBe(2300698);
  });
});

// 3-option NP-type chooser end-to-end (Space Ishtar 268 S2 「Venus Driver B」 /
// Emiya 11 S3 pattern). Real fixtures for 11 and 268 aren't committed yet (the
// sandbox lacks network access to Atlas/Supabase); this synthetic Atlas-shaped
// servant exercises exactly the same engine path so the routing is locked in.
// Drop a real fixture under src/simulation/__fixtures__/real/servants/ and the
// real-data test follows the same shape.
describe('synthetic 3-option NP chooser — Space-Ishtar/Emiya routing', () => {
  const { Driver } = require('../Driver');
  const { loadQuest, loadMysticCode } = require('../__fixtures__/realData');

  const ATK = Array.from({ length: 120 }, () => 1500);
  const NP_GAIN = { np: [50, 50, 50, 50, 50], arts: [50, 50, 50, 50, 50],
    buster: [25, 25, 25, 25, 25], quick: [75, 75, 75, 75, 75],
    extra: [50, 50, 50, 50, 50], defence: [500, 500, 500, 500, 500] };
  const DIST = [16, 33, 51];
  const NP_IDS = [9001, 9002, 9003];

  function tdSkill() {
    const tdFn = (type) => ({
      funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice',
      svals: [{ Rate: 1000, Turn: 3, Count: -1, Value: 0 }],
      functvals: [], funcquestTvals: [], buffs: [{ name: type, type, tvals: [], svals: [{ Value: 0, Turn: 3 }] }],
    });
    return {
      id: 9100, num: 2, name: 'Venus Driver B', coolDown: [5],
      functions: [
        { funcType: 'gainNp', funcTargetType: 'self', svals: [{ Value: 3000 }], functvals: [], funcquestTvals: [], buffs: [] },
        tdFn('tdTypeChange'),
        tdFn('tdTypeChangeArts'),
        tdFn('tdTypeChangeBuster'),
        tdFn('tdTypeChangeQuick'),
      ],
    };
  }
  const aoeNp = (id, card) => ({
    id, card, name: `NP-${card}`,
    script: { tdTypeChangeIDs: NP_IDS },
    functions: [{ funcType: 'damageNp', funcTargetType: 'enemyAll', svals: [{ Value: 6000 }], buffs: [] }],
    npGain: NP_GAIN, npDistribution: DIST,
  });
  function buildSpaceIshtarStub(initialCharge) {
    return {
      collectionNo: 99999, name: 'SyntheticIshtar', className: 'avenger', classId: 11,
      gender: 'female', attribute: 'human', rarity: 5, traits: [{ id: 110 }],
      cards: ['arts', 'arts', 'buster', 'quick', 'buster'], atkGrowth: ATK,
      skills: [tdSkill()], classPassive: [],
      noblePhantasms: [aoeNp(NP_IDS[0], 'arts'), aoeNp(NP_IDS[1], 'buster'), aoeNp(NP_IDS[2], 'quick')],
    };
  }

  function runWith(token) {
    const inputs = {
      servantDataList: [
        { rawData: buildSpaceIshtarStub(100), opts: { initialCharge: 100, attack: 2000, np: 5 } },
      ],
      questData: loadQuest(94089601),
      mcData: loadMysticCode(20),
      damageMultiplier: 1.0,
    };
    return new Driver(inputs).run(token);
  }

  test.each([
    ['[Ch3A]', 'tdTypeChangeArts',   NP_IDS[0]],
    ['[Ch3B]', 'tdTypeChangeBuster', NP_IDS[1]],
    ['[Ch3C]', 'tdTypeChangeQuick',  NP_IDS[2]],
  ])('S2 %s arms %s and resolves to NP %i', (suffix, expectedType, expectedNpId) => {
    const engine = runWith(`b${suffix}`);
    expect(engine).not.toBe(false);
    const s = engine.servants[0];
    const armed = s.buffs.buffs.filter(b => typeof b.type === 'string'
      && b.type.startsWith('tdTypeChange') && b.type !== 'tdTypeChange');
    expect(armed.length).toBe(1);
    expect(armed[0].type).toBe(expectedType);

    const newId = s.nps.tdTypeChangeNewId(s.buffs.buffs);
    expect(s.nps.getNpById(newId).id).toBe(expectedNpId);
  });
});
