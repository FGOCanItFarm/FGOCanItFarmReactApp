import { Servant }    from './Servant.js';
import { Quest }      from './Quest.js';
import { MysticCode } from './MysticCode.js';
import { classTraitByName } from './gameData.js';
import { getEffectHandler } from './effectRegistry.js';
import { applySkillTransform } from './transforms.js';

// Injected at the start of every NP that has extra gauge above 100%
const NP_OC_1_TURN = {
  funcType: 'addStateShort', funcTargetType: 'ptAll',
  functvals: [], fieldReq: [], condTarget: [],
  svals: { Rate: 1000, Turn: 1, Count: 1, Value: 1 },
  buffs: [{ name: 'Overcharge Lv. Up', functvals: '', tvals: [], svals: null, value: 0, turns: 1 }],
};

export class BattleEngine {
  /**
   * @param {Array<{rawData: object, opts: object}>} servantDataList
   *   rawData = full servant record from Supabase; opts = battle params (np, initialCharge, …)
   * @param {object} questData   - full quest record from Supabase
   * @param {object} mcData      - full mystic code record from Supabase
   * @param {number} damageMultiplier - RNG mid-roll proxy (default 1.0)
   * @param {object|null} superAokoData - raw servant record for collectionNo 4132 (if Aoko is in party)
   */
  constructor({ servantDataList, questData, mcData, damageMultiplier = 1.0, superAokoData = null }) {
    this.servantDataList   = servantDataList;
    this.damageMultiplier  = damageMultiplier;
    this.superAokoData     = superAokoData;

    this.servants = servantDataList.map(({ rawData, opts }) => new Servant(rawData, opts ?? {}));
    this.mc       = new MysticCode(mcData);
    this.quest    = new Quest(questData);

    this.fields      = [...this.quest.fields]; // mutable battle-level field list
    this.wave        = 1;
    this.totalWaves  = this.quest.totalWaves;
    this.enemies     = this.quest.getWave(1);
    this.waveStats   = {};
    this.questCleared       = false;
    this.servantsAtWaveEnd  = {};

    this._recordInitialWaveHp();
    this._syncFields();
  }

  // ─── Field state ──────────────────────────────────────────────────────────

  /** Push battle-level field list into every servant's fields slot. */
  _syncFields() {
    for (const s of this.servants) s.fields = [...this.fields];
  }

  /**
   * Add a field trait to the battle. Called by addFieldChangeToField effects
   * from skills, NPs, enemies, or the quest itself.
   */
  addField({ fieldId }) {
    if (fieldId != null && !this.fields.includes(fieldId)) {
      this.fields.push(fieldId);
      this._syncFields();
    }
  }

  // ─── Wave state ───────────────────────────────────────────────────────────

  _recordInitialWaveHp() {
    if (!this.waveStats[this.wave]) this.waveStats[this.wave] = { hpRequired: 0, damageDealt: 0 };
    this.waveStats[this.wave].hpRequired = this.enemies.reduce((s, e) => s + e.maxHp, 0);
    // FR-8 granular logging: per-enemy, index-aligned to the live wave enemies.
    this.waveStats[this.wave].enemies = this.enemies.map((e, i) => ({
      index: i, name: e.name, maxHp: e.maxHp, damageTaken: 0, npRefund: 0,
    }));
  }

  recordNpDamage(wave, damage) {
    if (!this.waveStats[wave]) this.waveStats[wave] = { hpRequired: 0, damageDealt: 0 };
    this.waveStats[wave].damageDealt += damage;
  }

  /** FR-8: per-enemy damage / NP-refund logging, keyed by the enemy's live index. */
  _recordEnemyStat(enemy, field, amount) {
    const ws = this.waveStats[this.wave];
    const idx = this.enemies.indexOf(enemy);
    if (ws?.enemies && idx >= 0 && ws.enemies[idx]) ws.enemies[idx][field] += amount;
  }

  captureServantsAtWaveEnd(wave) {
    this.servantsAtWaveEnd[String(wave)] = this.servants.slice(0, 3).map((s, i) => ({
      slot: i,
      collectionNo: s.id,
      npGauge: Math.round(s.npGauge * 10) / 10,
    }));
  }

  getNextWave() {
    this.wave++;
    if (this.wave > this.totalWaves) return;
    this.enemies = this.quest.getWave(this.wave);
    this._recordInitialWaveHp();
  }

