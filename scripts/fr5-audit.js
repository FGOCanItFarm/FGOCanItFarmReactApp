#!/usr/bin/env node
/**
 * FR-5 Phase A: coverage audit of all servant function shapes.
 *
 * Run from project root:
 *   node scripts/fr5-audit.js
 *
 * Outputs:
 *   docs/fr5-coverage.md
 *   docs/fr5-coverage.csv
 */

const fs   = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, '..', 'src', 'simulation', '__fixtures__', 'real', 'servants');
const OUT_DIR      = path.join(__dirname, '..', 'docs');

// ── 1. Handled funcTypes ──────────────────────────────────────────────────────
// BattleEngine.EFFECT_HANDLERS dispatch table + special-cased in useNp / useSkill.

const HANDLED_FUNC_TYPES = new Set([
  'addState', 'addStateShort',
  'gainNp',
  'shortenSkill',
  'addFieldChangeToField',
  'transformServant',          // no-op stub; handled per-servant in useNp
  'gainMultiplyNp',
  'forceInstantDeath',
  'instantDeath',
  // NP damage paths (BattleEngine.useNp)
  'damageNp',
  'damageNpPierce',
  'damageNpIndividual',
  'damageNpStateIndividualFix',
  'damageNpIndividualSum',
]);

// ── 2. Buff types whose effect is active in processServantBuffs / processEnemyBuffs ─
// Keyed by buff.type (Atlas internal). Some are handled by buff.name instead
// (see HANDLED_BUFF_NAMES below) but listing both avoids double-counting.

const HANDLED_BUFF_TYPES = new Set([
  'upNpdamage',          // processServantBuffs → NP Strength Up branch
  'overwriteBattleclass', // applyBattleClassOverride (Kazuradrop S3)
  'tdTypeChange',         // NP-swap resolver (NP.tdTypeChangeNewId)
  'tdTypeChangeArts',
  'tdTypeChangeBuster',
  'tdTypeChangeQuick',
  'upDamage',             // processServantBuffs powerMod branch (buff.type === 'upDamage')
  'buffRate',             // Boost NP Strength Up — doubles active npDamageMod
]);

// Buff NAMES the engine reads directly in switch / if branches.
// These are the buff.name (display) values stored in the fixture.
const HANDLED_BUFF_NAMES = new Set([
  // processServantBuffs
  'NP Strength Up', 'upNpdamage',
  'Boost NP Strength Up',
  'ATK Up',
  'Buster Up', 'Arts Up', 'Quick Up',
  'NP Overcharge Level Up', 'Overcharge Lv. Up',
  'NP Gain Up',
  'Buster Card Damage Up', 'Arts Card Damage Up', 'Quick Card Damage Up',
  // processEnemyBuffs
  'DEF Down',
  'Buster Card Resist Down', 'Arts Card Resist Down', 'Quick Card Resist Down',
  'Apply Trait (Rome)',
  // processEndTurnSkills
  'NP Gain Each Turn',
  'Delayed Effect (Death)',
]);

// ── 3. Cosmetic funcTypes — never affect damage/gauge/cooldown ────────────────
const COSMETIC_FUNC_TYPES = new Set([
  // NP-turn mechanics (turn counter for auto-fire NPs; irrelevant to manual farming)
  'hastenNpturn',
  // HP/star/item economy — not damage-path
  'gainHp', 'gainStar', 'lossHp', 'lossHpSafe', 'lossNp',
  'gainMultipleNp',
  // Servant swap / placement (handled separately via command grammar x12, death-sub)
  'shiftServant', 'changeServant', 'replaceMember', 'moveToLastSubmember',
  'callServant',
  // Visual / meta
  'none', 'sub', 'addVoice', 'setSystemAliveFlag', 'displayBuffstring',
  'changeBg', 'questRewardSameTarget',
  // Economy events
  'eventDropRateUp', 'eventPointRateUp', 'friendshipRateUp',
  'expUp', 'masterSkillRankUp', 'masterExpUp', 'itemGet',
  'servantFriendshipUp',
  'revive',
  'absorb',
]);

