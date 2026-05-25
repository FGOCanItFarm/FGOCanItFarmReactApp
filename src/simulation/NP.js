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
   * Mash's "Lord Chaldeas" (default, Arts) ↔ "Holy Sword" (loaded, Buster) is the
   * only live case. `loaded` = whether the tdTypeChange state buff is active.
   * Returns null when the servant has no NP-swap group.
   */
  tdTypeChangeNewId(loaded) {
    const group = this.nps.find(np => np.script?.tdTypeChangeIDs);
    if (!group) return null;
    const [defaultId, alternateId] = group.script.tdTypeChangeIDs;
    const wantId = loaded ? alternateId : defaultId;
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
          name: buff.name,
          functvals: buff.functvals || '',
          tvals: buff.tvals || [],
          svals: bSvals.length > 9 ? bSvals[9] : null,
          value: bSvals.length > 9 ? (bSvals[9]?.Value ?? 0) : 0,
          turns: bSvals.length > 9 ? (bSvals[9]?.Turn  ?? 0) : 0,
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
    const arr = np.npGain?.[cardType] || [0];
    return arr[0] / 100;
  }

  getNpdist(newId = null) {
    return this.getNpById(newId).npDistribution || [];
  }
}
