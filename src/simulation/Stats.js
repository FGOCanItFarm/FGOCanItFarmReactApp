import { classAdvantageMatrix, attributeDict, classIndices } from './gameData.js';

export class Stats {
  constructor(servant) {
    this.servant = servant;
  }

  decrementCooldowns(effect) {
    for (const skill of Object.keys(this.servant.cooldowns)) {
      if (this.servant.cooldowns[skill] > 0) {
        this.servant.cooldowns[skill] = Math.max(
          this.servant.cooldowns[skill] - effect.svals.Value, 0
        );
      }
    }
  }

  getBaseAtk() {
    return (this.servant.ceAttack + 1000 + this.getAtkAtLevel()) * this.getClassBaseMultiplier();
  }

  getAtkAtLevel(level = 0) {
    if (level === 0) {
      const rarityLevels = { 1: 55, 2: 60, 3: 65, 4: 80, 5: 90 };
      level = rarityLevels[this.servant.rarity] ?? 90;
    }
    return level <= 120 ? this.servant.atkGrowth[level - 1] : null;
  }

  getName()           { return this.servant.name; }
  getAtkMod()         { return this.servant.atkMod; }
  getBUp()            { return this.servant.bUp; }
  getAUp()            { return this.servant.aUp; }
  getQUp()            { return this.servant.qUp; }
  getNpDamageMod()    { return this.servant.npDamageMod; }
  getNpLevel()        { return this.servant.npLevel; }
  getOcLevel()        { return this.servant.ocLevel; }
  setOcLevel(oc)      { this.servant.ocLevel = oc; }
  getNpgain()         { return this.servant.nps.getNpgain(this.servant.cardType); }
  getNpGainMod()      { return this.servant.npGainMod; }
  getNpdist()         { return this.servant.nps.getNpdist(); }
  getNpgauge()        { return this.servant.npGauge; }

  setNpgauge(val = 0) {
    if (val === 0) this.servant.npGauge = 0;
    else this.servant.npGauge += val;
  }

  getPowerMod(target = null) {
    if (target) {
      let powermod = 0;
      for (const key of Object.keys(this.servant.powerMod)) {
        if (target.traits.includes(Number(key))) powermod += this.servant.powerMod[key];
      }
      return powermod / 1000;
    }
    return this.servant.powerMod;
  }

  getClassMultiplier(defenderClass) {
    return classAdvantageMatrix[classIndices[this.servant.className]]?.[classIndices[defenderClass]] ?? 1.0;
  }

  getClassBaseMultiplier() { return this.servant.classBaseMultiplier; }

  getAttributeModifier(defender) {
    return attributeDict[this.servant.attribute]?.[defender.attribute] ?? 1.0;
  }

  containsTrait(traitId) {
    return this.servant.traits.includes(traitId[0].id);
  }

  getBusterCardDamageUp() { return this.servant.busterCardDamageUp ?? 0; }
  getArtsCardDamageUp()   { return this.servant.artsCardDamageUp   ?? 0; }
  getQuickCardDamageUp()  { return this.servant.quickCardDamageUp  ?? 0; }
}
