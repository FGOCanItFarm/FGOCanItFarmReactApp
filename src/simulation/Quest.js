import { Enemy } from './Enemy.js';

export class Quest {
  constructor(questData) {
    this.fields = [];
    this.waves = {};
    this.totalWaves = 0;
    this.processQuest(questData);
  }

  processQuest(doc) {
    for (const field of (doc.individuality || [])) {
      this.fields.push(field.id);
    }
    const stages = doc.stages || [];
    for (let i = 0; i < stages.length; i++) {
      this.waves[i + 1] = (stages[i].enemies || []).map(enemy => {
        const enemydata = [
          enemy.name,
          enemy.hp,
          enemy.deathRate,
          enemy.svt.className,
          (enemy.svt.traits || []).map(t => t.id),
          enemy.svt.attribute,
          enemy.state ?? null,
        ];
        const e = new Enemy(enemydata);
        // 90** "Anti-<class> Defense Vulnerability" gimmick: per-attacker-class
        // damage-advantage override (e.g. { saber: 5 } = Saber attackers deal 5×
        // instead of the normal 2×). Populated by the sync trim from the enemy's
        // vulnerability buff; absent for ordinary enemies.
        if (enemy.classAdvantageMod && typeof enemy.classAdvantageMod === 'object') {
          e.classAdvantageMod = enemy.classAdvantageMod;
        }
        return e;
      });
    }
    this.totalWaves = stages.length;
  }

  getWave(waveNo = 0) {
    if (waveNo === 0) return this.waves;
    return this.waves[waveNo] || [];
  }
}
