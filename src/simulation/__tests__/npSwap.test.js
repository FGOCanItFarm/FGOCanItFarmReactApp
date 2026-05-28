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