  getEnemies() { return this.enemies; }

  swapServants(frontlineIdx, backlineIdx) {
    [this.servants[frontlineIdx], this.servants[backlineIdx]] =
      [this.servants[backlineIdx], this.servants[frontlineIdx]];
  }

  /** Aoko's NP triggers a full servant swap to the Super Aoko profile. */
  transformAoko(aokoBuffs, aokoCooldowns, aokoNpGauge = null) {
    if (!this.superAokoData) return;
    for (let i = 0; i < this.servants.length; i++) {
      if (this.servants[i].id === 413) {
        const transformed = new Servant(this.superAokoData, {});
        transformed.buffs.buffs      = aokoBuffs.map(b => ({ ...b }));
        transformed.skills.cooldowns = { ...aokoCooldowns };
        if (aokoNpGauge !== null) transformed.npGauge = aokoNpGauge;
        this.servants[i] = transformed;
      }
    }
  }

  // ─── Turn management ──────────────────────────────────────────────────────

  endTurn() {
    if (!this.enemies.every(e => e.hp <= 0)) return false;

    // Process end-of-turn triggered effects (NP gain per turn, death flags, etc.)
    for (const s of this.servants.slice(0, 3)) s.buffs.processEndTurnSkills();

    // Handle death-flagged servants (Arash, Bunyan self-sacrifice)
    for (let i = 0; i < 3; i++) {
      const s = this.servants[i];
      if (s?.kill) {
        if (this.servants.length > 3) {
          this.servants[i] = this.servants[3];
          this.servants.splice(3, 1);
        }
        if (s) s.kill = false;
      }
    }

    this._decrementBuffs();
    this._decrementCooldowns();
    this.mc.decrementCooldowns();
    this.captureServantsAtWaveEnd(this.wave);

    if (this.wave >= this.totalWaves) {
      this.questCleared = true;
      return true;
    }
    this.getNextWave();
    return true;
  }

  _decrementBuffs() {
    for (const t of [...this.enemies, ...this.servants]) t.buffs?.decrementBuffs();
  }

  _decrementCooldowns() {
    for (const s of this.servants.slice(0, 3)) s?.skills.decrementCooldowns(1);
  }

  // ─── Effect execution ─────────────────────────────────────────────────────

  extractState(effect) {
    let svals = effect.svals ?? {};
    if (Array.isArray(svals)) svals = svals[0] ?? {};

    if (effect.funcType === 'gainNp') {
      return { type: 'gainNp', functvals: effect.condTarget || [], value: svals.Value || 0 };
    }
    if (effect.funcType === 'addFieldChangeToField') {
      return { type: 'fieldChange', fieldId: (svals.FieldIndividuality || [null])[0], turns: svals.Turn || 0 };
    }

    const buffs  = effect.buffs || [];
    const buff   = buffs[0] || {};
    const tvals  = buff.tvals || [];
    const hasName = buff.name && buff.name !== 'Unknown';
    const state = {
      type:           'buff',
      buff_name:      hasName ? buff.name : (buff.type || 'Unknown'),
      buff_type:      buff.type,
      functvals:      hasName ? (effect.functvals || []) : (tvals[0]?.id ?? 'Unknown'),
      tvals,
      value:          svals.Value || 0,
      turns:          svals.Turn  || 0,
      count:          svals.Count ?? -1,
      script:         buff.script,
      originalScript: buff.originalScript,
    };

    // tdTypeChange* (BB Dubai S3, etc.): if the parent skill carried a
    // `selectTreasureDeviceInfo` entry for the chosen option, embed its NP id
    // on the buff so NP.tdTypeChangeNewId can resolve to the exact group
    // member. Without it, the NP-side card-key fallback handles selection.
    if (typeof buff.type === 'string' && buff.type.startsWith('tdTypeChange') && this._pendingChoiceNpId != null) {
      state.targetNpId = this._pendingChoiceNpId;
    }

    // overwriteBattleclass (Kazuradrop S3 「月の蛹」): the buff is self-target,
    // but the class to copy comes from the enemy the skill was pinned to.
    // Capture the target enemy's class so processServantBuffs can swap class /
    // class-trait while the buff is active. If no enemy target was provided
    // (bare `g`/`g1`), fall back to the first surviving enemy (FGO defaults to
    // the highest-HP / leftmost enemy in practice).
    if (buff.type === 'overwriteBattleclass') {
      const enemy = this._skillTargetEnemy ?? this.enemies?.find(e => e.hp > 0) ?? null;
      if (enemy) {
        state.targetClassName = enemy.className;
        state.targetClassId   = enemy.classId;
        state.targetClassTrait = classTraitByName[enemy.className] ?? null;
      }
    }
    return state;
  }

