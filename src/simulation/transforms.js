/**
 * Declarative transform registry for servants whose in-battle state changes
 * in ways that aren't expressible by the generic buff + processServantBuffs
 * pipeline alone.
 *
 * Schema
 * ──────
 * [collectionNo]: {
 *   skillOverrides?: Array<{
 *     num:       number,          // 1-based skill number
 *     condition: (servant) => boolean,  // fire this override only when true
 *     handler:   (engine, servant) => void,  // replace default skill effects
 *   }>,
 * }
 *
 * BattleEngine.useSkill consults this registry BEFORE processing the skill's
 * Atlas functions. If a matching skillOverride fires, useSkill returns early
 * (the Atlas function list is skipped for that use).
 *
 * Currently registered
 * ────────────────────
 * Mash (1): S2 「Purple Bullet / Sanctify Bullet」
 *   Default S2 in Atlas is a defensive skill; while 「聖剣装填」 (tdTypeChangeBuster)
 *   is loaded, her S2 becomes an offensive star-to-NP converter + NP strength
 *   boost. The engine assumes 50 crit stars (max useful input) → +200% NP.
 *   Owner-approved contained special case (see CLAUDE.md, FR-5).
 *
 * Adding new entries
 * ──────────────────
 * For a servant whose S3 always overwrites class via a skill effect:
 *   [cn]: {
 *     skillOverrides: [{ num: 3, condition: () => true, handler: (eng, s) => { ... } }],
 *   }
 * For a servant whose NP post-fire triggers a whole-servant swap (Aoko pattern),
 * that lives in BattleEngine.useNp directly (complex data dependency); a future
 * schema extension would capture it as { npTransform: fn }.
 */

const ASSUME_STARS = 50; // max useful star input for star-conditional skills

export const transforms = {
  // Mash Kyrielight — collectionNo 1
  // S2 override: while 「聖剣装填」 buff is loaded (any tdTypeChange* active),
  // converts 50 crit stars into +200% NP charge and grants +100% NP strength (3T).
  1: {
    skillOverrides: [
      {
        num: 2,
        condition: (servant) =>
          servant.buffs.buffs.some(
            (b) => typeof b.type === 'string' && b.type.startsWith('tdTypeChange')
          ),
        handler: (engine, servant) => {
          servant.skills.setSkillCooldown(2);
          servant.stats.setNpgauge(Math.min(ASSUME_STARS, 50) * 4); // stars × 4%
          engine.applyBuff(servant, {
            buff_name: 'NP Strength Up',
            value:     1000,
            turns:     3,
            functvals: [],
            tvals:     [],
          });
        },
      },
    ],
  },
};

/**
 * Find and execute a matching skillOverride for the given servant + skill number.
 * Returns true if an override fired (caller should return early); false otherwise.
 */
export function applySkillTransform(engine, servant, skillNum) {
  const entry = transforms[servant.id];
  if (!entry?.skillOverrides) return false;
  for (const override of entry.skillOverrides) {
    if (override.num === skillNum && override.condition(servant)) {
      override.handler(engine, servant);
      return true;
    }
  }
  return false;
}
