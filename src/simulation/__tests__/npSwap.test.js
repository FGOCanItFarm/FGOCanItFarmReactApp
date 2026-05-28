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

  test('with any tdTypeChange* buff active, resolves to ids[1] (the alternate)', () => {
    const nps = makeNps();
    for (const buffType of ['tdTypeChange', 'tdTypeChangeArts', 'tdTypeChangeBuster', 'tdTypeChangeQuick']) {
      const altNewId = nps.tdTypeChangeNewId([{ type: buffType }]);
      expect(altNewId).not.toBeNull();
      expect(nps.getNpById(altNewId).id).toBe(800108);
    }
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

  test('handles 3-NP groups by returning the alternate slot (ids[1]); 3-way card-driven choice is FR-3 future work', () => {
    const nps = new NP([
      { id: 1100901, card: '1', script: { tdTypeChangeIDs: [1100901, 1100997, 1100998] } },
      { id: 1100997, card: '2', script: { tdTypeChangeIDs: [1100901, 1100997, 1100998] } },
      { id: 1100998, card: '3', script: { tdTypeChangeIDs: [1100901, 1100997, 1100998] } },
    ]);
    expect(nps.getNpById(nps.tdTypeChangeNewId([])).id).toBe(1100901);
    expect(nps.getNpById(nps.tdTypeChangeNewId([{ type: 'tdTypeChangeBuster' }])).id).toBe(1100997);
  });
});