  applyEffect(effect, servant, allyTarget = null) {
    if (!effect?.funcType) return;
    const condTarget = effect.condTarget || [];
    const fieldReq   = effect.fieldReq   || [];
    if (!allyTarget) allyTarget = servant;

    let targets = [];
    switch (effect.funcTargetType) {
      case 'self':                          targets = servant ? [servant] : [];           break;
      case 'commandTypeSelfTreasureDevice': targets = servant ? [servant] : [];           break;
      case 'enemyAll':  targets = this.getEnemies();                  break;
      case 'enemy':     targets = [allyTarget];                       break;
      case 'ptOther':   targets = this.servants.filter(s => s !== servant); break;
      case 'ptAll':     targets = this.servants;                      break;
      case 'ptOne':     targets = [allyTarget];                       break;
      default:          targets = [];                                  break;
    }

    const checkCond  = t => !condTarget.length || condTarget.every(c => t.traits.includes(c.id));
    const checkField = () => !fieldReq.length  || fieldReq.some(f => this.fields.includes(f.id));
    if (!checkField()) return;

    for (const target of targets) {
      if (!checkCond(target)) continue;
      const handler = getEffectHandler(effect.funcType);
      if (handler) handler(this, effect, target);
    }
  }

  applyBuff(target, state) {
    target.buffs.addBuff({
      buff:             state.buff_name,
      type:             state.buff_type,
      functvals:        state.functvals,
      value:            state.value,
      tvals:            (state.tvals || []).map(t => t.id ?? t),
      turns:            state.turns,
      count:            state.count ?? -1,
      targetClassName:  state.targetClassName,
      targetClassId:    state.targetClassId,
      targetClassTrait: state.targetClassTrait,
      targetNpId:       state.targetNpId,
      script:           state.script,
      originalScript:   state.originalScript,
    });
  }

  // ─── Skill execution ──────────────────────────────────────────────────────

  /**
   * @param {Servant} servant
   * @param {number}  skillNum  0-based index (0=skill1, 1=skill2, 2=skill3)
   * @param {Servant|null} target  - ally target for ptOne skills
   * @param {Array|null}   choice  - [choiceId, optionIdx] for modal skills
   */
  useSkill(servant, skillNum, target = null, choice = null) {
    const num = skillNum + 1; // convert to 1-based
    if (!servant.skills.skillAvailable(num)) return false;

    // Consult the transform registry for servants with in-battle state overrides
    // (e.g. Mash S2 while 「聖剣装填」 is loaded). If an override fires, skip the
    // Atlas function list for this use — the registry handler is authoritative.
    if (applySkillTransform(this, servant, num)) return true;

    const skill = servant.skills.getSkillByNum(num);
    servant.skills.setSkillCooldown(num);
    // choice = [choiceCount, optionIdx] from token like [Ch2A] / [Ch3B].
    // optionIdx is 0-based (A→0, B→1, C→2). Used to route NP-type-chooser
    // skills (BB Dubai S3, Emiya S3, etc.) — see _resolveChoiceTargetNpId.
    this._pendingChoice = choice;
    this._pendingChoiceNpId = this._resolveChoiceTargetNpId(skill, choice);
    // If the user pinned the skill to an enemy (e.g. `g~2`), retain it so
    // self-target effects that depend on a target (overwriteBattleclass class
    // copy, etc.) can read it from extractState. ptOne/ally targets are stored
    // here too but cleared after — extractState filters by inclusion in
    // this.enemies.
    this._skillTargetEnemy = (target && this.enemies?.includes(target)) ? target : null;
    for (const effect of skill.functions) {
      if (this._shouldSkipChoiceEffect(skill, effect, choice)) continue;
      this.applyEffect(effect, servant, target);
    }
    this._skillTargetEnemy = null;
    this._pendingChoice = null;
    this._pendingChoiceNpId = null;
    return true;
  }

