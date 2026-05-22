import { Buffs } from './Buffs.js';

export class Enemy {
  constructor(enemydata) {
    this.name      = enemydata[0];
    this.maxHp     = enemydata[1];
    this.hp        = enemydata[1];
    this.deathRate = enemydata[2];
    this.className = enemydata[3];
    this.traits    = enemydata[4];
    this.attribute = enemydata[5];
    this.state     = enemydata[6];
    this.defense   = 0;
    this.bResdown  = 0;
    this.aResdown  = 0;
    this.qResdown  = 0;
    this.buffs     = new Buffs({ enemy: this });
    this.npPerHitMult = this.npGainPerHit();
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
