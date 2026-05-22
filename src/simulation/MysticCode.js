export class MysticCode {
  constructor(mcData) {
    this.name     = mcData.name || '';
    this.shortName = mcData.shortName || '';
    this.maxLv    = mcData.maxLv || 10;
    this.skills   = this.parseSkills(mcData.skills || []);
    this.cooldowns = { 0: 0, 1: 0, 2: 0 };
  }

  parseSkills(skillsData) {
    return skillsData.map(skill => {
      const cdList = skill.coolDown || [0];
      const cooldown = cdList[cdList.length - 1];
      const functions = (skill.functions || []).map(func => {
        let svals = func.svals ?? [];
        if (Array.isArray(svals) && svals.length > 0) svals = svals[svals.length - 1];
        else if (!Array.isArray(svals)) svals = svals;
        else svals = {};
        return { ...func, svals };
      });
      return { id: skill.id, num: skill.num, name: skill.name, cooldown, functions };
    });
  }

  getSkillByNum(num) { return this.skills[num]; }

  setCooldown(skillNum) {
    this.cooldowns[skillNum] = this.skills[skillNum].cooldown;
  }

  decrementCooldowns() {
    for (const k of Object.keys(this.cooldowns)) {
      if (this.cooldowns[k] > 0) this.cooldowns[k]--;
    }
  }
}
