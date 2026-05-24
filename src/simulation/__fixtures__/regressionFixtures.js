/**
 * Engine-shaped fixtures for the simulation regression suite.
 *
 * WHY THIS EXISTS (spec §5, §7): the engine extensions in later phases
 * (enemy targeting, transforms, granular stats, choice dispatch) MUST NOT alter
 * the wave outcome of existing token strings. These fixtures + the golden
 * snapshots in __tests__/regression.test.js form a *differential* safety net:
 * same inputs, same output, before and after every engine change. Any
 * intentional behavior change (e.g. a transform fix) shows up as a snapshot
 * diff that must be reviewed and called out.
 *
 * These are HAND-AUTHORED, Atlas-Academy-shaped records (the sandbox has no
 * Supabase/Atlas network access). They mirror the exact field shape the engine
 * reads — verified against src/simulation/{Servant,Skills,NP,Quest,Enemy,
 * MysticCode,Stats,Buffs}.js. To enrich the suite with REAL data later, run
 * scripts/captureFixtures.js with Supabase credentials and add the dumped
 * records here.
 *
 * NOTE: this module lives in __fixtures__/ (not __tests__/) on purpose — CRA's
 * Jest treats every file under __tests__/ as a test suite.
 */

// Servant attack-growth table is indexed by (level - 1); rarity 5 reads level
// 90 → index 89. A flat array keeps damage deterministic and avoids NaN.
export const ATK_GROWTH = Array.from({ length: 120 }, () => 1500);

// ─── Builders ──────────────────────────────────────────────────────────────

function servant({
  collectionNo, name, className, attribute = 'human', rarity = 5,
  skills = [], np = null, traits = [], classId = 1, gender = 'female',
}) {
  return {
    collectionNo, name, className, classId, gender, attribute, rarity,
    traits: traits.map((id) => ({ id })),
    cards: ['arts', 'arts', 'buster', 'quick', 'buster'],
    atkGrowth: ATK_GROWTH,
    skills,
    noblePhantasms: np ? [np] : [],
    classPassive: [],
  };
}

// addState buff skill (self / ptAll / ptOne / enemy by targetType).
function buffSkill({ id, num, name, buff, value, target = 'self', cd = 5, turns = 3 }) {
  return {
    id, num, name, coolDown: [cd],
    functions: [{
      funcType: 'addState', funcTargetType: target,
      svals: [{ Value: value, Turn: turns, Count: 1, Rate: 1000 }],
      functvals: [], funcquestTvals: [],
      buffs: [{ name: buff, svals: [{ Value: value, Turn: turns }], tvals: [] }],
    }],
  };
}

// gainNp charge skill (ptOne needs an ally target; ptAll/self auto-resolve).
function chargeSkill({ id, num, name, value, target = 'ptOne', cd = 5 }) {
  return {
    id, num, name, coolDown: [cd],
    functions: [{
      funcType: 'gainNp', funcTargetType: target,
      svals: [{ Value: value }], functvals: [], funcquestTvals: [], buffs: [],
    }],
  };
}

const NP_GAIN = { arts: [50], buster: [25], quick: [75] };

function aoeNp({ id = 800, card = 'arts', value = 6000 } = {}) {
  return {
    id, card, name: 'AoE NP',
    functions: [{ funcType: 'damageNp', funcTargetType: 'enemyAll', svals: [{ Value: value }], buffs: [] }],
    npGain: NP_GAIN, npDistribution: [16, 33, 51],
  };
}

function stNp({ id = 801, card = 'buster', value = 9000 } = {}) {
  return {
    id, card, name: 'ST NP',
    functions: [{ funcType: 'damageNp', funcTargetType: 'enemy', svals: [{ Value: value }], buffs: [] }],
    npGain: NP_GAIN, npDistribution: [10, 20, 30, 40],
  };
}

// Support NP: party charge + party ATK Up, no damage.
function supportNp({ id = 802 } = {}) {
  return {
    id, card: 'arts', name: 'Support NP',
    functions: [
      { funcType: 'gainNp', funcTargetType: 'ptAll', svals: [{ Value: 3000 }], buffs: [] },
      {
        funcType: 'addState', funcTargetType: 'ptAll',
        svals: [{ Value: 300, Turn: 3 }],
        buffs: [{ name: 'ATK Up', svals: [{ Value: 300, Turn: 3 }], tvals: [] }],
      },
    ],
    npGain: NP_GAIN, npDistribution: [100],
  };
}

function enemy({ name, hp, className = 'lancer', attribute = 'human', deathRate = 1000, traits = [] }) {
  return { name, hp, deathRate, svt: { className, traits: traits.map((id) => ({ id })), attribute }, state: null };
}

function quest({ individuality = [], stages }) {
  return { individuality: individuality.map((id) => ({ id })), stages };
}