// Cosmetic buff types (stored as addState/addStateShort but never read by the engine)
const COSMETIC_BUFF_TYPES = new Set([
  'avoidance',           // Evade — player evasion, not damage
  'avoidanceAttackDeathDamage', // Evade lethal — not damage
  'invincible',          // Invincible — not damage
  'specialInvincible',   // Anti-Enforcement DEF — not damage
  'avoidInstantdeath',   // Death immune — not damage
  'avoidFunctionExecuteSelf', // Plot Armor — not damage
  'avoidState',          // Debuff immune — not damage
  'breakAvoidance',      // Sure Hit — only matters if enemies evade (not modeled)
  'pierceInvincible',    // Ignore Invincible — enemies rarely invincible in farming
  'pierceSpecialInvincible',
  'pierceSubdamage',     // Pierce damage cut — not relevant
  'guts',                // Guts — not damage
  'gutsRatio',           // Guts variant
  'donotAct',            // Stun/Charm — not relevant to our servants' damage
  'donotActCommandtype', // Card seal — not relevant
  'donotNoble',          // NP seal — not relevant
  'donotNobleCondMismatch',
  'donotRecovery',       // Healing disabled — not relevant
  'donotSkill',          // Skill seal — not relevant
  'donotSelectCommandcard',
  'donotSkillSelect',
  'upHate',              // Taunt — aggro, not damage
  'upDefence',           // DEF Up (self) — not relevant for our damage output
  'upCriticalrate',      // Crit rate — crits not modeled
  'upCriticaldamage',    // Crit damage — crits not modeled
  'upStarweight',        // Star gather — not damage
  'upCriticalpoint',     // Star drop rate — not damage
  'upGrantstate',        // Buff success rate — not damage
  'downGrantstate',      // Buff chance down — not damage
  'downCriticalrate',    // Crit rate down (on enemy) — not modeled
  'downCriticaldamage',  // Crit damage down (on enemy) — not modeled
  'downCriticalpoint',   // Star drop rate down — not damage
  'downCriticalRateDamageTaken',
  'downCriticalStarDamageTaken',
  'downStarweight',      // Star gather down — not damage
  'downGainHp',          // Heal down — not damage
  'downDropnp',          // NP gain down (on enemy) — affects enemy, not us
  'downAtk',             // ATK down (on enemy) — affects enemy's attack, not our damage
  'downNpdamage',        // NP damage down (on enemy) — enemy's NP, not ours
  'downNpturnval',       // Charge down per turn — on enemy, not relevant
  'downTolerance',       // Debuff resist down — not damage
  'regainHp',            // HP regen — not damage
  'regainStar',          // Star regen — not damage
  'reduceHp',            // DoT (Curse/Poison/Burn) — only relevant if enemies last multiple turns; farming is 1-wave NP
  'addMaxhp',            // Max HP+ — not damage
  'subMaxhp',            // Max HP- — not damage
  'masterSkillValueUp',  // Master skill boost — not damage
  'skillRankUp',         // Skill rank up — not modeled
  'changeBgm',           // BGM — cosmetic
  'preventDeathByDamage', // Not damage-relevant
  'hpReduceToRegain',    // Poison → heal conversion — not relevant
  'fixCommandcard',      // Lock command cards — not damage (we use token string)
  'reactiveDamageGainHp', // Absorb — not damage
  'reflectionFunction',  // Reflect damage — not relevant
  'confirmedCommandFunction',
  'confirmCommandFunction',
  'continueFunction',
  'entryFunction',
  'fieldIndividualityChangedFunction',
  'functionedFunction',
  'multiGutsBeforeFunction',
  'skillBeforeFunction',
  'skillTargetedBeforeFunction',
  'npattackPrevBuff',    // Pre-NP buff storage — resolved by other handlers
  'subFuncHpReduce',
  'subIndividuality',
  'subFieldIndividuality',
  'changeCommandCardType', // Changes individual command card type — not farming relevant
]);

// ── 4. Load and process fixtures ─────────────────────────────────────────────

const files = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'));
console.log(`Loading ${files.length} servant fixtures…`);

// shape key → { count, servants: Set, sources: Set }
const shapes = new Map();

function recordShape(shape, collectionNo, source) {
  const key = JSON.stringify(shape);
  if (!shapes.has(key)) shapes.set(key, { shape, count: 0, servants: new Set(), sources: new Set() });
  const rec = shapes.get(key);
  rec.count++;
  rec.servants.add(collectionNo);
  rec.sources.add(source);
}

