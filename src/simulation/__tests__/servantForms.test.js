/**
 * Form/ascension override (Servant.js formKey opt).
 *
 * The sync pipeline collapses ascensionAdd into a compact `forms[]` (distinct
 * per-ascension trait/attribute sets). When the player selects a form, the
 * engine swaps the servant's trait ids + attribute to that form's values. No
 * formKey (or an unknown one) leaves base traits untouched, so existing sims
 * are unaffected — that default-safety is the important guarantee here.
 */
import { Servant } from '../Servant';
import { loadServant } from '../__fixtures__/realData';

// Minimal Mélusine-style blob: base = Cruise (canFlyInSpace, id 2924), the
// alternate form 0 = Analog (knightsOfTheRound, id 2795).
const rawData = () => ({
  collectionNo: 9001, name: 'Test Fae', className: 'lancer', classId: 101,
  gender: 'female', attribute: 'earth', rarity: 5,
  traits: [{ id: 2 }, { id: 101 }, { id: 201 }, { id: 2924 }],
  atkGrowth: Array.from({ length: 120 }, () => 1000),
  skills: [], noblePhantasms: [], classPassive: [],
  forms: [
    { key: 0, asc: 2, label: 'Analog', attribute: 'earth', traitIds: [2, 101, 201, 2795], traits: ['knightsOfTheRound'], isBase: false },
    { key: 3, asc: 4, label: 'Cruise', attribute: 'earth', traitIds: [2, 101, 201, 2924], traits: ['canFlyInSpace'], isBase: true, final: true },
  ],
});

describe('Servant form override', () => {
  test('no formKey defaults to the final ascension form', () => {
    const s = new Servant(rawData(), {});
    expect(s.traits).toEqual([2, 101, 201, 2924]); // Cruise (final)
    expect(s.traits).not.toContain(2795);
  });

  test('selecting a form swaps to that form\'s trait ids', () => {
    const s = new Servant(rawData(), { formKey: 0 });
    expect(s.traits).toContain(2795);     // knightsOfTheRound (Analog)
    expect(s.traits).not.toContain(2924); // not canFlyInSpace
    // baseline snapshot reflects the chosen form so class-override reverts to it
    expect(s._baseTraits).toContain(2795);
  });

  test('unknown formKey falls back to base traits', () => {
    const s = new Servant(rawData(), { formKey: 77 });
    expect(s.traits).toEqual([2, 101, 201, 2924]);
  });

  test('form attribute override is applied', () => {
    const data = rawData();
    data.forms[0].attribute = 'sky';
    const s = new Servant(data, { formKey: 0 });
    expect(s.attribute).toBe('sky');
  });
});

// End-to-end against the real Mélusine (312) blob: her two forms swap both the
// active NP card (Analog=Arts 304801, Cruise=Buster 304802) and the form trait
// (knightsOfTheRound vs canFlyInSpace). Default must field Cruise (final asc).
describe('Mélusine (312) real-data forms', () => {
  const data = loadServant(312);

  test('default fields the final form (Cruise / Buster)', () => {
    const s = new Servant(data, {});
    expect(s.nps.card).toBe('buster');
    expect(s.nps.getNpById(null).id).toBe(304802);
    expect(s.traits).toContain(2924);     // canFlyInSpace
    expect(s.traits).not.toContain(2795); // knightsOfTheRound
  });

  test('picking Analog (asc 0) swaps to the Arts NP and its traits', () => {
    const s = new Servant(data, { formKey: 0 });
    expect(s.nps.card).toBe('arts');
    expect(s.nps.getNpById(null).id).toBe(304801);
    expect(s.traits).toContain(2795);
    expect(s.traits).not.toContain(2924);
  });
});
