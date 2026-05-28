const MAGIC_BULLET_BUFF = { buff: 'Magic Bullet', functvals: [], value: 9999, tvals: [], turns: -1 };

export class Buffs {
  constructor({ servant = null, enemy = null } = {}) {
    this.buffs = [];
    if (servant) this.servant = servant;
    if (enemy) this.enemy = enemy;
  }

  processEndTurnSkills() {
    let addMagicBullets = false;
    for (const buff of this.buffs) {
      // Per-turn NP charge (Lord Logres S1, etc.). svals.Value is in 0.01%
      // units (a 50% battery = 5000), same scale as the gainNp handler — convert
      // to gauge percent. Applied here (once per turn) NOT in processServantBuffs
      // (a recompute that runs many times per turn and would compound it).
      if (
        buff.buff === 'NP Gain Each Turn' ||
        buff.buff.includes('Triggers Each Turn (Increase NP)') ||
        buff.buff.includes('Triggers Each Turn (NP Absorb)')
      ) this.servant.setNpgauge(buff.value / 100);
      if (buff.buff === 'Delayed Effect (Death)') this.servant.kill = true;
      if (this.servant.name === 'Super Aoko') addMagicBullets = true;
    }
    if (addMagicBullets) {
      this.addBuff({ ...MAGIC_BULLET_BUFF });
      this.addBuff({ ...MAGIC_BULLET_BUFF });
    }
  }

  processEnemyBuffs() {
    this.enemy.defense = 0;
    this.enemy.bResdown = 0;
    this.enemy.aResdown = 0;
    this.enemy.qResdown = 0;
    this.enemy.roman = this.enemy.traits.filter(t => t === 2004).length;
    for (const buff of this.buffs) {
      if      (buff.buff === 'DEF Down')               this.enemy.defense   -= buff.value / 1000;
      else if (buff.buff === 'Buster Card Resist Down') this.enemy.bResdown  -= buff.value / 1000;
      else if (buff.buff === 'Arts Card Resist Down')   this.enemy.aResdown  -= buff.value / 1000;
      else if (buff.buff === 'Quick Card Resist Down')  this.enemy.qResdown  -= buff.value / 1000;
      else if (buff.buff === 'Apply Trait (Rome)')      this.enemy.traits.push(2004);
    }
  }

  processServantBuffs() {
    const s = this.servant;
    s.atkMod            = s.userAtkMod;
    s.bUp               = s.userBUp;
    s.aUp               = s.userAUp;
    s.qUp               = s.userQUp;
    s.powerMod          = {};
    s.npDamageMod       = s.userNpDamageMod;
    s.ocLevel           = 1;
    s.npGainMod         = 1;
    s.busterCardDamageUp = s.userBusterDamageUp;
    s.artsCardDamageUp  = s.userArtsDamageUp;
    s.quickCardDamageUp = s.userQuickDamageUp;

    let boostNpStrengthUpActive = false;

    for (const buff of this.buffs) {
      const requiredField = buff.script?.INDIVIDUALITIE?.id ?? buff.originalScript?.INDIVIDUALITIE ?? null;
      if (requiredField === null
          || s.fields.includes(requiredField)
          || (s.traits && s.traits.includes(requiredField))) {
        if (buff.buff === 'NP Strength Up' || buff.buff === 'upNpdamage') {
          s.npDamageMod += buff.value / 1000;
        } else if (buff.buff === 'Boost NP Strength Up') {
          boostNpStrengthUpActive = true;
        }
      }
    }

    if (boostNpStrengthUpActive) s.npDamageMod *= 2;

    for (const buff of this.buffs) {
      const requiredField = buff.script?.INDIVIDUALITIE?.id ?? buff.originalScript?.INDIVIDUALITIE ?? null;
      if (requiredField === null
          || s.fields.includes(requiredField)
          || (s.traits && s.traits.includes(requiredField))) {
        switch (buff.buff) {
          case 'ATK Up':                 s.atkMod  += buff.value / 1000; break;
          case 'Buster Up':              s.bUp     += buff.value / 1000; break;
          case 'Arts Up':                s.aUp     += buff.value / 1000; break;
          case 'Quick Up':               s.qUp     += buff.value / 1000; break;
          case 'NP Overcharge Level Up':
          case 'Overcharge Lv. Up':      s.ocLevel  = Math.min(s.ocLevel + buff.value, 5); break;
          case 'NP Gain Up':             s.npGainMod += buff.value / 1000; break;
          case 'Buster Card Damage Up':  s.busterCardDamageUp += buff.value / 1000; break;
          case 'Arts Card Damage Up':    s.artsCardDamageUp   += buff.value / 1000; break;
          case 'Quick Card Damage Up':   s.quickCardDamageUp  += buff.value / 1000; break;
          default:
            if (buff.type === 'upDamage'
                || buff.buff.includes('STR Up')
                || buff.buff.includes('Strength Up')) {
              for (const tval of (buff.tvals || [])) {
                if (!(tval in s.powerMod)) s.powerMod[tval] = 0;
                s.powerMod[tval] += buff.value || 0;
              }
            }
            // NOTE: per-turn NP gain ("Triggers Each Turn …", "NP Gain Each
            // Turn") is applied once per turn in processEndTurnSkills, NOT here —
            // processServantBuffs is a derived-stat recompute that runs many
            // times per turn, so mutating npGauge here would compound it.
        }
      }
    }
  }

  parsePassive(passivesData) {
    return passivesData.map(passive => ({
      id: passive.id,
      name: passive.name,
      functions: this.parsePassiveFunctions(passive.functions || []),
    }));
  }

  parsePassiveFunctions(functionsData) {
    return functionsData.map(func => {
      const svalsRaw = func.svals;
      const sval = (Array.isArray(svalsRaw) && svalsRaw.length > 0 && typeof svalsRaw[0] === 'object')
        ? svalsRaw[0] : {};
      return {
        funcType: func.funcType,
        funcTargetType: func.funcTargetType,
        functvals: func.functvals || [],
        svals: sval,
        buffs: func.buffs || [],
      };
    });
  }

  addBuff(buff) { this.buffs.push(buff); }

  removeBuff(buff) {
    const idx = this.buffs.indexOf(buff);
    if (idx !== -1) this.buffs.splice(idx, 1);
  }

  decrementBuffs() {
    this.buffs = this.buffs.filter(buff => {
      if (buff.turns > 0) buff.turns -= 1;
      return buff.turns !== 0;
    });
  }

  clearBuff(name) {
    this.buffs = this.buffs.filter(b => b.buff !== name);
  }

  // Spend one charge of each count-limited Overcharge Lv. Up buff (the "1 time"
  // party OC from NPs like Lord Logres). Unlimited buffs (count -1, e.g. the
  // 1-turn NP-chain OC) are left untouched; buffs whose count hits 0 are removed.
  consumeOverchargeBuffs() {
    this.buffs = this.buffs.filter(b => {
      if ((b.buff === 'Overcharge Lv. Up' || b.buff === 'NP Overcharge Level Up') && b.count > 0) {
        b.count -= 1;
        return b.count > 0;
      }
      return true;
    });
  }
}