function scriptKeys(script) {
  if (!script || typeof script !== 'object') return '';
  return Object.keys(script).sort().join('|');
}

function processFunction(func, collectionNo, source) {
  const ft   = func.funcType       ?? 'null';
  const ftt  = func.funcTargetType ?? 'null';
  const cond = Array.isArray(func.condTarget) && func.condTarget.length > 0;
  const ftvs = Array.isArray(func.functvals)  && func.functvals.length > 0;

  const buffs = func.buffs ?? [];
  if (buffs.length === 0) {
    recordShape({ ft, ftt, bt: null, bn: null, bsk: '', bosk: '', cond, ftvs }, collectionNo, source);
  } else {
    for (const buff of buffs) {
      recordShape({
        ft, ftt,
        bt:   buff.type ?? null,
        bn:   buff.name ?? null,
        bsk:  scriptKeys(buff.script),
        bosk: scriptKeys(buff.originalScript),
        cond, ftvs,
      }, collectionNo, source);
    }
  }
}

function loadFixture(file) {
  const raw  = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8');
  const json = JSON.parse(raw);
  if (json && json.data && !json.collectionNo) return json.data;
  return json;
}

for (const file of files) {
  let servant;
  try { servant = loadFixture(file); } catch (e) { console.error(`Skip ${file}:`, e.message); continue; }
  const cn = servant.collectionNo ?? parseInt(file);

  for (const skill of servant.skills ?? []) {
    for (const func of skill.functions ?? []) processFunction(func, cn, 'skill');
  }
  for (const np of servant.noblePhantasms ?? []) {
    for (const func of np.functions ?? []) processFunction(func, cn, 'np');
  }
  for (const passive of servant.classPassive ?? []) {
    for (const func of passive.functions ?? []) processFunction(func, cn, 'passive');
  }
  for (const passive of servant.appendPassive ?? []) {
    for (const func of passive.functions ?? []) processFunction(func, cn, 'appendPassive');
  }
}

console.log(`Discovered ${shapes.size} distinct shapes.`);

// ── 5. Classify each shape ────────────────────────────────────────────────────

function isHandledBuff(bt, bn) {
  if (!bt && !bn) return true;  // no-buff effect
  if (HANDLED_BUFF_TYPES.has(bt))                             return true;
  if (HANDLED_BUFF_NAMES.has(bn))                             return true;
  if (HANDLED_BUFF_NAMES.has(bt))                             return true; // type == name sometimes
  if (bn && (bn.includes('STR Up') || bn.includes('Strength Up'))) return true;
  if (bn && bn.includes('Triggers Each Turn'))                return true;
  if (bt && bt === 'buffRate')                                return true;
  return false;
}

function classify({ ft, ftt, bt, bn }) {
  // Cosmetic funcType takes priority
  if (COSMETIC_FUNC_TYPES.has(ft)) return 'cosmetic';
  // Cosmetic buff type (even if funcType is addState)
  if (COSMETIC_BUFF_TYPES.has(bt)) return 'cosmetic';

  if (HANDLED_FUNC_TYPES.has(ft)) {
    // damage funcTypes are always handled
    if (!['addState', 'addStateShort'].includes(ft)) return 'handled';
    // addState/addStateShort: handled only if the buff itself is active in the engine
    if (isHandledBuff(bt, bn)) return 'handled';
    return 'long_tail';
  }

  // funcType not in EFFECT_HANDLERS at all
  return 'long_tail';
}

// ── 6. Build result rows ──────────────────────────────────────────────────────

const rows = [...shapes.entries()]
  .map(([, rec]) => {
    const { shape, count, servants, sources } = rec;
    return {
      ...shape,
      count,
      servants:       [...servants].slice(0, 5).join(','),
      sources:        [...sources].join(','),
      classification: classify(shape),
    };
  })
  .sort((a, b) => b.count - a.count);

// ── 7. Write CSV ──────────────────────────────────────────────────────────────

const csvHeader = 'funcType,funcTargetType,buffType,buffName,scriptKeys,origScriptKeys,condTarget,functvals,count,top5servants,sources,classification\n';
const csvRows = rows.map(r =>
  [r.ft, r.ftt, r.bt, r.bn, r.bsk, r.bosk, r.cond, r.ftvs, r.count, r.servants, r.sources, r.classification]
    .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
    .join(',')
).join('\n');
fs.writeFileSync(path.join(OUT_DIR, 'fr5-coverage.csv'), csvHeader + csvRows, 'utf8');
console.log('Wrote docs/fr5-coverage.csv');

