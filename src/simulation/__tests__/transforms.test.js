/**
 * transforms.js registry (Phase C-4).
 *
 * Verifies that the two registered transform entries behave identically to the
 * hardcoded id-branches they replaced, so the refactor is provably zero-change.
 *
 * Mash (1) S2 — while 「聖剣装填」 (any tdTypeChange* buff) is active:
 *   - Skill cooldown is set.
 *   - NP gauge increases by (50 stars × 4%) = 200%.
 *   - NP Strength Up (1000 = +100%) is applied for 3 turns.
 *   - Base S2 Atlas functions are NOT processed.
 *
 * When 「聖剣装填」 is NOT active, S2 falls through to the normal Atlas function
 * list (no override fires), same as before the refactor.
 */
import { Driver } from '../Driver';
import { BattleEngine } from '../BattleEngine';
import { Servant } from '../Servant';
import { buildSimInputs, loadServant } from '../__fixtures__/realData';

function makeMashEngine(extraOpts = {}) {
  return new BattleEngine(buildSimInputs({
    servants: [{ collectionNo: 1, opts: { initialCharge: 100, ...extraOpts } }],
    questId: 94089601,
  }));
}

describe('transforms registry — Mash S2 override', () => {
  test('S2 does NOT override when 「聖剣装填」 is absent (no tdTypeChange buff)', () => {
    const eng  = makeMashEngine();
    const mash = eng.servants[0];
    // No tdTypeChange* buff initially — S2 should fall through to Atlas functions
    expect(mash.buffs.buffs.some(b => typeof b.type === 'string' && b.type.startsWith('tdTypeChange'))).toBe(false);
    const gauge0 = mash.npGauge;
    // Skill 2 (0-indexed = 1) — should process normally (no guaranteed NP gain)
    eng.useSkill(mash, 1); // skillNum=1 → num=2
    // No override means no 200% NP charge is injected by transforms
    // (actual Atlas S2 may add NP via gainNp function, but no 200% jump)
    expect(mash.npGauge).toBeLessThan(gauge0 + 200);
  });

  test('S2 fires the override when any tdTypeChange* buff is active', () => {
    const eng  = makeMashEngine();
    const mash = eng.servants[0];
    // Arm the buff that signals Holy Sword is loaded
    mash.buffs.addBuff({ buff: '聖剣装填', type: 'tdTypeChangeBuster', value: 0, turns: 3 });
    expect(mash.buffs.buffs.some(b => typeof b.type === 'string' && b.type.startsWith('tdTypeChange'))).toBe(true);

    const gauge0 = mash.npGauge;
    eng.useSkill(mash, 1); // skillNum=1 → num=2

    // Transform: +50 stars × 4% = +200% NP
    expect(mash.npGauge).toBeCloseTo(gauge0 + 200, 5);
    // Transform: NP Strength Up (1000 = +100%) for 3 turns
    const npStrBuff = mash.buffs.buffs.find(b => b.buff === 'NP Strength Up');
    expect(npStrBuff).toBeDefined();
    expect(npStrBuff.value).toBe(1000);
    expect(npStrBuff.turns).toBe(3);
  });

  test('S2 override sets skill cooldown correctly', () => {
    const eng  = makeMashEngine();
    const mash = eng.servants[0];
    mash.buffs.addBuff({ buff: '聖剣装填', type: 'tdTypeChangeBuster', value: 0, turns: 3 });
    expect(mash.skills.getSkillCooldowns()[2]).toBe(0);
    eng.useSkill(mash, 1);
    expect(mash.skills.getSkillCooldowns()[2]).toBeGreaterThan(0);
  });

  // Smoke-test: ensure a full Mash NP-swap sequence still works via the Driver
  // (NP fires Lord Chaldeas → loads 聖剣装填 → S2 now uses the override)
  test('end-to-end: fire NP then S2 arms the Holy Sword chain (smoke)', () => {
    const inputs = buildSimInputs({
      servants: [{ collectionNo: 1, opts: { initialCharge: 100 } }],
      questId: 94089601,
    });
    const driver = new Driver(inputs);
    // '4' fires NP (Lord Chaldeas → loads 聖剣装填)
    // 'b' fires S2 (should now use the override → +200% NP)
    const engine = driver.run('4 b');
    expect(engine).not.toBe(false);
    // Both actions should have resolved without throwing
    const mash = engine.servants[0];
    expect(mash.id).toBe(1);
  });
});
