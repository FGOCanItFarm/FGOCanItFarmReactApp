import { BattleEngine } from './BattleEngine.js';

// Token letter → { servantIdx, skillIdx } (0-based both)
const SKILL_LETTERS = ['a','b','c','d','e','f','g','h','i'];
const MC_LETTERS    = ['j','k','l'];
const NP_SLOTS      = { '4': 0, '5': 1, '6': 2 };

const SKILL_MAP = Object.fromEntries(
  SKILL_LETTERS.map((l, i) => [l, { servantIdx: Math.floor(i / 3), skillIdx: i % 3 }])
);

// Regex patterns for compound tokens
const RE_CHOICE_TARGET = /^([a-i])\(\[Ch(\d+)([A-C])\](\d)\)$/;  // a([Ch1A]2)
const RE_CHOICE        = /^([a-i])\[Ch(\d+)([A-C])\]$/;            // a[Ch1A]
const RE_SWAP          = /^x(\d)(\d)$/;                             // x12
const RE_SKILL_TARGET  = /^([a-i])(\d)$/;                           // a1
const RE_MC_TARGET     = /^([jkl])(\d)$/;                           // j1

export class Driver {
  /**
   * @param {object} config  - same shape passed to BattleEngine constructor
   */
  constructor(config) {
    this.config = config;
    this.engine = null;
  }

  /** (Re)initialise a fresh BattleEngine. Called automatically by run(). */
  reset() {
    this.engine = new BattleEngine(this.config);
  }

  /**
   * Execute a token string and return the final engine state.
   * Tokens are whitespace- or comma-separated.
   * Returns false if any token signals a failure (skill on cooldown, etc.).
   *
   * Example token string: "a b4 c 4 # d 5 # 6 #"
   */
  run(tokenString) {
    this.reset();
    const tokens = tokenString.trim().split(/[\s,]+/).filter(Boolean);
    for (const token of tokens) {
      const result = this.executeToken(token);
      if (result === false) return false;
    }
    return this.engine;
  }

  executeToken(token) {
    const eng = this.engine;
    let m;

    // a([Ch1A]2)  — choice + explicit target
    if ((m = RE_CHOICE_TARGET.exec(token))) {
      const { servantIdx, skillIdx } = SKILL_MAP[m[1]];
      const choice    = [parseInt(m[2]), m[3].charCodeAt(0) - 65];
      const targetIdx = parseInt(m[4]) - 1;
      return eng.useSkill(eng.servants[servantIdx], skillIdx, eng.servants[targetIdx], choice);
    }

    // a[Ch1A]  — choice, no explicit target
    if ((m = RE_CHOICE.exec(token))) {
      const { servantIdx, skillIdx } = SKILL_MAP[m[1]];
      const choice = [parseInt(m[2]), m[3].charCodeAt(0) - 65];
      return eng.useSkill(eng.servants[servantIdx], skillIdx, null, choice);
    }

    // x14  — swap two absolute slots (1-3 = frontline, 4-6 = backline; 1-indexed).
    // Only a frontline↔backline swap is legal (not front-front or back-back).
    if ((m = RE_SWAP.exec(token))) {
      const a = parseInt(m[1], 10) - 1;
      const b = parseInt(m[2], 10) - 1;
      const inRange = (i) => i >= 0 && i < eng.servants.length;
      const isFront = (i) => i >= 0 && i <= 2;
      if (!inRange(a) || !inRange(b) || isFront(a) === isFront(b)) return false;
      eng.swapServants(a, b);
      return eng;
    }

    // a1  — skill with explicit ally target
    if ((m = RE_SKILL_TARGET.exec(token)) && SKILL_LETTERS.includes(m[1])) {
      const { servantIdx, skillIdx } = SKILL_MAP[m[1]];
      return eng.useSkill(eng.servants[servantIdx], skillIdx, eng.servants[parseInt(m[2]) - 1]);
    }

    // a  — skill, no target
    if (token.length === 1 && SKILL_LETTERS.includes(token)) {
      const { servantIdx, skillIdx } = SKILL_MAP[token];
      return eng.useSkill(eng.servants[servantIdx], skillIdx);
    }

    // j1  — MC skill with explicit target
    if ((m = RE_MC_TARGET.exec(token))) {
      return eng.useMysticCodeSkill(MC_LETTERS.indexOf(m[1]), eng.servants[parseInt(m[2]) - 1]);
    }

    // j  — MC skill, no target
    if (token.length === 1 && MC_LETTERS.includes(token)) {
      return eng.useMysticCodeSkill(MC_LETTERS.indexOf(token));
    }

    // 4 / 5 / 6  — fire NP
    if (token in NP_SLOTS) {
      return eng.useNp(eng.servants[NP_SLOTS[token]]);
    }

    // #  — end turn (advances wave on success)
    if (token === '#') return eng.endTurn();

    // Unknown token — ignore silently
    return eng;
  }
}