// ── 8. Write Markdown ─────────────────────────────────────────────────────────

const handled  = rows.filter(r => r.classification === 'handled');
const longTail = rows.filter(r => r.classification === 'long_tail');
const cosmetic = rows.filter(r => r.classification === 'cosmetic');

function top5(servants) { return servants.split(',').slice(0, 5).join(', '); }

function renderTable(rowsSubset) {
  if (rowsSubset.length === 0) return '_None_\n';
  const header =
    `| funcType | funcTargetType | buff.type | buff.name | script keys | oScript keys | condTarget | count | top-5 servants | sources |\n` +
    `|---|---|---|---|---|---|---|---|---|---|\n`;
  const body = rowsSubset.map(r =>
    `| ${r.ft} | ${r.ftt} | ${r.bt ?? ''} | ${r.bn ?? ''} | ${r.bsk} | ${r.bosk} | ${r.cond} | ${r.count} | ${top5(r.servants)} | ${r.sources} |`
  ).join('\n');
  return header + body + '\n';
}

// Split long tail into: unknown funcType vs unhandled buff in addState
const ltUnknownFt  = longTail.filter(r => !['addState','addStateShort'].includes(r.ft));
const ltUnknownBuf = longTail.filter(r =>  ['addState','addStateShort'].includes(r.ft));

const md = `# FR-5 Coverage Audit

Generated ${new Date().toISOString().slice(0,10)} against ${files.length} real servant fixtures.

**${shapes.size} distinct (funcType, funcTargetType, buff.type, buff.name, scriptKeys) shapes** across
skills, noblePhantasms, classPassive, appendPassive.

| Category | Shapes | Occurrences |
|---|---|---|
| Handled | ${handled.length} | ${handled.reduce((s,r)=>s+r.count,0)} |
| Long tail | ${longTail.length} | ${longTail.reduce((s,r)=>s+r.count,0)} |
| Cosmetic | ${cosmetic.length} | ${cosmetic.reduce((s,r)=>s+r.count,0)} |

---

## Already Handled

Shapes with an active handler in \`BattleEngine.EFFECT_HANDLERS\`, \`useNp\`, \`useSkill\`,
\`Buffs.processServantBuffs\`, \`processEnemyBuffs\`, or \`applyBattleClassOverride\`.

<details><summary>Expand (${handled.length} shapes)</summary>

${renderTable(handled)}
</details>

---

## Long Tail — Engine Impact

Shapes that **could affect damage / NP gauge / cooldowns** but have no handler today.
Sorted by occurrence count. **This is the FR-5 backlog.**

### Unhandled funcType (no entry in EFFECT\_HANDLERS)

These funcTypes are completely absent from the dispatch table — every occurrence
is a silent no-op.

${renderTable(ltUnknownFt)}

### Known funcType (addState/addStateShort) but unhandled buff type/name

The buff is stored, but \`processServantBuffs\` / \`processEnemyBuffs\` never reads
it. The engine currently sees these as if they were never applied.

${renderTable(ltUnknownBuf)}

---

## Cosmetic / Story / Cutscene

funcTypes or buff types that never affect damage simulation. Listed for completeness.

<details><summary>Expand (${cosmetic.length} shapes)</summary>

${renderTable(cosmetic)}
</details>
`;

fs.writeFileSync(path.join(OUT_DIR, 'fr5-coverage.md'), md, 'utf8');
console.log('Wrote docs/fr5-coverage.md');

// ── 9. Console summary ────────────────────────────────────────────────────────

console.log('\n=== UNHANDLED funcTypes (top 20) ===');
ltUnknownFt.slice(0,20).forEach(r =>
  console.log(`  [${r.count.toString().padStart(5)}] ${r.ft} / ${r.ftt} / ${r.bt} / ${r.bn}  servants:${top5(r.servants)}`)
);
console.log('\n=== UNHANDLED buffs in addState/addStateShort (top 30) ===');
ltUnknownBuf.slice(0,30).forEach(r =>
  console.log(`  [${r.count.toString().padStart(5)}] ${r.ft} / ${r.ftt} / ${r.bt} / "${r.bn}"  servants:${top5(r.servants)}`)
);