  // NP-type-chooser routing (BB Dubai S3 etc.): when a skill has multiple
  // `tdTypeChange{Arts,Buster,Quick}` (suffixed, non-generic) buff functions —
  // each representing one of the player-selectable variants — fire only the
  // one matching `choice[1]` (option idx). The generic `tdTypeChange` buff and
  // all non-tdTypeChange functions fire unconditionally. With no choice, the
  // first variant is kept (default to option A) so single-fire scenarios still
  // behave reasonably.
  _shouldSkipChoiceEffect(skill, effect, choice) {
    const buffType = effect.buffs?.[0]?.type;
    if (typeof buffType !== 'string') return false;
    if (!buffType.startsWith('tdTypeChange') || buffType === 'tdTypeChange') return false;
    const variants = (skill.functions || []).filter(f => {
      const t = f.buffs?.[0]?.type;
      return typeof t === 'string' && t.startsWith('tdTypeChange') && t !== 'tdTypeChange';
    });
    if (variants.length <= 1) return false;
    const optionIdx = Array.isArray(choice) ? (choice[1] || 0) : 0;
    return variants.indexOf(effect) !== Math.min(optionIdx, variants.length - 1);
  }

  // Map the chosen option to an Atlas NP id, when the skill exposes
  // `selectTreasureDeviceInfo` (BB Dubai). Used by extractState to embed
  // `targetNpId` on the resulting `tdTypeChange*` buff so the NP resolver can
  // pick the exact group member regardless of card-type. Returns null for
  // skills without the metadata (Emiya / Space Ishtar — handled via buff-type
  // → card-key fallback in NP.tdTypeChangeNewId).
  _resolveChoiceTargetNpId(skill, choice) {
    if (!Array.isArray(choice) || !skill?.selectTreasureDeviceInfo) return null;
    const opt = skill.selectTreasureDeviceInfo[choice[1] || 0];
    return opt?.id ?? null;
  }

  useMysticCodeSkill(skillNum, target = null) {
    if (this.mc.cooldowns[skillNum] !== 0) return false;
    const skill = this.mc.getSkillByNum(skillNum);
    for (const effect of skill.functions) this.applyEffect(effect, null, target);
    this.mc.setCooldown(skillNum);
    return true;
  }

  // ─── NP execution ─────────────────────────────────────────────────────────