function mcSkill({ id, num, name, funcType, target, value, buff = null, cd = 3 }) {
  return {
    id, num, name, coolDown: [cd],
    functions: [{
      funcType, funcTargetType: target,
      svals: [{ Value: value, Turn: 3 }],
      buffs: buff ? [{ name: buff, svals: [{ Value: value, Turn: 3 }], tvals: [] }] : [],
    }],
  };
}

const MYSTIC_CODE = {
  name: 'Test MC', shortName: 'TMC', maxLv: 10,
  skills: [
    mcSkill({ id: 9001, num: 1, name: 'MC ATK Up', funcType: 'addState', target: 'ptAll', value: 200, buff: 'ATK Up' }),
    mcSkill({ id: 9002, num: 2, name: 'MC Charge One', funcType: 'gainNp', target: 'ptOne', value: 2000 }),
    mcSkill({ id: 9003, num: 3, name: 'MC Charge All', funcType: 'gainNp', target: 'ptAll', value: 2000 }),
  ],
};

// ─── Fixture A — comprehensive "normal" farming ──────────────────────────────
// 3 frontline + 1 backline. Exercises: self/ptAll/ptOne skills, ally targeting,
// AoE NP, ST NP (highest-HP default), support NP, MC skills, swap, multi-wave.

function fixtureNormal() {
  const s1 = servant({
    collectionNo: 1001, name: 'AoE Caster', className: 'caster',
    np: aoeNp(),
    skills: [
      buffSkill({ id: 101, num: 1, name: 'Self ATK', buff: 'ATK Up', value: 500, target: 'self' }),
      chargeSkill({ id: 102, num: 2, name: 'Charge Ally', value: 5000, target: 'ptOne' }),
      buffSkill({ id: 103, num: 3, name: 'Party Arts', buff: 'Arts Up', value: 300, target: 'ptAll' }),
    ],
  });
  const s2 = servant({
    collectionNo: 1002, name: 'Support Caster', className: 'caster',
    np: supportNp(),
    skills: [
      buffSkill({ id: 201, num: 1, name: 'Party Arts', buff: 'Arts Up', value: 200, target: 'ptAll' }),
      chargeSkill({ id: 202, num: 2, name: 'Charge Ally', value: 5000, target: 'ptOne' }),
      buffSkill({ id: 203, num: 3, name: 'Party ATK', buff: 'ATK Up', value: 200, target: 'ptAll' }),
    ],
  });
  const s3 = servant({
    collectionNo: 1003, name: 'ST Saber', className: 'saber',
    np: stNp(),
    skills: [
      buffSkill({ id: 301, num: 1, name: 'Self Buster', buff: 'Buster Up', value: 500, target: 'self' }),
      buffSkill({ id: 302, num: 2, name: 'Self NP Up', buff: 'NP Strength Up', value: 300, target: 'self' }),
      chargeSkill({ id: 303, num: 3, name: 'Self Charge', value: 5000, target: 'self' }),
    ],
  });
  const s4 = servant({
    collectionNo: 1004, name: 'Backline AoE', className: 'caster',
    np: aoeNp({ id: 803, value: 6000 }),
    skills: [
      buffSkill({ id: 401, num: 1, name: 'Self ATK', buff: 'ATK Up', value: 500, target: 'self' }),
      buffSkill({ id: 402, num: 2, name: 'Self Arts', buff: 'Arts Up', value: 300, target: 'self' }),
      chargeSkill({ id: 403, num: 3, name: 'Self Charge', value: 5000, target: 'self' }),
    ],
  });

  const wave = (label) => [
    enemy({ name: `${label}-A`, hp: 1500 }),
    enemy({ name: `${label}-B`, hp: 1500 }),
    enemy({ name: `${label}-C`, hp: 1500 }),
  ];

  const simInputs = {
    servantDataList: [
      { rawData: s1, opts: { np: 1, initialCharge: 100 } },
      { rawData: s2, opts: { np: 1, initialCharge: 100 } },
      { rawData: s3, opts: { np: 1, initialCharge: 100 } },
      { rawData: s4, opts: { np: 1, initialCharge: 100 } },
    ],
    questData: quest({
      stages: [
        { enemies: wave('W1') },
        { enemies: wave('W2') },
        { enemies: [enemy({ name: 'Boss', hp: 5000 })] },
      ],
    }),
    mcData: MYSTIC_CODE,
    damageMultiplier: 1.0,
  };

  return {
    name: 'normal-farming',
    simInputs,
    tokenStrings: [
      '4 #',            // S1 AoE NP clears wave 1, end turn
      'a 4 #',          // self ATK buff then NP (higher damage)
      'd e1 f 4 #',     // S2 party/ally skills then S1 NP
      '5 4 #',          // support NP (charge+atk) then S1 AoE NP
      '6',              // ST NP on highest-HP enemy (no end turn — wave not cleared)
      'x31 6 #',        // swap front 3 (S3) ↔ back 1 (S4), then slot-3 NP
      'j 4 #',          // MC ATK-up-all then NP
      'k1 4 #',         // MC charge ally 1 then NP
      'a b1 c',         // pure skills (no NP/end) — parse + buff coverage
    ],
  };
}

