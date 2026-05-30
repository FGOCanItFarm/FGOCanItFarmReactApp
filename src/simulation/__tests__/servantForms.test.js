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

// Minimal Mélusine-style blob: base = Cruise (canFlyInSpace, id 2924), the
// alternate form 0 = Analog (knightsOfTheRound, id 2795).
const rawData = () => ({
  collectionNo: 9001, name: 'Test Fae', className: 'lancer', classId: 101,
  gender: 'female', attribute: 'earth', rarity: 5,
  traits: [{ id: 2 }, { id: 101 }, { id: 201 }, { id: 2924 }],
  atkGrowth: Array.from({ length: 120 }, () => 1000),
  skills: [], noblePhantasms: [], classPassive: [],
  forms: [
    { key: 0, label: 'Analog', attribute: 'earth', traitIds: [2, 101, 201, 2795], traits: ['knightsOfTheRound'], isBase: false },
    { key: 3, label: 'Cruise', attribute: 'earth', traitIds: [2, 101, 201, 2924], traits: ['canFlyInSpace'], isBase: true },
  ],
});

describe('Servant form override', () => {
  test('no formKey keeps base traits (default-safe)', () => {
    const s = new Servant(rawData(), {});
    expect(s.traits).toEqual([2, 101, 201, 2924]);
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