  useNp(servant, enemyTargetIdx = null) {
    if (servant.stats.getNpgauge() < 99) return false;

    // Each 100% above baseline adds one Overcharge Lv. Up to the whole party
    const extraOc = Math.floor(servant.stats.getNpgauge() / 100) - 1;
    for (let i = 0; i < extraOc; i++) {
      this.applyEffect(NP_OC_1_TURN, servant);
      servant.buffs.processServantBuffs();
    }

    // NP swap (FR-5): any servant whose NPs declare `script.tdTypeChangeIDs`
    // resolves to the alternate NP when any `tdTypeChange*` state buff is
    // active. Covers Mash (default Lord Chaldeas → 「聖剣装填」 arms Holy Sword)
    // and any future 2-NP swap servants out of the box. Servants without an
    // NP-swap group resolve to null (their default NP). 3-NP groups (Emiya,
    // Space Ishtar) need choice-token plumbing — tracked under FR-3.
    let activeNpId = servant.nps.tdTypeChangeNewId(servant.buffs.buffs);
    let npCardType = (activeNpId != null)
      ? servant.nps.getNpById(activeNpId).card
      : servant.nps.card;

    // Recompute derived stats so OC level reflects all currently-active buffs
    // (incl. an Overcharge Lv. Up carried from a prior wave) — getNpValues
    // selects each function's overcharge-scaled svals by this OC level.
    servant.buffs.processServantBuffs();
    const functions = servant.nps.getNpValues(
      servant.stats.getNpLevel(), servant.stats.getOcLevel(), activeNpId
    );
    // Overcharge Lv. Up buffs from a prior NP are "1 time" (Count): they raise
    // THIS fire's OC, then are spent — consume so they don't stack across waves.
    servant.buffs.consumeOverchargeBuffs();
    servant.stats.setNpgauge(0);

    // FR-4: an explicit, living enemy target wins; otherwise default to the
    // highest-HP living enemy.
    const explicit = (enemyTargetIdx != null) ? this.enemies[enemyTargetIdx] : null;
    const mainTarget = (explicit && explicit.hp > 0)
      ? explicit
      : this.enemies.reduce((best, e) => (e.hp > best.hp ? e : best), this.enemies[0]);

    for (const func of functions) {
      if (['damageNp', 'damageNpPierce', 'damageNpHpratioLow'].includes(func.funcType)) {
        servant.buffs.processServantBuffs();
        if (func.funcTargetType === 'enemyAll') {
          for (const e of this.enemies) { e.buffs.processEnemyBuffs(); this._applyNpDamage(servant, e, activeNpId, npCardType); }
        } else {
          for (const e of this.enemies) e.buffs.processEnemyBuffs();
          this._applyNpDamage(servant, mainTarget, activeNpId, npCardType);
        }
      } else if (['damageNpIndividualSum','damageNpStateIndividualFix','damageNpIndividual'].includes(func.funcType)) {
        servant.buffs.processServantBuffs();
        if (func.funcTargetType === 'enemyAll') {
          for (const e of this.enemies) { e.buffs.processEnemyBuffs(); this._applyNpOddDamage(servant, e, activeNpId, npCardType); }
        } else {
          for (const e of this.enemies) e.buffs.processEnemyBuffs();
          this._applyNpOddDamage(servant, mainTarget, activeNpId, npCardType);
        }
      } else {
        if (func.funcTargetType === 'enemyAll') this.applyEffect(func, servant);
        if (func.funcTargetType === 'enemy')    this.applyEffect(func, servant, mainTarget);
        if (func.funcTargetType === 'self')     this.applyEffect(func, servant);
        if (func.funcTargetType === 'ptAll')    this.applyEffect(func, servant);
      }
    }

    // Give every other frontline servant +1 OC from the NP chain
    for (const s of this.servants.slice(0, 3)) {
      if (s !== servant) this.applyEffect(NP_OC_1_TURN, s);
    }

    if (servant.id === 413)  this.transformAoko(servant.buffs.buffs, servant.skills.cooldowns);
    if (servant.id === 4132) {
      // Burn off magic bullets after Super Aoko NP
      for (let i = 0; i < 10; i++) {
        servant.buffs.removeBuff({ buff: 'Magic Bullet', functvals: [], value: 9999, tvals: [], turns: -1 });
      }
    }
    return true;
  }

  // ─── Damage calculation helpers ───────────────────────────────────────────

  _getCardMods(servant, target, cardType) {
    if (cardType === 'buster') return {
      cardDamageValue: 1.5, cardNpValue: 1,
      cardEffMod:    servant.stats.getBUp(),
      cardDamageMod: servant.stats.getBUp() + servant.stats.getBusterCardDamageUp(),
      enemyResMod:   target.getBResdown(),
    };
    if (cardType === 'quick') return {
      cardDamageValue: 0.8, cardNpValue: 1,
      cardEffMod:    servant.stats.getQUp(),
      cardDamageMod: servant.stats.getQUp() + servant.stats.getQuickCardDamageUp(),
      enemyResMod:   target.getQResdown(),
    };
    return { // arts
      cardDamageValue: 1.0, cardNpValue: 3,
      cardEffMod:    servant.stats.getAUp(),
      cardDamageMod: servant.stats.getAUp() + servant.stats.getArtsCardDamageUp(),
      enemyResMod:   target.getAResdown(),
    };
  }

  // Class-advantage multiplier. Precedence:
  //   1. Servant-side overwriteClassRelation buff (Kiara Nega-Saver, Kama, etc.)
  //   2. Enemy-side classAdvantageMod (90** Anti-X vulnerability)
  //   3. Default class matrix
  _classMultiplier(servant, target) {
    const defClass = target.getClass();
    const servantOverride = servant.classRelationOverrides?.[defClass];
    if (servantOverride != null) return servantOverride;
    const enemyOverride = target.getClassAdvantageMod?.(servant.className);
    return enemyOverride != null ? enemyOverride : servant.stats.getClassMultiplier(defClass);
  }

