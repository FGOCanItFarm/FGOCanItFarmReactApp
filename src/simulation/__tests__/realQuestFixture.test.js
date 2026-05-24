/**
 * Verifies the trimmed real quest fixture (94095710, enemyHash 1_1053_6d20505)
 * still drives Quest.js correctly — i.e. stripQuestData (shared/atlasSync.js)
 * kept every field the simulation reads. Guards against an over-aggressive trim
 * silently dropping enemy data the engine needs (hp/class/attribute/trait ids).
 */
import { Quest } from '../Quest';
import { loadQuest } from '../__fixtures__/realData';

describe('real quest fixture 94095710 (trimmed)', () => {
  const quest = new Quest(loadQuest(94095710));

  test('parses 3 waves with expected enemy counts', () => {
    expect(quest.totalWaves).toBe(3);
    expect(quest.getWave(1)).toHaveLength(1);
    expect(quest.getWave(2)).toHaveLength(6);
    expect(quest.getWave(3)).toHaveLength(3);
  });

  test('battle field traits come from individuality', () => {
    expect(quest.fields).toEqual([94000154]);
  });

  test('wave-1 enemy retains hp / class / attribute / numeric trait ids', () => {
    const [boss] = quest.getWave(1);
    expect(boss.maxHp).toBe(181138);
    expect(boss.getClass()).toBe('berserker');
    expect(boss.attribute).toBe('earth');
    expect(boss.traits).toHaveLength(8);
    expect(boss.traits.every((t) => typeof t === 'number')).toBe(true);
  });
});
