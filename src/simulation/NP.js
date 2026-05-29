// Atlas recently renumbered NP card ids; real data now stores numeric strings
// ("1"=Arts, "2"=Buster, "3"=Quick). Normalize to the engine's named card keys
// (already-named values pass through unchanged, e.g. synthetic test fixtures).
const CARD_ID_TO_NAME = { 1: 'arts', 2: 'buster', 3: 'quick' };
const normalizeCard = (card) => CARD_ID_TO_NAME[card] ?? card;

export class NP {
  constructor(npsData) {
    this.nps = this.parseNoblePhantasms(npsData);
    this.card = this.nps.length > 0 ? this.nps[this.nps.length - 1].card : null;
  }

  parseNoblePhantasms(npsData) {
    if (!npsData || npsData.length === 0) return [];
    return [...npsData]
      .sort((a, b) => (a.id || 0) - (b.id || 0))
      .map((np, i) => ({ ...np, card: normalizeCard(np.card), newId: i + 1 }));
  }

  getNpById(newId = null) {
    if (newId === null) return this.nps[this.nps.length - 1];
    const found = this.nps.find(np => np.newId === newId);
    if (!found) throw new Error(`No NP found with newId ${newId}`);
    return found;
  }

  /**
   * Resolve the newId of an NP-swap (`script.tdTypeChangeIDs`) group member.
   *
   * Atlas encodes NP transforms as a multi-NP group where each member's
   * `script.tdTypeChangeIDs` lists the full set, and the active member is
   * selected by a `tdTypeChange*` state buff (tdTypeChange, tdTypeChangeArts,
   * tdTypeChangeBuster, tdTypeChangeQuick). Examples covered today:
   *
   *   - Mash 1: [800107 Lord Chaldeas/Arts, 800108 聖剣 Holy Sword/Buster].
   *     Her default NP fires a `tdTypeChangeBuster` buff (「聖剣装填」), arming
   *     the alternate for subsequent NP fires.
   *   - BB Dubai 421: [2300601 C.C.C., 2300698 G.G.G.]. Her S3 applies one of
   *     three `tdTypeChange*` buffs — choice-driven (deferred; see FR-3).
   *   - Emiya 11, Space Ishtar 268: 2- and 3-card swap groups, also
   *     choice-driven via skill.
   *
   * For 2-NP groups this picks ids[1] when ANY `tdTypeChange*` buff is on the
   * active list, ids[0] otherwise (covers Mash). For 3-NP groups the right
   * slot depends on which specific buff variant is active; that map lands
   * with the choice plumbing.
   *
   * Returns null when the servant has no NP-swap group.
   */
  tdTypeChangeNewId(activeBuffs = []) {
    const group = this.nps.find(np => np.script?.tdTypeChangeIDs);
    if (!group) return null;
    const ids = group.script.tdTypeChangeIDs;
    const swapBuffs = activeBuffs.filter(
      b => typeof b.type === 'string' && b.type.startsWith('tdTypeChange')
    );

    // 1. Explicit NP id embedded by selectTreasureDeviceInfo routing
    //    (BB Dubai S3). The skill knows exactly which group member the option
    //    maps to, so no card guesswork is needed.
    for (const b of swapBuffs) {
      if (b.targetNpId != null) {
        const explicit = this.nps.find(np => np.id === b.targetNpId);
        if (explicit) return explicit.newId;
      }
    }

    // 2. Card-key fallback (Space Ishtar / Emiya 3-NP groups). The buff type
    //    suffix names the card the chosen variant fires; pick the group
    //    member whose card matches.
    const CARD_BY_TDTYPE = {
      tdTypeChangeArts:   'arts',
      tdTypeChangeBuster: 'buster',
      tdTypeChangeQuick:  'quick',
    };
    for (const b of swapBuffs) {
      const wantCard = CARD_BY_TDTYPE[b.type];
      if (!wantCard) continue;
      const member = ids
        .map(id => this.nps.find(np => np.id === id))
        .find(np => np && np.card === wantCard);
      if (member) return member.newId;
    }

    // 3. Generic 2-NP swap (Mash 1, no per-card selection — any
    //    `tdTypeChange*` buff flips to the alternate slot).
    const wantId = (swapBuffs.length > 0 && ids.length >= 2) ? ids[1] : ids[0];
    return this.nps.find(np => np.id === wantId)?.newId ?? null;
  }