  _applyNpDamage(servant, target, newId = null, cardType = servant.nps.card) {
    const { cardDamageValue, cardNpValue, cardEffMod, cardDamageMod, enemyResMod } =
      this._getCardMods(servant, target, cardType);

    const [npDamageMultiplier] = servant.nps.getNpDamageValues(
      servant.stats.getOcLevel(), servant.stats.getNpLevel(), newId
    );
    const dist = servant.nps.getNpdist(newId);
    const formula = (
      servant.stats.getBaseAtk() * npDamageMultiplier *
      cardDamageValue * (1 + cardDamageMod - enemyResMod) *
      this._classMultiplier(servant, target) *
      servant.stats.getAttributeModifier(target) * 0.23 *
      (1 + servant.stats.getAtkMod() - target.getDef()) *
      (1 + servant.stats.getNpDamageMod() + servant.stats.getPowerMod(target))
    ) * this.damageMultiplier;
    const total = formula + (servant.flatDamageMod ?? 0) * dist.length;

    this.recordNpDamage(this.wave, total);
    this._recordEnemyStat(target, 'damageTaken', total);
    this._distributeHits(servant, target, total, cardType, cardNpValue, cardEffMod, newId, dist);
  }

  _applyNpOddDamage(servant, target, newId = null, cardType = servant.nps.card) {
    const { cardDamageValue, cardNpValue, cardEffMod, cardDamageMod, enemyResMod } =
      this._getCardMods(servant, target, cardType);

    const [npMult, , npCorr, npCorrId, npCorrTarget] = servant.nps.getNpDamageValues(
      servant.stats.getOcLevel(), servant.stats.getNpLevel(), newId
    );

    let seMod = 1;
    let isSe = (npCorrTarget && target.traits.includes(npCorrTarget)) ? 1 : 0;
    if (npCorrId) {
      const ids = Array.isArray(npCorrId) ? npCorrId : [npCorrId];
      if (npCorrTarget === 1) {
        for (const id of ids) seMod += npCorr * target.traits.filter(t => t === id).length;
      } else if (servant.name === 'Super Aoko') {
        const bullets = Math.min(10, servant.buffs.buffs.filter(b => b.buff === 'Magic Bullet').length);
        seMod += bullets * npCorr;
      }
    }
    if (seMod > 1) isSe = 1;

    const dist = servant.nps.getNpdist(newId);
    const formula = (
      servant.stats.getBaseAtk() * npMult *
      cardDamageValue * (1 + cardDamageMod - enemyResMod) *
      this._classMultiplier(servant, target) *
      servant.stats.getAttributeModifier(target) * 0.23 *
      (1 + servant.stats.getAtkMod() - target.getDef()) *
      (1 + servant.stats.getNpDamageMod() + servant.stats.getPowerMod(target)) *
      (1 + (isSe ? seMod - 1 : 0))
    ) * this.damageMultiplier;
    const total = formula + (servant.flatDamageMod ?? 0) * dist.length;

    this.recordNpDamage(this.wave, total);
    this._recordEnemyStat(target, 'damageTaken', total);
    this._distributeHits(servant, target, total, cardType, cardNpValue, cardEffMod, newId, dist);
  }

  /** Spread total damage across NP hit distribution, apply NP refund per hit. */
  _distributeHits(servant, target, totalDamage, cardType, cardNpValue, cardEffMod, newId = null, dist = null) {
    // Use the FIRED NP's gain + hit distribution (not the default last NP) so an
    // NP swap (e.g. Mash's Holy Sword) refunds and distributes against the right NP.
    const npGain  = servant.nps.getNpgain(cardType, newId) * servant.stats.getNpGainMod();
    if (!dist) dist = servant.nps.getNpdist(newId);
    const perHit  = dist.map(v => totalDamage * v / 100);
    let cumulative = 0;
    for (let i = 0; i < dist.length; i++) {
      cumulative += perHit[i];
      const overkill  = cumulative > target.hp ? 1.5 : 1;
      const npPerHit  = npGain * cardNpValue * (1 + cardEffMod) * target.npPerHitMult * overkill;
      if (cardType !== 'buster') { servant.setNpgauge(npPerHit); this._recordEnemyStat(target, 'npRefund', npPerHit); }
      target.setHp(perHit[i]);
    }
  }
}

// Handlers live in effectRegistry.js; imported at top of file via getEffectHandler.
// Rate policy: addState / addStateShort / gainNp / shortenSkill all apply
// unconditionally (full-uptime assumption for planning). `instantDeath` is the
// lone Rate-checked handler because it derives the outcome flag the engine reads.
