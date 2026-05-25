import { baseMultipliers } from './gameData.js';
import { Stats }  from './Stats.js';
import { Skills } from './Skills.js';
import { Buffs }  from './Buffs.js';
import { NP }     from './NP.js';

export class Servant {
  static specialServants = [312, 394, 391, 413, 385, 350, 306, 305];

  /**
   * @param {object} rawData  - Full servant record from Supabase (the `data` JSONB column)
   * @param {object} opts     - User-supplied battle configuration
   */
  constructor(rawData, {
    np             = 1,
    initialCharge  = 0,
    attack         = 0,
    atkUp          = 0,
    artsUp         = 0,
    quickUp        = 0,
    busterUp       = 0,
    npUp           = 0,
    damageUp       = 0,
    busterDamageUp = 0,
    quickDamageUp  = 0,
    artsDamageUp   = 0,
    append5        = false,
  } = {}) {
    this.id        = rawData.collectionNo;
    this.data      = rawData;
    this.name      = rawData.name;
    this.className = rawData.className;
    this.classId   = rawData.classId;
    this.gender    = rawData.gender;
    this.attribute = rawData.attribute;
    this.traits    = (rawData.traits || []).map(t => t.id);
    this.cards     = rawData.cards || [];
    this.atkGrowth = rawData.atkGrowth || [];
    this.rarity    = rawData.rarity;

    // Mash Kyrielight (collectionNo 1): Atlas models her base 4★ Shielder, but the
    // playable unit is the upgraded 5★ "Paladin" — higher ATK and Human attribute.
    // (NP swap to the offensive Holy Sword is handled in BattleEngine.useNp.)
    if (this.id === 1) {
      this.rarity    = 5;
      this.attribute = 'human';
      this.atkGrowth = this.atkGrowth.slice();
      this.atkGrowth[89] = 10835; // 5★ ATK @ Lv90 (Stats reads index 89 for rarity 5)
    }

    this.skills  = new Skills(rawData.skills || [], append5);
    this.nps     = new NP(rawData.noblePhantasms || []);
    this.buffs   = new Buffs({ servant: this });
    this.stats   = new Stats(this);

    this.npLevel     = np;
    this.ocLevel     = 1;
    this.npGauge     = initialCharge;
    this.npGainMod   = 1;
    this.ceAttack    = attack;
    this.atkMod      = atkUp;
    this.bUp         = busterUp;
    this.aUp         = artsUp;
    this.qUp         = quickUp;
    this.powerMod    = {};
    this.npDamageMod = 0;
    this.cardType    = this.nps.nps[0]?.card ?? null;
    // ID 426 is a special enemy-type entry with no standard class multiplier
    this.classBaseMultiplier = this.id === 426 ? 1 : (baseMultipliers[this.className] ?? 1);
    // Set by the simulation runner from quest field traits before battle starts
    this.fields = [];
    this.kill   = false;

    // Stored separately so processServantBuffs() can reset to baseline each turn
    this.userAtkMod        = atkUp;
    this.userBUp           = busterUp;
    this.userAUp           = artsUp;
    this.userQUp           = quickUp;
    this.userNpDamageMod   = npUp;
    this.userBusterDamageUp = busterDamageUp;
    this.userQuickDamageUp  = quickDamageUp;
    this.userArtsDamageUp   = artsDamageUp;

    this.busterCardDamageUp = busterDamageUp;
    this.artsCardDamageUp   = artsDamageUp;
    this.quickCardDamageUp  = quickDamageUp;

    this.passives = this.buffs.parsePassive(rawData.classPassive || []);
    this.applyPassiveBuffs();
  }

  setNpgauge(value) {
    if (value === 0) this.npGauge = 0;
    else this.npGauge += value;
  }

  getNpgauge() { return this.npGauge; }

  applyBonusBuffs() {
    const add = (name, val) => val && this.applyBuff({ buff_name: name, value: val, turns: -1, functvals: [], tvals: [] });
    add('ATK Up',                this.userAtkMod);
    add('Buster Up',             this.userBUp);
    add('Arts Up',               this.userAUp);
    add('Quick Up',              this.userQUp);
    add('NP Strength Up',        this.userNpDamageMod);
    add('Buster Card Damage Up', this.userBusterDamageUp);
    add('Quick Card Damage Up',  this.userQuickDamageUp);
    add('Arts Card Damage Up',   this.userArtsDamageUp);
  }

  applyPassiveBuffs() {
    for (const passive of this.passives) {
      for (const func of passive.functions) {
        for (const buff of func.buffs) {
          this.applyBuff({
            buff_name: buff.name || 'Unknown',
            value:     func.svals?.Value ?? 0,
            turns:     -1,
            functvals: func.functvals || [],
            tvals:     [],
          });
        }
      }
    }
  }

  applyBuff(state) {
    this.buffs.addBuff({
      buff:      state.buff_name,
      functvals: state.functvals,
      value:     state.value,
      tvals:     (state.tvals || []).map(t => t.id ?? t),
      turns:     state.turns,
    });
  }

  applyCeEffects(ceEffects) {
    for (const effect of ceEffects) {
      this.applyBuff({
        buff_name: effect.name     || 'Unknown',
        value:     effect.value    || 0,
        turns:     -1,
        functvals: effect.functvals || [],
        tvals:     [],
      });
    }
  }
}
