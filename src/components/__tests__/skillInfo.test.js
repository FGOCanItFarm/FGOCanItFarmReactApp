/**
 * Auto-detect "is this an NP-type chooser skill?" from the nice Atlas blob so
 * the UI no longer needs a hardcoded servant→skillIdx list for new swap
 * servants. Two detection paths cover what's in production today:
 *
 *   1. `script.selectTreasureDeviceInfo[0].treasureDevices` lists the option
 *      → NP id mapping (BB Dubai 421 S3 「Golden Capital on the Moon EX」).
 *   2. 2+ suffixed `tdTypeChange{Arts,Buster,Quick}` functions on the same
 *      skill, where the choice is implicit-by-card (Emiya 11 S3, Space
 *      Ishtar 268 S2 「Venus Driver B」).
 *
 * Skills with a single tdTypeChange* function (Kukulkan 391's unconditional
 * Arts swap) are NOT a choice — variant count must be ≥ 2.
 */
import { parseServantSkills } from '../skillInfo';

const bareSkill = (num, fns = [], script = {}) => ({
  num, id: 1000 + num, name: `Skill ${num}`, functions: fns, script,
});

describe('parseServantSkills — choice detection', () => {
  test('selectTreasureDeviceInfo path: BB Dubai 421 S3 with two treasureDevices', () => {
    const data = {
      skills: [
        bareSkill(1),
        bareSkill(2),
        bareSkill(3, [
          { funcType: 'shortenSkill', funcTargetType: 'self', buffs: [] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChange' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeArts' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeBuster' }] },
        ], {
          selectTreasureDeviceInfo: [{
            treasureDevices: [
              { id: 2300601, type: '1', message: '攻撃タイプ' },
              { id: 2300698, type: '1', message: '防御タイプ' },
            ],
          }],
        }),
      ],
    };
    const out = parseServantSkills(data);
    expect(out[2].isChoice).toBe(true);
    expect(out[2].choiceCount).toBe(2);
    expect(out[0].isChoice).toBe(false);
    expect(out[1].isChoice).toBe(false);
  });

  test('tdTypeChange* count path: Emiya 11 S3 with 2 suffixed variants (Arts + Buster)', () => {
    const data = {
      skills: [
        bareSkill(1),
        bareSkill(2),
        bareSkill(3, [
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'tdTypeChange' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeArts' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeBuster' }] },
        ]),
      ],
    };
    const out = parseServantSkills(data);
    expect(out[2].isChoice).toBe(true);
    expect(out[2].choiceCount).toBe(2);
  });

  test('tdTypeChange* count path: Space Ishtar 268 S2 with 3 suffixed variants', () => {
    const data = {
      skills: [
        bareSkill(1),
        bareSkill(2, [
          { funcType: 'gainNp', funcTargetType: 'self', buffs: [] },
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'upNpdamage' }] },
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'invincible' }] },
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'tdTypeChange' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeArts' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeBuster' }] },
          { funcType: 'addStateShort', funcTargetType: 'commandTypeSelfTreasureDevice', buffs: [{ type: 'tdTypeChangeQuick' }] },
        ]),
        bareSkill(3),
      ],
    };
    const out = parseServantSkills(data);
    expect(out[1].isChoice).toBe(true);
    expect(out[1].choiceCount).toBe(3);
    expect(out[0].isChoice).toBe(false);
    expect(out[2].isChoice).toBe(false);
  });

  test('single tdTypeChange* variant is NOT a choice (Kukulkan-style unconditional swap)', () => {
    const data = {
      skills: [
        bareSkill(1),
        bareSkill(2),
        bareSkill(3, [
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'upNpdamage' }] },
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'tdTypeChangeArts' }] },
        ]),
      ],
    };
    const out = parseServantSkills(data);
    expect(out[2].isChoice).toBe(false);
    expect(out[2].choiceCount).toBe(1);
  });

  test('bare tdTypeChange (no suffix) alone is not a choice — Mash 1 NP self-loaded pattern', () => {
    const data = {
      skills: [
        bareSkill(1),
        bareSkill(2),
        bareSkill(3, [
          { funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'tdTypeChange' }] },
        ]),
      ],
    };
    const out = parseServantSkills(data);
    expect(out[2].isChoice).toBe(false);
  });

  test('servants with no swap skills have isChoice=false everywhere', () => {
    const data = {
      skills: [
        bareSkill(1, [{ funcType: 'gainNp', funcTargetType: 'self', buffs: [] }]),
        bareSkill(2, [{ funcType: 'addStateShort', funcTargetType: 'self', buffs: [{ type: 'upAtk' }] }]),
        bareSkill(3, [{ funcType: 'addStateShort', funcTargetType: 'ptAll', buffs: [{ type: 'upNpdamage' }] }]),
      ],
    };
    const out = parseServantSkills(data);
    expect(out.every(s => s.isChoice === false)).toBe(true);
  });
});
