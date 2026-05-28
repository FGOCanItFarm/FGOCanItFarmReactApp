export class Skills {
  constructor(skillsData, append5, mysticCode = null) {
    this.skills = this.parseSkills(skillsData);
    this.cooldowns = { 1: 0, 2: 0, 3: 0 };
    this.maxCooldowns = this.initializeMaxCooldowns();
    this.cooldownReductionApplied = { 1: false, 2: false, 3: false };
    this.mysticCode = mysticCode;
    this.melusineSkill = false;
    this.append5 = append5;
  }

  static safeSval(svalsRaw, defaultVal = {}) {
    if (!Array.isArray(svalsRaw) || svalsRaw.length === 0) return defaultVal;
    const entry = svalsRaw.length > 9 ? svalsRaw[9] : svalsRaw[svalsRaw.length - 1];
    return (typeof entry === 'object' && entry !== null) ? entry : defaultVal;
  }

  parseSkills(skillsData) {
    const skills = { 1: [], 2: [], 3: [] };
    for (const skill of skillsData) {
      const cdList = skill.coolDown || [];
      const cooldown = Array.isArray(cdList) && cdList.length > 0
        ? (cdList.length > 9 ? cdList[9] : cdList[cdList.length - 1])
        : 0;

      const parsedSkill = { id: skill.id, name: skill.name, cooldown, functions: [] };

      for (const func of (skill.functions || [])) {
        const sval = Skills.safeSval(func.svals);
        const parsedFunc = {
          funcType:       func.funcType,
          funcTargetType: func.funcTargetType,
          functvals:      func.functvals,
          fieldReq:       func.funcquestTvals || [],
          condTarget:     func.functvals || [],
          svals:          sval,
          buffs:          [],
        };
        for (const buff of (func.buffs || [])) {
          const buffSval = Skills.safeSval(buff.svals);
          parsedFunc.buffs.push({
            name:           buff.name,
            type:           buff.type,
            tvals:          buff.tvals || [],
            svals:          buffSval || null,
            value:          buffSval ? (buffSval.Value ?? 0) : 0,
            script:         buff.script,
            originalScript: buff.originalScript,
          });
        }
        parsedSkill.functions.push(parsedFunc);
      }

      const num = parseInt(skill.num);
      if (skills[num]) skills[num].push(parsedSkill);
    }
    return skills;
  }

  initializeMaxCooldowns() {
    const max = {};
    for (let i = 1; i <= 3; i++) {
      const arr = this.skills[i];
      max[i] = arr && arr.length > 0 ? arr[arr.length - 1].cooldown : 0;
    }
    return max;
  }

  getSkillByNum(num) {
    if (num >= 1 && num <= 3) {
      // Melusine: first use of skill ID 888550 triggers form change
      if (!this.melusineSkill && this.skills[num][0]?.id === 888550) {
        this.melusineSkill = true;
        return this.skills[num][0];
      }
      return this.skills[num][this.skills[num].length - 1];
    }
    throw new RangeError(`Skill number ${num} is out of range`);
  }

  getSkillCooldowns() { return this.cooldowns; }

  decrementCooldowns(turns) {
    for (const skillNum of Object.keys(this.cooldowns)) {
      if (this.cooldowns[skillNum] > 0)
        this.cooldowns[skillNum] = Math.max(0, this.cooldowns[skillNum] - turns);
    }
  }

  skillAvailable(skillNum) { return this.cooldowns[skillNum] === 0; }

  setSkillCooldown(skillNum) {
    if (!this.cooldownReductionApplied[skillNum] && this.append5) {
      this.cooldowns[skillNum] = Math.max(0, this.maxCooldowns[skillNum] - 1);
      this.cooldownReductionApplied[skillNum] = true;
    } else {
      this.cooldowns[skillNum] = this.maxCooldowns[skillNum];
    }
  }
}
