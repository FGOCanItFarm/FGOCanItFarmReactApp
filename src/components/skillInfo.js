// Parse a servant's full Atlas "nice" data into per-skill targeting info so the
// command UI can label skills and only ask for an ally target when the skill
// actually needs one. Parsing only guides the UI — it never blocks input, so a
// misparse still lets the user pick a target manually.

const ALLY_TARGET = new Set(['ptOne', 'ptOneOther']);

// Preference order when a skill has functions with several target types.
const TARGET_PRIORITY = [
  'ptOne', 'ptOneOther',
  'enemyAll', 'enemyFull', 'enemy', 'enemyOther',
  'ptAll', 'ptFull', 'ptOther', 'ptAllOther',
  'ptselectOneSub', 'ptselectSub',
  'self',
];

export function targetLabel(t) {
  switch (t) {
    case 'self': return 'Self';
    case 'ptOne':
    case 'ptOneOther': return 'Ally';
    case 'ptAll':
    case 'ptFull':
    case 'ptOther':
    case 'ptAllOther': return 'Party';
    case 'enemy':
    case 'enemyOther': return 'Enemy';
    case 'enemyAll':
    case 'enemyFull': return 'All Enemies';
    case 'ptselectOneSub':
    case 'ptselectSub': return 'Swap';
    default: return '';
  }
}

// Returns [{ num, name, icon, targetType, label, needsAllyTarget, isChoice,
// choiceCount }] for skills 1-3. isChoice is true when the skill is an NP-type
// chooser — either it carries `script.selectTreasureDeviceInfo` (BB Dubai 421
// S3, lists each option's target NP) or it has 2+ suffixed
// `tdTypeChange{Arts,Buster,Quick}` functions (Emiya 11 S3, Space Ishtar 268
// S2 — choice is by card type). choiceCount is the number of options
// (2 for BB Dubai/Emiya, 3 for Space Ishtar) so the UI can render the right
// A/B/C selector.
export function parseServantSkills(data) {
  const skills = data?.skills || [];
  const byNum = {};
  for (const s of skills) {
    const num = s?.num;
    if (!num || num < 1 || num > 3) continue;
    // Multiple entries per num are rank-ups; keep the highest priority one.
    if (!byNum[num] || (s.priority || 0) > (byNum[num].priority || 0)) byNum[num] = s;
  }

  const result = [];
  for (let num = 1; num <= 3; num++) {
    const s = byNum[num];
    if (!s) {
      result.push({ num, name: `Skill ${num}`, icon: null, targetType: '', label: '', needsAllyTarget: false, isChoice: false, choiceCount: 0 });
      continue;
    }
    const targets = (s.functions || []).map(f => f.funcTargetType).filter(Boolean);
    let primary = '';
    for (const t of TARGET_PRIORITY) {
      if (targets.includes(t)) { primary = t; break; }
    }
    if (!primary && targets.length) primary = targets[0];

    const stdi = s.script?.selectTreasureDeviceInfo?.[0]?.treasureDevices;
    const stdiCount = Array.isArray(stdi) ? stdi.length : 0;
    const variantCount = (s.functions || []).filter(f => {
      const t = f.buffs?.[0]?.type;
      return typeof t === 'string' && t.startsWith('tdTypeChange') && t !== 'tdTypeChange';
    }).length;
    const choiceCount = Math.max(stdiCount, variantCount);
    const isChoice = choiceCount >= 2;

    result.push({
      num,
      name: s.name || `Skill ${num}`,
      icon: s.icon || null,
      targetType: primary,
      label: targetLabel(primary),
      needsAllyTarget: targets.some(t => ALLY_TARGET.has(t)),
      isChoice,
      choiceCount,
    });
  }
  return result;
}