  static safeSvalAtLevel(func, oc, npLevel) {
    const key = oc > 1 ? `svals${oc}` : 'svals';
    const svalsList = func[key] || func.svals || [];
    if (!Array.isArray(svalsList) || svalsList.length === 0) return {};
    const idx = Math.min(Math.max(npLevel - 1, 0), svalsList.length - 1);
    const entry = svalsList[idx];
    return (typeof entry === 'object' && entry !== null) ? entry : {};
  }

  getNpValues(npLevel = 1, overchargeLevel = 1, newId = null) {
    const np = this.getNpById(newId);
    return np.functions.map(func => {
      const svalsKey = overchargeLevel > 1 ? `svals${overchargeLevel}` : 'svals';
      const svalsList = func[svalsKey] || func.svals || [];
      let funcValues = {};
      if (Array.isArray(svalsList) && svalsList.length > 0) {
        const idx = Math.min(Math.max(npLevel - 1, 0), svalsList.length - 1);
        const entry = svalsList[idx];
        funcValues = (typeof entry === 'object' && entry !== null) ? entry : {};
      }
      const buffs = (func.buffs || []).map(buff => {
        const bSvals = buff.svals || [];
        return {
          name:           buff.name,
          type:           buff.type,
          functvals:      buff.functvals || '',
          tvals:          buff.tvals || [],
          svals:          bSvals.length > 9 ? bSvals[9] : null,
          value:          bSvals.length > 9 ? (bSvals[9]?.Value ?? 0) : 0,
          turns:          bSvals.length > 9 ? (bSvals[9]?.Turn  ?? 0) : 0,
          script:         buff.script,
          originalScript: buff.originalScript,
        };
      });
      return {
        funcType: func.funcType,
        funcTargetType: func.funcTargetType,
        functvals: func.functvals || [],
        fieldReq: func.fieldReq || [],
        condTarget: func.condTarget || [],
        svals: funcValues,
        buffs,
      };
    });
  }

  getNpDamageValues(oc = 1, npLevel = 1, newId = null) {
    const np = this.getNpById(newId);
    for (const func of np.functions) {
      if (['damageNp', 'damageNpPierce'].includes(func.funcType)) {
        const sval = NP.safeSvalAtLevel(func, oc, npLevel);
        return [(sval.Value ?? 0) / 1000, null, null, null, null];
      }
      if (['damageNpIndividual', 'damageNpStateIndividualFix'].includes(func.funcType)) {
        const sval = NP.safeSvalAtLevel(func, 1, npLevel);
        return [
          (sval.Value      ?? 0) / 1000,
          null,
          (sval.Correction ?? 0) / 1000,
          null,
          sval.Target ?? 0,
        ];
      }
      if (func.funcType === 'damageNpIndividualSum') {
        const sval = NP.safeSvalAtLevel(func, 1, npLevel);
        return [
          (sval.Value      ?? 0) / 1000,
          (sval.Value2     ?? 0) / 1000,
          (sval.Correction ?? 0) / 1000,
          sval.TargetList  ?? 0,
          sval.Target      ?? 0,
        ];
      }
    }
    return [0, null, null, null, null];
  }

  getNpgain(cardType, newId = null) {
    const np = this.getNpById(newId);
    // Atlas renormalised NP gain: the NP-card refund rate is under `npGain.np`
    // (the per-card keys exist too and are equal). Fall back to the card key for
    // synthetic fixtures that only define named-card arrays.
    const arr = np.npGain?.np ?? np.npGain?.[cardType] ?? [0];
    return arr[0] / 100;
  }

  getNpdist(newId = null) {
    return this.getNpById(newId).npDistribution || [];
  }
}
