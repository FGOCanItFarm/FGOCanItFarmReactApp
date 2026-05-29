import { Buffs } from './Buffs.js';
import { classTraitByName } from './gameData.js';

export class Enemy {
  constructor(enemydata) {
    this.name      = enemydata[0];
    this.maxHp     = enemydata[1];
    this.hp        = enemydata[1];
    this.deathRate = enemydata[2];
    this.className = enemydata[3];
    this.traits    = Array.isArray(enemydata[4]) ? [...enemydata[4]] : [];
    // Ensure the enemy carries its class individuality trait. Raw quest data
    // includes it inconsistently, but class-conditional damage passives —
    // "STR Up vs. <class>" and same-class specials (Kazuradrop's 75% vs own
    // class after a class-change) — key on it, so inject it when missing.
    const classTrait = classTraitByName[this.className];
    if (classTrait != null && !this.traits.includes(classTrait)) this.traits.push(classTrait);
    this.attribute = enemydata[5];
    this.state     = enemydata[6];
    this.defense   = 0;
    this.bResdown  = 0;
    this.aResdown  = 0;
    this.qResdown  = 0;
    this.buffs     = new Buffs({ enemy: this });
    this.npPerHitMult = this.npGainPerHit();
    // { attackerClassName: multiplier } override for the 90** class-vulnerability
    // gimmick; null when the enemy has no such buff (the common case).
    this.classAdvantageMod = null;
  }

  // 90** vulnerability: returns the overridden class-advantage multiplier for an
  // attacker of the given class, or null to fall back to the normal class matrix.
  getClassAdvantageMod(attackerClass) {
    const v = this.classAdvantageMod?.[attackerClass];
    return typeof v === 'number' ? v : null;
  }

  getDef()      { return this.defense; }
  getBResdown() { return this.bResdown; }
  getAResdown() { return this.aResdown; }
  getQResdown() { return this.qResdown; }
  getName()     { return this.name; }
  getMaxHp()    { return this.maxHp; }
  getHp()       { return this.hp; }
  setHp(dmg)    { this.hp -= dmg; }
  getClass()    { return this.className; }
  getTraits()   { return this.traits; }

  addBuff(buff) {
    this.buffs.addBuff(buff);
    this.buffs.processEnemyBuffs();
  }

  npGainPerHit() {
    let m = 1;
    if (this.className === 'rider')     m *= 1.1;
    if (this.className === 'caster')    m *= 1.2;
    if (this.className === 'assassin')  m *= 0.9;
    if (this.className === 'berserker') m *= 0.8;
    // undead (1002) or soldier (1100) bonus
    if (this.traits.includes(1002) || this.traits.includes(1100)) m *= 1.2;
    return m;
  }

  decrementBuffs() {
    for (const buff of [...this.buffs.buffs]) {
      if (buff.turns != null) {
        if (buff.turns > 0) buff.turns -= 1;
        if (buff.turns === 0)
          this.buffs.buffs = this.buffs.buffs.filter(b => b !== buff);
      }
    }
  }
}