// ─── Fixture B — Melusine seam (Skills.getSkillByNum first-use variant) ──────
// Skill 3 has TWO variants; variant[0].id === 888550 triggers the one-time
// form selection in getSkillByNum. Locks that behavior so the Phase-3
// activeSkill refactor preserves it.

function fixtureMelusine() {
  const melusine = servant({
    collectionNo: 888, name: 'Melusine-like', className: 'lancer',
    np: aoeNp({ value: 6000 }),
    skills: [
      buffSkill({ id: 8801, num: 1, name: 'Self ATK', buff: 'ATK Up', value: 300, target: 'self' }),
      chargeSkill({ id: 8802, num: 2, name: 'Self Charge', value: 5000, target: 'self' }),
    ],
  });
  // Two variants for skill 3 — first carries the Melusine form-skill id.
  melusine.skills.push(
    { id: 888550, num: 3, name: 'Form Change (first use)', coolDown: [0],
      functions: [{ funcType: 'addState', funcTargetType: 'self', svals: [{ Value: 1000, Turn: 3 }],
        buffs: [{ name: 'ATK Up', svals: [{ Value: 1000, Turn: 3 }], tvals: [] }] }] },
    { id: 888551, num: 3, name: 'Normal (later uses)', coolDown: [0],
      functions: [{ funcType: 'addState', funcTargetType: 'self', svals: [{ Value: 100, Turn: 3 }],
        buffs: [{ name: 'ATK Up', svals: [{ Value: 100, Turn: 3 }], tvals: [] }] }] },
  );

  const simInputs = {
    servantDataList: [{ rawData: melusine, opts: { np: 1, initialCharge: 100 } }],
    questData: quest({ stages: [{ enemies: [
      enemy({ name: 'E1', hp: 1500 }), enemy({ name: 'E2', hp: 1500 }), enemy({ name: 'E3', hp: 1500 }),
    ] }] }),
    mcData: MYSTIC_CODE,
    damageMultiplier: 1.0,
  };

  return {
    name: 'melusine-form-seam',
    simInputs,
    tokenStrings: [
      'c 4 #',     // first use of skill 3 → form variant (big ATK), then NP
      'c c 4 #',   // form variant, then normal variant, then NP (different damage)
    ],
  };
}

// ─── Fixture C — Aoko transform (full servant-object swap on NP) ─────────────
// Locks transformAoko: after Aoko (413) fires her NP, slot is replaced by the
// Super Aoko (4132) profile, observable via servantsAtWaveEnd collectionNo.

function fixtureAoko() {
  const aoko = servant({
    collectionNo: 413, name: 'Aoko', className: 'caster',
    np: aoeNp({ value: 6000 }),
    skills: [
      buffSkill({ id: 4131, num: 1, name: 'Self ATK', buff: 'ATK Up', value: 300, target: 'self' }),
      buffSkill({ id: 4133, num: 2, name: 'Self Arts', buff: 'Arts Up', value: 300, target: 'self' }),
      chargeSkill({ id: 4134, num: 3, name: 'Self Charge', value: 5000, target: 'self' }),
    ],
  });
  const superAoko = servant({
    collectionNo: 4132, name: 'Super Aoko', className: 'caster',
    np: aoeNp({ id: 900, value: 7000 }),
    skills: [
      buffSkill({ id: 41321, num: 1, name: 'Self ATK', buff: 'ATK Up', value: 400, target: 'self' }),
      buffSkill({ id: 41322, num: 2, name: 'Self Arts', buff: 'Arts Up', value: 400, target: 'self' }),
      chargeSkill({ id: 41323, num: 3, name: 'Self Charge', value: 5000, target: 'self' }),
    ],
  });

  const simInputs = {
    servantDataList: [{ rawData: aoko, opts: { np: 1, initialCharge: 100 } }],
    superAokoData: superAoko,
    questData: quest({ stages: [{ enemies: [
      enemy({ name: 'E1', hp: 1500 }), enemy({ name: 'E2', hp: 1500 }), enemy({ name: 'E3', hp: 1500 }),
    ] }] }),
    mcData: MYSTIC_CODE,
    damageMultiplier: 1.0,
  };

  return {
    name: 'aoko-transform',
    simInputs,
    tokenStrings: [
      '4 #',   // Aoko NP clears wave, transforms to Super Aoko (collectionNo 4132 at wave end)
    ],
  };
}

// Optional REAL-data fixtures captured from Supabase via scripts/captureFixtures.js.
// The generated file is gitignored and absent by default (the sandbox has no DB
// access); when present it joins the suite automatically so real saved runs are
// regression-locked alongside the synthetic ones. This module is test-only (not
// in the app bundle), so a missing file never affects `npm run build`.
let realFixtures = [];
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  realFixtures = require('./real/realFixtures.generated.json');
} catch (e) { /* no captured fixtures — synthetic suite still runs */ }

export const fixtures = [fixtureNormal(), fixtureMelusine(), fixtureAoko(), ...realFixtures];

export default fixtures;
