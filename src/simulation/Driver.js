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
const RE_NP_TARGET     = /^([456])e(\d+)$/;                         // 4e2 (NP → enemy 2)
const RE_SKILL_ENEMY   = /^([a-i])~(\d+)$/;                         // a~2 (skill → enemy 2)
const RE_SKILL_TARGET  = /^([a-i])(\d)$/;                           // a1
const RE_MC_TARGET     = /^([jkl])(\d)$/;                           // j1

/**
 * Canonical swap-token builder — the single source of truth for the `x<f><b>`
 * grammar so the UI never hand-rolls (and mis-numbers) it again.
 *
 * The token is `x<frontSlot><backSlot>`, BOTH 1-based slots (1-3). The Driver
 * parses it as frontline index = frontSlot-1 and backline index = backSlot+2.
 * Callers hold 0-based TEAM indices (frontline 0-2, backline 3-5), so:
 *   frontSlot = frontTeamIdx + 1   (0->1, 1->2, 2->3)
 *   backSlot  = backTeamIdx  - 2   (3->1, 4->2, 5->3)
 * e.g. swap front-1 <-> back-1  ->  "x11"  (NOT "x14").
 */
export function swapToken(frontTeamIdx, backTeamIdx) {
  return `x${frontTeamIdx + 1}${backTeamIdx - 2}`;
}

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

    // x12  — swap frontline slot 1 (1-indexed) with backline slot 2 (1-indexed)
    if ((m = RE_SWAP.exec(token))) {
      const frontline = parseInt(m[1]) - 1;
      const backline  = parseInt(m[2]) + 2; // backline slots start at index 3
      if (frontline < 0 || frontline > 2 || backline < 3 || backline >= eng.servants.length)
        return false;
      eng.swapServants(frontline, backline);
      return eng;
    }

    // a~2  — skill with explicit enemy target (FR-4); enemy index is 1-based
    if ((m = RE_SKILL_ENEMY.exec(token))) {
      const { servantIdx, skillIdx } = SKILL_MAP[m[1]];
      const enemy = eng.getEnemies()[parseInt(m[2], 10) - 1];
      if (!enemy) return false;
      return eng.useSkill(eng.servants[servantIdx], skillIdx, enemy);
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

    // 4e2  — fire NP at an explicit enemy (FR-4); enemy index is 1-based
    if ((m = RE_NP_TARGET.exec(token))) {
      return eng.useNp(eng.servants[NP_SLOTS[m[1]]], parseInt(m[2], 10) - 1);
    }

    // 4 / 5 / 6  — fire NP (highest-HP enemy default)
    if (token in NP_SLOTS) {
      return eng.useNp(eng.servants[NP_SLOTS[token]]);
    }

    // #  — end turn (advances wave on success)
    if (token === '#') return eng.endTurn();

    // Unknown token — fail the run (FR-6: silent-drop was hiding bad manual
    // edits from the builder). For tolerant prefix-validation in the UI, use
    // CommandState.classifyToken to inspect a token without stepping the
    // engine.
    return false;
  }
}
