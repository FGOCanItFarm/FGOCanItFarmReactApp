/**
 * Guards the 90** class-vulnerability extraction in the sync pipeline.
 *
 * "Anti-<Class> Defense Vulnerability" is an enemy `overwriteClassRelation` buff
 * whose script.relationId.defSide[attacker][defender].damageRate forces the
 * class multiplier (e.g. saber→lancer 5000 = 5×). extractClassAdvantageMod
 * flattens it to { attackerClassName: multiplier } for Enemy.classAdvantageMod.
 * (Real shape verified against Atlas quest 94100501 Great Dragon / Vritra.)
 */
import { extractClassAdvantageMod } from '../../../shared/atlasSync.js';

const vulnBuff = {
  type: 'overwriteClassRelation',
  name: 'Anti-Saber Defense Vulnerability',
  script: { relationId: { atkSide: {}, defSide: { saber: { lancer: { damageRate: 5000, type: 'overwriteForce' } } } } },
};
const enemyWith = (buffs, className = 'lancer') => ({
  svt: { className },
  classPassive: [{ functions: [{ funcType: 'addState', buffs }] }],
});

test('extracts saber 5x vulnerability for a lancer enemy', () => {
  expect(extractClassAdvantageMod(enemyWith([vulnBuff]))).toEqual({ saber: 5 });
});

test('only applies entries matching THIS enemy class', () => {
  // defSide targets a rider defender, but the enemy is a lancer -> no match.
  const riderOnly = { ...vulnBuff, script: { relationId: { defSide: { saber: { rider: { damageRate: 5000 } } } } } };
  expect(extractClassAdvantageMod(enemyWith([riderOnly], 'lancer'))).toBeNull();
});

test('reads buffs from the enemy skills object too', () => {
  const e = { svt: { className: 'lancer' }, skills: { skill1: { functions: [{ buffs: [vulnBuff] }] } } };
  expect(extractClassAdvantageMod(e)).toEqual({ saber: 5 });
});

test('returns null when the enemy has no vulnerability buff', () => {
  expect(extractClassAdvantageMod(enemyWith([{ type: 'upAtk', name: 'ATK Up' }]))).toBeNull();
});
