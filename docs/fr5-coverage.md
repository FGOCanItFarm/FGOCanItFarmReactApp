# FR-5 Coverage Audit

Generated 2026-05-29 against 469 real servant fixtures.

**892 distinct (funcType, funcTargetType, buff.type, buff.name, scriptKeys) shapes** across
skills, noblePhantasms, classPassive, appendPassive.

| Category | Shapes | Occurrences |
|---|---|---|
| Handled | 246 | 3697 |
| Long tail | 293 | 1542 |
| Cosmetic | 353 | 5031 |

---

## Already Handled

Shapes with an active handler in `BattleEngine.EFFECT_HANDLERS`, `useNp`, `useSkill`,
`Buffs.processServantBuffs`, `processEnemyBuffs`, or `applyBattleClassOverride`.

<details><summary>Expand (246 shapes)</summary>

| funcType | funcTargetType | buff.type | buff.name | script keys | oScript keys | condTarget | count | top-5 servants | sources |
|---|---|---|---|---|---|---|---|---|---|
| gainNp | self |  |  |  |  | false | 334 | 1, 100, 101, 105, 106 | skill,np,passive |
| addStateShort | self | upCommandall | Arts Up |  |  | false | 297 | 100, 102, 103, 104, 107 | passive,skill,np |
| addStateShort | self | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 284 | 1, 104, 106, 108, 11 | skill,np,passive |
| addStateShort | self | upCommandall | Quick Up |  |  | false | 282 | 1, 10, 101, 104, 105 | passive,skill,np |
| damageNp | enemyAll |  |  |  |  | false | 220 | 100, 103, 104, 108, 112 | np |
| addStateShort | self | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 167 | 100, 112, 113, 116, 12 | skill,np,passive |
| addStateShort | self | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 160 | 1, 11, 118, 123, 131 | skill,np |
| addStateShort | ptAll | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 159 | 1, 101, 106, 108, 112 | np,skill |
| damageNp | enemy |  |  |  |  | false | 151 | 105, 106, 109, 110, 113 | np |
| addStateShort | enemyAll | downDefence | DEF Down | ProgressSelfTurn | ProgressSelfTurn | false | 110 | 10, 100, 108, 112, 117 | np,skill |
| addStateShort | self | upDropnp | NP Gain Up |  |  | false | 92 | 1, 110, 111, 12, 128 | skill,np,passive |
| gainNp | ptAll |  |  |  |  | false | 80 | 1, 100, 118, 125, 145 | skill,np |
| damageNpIndividual | enemyAll |  |  |  |  | false | 78 | 1, 12, 169, 188, 196 | np |
| addStateShort | self | regainNp | NP Gain Each Turn |  |  | false | 72 | 103, 106, 107, 127, 136 | skill,passive,np |
| addStateShort | enemy | downDefence | DEF Down | ProgressSelfTurn | ProgressSelfTurn | false | 68 | 102, 116, 118, 128, 131 | np,skill |
| addStateShort | ptAll | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 59 | 103, 108, 119, 12, 126 | skill,np |
| damageNpIndividual | enemy |  |  |  |  | false | 57 | 101, 128, 140, 143, 15 | np |
| gainNp | ptOne |  |  |  |  | false | 45 | 1, 144, 183, 189, 197 | skill |
| damageNpPierce | enemyAll |  |  |  |  | false | 40 | 100, 11, 127, 167, 18 | np |
| addStateShort | ptAll | upCommandall | Arts Up |  |  | false | 39 | 10, 100, 127, 145, 192 | skill,np |
| addStateShort | ptAll | upDropnp | NP Gain Up |  |  | false | 36 | 113, 126, 182, 196, 203 | skill,np |
| addStateShort | ptAll | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 34 | 100, 125, 140, 161, 171 | skill,np |
| instantDeath | enemy |  |  |  |  | false | 32 | 102, 124, 154, 158, 17 | np |
| damageNpPierce | enemy |  |  |  |  | false | 27 | 102, 109, 113, 121, 122 | np |
| addStateShort | ptAll | upChagetd | Overcharge Lv. Up |  |  | false | 25 | 167, 189, 212, 241, 253 | skill,np |
| addStateShort | ptAll | upCommandall | Quick Up |  |  | false | 23 | 100, 14, 179, 182, 189 | skill,np |
| addStateShort | enemyAll | downDefencecommandall | Buster Card Resist Down |  |  | false | 23 | 199, 205, 209, 243, 247 | skill,np |
| addStateShort | enemyAll | downDefencecommandall | Arts Card Resist Down |  |  | false | 20 | 173, 198, 201, 204, 221 | skill,np |
| instantDeath | enemyAll |  |  |  |  | false | 19 | 120, 133, 177, 283, 285 | np |
| addStateShort | enemyAll | downDefencecommandall | Quick Card Resist Down |  |  | false | 19 | 218, 243, 263, 295, 305 | np,skill |
| addStateShort | ptOne | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 18 | 144, 150, 181, 207, 22 | skill |
| addStateShort | enemy | downDefencecommandall | Arts Card Resist Down |  |  | false | 17 | 110, 167, 187, 278, 291 | np,skill |
| addStateShort | self | upDamage | STR Up vs. Demonic |  |  | false | 16 | 114, 125, 185, 193, 224 | skill,np |
| gainNp | ptAll |  |  |  |  | false | 16 | 281, 32, 367, 369, 389 | np,skill |
| shortenSkill | ptOne |  |  |  |  | false | 15 | 103, 104, 144, 179, 314 | skill |
| addStateShort | ptAll | regainNp | NP Gain Each Turn |  |  | false | 15 | 103, 150, 178, 195, 276 | skill,np |
| addStateShort | ptAll | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 15 | 106, 196, 214, 286, 297 | skill,np |
| damageNpIndividualSum | enemy |  |  |  |  | false | 12 | 153, 246, 303, 311, 339 | np |
| shortenSkill | self |  |  |  |  | false | 11 | 1, 118, 196, 238, 310 | np,skill |
| addStateShort | ptOne | upChagetd | Overcharge Lv. Up |  |  | false | 11 | 103, 127, 197, 239, 282 | skill |
| addState | self | downDefence | DEF Down | ProgressSelfTurn | ProgressSelfTurn | false | 11 | 136, 163, 254, 326, 33 | np,skill |
| addStateShort | ptOne | upCommandall | Arts Up |  |  | false | 11 | 207, 284, 320, 349, 353 | skill |
| addStateShort | ptOne | upDropnp | NP Gain Up |  |  | false | 11 | 242, 244, 31, 320, 387 | skill |
| gainNp | ptOther |  |  |  |  | false | 11 | 294, 347, 349, 351, 363 | np,skill |
| addStateShort | ptAll | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 10 | 1, 119, 33, 367, 387 | np,skill |
| addStateShort | ptOne | upCommandall | Quick Up |  |  | false | 10 | 104, 207, 215, 281, 320 | skill |
| addStateShort | self | upAtk | ATK Up |  |  | false | 10 | 135, 17, 178, 322, 354 | skill,np,passive |
| addStateShort | ptOne | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 10 | 175, 241, 242, 295, 330 | skill |
| addStateShort | self | upDamage | STR Up vs. Evil |  |  | false | 9 | 119, 159, 234, 374, 43 | skill,np |
| addStateShort | self | upDamage | STR Up vs. Divine |  |  | false | 9 | 133, 331, 364, 371, 386 | skill,np |
| addStateShort | enemy | downDefencecommandall | Quick Card Resist Down |  |  | false | 9 | 146, 159, 269, 278, 281 | skill,np |
| addStateShort | ptOther | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 8 | 111, 342, 363, 372, 404 | skill,np |
| addStateShort | ptOne | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 8 | 127, 183, 197, 213, 244 | skill |
| instantDeath | enemyAll |  |  |  |  | false | 8 | 214, 359, 360, 361, 369 | np |
| transformServant | self |  |  |  |  | false | 8 | 312, 394, 413, 464, 467 | skill,np |
| addStateShort | ptAll | upDropnp | NP Gain Up |  |  | false | 8 | 33, 341, 355, 359, 360 | skill |
| addStateShort | self | upDamage | Strength Up [Chaotic] |  |  | false | 7 | 119, 205, 234, 293, 345 | skill,np |
| damageNpStateIndividualFix | enemy |  |  |  |  | false | 7 | 13, 239, 275, 319, 356 | np |
| addStateShort | self | upDamage | Strength Up [Human Attribute] |  |  | false | 7 | 158, 235, 276, 323, 424 | skill,np |
| forceInstantDeath | self |  |  |  |  | false | 7 | 16, 294, 414, 427, 454 | np |
| addStateShort | self | upDamage | STR Up vs. Dragon |  |  | false | 7 | 208, 224, 332, 419, 6 | skill |
| addStateShort | self | upDamage | Strength Up (Heaven attribute) |  |  | false | 7 | 209, 250, 383, 421, 424 | skill,np |
| addStateShort | enemy | downDefencecommandall | Buster Card Resist Down |  |  | false | 6 | 101, 289, 294, 335, 446 | np,skill |
| addStateShort | self | upDamage | Strength Up (Lawful) |  |  | false | 6 | 159, 205, 387, 423, 440 | skill,np |
| addStateShort | self | upDamage | Strength Up (Wild Beasts) |  |  | false | 6 | 20, 326, 334, 379 | skill,passive |
| gainNp | ptOther |  |  |  |  | false | 6 | 254, 351, 421, 431, 452 | skill,np |
| damageNpIndividualSum | enemyAll |  |  |  |  | false | 6 | 280, 285, 343, 441, 444 | np |
| addStateShort | self | upDamage | STR Up (Good) |  |  | false | 5 | 155, 423, 438, 440, 78 | np,skill |
| addStateShort | ptOther | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 5 | 156, 18, 216, 452, 99 | skill |
| addStateShort | self | upDamage | STR Up vs. Super Giant |  |  | false | 5 | 160, 347, 371, 452 | skill,np |
| addStateShort | self | upDamage | Strength Up (Earth Attribute) |  |  | false | 5 | 232, 419, 424, 425, 437 | skill,np |
| addStateShort | self | upDamage | STR Up vs. Undead |  |  | false | 5 | 243, 299, 435, 70 | skill |
| addStateShort | self | upCommandall | Buster Up |  |  | false | 4 | 123, 250, 310, 350 | skill,np |
| addStateShort | self | upDamage | Strength Up (Threat to Humanity) |  |  | false | 4 | 175, 222, 373, 393 | np,skill |
| addStateShort | self | upDamageIndividuality | Strength Up (Curse) |  |  | false | 4 | 185, 324, 407 | skill |
| addStateShort | ptAll | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 4 | 294, 456, 53 | np,skill |
| addStateShort | ptOther | upDropnp | NP Gain Up |  |  | false | 4 | 305, 429, 77 | skill,np |
| addStateShort | ptAll | upAtk | ATK Up | HP_LOWER | HP_LOWER | false | 4 | 385 | skill |
| shortenSkill | ptAll |  |  |  |  | false | 4 | 438, 461, 62 | skill,np |
| addStateShort | self | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 4 | 448, 453, 81 | skill,np |
| addStateShort | ptOther | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 3 | 1, 268, 269 | np,skill |
| addStateShort | commandTypeSelfTreasureDevice | tdTypeChange | NP Type Change | INDIVIDUALITIE | INDIVIDUALITIE | false | 3 | 11, 268, 421 | skill |
| addStateShort | self | upNpdamage | NP Strength Up |  |  | false | 3 | 132, 296, 357 | np |
| addState | enemy | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 3 | 134, 56 | skill |
| addStateShort | self | upCommandatk | Extra Attack STR Up |  |  | false | 3 | 268 | np |
| addStateShort | self | upDamage | Strength Up [Shadow Servant] | checkIndvType | checkIndvType | false | 3 | 276, 323, 435 | np,skill |
| addStateShort | ptOne | regainNp | NP Gain Each Turn |  |  | false | 3 | 33, 463, 465 | skill |
| addStateShort | ptAll | upCommandall | Arts Up |  |  | false | 3 | 341, 369, 456 | skill,np |
| addStateShort | self | upDropnp | NP Gain Up |  |  | false | 3 | 343, 366 | skill |
| addStateShort | self | upDamage | STR Up vs. Human |  |  | false | 3 | 415, 43 | np,skill |
| addStateShort | commandTypeSelfTreasureDevice | tdTypeChangeArts | NP Type Change: Arts | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 11, 268 | skill |
| addStateShort | commandTypeSelfTreasureDevice | tdTypeChangeBuster | NP Type Change: Buster | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 11, 268 | skill |
| gainNp | self |  |  |  |  | false | 2 | 116, 81 | skill |
| addStateShort | self | upDamage | Strength Up |  |  | false | 2 | 153 | skill |
| addStateShort | ptAll | upDamage | STR Up (Good) |  |  | false | 2 | 167, 237 | skill |
| addStateShort | self | upDamageIndividualityActiveonly | Strength Up (Poison) |  |  | false | 2 | 199, 420 | skill |
| addStateShort | self | upChagetd | Overcharge Lv. Up |  |  | false | 2 | 209, 444 | skill |
| addStateShort | self | upDamage | STR Up vs. Humanoid |  |  | false | 2 | 210, 97 | skill |
| addStateShort | ptAll | upDamage | Strength Up (Earth Attribute) |  |  | false | 2 | 274, 465 | skill |
| addStateShort | self | upDamage | Strength Up (Servant) |  |  | false | 2 | 283, 356 | skill |
| addStateShort | ptAll | upAtk | ATK Up |  |  | false | 2 | 296 | skill |
| addStateShort | ptAll | upDamage | STR Up vs. Dragon |  |  | false | 2 | 30, 332 | skill |
| addStateShort | self | upDamage | Strength Up [King] |  |  | false | 2 | 302, 42 | passive,skill |
| addStateShort | self | selfturnendFunction | Triggers Each Turn (HP Recovery & Remove Debuff) |  |  | false | 2 | 306 | skill |
| addStateShort | ptSelfAnotherFirst | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 307, 463 | np |
| gainNp | ptSelfAnotherFirst |  |  |  |  | false | 2 | 307, 463 | np |
| damageNpStateIndividualFix | enemyAll |  |  |  |  | false | 2 | 321, 380 | np |
| addStateShort | self | upCommandall | Quick Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 351, 431 | passive |
| addStateShort | self | upCommandall | Arts Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 351, 431 | passive |
| addStateShort | self | upCommandall | Buster Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 351, 431 | passive |
| addStateShort | ptAll | upDamage | STR Up vs. Undead |  |  | false | 2 | 352, 358 | skill |
| addStateShort | self | upDamage | Strength Up (Riding Skill) |  |  | false | 2 | 368 | np |
| addStateShort | ptOther | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 393, 434 | skill |
| instantDeath | enemy |  |  |  |  | false | 2 | 41 | np |
| addFieldChangeToField | self | toFieldChangeField | フィールド変化〔天国〕 |  |  | false | 2 | 437, 464 | skill,np |
| addStateShort | self | upDamage | 威力アップ〔七騎士クラス〕 |  |  | false | 2 | 444, 459 | skill |
| addStateShort | self | tdTypeChangeArts | 日輪 | INDIVIDUALITIE | DisplayCardBottomImageName|DisplayPriority|INDIVIDUALITIE | false | 2 | 448 | skill,passive |
| addStateShort | self | upDamage | Strength Up [Giant] |  |  | false | 2 | 452, 89 | np,skill |
| addStateShort | ptAll | upDamage | Strength Up (Lawful) |  |  | false | 2 | 467, 55 | skill |
| addState | ptOne | downDefence | DEF Down | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 7 | skill |
| addStateShort | self | upDamage | STR Up vs. Female |  |  | false | 2 | 75 | np |
| addStateShort | self | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn|UnSubStateWhenContinue | false | 2 | 81 | np |
| addStateShort | self | upDamage | STR Up vs. Saber |  |  | false | 2 | 86 | skill |
| addStateShort | self | tdTypeChangeBuster | 聖剣装填 | INDIVIDUALITIE_OR | DisplayCardBottomImageName|INDIVIDUALITIE_OR | false | 1 | 1 | np |
| addStateShort | self | upDamage | STR Up vs. Heaven/Earth Servant |  |  | false | 1 | 114 | skill |
| addStateShort | ptOne | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 116 | skill |
| gainNp | enemy |  |  |  |  | false | 1 | 128 | skill |
| addStateShort | self | upDamage | STR Up vs. Divine, Undead, Demon |  |  | false | 1 | 135 | skill |
| addState | self | delayFunction | NP Strength Up Set |  |  | false | 1 | 163 | skill |
| addStateShort | self | commandattackBeforeFunction | Pre-ATK Damage Bonus Effect (Critical STR Up) |  |  | false | 1 | 163 | skill |
| addStateShort | self | upAtk | ATK Up | HP_LOWER | HP_LOWER | false | 1 | 164 | skill |
| addStateShort | ptOther | upCommandall | Quick Up |  |  | false | 1 | 170 | skill |
| addStateShort | self | upDamage | STR Up vs. [Greek Mythology Male] |  |  | false | 1 | 171 | skill |
| addStateShort | self | upDropnp | NP Gain Up | HP_LOWER | HP_LOWER | false | 1 | 175 | skill |
| addStateShort | self | upDamage | 威力アップ〔獣の力〕 |  |  | false | 1 | 175 | np |
| addFieldChangeToField | self | toFieldChangeField | Field Change [Near Water] |  |  | false | 1 | 177 | np |
| addStateShort | self | upDamageIndividuality | Strength Up [Terror] |  |  | false | 1 | 195 | skill |
| addStateShort | ptAll | upDamage | STR Up vs. Demonic |  |  | false | 1 | 237 | skill |
| addStateShort | ptAll | upDamage | Strength Up [Chaotic] |  |  | false | 1 | 237 | skill |
| addStateShort | self | upNpdamage | NP Strength Up [Growth] | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 238 | skill |
| addStateShort | self | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 238 | np |
| addStateShort | ptOne | upDamage | Strength Up (Lawful) |  |  | false | 1 | 244 | skill |
| addStateShort | self | upDamageIndividualityActiveonly | Strength Up (Debuff) |  |  | false | 1 | 247 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with Quick (Critical Strength Up) |  |  | false | 1 | 248 | skill |
| forceInstantDeath | ptSelfAnotherFirst |  |  |  |  | false | 1 | 258 | np |
| addStateShort | self | upDamage | STR Up vs. Roman |  |  | false | 1 | 26 | skill |
| addStateShort | ptAll | upDamage | STR Up vs. Roman |  |  | false | 1 | 26 | skill |
| addStateShort | self | upDamage | Strength Up [Lawful and Good] | checkIndvType | checkIndvType | false | 1 | 260 | skill |
| addStateShort | self | upDamage | Strength Up: Arts | checkIndvType | checkIndvType | false | 1 | 261 | skill |
| addStateShort | self | commandattackAfterFunction | Activate during Critical Attack (Critical Strength Up) |  |  | false | 1 | 264 | skill |
| addStateShort | commandTypeSelfTreasureDevice | tdTypeChangeQuick | NP Type Change: Quick | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 268 | skill |
| addStateShort | self | upDamage | STR Up (Wild Beasts and Demonic) |  |  | false | 1 | 272 | skill |
| addStateShort | self | commandattackBeforeFunction | Pre-Buster ATK Damage Bonus Effect (Critical STR Up) |  |  | false | 1 | 272 | skill |
| addStateShort | ptAll | upDamageIndividuality | STR Up (Charm) |  |  | false | 1 | 274 | skill |
| addStateShort | self | upDamage | Strength Up [Neutral Servant] | checkIndvType | checkIndvType | false | 1 | 276 | np |
| addStateShort | ptOne | upDamage | Strength Up (Threat to Humanity) |  |  | false | 1 | 284 | skill |
| addStateShort | ptOther | upCommandall | Arts Up |  |  | false | 1 | 287 | skill |
| addStateShort | ptOther | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 287 | skill |
| addStateShort | ptOther | upCommandall | Buster Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 294 | np |
| addStateShort | ptAll | upDamage | STR Up vs. Divine |  |  | false | 1 | 300 | skill |
| addStateShort | self | upDamage | Strength Up (Genji) |  |  | false | 1 | 303 | skill |
| addStateShort | self | selfturnendFunction | Triggers Each Turn (NP Absorb) |  |  | false | 1 | 305 | skill |
| addStateShort | self | selfturnendFunction | Triggers Each Turn (Charge Absorb) |  |  | false | 1 | 305 | skill |
| addStateShort | self | upAtk | ATK Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 305 | passive |
| addStateShort | ptSelfAnotherFirst | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 307 | np |
| addStateShort | self | upDamage | STR Up (Machine) |  |  | false | 1 | 308 | skill |
| addStateShort | self | selfturnendFunction | Triggers Each Turn (ATK Down & Critical Hit Rate Down) |  |  | false | 1 | 309 | skill |
| addStateShort | self | selfturnendFunction | Triggers Each Turn (ATK Down & C. Star Rate Down) |  |  | false | 1 | 309 | skill |
| addStateShort | self | upDamage | Strength Up (Round Table Knight and Fae) |  |  | false | 1 | 309 | np |
| addStateShort | self | selfturnendFunction | Triggers Each Turn (Increase NP) |  |  | false | 1 | 310 | skill |
| addStateShort | ptOne | upDamage | STR Up vs. Human |  |  | false | 1 | 314 | skill |
| addStateShort | ptOne | upDamage | Strength Up [Human Attribute] |  |  | false | 1 | 314 | skill |
| addStateShort | self | delayFunction | Delayed Effect (Death) |  |  | false | 1 | 315 | skill |
| addStateShort | ptOne | buffRate | Boost NP Strength Up | UpBuffRateBuffIndiv | UpBuffRateBuffIndiv | false | 1 | 316 | skill |
| addStateShort | self | upDamage | Strength Up (Flames of Love) |  |  | false | 1 | 321 | skill |
| addStateShort | self | upDamage | Strength UP [Lawful Servants] | checkIndvType | checkIndvType | false | 1 | 323 | np |
| addStateShort | ptAll | upDamage | STR Up vs. Divine, Undead, Demon |  |  | false | 1 | 330 | np |
| addStateShort | self | upDamage | STR Up vs. Caster |  |  | false | 1 | 336 | skill |
| addStateShort | enemyAll | downDefencecommandall | Arts Card Resist Down |  |  | false | 1 | 346 | skill |
| addState | self | gutsFunction | Activate when Guts IS Triggered (NP Strength Up & Remove Debuff) |  |  | false | 1 | 350 | skill |
| addState | self | selfturnendFunction | Triggers Each Turn (NP Strength Up) |  |  | false | 1 | 350 | skill |
| addFieldChangeToField | self | toFieldChangeField | Field Change [Millennium Castle] |  |  | false | 1 | 351 | np |
| addStateShort | ptOne | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 352 | skill |
| gainNp | ptOne |  |  |  |  | false | 1 | 352 | skill |
| addStateShort | ptOtherFull | upCommandall | Arts Up |  |  | false | 1 | 372 | passive |
| gainNp | enemyAll |  |  |  |  | false | 1 | 377 | skill |
| addStateShort | self | upDamage | STR Up vs. Dragon |  |  | false | 1 | 377 | skill |
| addStateShort | self | upDamage | STR Up vs. Roman |  |  | false | 1 | 377 | skill |
| addStateShort | self | regainNp | NP Gain Each Turn |  |  | false | 1 | 377 | skill |
| addStateShort | ptOther | upAtk | ATK Up | INDIVIDUALITIE|ProgressSelfTurn | INDIVIDUALITIE|ProgressSelfTurn | false | 1 | 389 | skill |
| shortenSkill | ptOther |  |  |  |  | false | 1 | 391 | skill |
| addStateShort | self | tdTypeChangeArts | NP Change | INDIVIDUALITIE | DisplayCardBottomImageName|INDIVIDUALITIE | false | 1 | 391 | skill |
| addStateShort | self | upNpdamage | NP Strength Up [Aerial] | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 393 | passive |
| addStateShort | self | upDamage | Strength Up (Demonic Beast type Servants) |  |  | false | 1 | 396 | np |
| addStateShort | self | upDamage | STR Up (Servants with Earth Attribute) | checkIndvType | checkIndvType | false | 1 | 403 | skill |
| addStateShort | self | upCommandall | Buster Up |  | UnSubStateWhenContinue | false | 1 | 413 | np |
| gainMultiplyNp | self |  |  |  |  | false | 1 | 414 | skill |
| addStateShort | self | upDamageIndividualityActiveonly | Strength Up (Curse) |  |  | false | 1 | 420 | skill |
| addStateShort | self | upDamageIndividualityActiveonly | STR Up (Burn) |  |  | false | 1 | 420 | skill |
| addStateShort | commandTypeSelfTreasureDevice | tdTypeChangeArts | Noble Phantasm Type Change: Attack | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 421 | skill |
| addStateShort | commandTypeSelfTreasureDevice | tdTypeChangeBuster | Noble Phantasm Type Change: Defense | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 421 | skill |
| addStateShort | self | upDamage | Strength Up (Star Attribute) |  |  | false | 1 | 421 | np |
| addStateShort | self | upAtk | ATK Up | ProgressSelfTurn|checkIndvType | IndvAddBuffPassive|ProgressSelfTurn|checkIndvType | false | 1 | 421 | passive |
| addState | enemyAll | upAtk | ATK Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 422 | skill |
| shortenSkill | ptAll |  |  |  |  | false | 1 | 422 | skill |
| addState | self | overwriteBattleclass | クラス変化 |  | classIconChangeEffectId | false | 1 | 426 | skill |
| addStateShort | self | upDamage | 威力アップ〔サクラシリーズ系〕 |  |  | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Saber | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Archer | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Lancer | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Rider | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Caster | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Assassin | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | STR Up vs. Berserker | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | Strength Up (Ruler) | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | 威力アップ〔アヴェンジャー〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | 威力アップ〔ムーンキャンサー〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | 威力アップ〔アルターエゴ〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | Strength Up (Foreigner) | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addStateShort | self | upDamage | 威力アップ〔プリテンダー〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 426 | passive |
| addFieldChangeToField | self | toFieldChangeField | フィールド変化〔都市〕 |  |  | false | 1 | 428 | np |
| addFieldChangeToField | self | toFieldChangeField | フィールド変化〔暗闇〕 |  |  | false | 1 | 429 | skill |
| addStateShort | self | upDamage | 威力アップ〔中庸〕 |  |  | false | 1 | 432 | skill |
| addFieldChangeToField | self | toFieldChangeField | フィールド変化〔地獄〕 |  |  | false | 1 | 437 | skill |
| addStateShort | ptAll | upCommandall | Buster Up |  |  | false | 1 | 437 | skill |
| addStateShort | ptAll | upNpdamage | NP Strength Up |  |  | false | 1 | 437 | skill |
| addStateShort | self | upDamage | 威力アップ〔今を生きる人類〕 |  |  | false | 1 | 440 | passive |
| addStateShort | self | upDamage | 威力アップ〔蛇・竜〕 |  |  | false | 1 | 442 | skill |
| addStateShort | self | upDamage | 威力アップ〔エクストラクラス〕 |  |  | false | 1 | 444 | skill |
| addStateShort | self | tdTypeChangeBuster | 月下 | INDIVIDUALITIE | DisplayCardBottomImageName|DisplayPriority|INDIVIDUALITIE | false | 1 | 448 | skill |
| addStateShort | self | upNpdamage | NP Strength Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 448 | skill |
| addStateShort | self | upChagetd | Overcharge Lv. Up |  |  | false | 1 | 448 | skill |
| shortenSkill | self |  |  |  |  | false | 1 | 448 | skill |
| addStateShort | ptAll | upDamage | 威力アップ〔精神異常〕 |  |  | false | 1 | 451 | skill |
| addStateShort | ptFull | upDropnp | NP Gain Up | INDIVIDUALITIE_OR | INDIVIDUALITIE_OR | false | 1 | 451 | passive |
| addStateShort | ptAll | upCommandall | Quick Up |  |  | false | 1 | 456 | np |
| addStateShort | self | upNpdamage | NP Strength Up | ProgressSelfTurn | INDIVIDUALITIE_MULTI_OR|ProgressSelfTurn | false | 1 | 462 | passive |
| forceInstantDeath | self |  |  |  |  | false | 1 | 463 | np |
| addStateShort | self | tdTypeChangeArts |  | INDIVIDUALITIE | DisplayCardBottomImageName|INDIVIDUALITIE | false | 1 | 464 | skill |
| addStateShort | ptFull | upDropnp | NP Gain Up |  |  | false | 1 | 464 | passive |
| addStateShort | self | upDamage | 威力アップ〔中立〕 |  |  | false | 1 | 469 | skill |
| addState | ptOther | downDefence | DEF Down | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 49 | skill |
| addStateShort | self | upDamageIndividuality | STR Up (Burn) |  |  | false | 1 | 56 | skill |
| addStateShort | self | upDamage | STR Up vs. Male |  |  | false | 1 | 60 | skill |
| addStateShort | ptAll | upChagetd | Overcharge Lv. Up |  |  | false | 1 | 9 | skill |
| addStateShort | ptOne | upDamage | Strength Up (Heaven attribute) |  |  | false | 1 | 90 | skill |

</details>

---

## Long Tail — Engine Impact

Shapes that **could affect damage / NP gauge / cooldowns** but have no handler today.
Sorted by occurrence count. **This is the FR-5 backlog.**

### Newly handled (zero-damage NP fix)

These three damage funcTypes were silent no-ops (NP dealt **0 damage**); now
billed at the plain `Value/1000` baseline alongside `damageNpHpratioLow`
(`NP.getNpDamageValues` + `BattleEngine.useNp` dispatch). Situational Correction
bonuses are intentionally omitted (conservative under-bill, like the HP-ratio
approximation). No longer in the backlog:

| funcType | servant | note |
|---|---|---|
| `damageNpRare` | Bartholomew Roberts (257) | +Correction vs enemy rarity 1/2 — omitted |
| `damageNpBattlePointPhase` | Ereshkigal (417) | scales with accrued battle points — phase-0 baseline |
| `damageNpAndOrCheckIndividuality` | MHXX Alter (423) | +Correction if enemy has ALL of [108,1000] — omitted |

### Intentional no-ops (not worth handling for a farming-clear sim)

These remain unhandled **by design** — they cannot change whether a team
full-clears a wave (the team one-shots each wave before enemies act). Do not
re-litigate without a concrete farming scenario that needs them:

- `pierceDefence` / **Ignore DEF** — `Enemy.defense` is never positive in this
  sim (starts 0, only DEF Down makes it negative), so ignoring it is a literal
  no-op.
- `delayNpturn`, enemy `subState`, `absorbNpturn` — enemy NP timing / enemy
  buff stripping; irrelevant when enemies die before acting (and enemy buffs are
  trimmed from quest data anyway).
- Defensive servant buffs — **Debuff Resist Up**, **Buff Removal Resist Up**,
  **Damage Cut**, **Death Resist Up**, **Guts** — survivability only.

### Unhandled funcType (no entry in EFFECT_HANDLERS)

These funcTypes are completely absent from the dispatch table — every occurrence
is a silent no-op.

| funcType | funcTargetType | buff.type | buff.name | script keys | oScript keys | condTarget | count | top-5 servants | sources |
|---|---|---|---|---|---|---|---|---|---|
| subState | self |  |  |  |  | false | 61 | 10, 110, 116, 119, 120 | skill,np |
| subState | enemyAll |  |  |  |  | false | 48 | 1, 167, 18, 19, 205 | np,skill |
| subState | enemy |  |  |  |  | false | 47 | 116, 122, 143, 153, 158 | np,skill |
| delayNpturn | enemy |  |  |  |  | false | 41 | 107, 109, 124, 129, 15 | skill,np |
| subState | ptAll |  |  |  |  | false | 30 | 122, 192, 249, 271, 282 | skill,np |
| delayNpturn | enemyAll |  |  |  |  | false | 28 | 132, 167, 220, 227, 229 | np,skill |
| subState | ptOne |  |  |  |  | false | 11 | 116, 166, 181, 232, 254 | skill |
| delayNpturn | self |  |  |  |  | false | 10 | 129, 138, 183, 347, 424 | skill |
| lossStar | self |  |  |  |  | false | 7 | 156, 199, 242, 373, 428 | skill |
| damageNpHpratioLow | enemy |  |  |  |  | false | 6 | 131, 161, 248, 66 | np |
| cardReset | self |  |  |  |  | false | 6 | 265, 418, 424, 425, 444 | skill |
| moveState | self |  |  |  |  | false | 4 | 295, 335, 353 | skill |
| delayNpturn | enemy |  |  |  |  | false | 3 | 101, 224, 93 | np,skill |
| gainNpBuffIndividualSum | self |  |  |  |  | false | 3 | 238, 295, 353 | skill |
| gainHpFromTargets | self |  |  |  |  | false | 3 | 263, 311 | skill |
| gainNpIndividualSum | self |  |  |  |  | false | 3 | 423, 457, 61 | skill |
| gainNpTargetSum | self |  |  |  |  | false | 3 | 426, 434, 449 | skill |
| gainNpFromTargets | self |  |  |  |  | false | 2 | 266, 275 | skill |
| absorbNpturn | self |  |  |  |  | false | 2 | 266, 275 | skill |
| damageNpBattlePointPhase | enemyAll |  |  |  |  | false | 2 | 417 | np |
| addBattlePoint | self |  |  |  |  | false | 2 | 417 | passive |
| addStateShortToField | noTarget | upAtk | フィールド効果〔攻撃力アップ〕 | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 464 | np |
| gainHpPer | self |  |  |  |  | false | 2 | 81 | np |
| fixCommandcard | self |  |  |  |  | false | 1 | 220 | skill |
| subState | enemyAll |  |  |  |  | false | 1 | 250 | np |
| damageNpRare | enemyAll |  |  |  |  | false | 1 | 257 | np |
| subState | ptOne |  |  |  |  | false | 1 | 315 | skill |
| gainNpBuffIndividualSum | ptAll |  |  |  |  | false | 1 | 388 | skill |
| extendBuffturn | ptAll |  |  |  |  | false | 1 | 392 | skill |
| extendBuffturn | enemyAll |  |  |  |  | false | 1 | 392 | skill |
| shortenBuffcount | self |  |  |  |  | false | 1 | 415 | skill |
| damageNpAndOrCheckIndividuality | enemy |  |  |  |  | false | 1 | 423 | np |
| subState | ptOther |  |  |  |  | false | 1 | 452 | skill |
| subState | ptAll |  |  |  |  | false | 1 | 456 | np |
| lossHpPerSafe | self |  |  |  |  | false | 1 | 458 | skill |
| delayNpturn | ptOne |  |  |  |  | false | 1 | 91 | skill |


### Known funcType (addState/addStateShort) but unhandled buff type/name

The buff is stored, but `processServantBuffs` / `processEnemyBuffs` never reads
it. The engine currently sees these as if they were never applied.

| funcType | funcTargetType | buff.type | buff.name | script keys | oScript keys | condTarget | count | top-5 servants | sources |
|---|---|---|---|---|---|---|---|---|---|
| addState | self | upTolerance | Debuff Resist Up |  |  | false | 357 | 1, 10, 101, 102, 108 | passive,skill |
| addStateShort | self | addDamage | Damage Plus |  |  | false | 136 | 101, 108, 111, 112, 113 | passive,skill |
| addState | self | upTolerance | Mental Resist Up |  |  | false | 36 | 126, 148, 167, 186, 239 | skill,passive |
| addState | self | subSelfdamage | Damage Cut |  |  | false | 32 | 113, 153, 157, 164, 177 | skill,passive |
| addState | self | upToleranceSubstate | Buff Removal Resist Up |  |  | false | 31 | 196, 198, 228, 230, 238 | skill,passive |
| addState | self | upDamagedropnp | NP Gain Up When Damaged |  |  | false | 29 | 106, 107, 147, 158, 162 | passive,skill |
| addState | ptAll | subSelfdamage | Damage Cut |  |  | false | 21 | 1, 215, 224, 227, 237 | skill,np |
| addState | self | upResistInstantdeath | Death Resist Up |  |  | false | 20 | 167, 239, 285, 303, 314 | passive,skill |
| addStateShort | self | pierceDefence | Ignore DEF |  |  | false | 19 | 1, 156, 171, 200, 212 | skill,np |
| addState | self | gutsFunction | Activate when Guts Is Triggered |  |  | false | 16 | 325, 369, 406, 410, 427 | skill,passive |
| addStateShort | self | upGrantInstantdeath | Death Chance Up |  |  | false | 13 | 120, 124, 259, 283, 297 | skill,passive,np |
| addState | self | damageFunction | Activate when Damaged |  |  | false | 12 | 1, 140, 356, 369, 398 | skill |
| addState | self | upGainHp | HP Recovery Up | ProgressSelfTurn | ProgressSelfTurn | false | 11 | 128, 155, 167, 175, 182 | skill,passive |
| addStateShort | self | attackAfterFunction | Bonus Effect when Attacking |  |  | false | 10 | 134, 273, 379, 409, 427 | skill |
| addStateShort | self | attackAfterFunction | Buster Attack Bonus Effect |  |  | false | 10 | 3, 337, 381, 418, 433 | skill |
| addState | ptAll | upToleranceSubstate | Buff Removal Resist Up |  |  | false | 9 | 10, 199, 234, 237, 296 | skill,np |
| addState | ptAll | upTolerance | Debuff Resist Up |  |  | false | 9 | 104, 126, 211, 439, 450 | np,skill |
| addState | self | upTolerance | ATK Debuff Resist Up |  |  | false | 9 | 115, 22, 51, 53, 8 | skill |
| addState | enemyAll | selfturnendFunction | Terror |  |  | false | 9 | 195, 270, 289, 295, 297 | skill,np |
| addStateShort | self | attackBeforeFunction | Pre-Quick ATK Damage Bonus Effect |  |  | false | 9 | 362, 365, 381, 388, 403 | skill |
| addState | enemyAll | selfturnendFunction | Confusion |  |  | false | 8 | 117, 206, 297, 319, 410 | np,skill |
| addState | enemyAll | upFuncHpReduce | Spreading Fire |  |  | false | 8 | 290, 334, 369, 441, 462 | np,skill |
| addState | enemyAll | upFuncHpReduce | Disastrous Curse |  |  | false | 8 | 297, 324, 334, 364, 369 | np,skill |
| addState | enemy | upFuncHpReduce | Disastrous Curse |  |  | false | 7 | 185, 260, 311, 427 | np |
| addStateShort | self | attackBeforeFunction | Pre-ATK Damage Bonus Effect |  |  | false | 6 | 109, 190, 191, 199, 432 | skill,np |
| addState | ptOne | upToleranceSubstate | Buff Removal Resist Up |  |  | false | 6 | 271, 338, 352, 463, 466 | skill |
| addStateShort | self | attackAfterFunction | Quick Attack Bonus Effect |  |  | false | 6 | 295, 384, 408, 435 | skill |
| addStateShort | self | upCommandall | Extra Attack Up |  |  | false | 6 | 411, 412, 431, 436, 443 | passive,skill,np |
| addStateShort | self | attackAfterFunction | Bonus Effect with Arts |  |  | false | 5 | 124, 337, 349, 418 | skill |
| addState | enemy | upFuncHpReduce | Spreading Fire |  |  | false | 5 | 138, 184 | np |
| addStateShort | self | commandattackAfterFunction | Bonus Effect (Debuff) |  |  | false | 5 | 154, 164, 185, 218, 219 | passive,skill |
| addStateShort | enemy | downDefence | NiceShot! |  |  | false | 5 | 221 | np |
| addState | self | addIndividuality |  | INDIVIDUALITIE | INDIVIDUALITIE | false | 5 | 296, 401, 415 | passive |
| addState | enemyAll | upFuncHpReduce | Corroding Poison |  |  | false | 4 | 112, 334, 433, 462 | np,skill |
| addState | self | fieldIndividuality | Field Set [Sunlight] |  |  | false | 4 | 118, 123, 348, 354 | np,skill |
| addState | ptOne | subSelfdamage | Damage Cut |  |  | false | 4 | 133, 245, 465, 466 | skill |
| addStateShort | enemyAll | upNonresistInstantdeath | Death Resist Down |  |  | false | 4 | 154, 91 | skill |
| addState | self | fieldIndividuality | Field Set [Near Water] |  |  | false | 4 | 266, 348, 372, 416 | skill |
| addStateShort | self | upDropnp | NP Gain Up: Near Water |  |  | false | 4 | 288, 372, 416 | skill,np |
| addState | self | deadFunction | Activate on Defeat |  |  | false | 4 | 427, 464 | skill,passive |
| addState | ptFull | addIndividuality |  |  |  | false | 3 | 112, 225, 392 | passive |
| addStateShort | enemy | addSelfdamage | Damage Up |  |  | false | 3 | 121, 312 | np |
| addState | enemy | upFuncHpReduce | Corroding Poison |  |  | false | 3 | 124, 378, 433 | skill,np |
| addState | ptAll | upGainHp | HP Recovery Up | ProgressSelfTurn | ProgressSelfTurn | false | 3 | 141, 249 | np,skill |
| addState | self | upTolerance | Charm Resist Up |  |  | false | 3 | 154, 276, 323 | passive |
| addState | self | fieldIndividuality | Field Set [Burning] |  |  | false | 3 | 178, 250, 348 | np,skill |
| addState | enemyAll | upTolerance | Decrease Buff Success Rate when receiving a Buff |  |  | false | 3 | 18, 370, 467 | np,skill |
| addStateShort | self | regainNp | NP Gain each Turn (Near Water) | INDIVIDUALITIE | INDIVIDUALITIE | false | 3 | 216, 406, 416 | passive |
| addState | self | selfturnendFunction | Infinite Growth |  |  | false | 3 | 238 | skill |
| addState | ptOne | upTolerance | Debuff Resist Up |  |  | false | 3 | 241, 249 | skill |
| addState | enemyAll | addIndividuality | Apply Trait [Evil] |  |  | false | 3 | 346, 370 | np,skill |
| addStateShort | self | commandattackAfterFunction | Bonus Effect with Normal Attack |  |  | false | 3 | 378, 393, 410 | skill |
| addState | self | selfturnendFunction | Triggers each Turn |  |  | false | 3 | 385, 395 | skill |
| addState | self | addIndividuality | Magic Bullets | ProgressSelfTurn | ProgressSelfTurn | false | 3 | 413 | skill |
| addStateShort | self | selfturnendFunction | Triggers each Turn |  |  | false | 3 | 413, 464 | skill |
| addStateShort | self | attackAfterFunctionMainOnly | Bonus Effect with Arts |  |  | false | 3 | 435, 452 | skill |
| addState | self | addIndividuality |  | INDIVIDUALITIE_AND | INDIVIDUALITIE_AND|individualityCondTargetType | false | 3 | 452 | skill |
| addState | self | delayFunction | Delayed Effect (The End of the Fourth Night) |  |  | false | 2 | 107 | skill |
| addStateShort | ptAll | pierceDefence | Ignore DEF |  |  | false | 2 | 108, 173 | skill,np |
| addState | self | upGivegainHp | Healing Up | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 111 | skill |
| addState | self | delayFunction | Stun After 1 Turn |  |  | false | 2 | 128, 182 | skill |
| addStateShort | self | upDamageIndividuality | 威力アップ〔行動不能〕 |  |  | false | 2 | 147, 23 | skill |
| addState | self | fieldIndividuality | Field Set [Forest] |  |  | false | 2 | 148, 348 | skill |
| addStateShort | self | multiattack | Hit Count Up |  |  | false | 2 | 153 | skill |
| addState | ptOther | addIndividuality | Apply Trait [Evil] |  |  | false | 2 | 156, 324 | skill |
| addStateShort | enemy | upNonresistInstantdeath | Death Resist Down |  |  | false | 2 | 158, 92 | skill |
| addStateShort | self | commandattackAfterFunction | Bonus Effect with Extra Attack |  |  | false | 2 | 166, 220 | skill |
| addStateShort | self | commandattackAfterFunction | Pseudonym "Iseidako" |  |  | false | 2 | 198 | skill |
| addState | self | overwriteClassRelation | Class Affinity Change | relationId | relationId|relationOverwrite | false | 2 | 199, 418 | skill,passive |
| addState | self | selfturnendFunction | Protection of Sakatsuki |  |  | false | 2 | 236 | np |
| addStateShort | self | selfturnendFunction | Protection of Sakatsuki |  |  | false | 2 | 236 | np |
| addState | self | overwriteClassRelation | Class Affinity Change | relationId | defPriority|relationId|relationOverwrite | false | 2 | 239, 335 | skill |
| addState | ptAll | overwriteClassRelation | Change DEF Affinity | relationId | relationId|relationOverwrite | false | 2 | 241 | np |
| addStateShort | self | attackAfterFunction | Activate when Attacking (ATK Up & DEF Down) |  |  | false | 2 | 251 | skill |
| addState | self | deadFunction | Activate on Defeat (Oni Musashi's Last Will and Testament) |  |  | false | 2 | 251 | skill |
| addState | self | delayFunction | Dance of the Seven Veils |  |  | false | 2 | 260 | skill |
| addState | enemy | delayFunction | Calling Card |  |  | false | 2 | 263 | skill |
| addState | self | downDefence | DEF Down (Treated as Buff) |  |  | false | 2 | 267 | skill |
| addState | self | upNonresistInstantdeath | Death Resist Down |  |  | false | 2 | 267 | passive |
| addState | self | damageFunction | Living Flame |  |  | false | 2 | 275 | skill |
| addStateShort | self | commandattackBeforeFunction | Pre-ATK Damage Bonus Effect (ATK Up + ATK Down) |  |  | false | 2 | 279 | skill |
| addState | enemyAll | addIndividuality | Apply Trait (Roman) |  |  | false | 2 | 280 | skill,np |
| addStateShort | ptOne | selfturnendFunction | Morning Lark |  |  | false | 2 | 316 | skill |
| addStateShort | self | commandattackBeforeFunction | Pre-ATK Damage Bonus Effect |  |  | false | 2 | 324, 417 | skill |
| addState | ptAll | subSelfdamage | Damage Cut |  |  | false | 2 | 342 | np |
| addState | self | damageFunction | Activate when damaged (Buff) |  |  | false | 2 | 343 | skill |
| addStateShort | self | commandattackAfterFunction | Bonus Effect with Critical ATK |  |  | false | 2 | 343, 96 | skill |
| addState | self | buffConvert | Apply Anti-Enforcement DEF | convert | convert | false | 2 | 373, 413 | passive |
| addState | ptAll | addIndividuality |  |  |  | false | 2 | 391, 9 | skill |
| addState | self | addIndividuality | Blood-Soaked Prince |  |  | false | 2 | 402 | skill |
| addState | ptFull | deadFunction |  |  |  | false | 2 | 402 | skill |
| addState | self | addIndividuality |  |  |  | false | 2 | 421, 463 | passive,np |
| addState | ptFull | subSelfdamage | Damage Cut |  |  | false | 2 | 422, 465 | passive |
| addStateShort | self | commandattackAfterFunctionMainOnly | Normal Quick Attack Bonus Effect |  |  | false | 2 | 424, 425 | skill |
| addStateShort | self | commandattackAfterFunctionMainOnly | Additional Effect with Normal Arts Attack |  |  | false | 2 | 424, 425 | skill |
| addStateShort | self | commandattackBeforeFunctionMainOnly | Pre-Buster Damage Bonus Effect |  |  | false | 2 | 424, 425 | skill |
| addStateShort | self | overwriteSvtCardType | Extra Attack全体攻撃化 |  |  | false | 2 | 431, 444 | skill,passive |
| addStateShort | enemy | downDefenceCriticaldamage | クリティカル威力耐性ダウン |  |  | false | 2 | 440, 68 | skill,np |
| addStateShort | ptAll | upCommandall | Extra Attack Up |  |  | false | 2 | 444 | skill |
| addState | self | subSelfdamage |  |  |  | false | 2 | 460 | passive |
| addState | self | upTolerance | ATK Buff Chance Down |  |  | false | 2 | 49, 72 | skill |
| addState | ptOne | upGainHp | HP Recovery Up | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 67 | skill |
| addState | self | delayFunction | Delayed Effect (Fire Support) |  |  | false | 2 | 86 | skill |
| addState | self | delayFunction | Delayed Effect (Annihilation Wish) |  |  | false | 1 | 107 | skill |
| addState | self | delayFunction | Mana Burst Set |  |  | false | 1 | 142 | skill |
| addState | self | delayFunction | 絶対豪運宝石圏準備 |  |  | false | 1 | 142 | skill |
| addStateShort | self | upCommandall | Death's Abyss | INDIVIDUALITIE|ProgressSelfTurn | INDIVIDUALITIE|ProgressSelfTurn | false | 1 | 154 | skill |
| addState | self | gutsFunction | Activate when Guts is Triggered (Remove Death's Abyss & NP Gauge Up & Buster Up) |  |  | false | 1 | 154 | skill |
| addState | self | upTolerance | Poison Resist Up |  |  | false | 1 | 16 | skill |
| addState | self | overwriteClassRelation | Nega-Saver | relationId | relationId|relationOverwrite | false | 1 | 167 | passive |
| addState | self | overwriteClassRelation | Change DEF Affinity | relationId | relationId|relationOverwrite | false | 1 | 175 | skill |
| addStateShort | enemy | delayFunction | Electrical Charge |  |  | false | 1 | 176 | np |
| addState | ptOne | delayFunction | Build Up |  |  | false | 1 | 179 | skill |
| addState | ptAll | addIndividuality | Blessing of Kur |  |  | false | 1 | 196 | skill |
| addState | self | delayFunction | Altera Timer |  |  | false | 1 | 197 | skill |
| addState | self | deadFunction | Activate on Defeat (Tranquil Fig) |  |  | false | 1 | 203 | skill |
| addState | self | gutsFunction | Activate when Guts is Triggered (ATK Up) |  |  | false | 1 | 21 | skill |
| addState | self | selfturnendFunction | Schwarzwald Falke |  |  | false | 1 | 219 | skill |
| addStateShort | self | commandattackAfterFunction | Activate during Attack (DEF Down) |  |  | false | 1 | 228 | np |
| addStateShort | self | commandattackAfterFunction | Activate during Critical Attack (Remove Buff) |  |  | false | 1 | 228 | np |
| addState | self | damageFunction | Activate when Damaged (Decrease Critical Strength) |  |  | false | 1 | 228 | np |
| addState | self | damageFunction | Activate when Critically Damaged (HP Recovery) |  |  | false | 1 | 228 | np |
| addState | enemy | addIndividuality | Apply Trait [Dragon] |  |  | false | 1 | 24 | np |
| addStateShort | self | upCommandall | Card Effectiveness Up |  |  | false | 1 | 240 | np |
| addState | enemyAll | addIndividuality | Marking | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 246 | skill |
| addState | enemyAll | selfturnendFunction | Evade Trap | INDIVIDUALITIE | ExcludeUnSubStateIndiv|INDIVIDUALITIE | false | 1 | 246 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with Buster (DEF Down) |  |  | false | 1 | 248 | skill |
| addState | self | upTolerance | Buff Chance Down (Treated as Buff) |  |  | false | 1 | 251 | skill |
| addState | enemy | addIndividuality | Weakness Detected |  |  | false | 1 | 255 | skill |
| addState | self | damageFunction | Activate when Damaged (ATK Up) |  |  | false | 1 | 256 | skill |
| addState | self | selfturnendFunction | Salacious Dance |  |  | false | 1 | 260 | skill |
| addStateShort | self | multiattack | Hit Count Up: Arts | checkIndvType | checkIndvType | false | 1 | 261 | skill |
| addStateShort | enemy | downDefence | DEF Down (Critical) |  |  | false | 1 | 263 | skill |
| addState | self | delayFunction | Royal Bunny Jump |  |  | false | 1 | 265 | skill |
| addState | self | upFuncHpReduce | Corroding Poison |  |  | false | 1 | 272 | passive |
| addStateShort | self | attackAfterFunction | Bonus Effect when Attacking (Remove DEF Buff + Death) |  |  | false | 1 | 273 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with Quick Attack (NP Gain) |  |  | false | 1 | 278 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with Arts Attack (C. Star Gain) |  |  | false | 1 | 278 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with Arts ATK (Critical Hit Rate Up) |  |  | false | 1 | 278 | skill |
| addStateShort | self | commandattackAfterFunction | Bonus Effect with Critical ATK (Apply Roman Trait) |  |  | false | 1 | 280 | skill |
| addState | ptAll | addIndividuality | Apply Trait (Roman) |  |  | false | 1 | 280 | np |
| addState | self | upTolerance | Debuff Resist Up | checkIndvType | checkIndvType | false | 1 | 283 | passive |
| addState | self | selfturnendFunction | Mermaid's Nourishment |  |  | false | 1 | 285 | skill |
| addStateShort | self | upDropnp | NP Gain Up: Sunlight |  |  | false | 1 | 288 | skill |
| addStateShort | enemy | downDefence | DEF Down (Sleep) | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 289 | skill |
| addState | self | delayFunction | Staying Up Late |  |  | false | 1 | 290 | skill |
| addState | enemy | selfturnendFunction | Confusion |  |  | false | 1 | 294 | skill |
| addState | self | deadFunction | Activate on Defeat (Adabana of War) |  |  | false | 1 | 294 | skill |
| addState | self | gutsFunction | Activate when Guts is Triggered (NP Gain) |  |  | false | 1 | 296 | skill |
| addStateShort | self | commandattackAfterFunction | Flame |  |  | false | 1 | 302 | skill |
| addState | self | gutsFunction | Activate when Guts Is Triggered (Grudge of Vengeance) |  |  | false | 1 | 303 | skill |
| addState | self | upDefencecommandall | Buster Card Resist |  |  | false | 1 | 305 | passive |
| addStateShort | self | commandattackAfterFunction | Bonus Effect with Normal Buster Attack |  |  | false | 1 | 306 | skill |
| addStateShort | self | commandattackAfterFunction | Strong Eater |  |  | false | 1 | 310 | skill |
| addStateShort | ptOne | commandattackAfterFunctionMainOnly | Bonus Effect with Normal Buster Attack |  |  | false | 1 | 314 | skill |
| addState | ptOne | selfturnendFunction | Ending of Dreams |  |  | false | 1 | 316 | skill |
| addStateShort | self | commandattackAfterFunction | Bonus Effect when Attacking (Apply Flames of Love) |  |  | false | 1 | 321 | skill |
| addState | self | selfturnstartFunction | 呪い滲出 |  |  | false | 1 | 324 | skill |
| addStateShort | self | commandattackAfterFunction | Activate during Critical Attack (DEF Down) |  |  | false | 1 | 327 | skill |
| addStateShort | ptOne | commandattackAfterFunctionMainOnly | Bonus Effect with Buster (C. Star Gain) |  |  | false | 1 | 334 | skill |
| addStateShort | ptOne | commandattackAfterFunctionMainOnly | Bonus Effect with Buster (Critical Hit Rate Up) |  |  | false | 1 | 334 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with ATK (Poison & Curse & Burn) |  |  | false | 1 | 334 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect (Debuff) |  |  | false | 1 | 334 | passive |
| addState | self | counterFunction | Fragarach Counter | CounterMessage|checkIndvType | CounterMessage|checkIndvType | false | 1 | 336 | np |
| addState | enemyAll | deadFunction | Taisui's Calamity |  |  | false | 1 | 338 | np |
| addStateShort | self | attackAfterFunction | Bonus Effect when Attacking (Buff) |  |  | false | 1 | 339 | passive |
| addState | self | damageFunction | Activate when damaged (Buff) |  |  | false | 1 | 339 | passive |
| addState | self | deadFunction | Activate on Defeat (Demise Privilege) |  |  | false | 1 | 342 | skill |
| addState | ptAll | upToleranceSubstate | Buff Removal Resist Up |  |  | false | 1 | 351 | skill |
| addState | enemyAll | addIndividuality |  |  |  | false | 1 | 353 | skill |
| addStateShort | self | commandattackAfterFunction | Bonus Effect with Normal Attack (Burn) |  |  | false | 1 | 354 | skill |
| addState | enemyAll | addIndividuality | Apply Trait (Undead) |  |  | false | 1 | 358 | np |
| addStateShort | self | upDropnp | NP Gain Up: Quick |  |  | false | 1 | 362 | passive |
| addState | self | addIndividuality | Apply Trait (Wild Beast) |  |  | false | 1 | 364 | passive |
| addStateShort | self | attackBeforeFunction | Pre-Buster ATK Damage Bonus Effect |  |  | false | 1 | 365 | skill |
| addState | self | addIndividuality | Governing Prince Wucheng |  |  | false | 1 | 366 | skill |
| addState | ptOther | addIndividuality | Mount Liang |  |  | false | 1 | 367 | skill |
| addStateShort | ptAll | addDamage | Damage Plus |  |  | false | 1 | 37 | skill |
| addState | ptAll | addIndividuality | Apply Trait (Good) |  |  | false | 1 | 370 | skill |
| addState | self | addIndividuality | Holy Grail Possession |  |  | false | 1 | 377 | skill |
| addStateShort | self | pierceDefence | Ignore DEF |  |  | false | 1 | 377 | skill |
| addState | self | upGainHp | HP Recovery Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 377 | skill |
| addState | self | delayFunction | Sacrifice for the World Tree |  |  | false | 1 | 38 | skill |
| addStateShort | self | commandattackAfterFunction | Normal Quick Attack Bonus Effect |  |  | false | 1 | 380 | skill |
| addStateShort | self | commandattackBeforeFunction | Pre-Critical Attack Damage Bonus Effect |  |  | false | 1 | 387 | skill |
| addStateShort | ptAll | attackAfterFunction | Bonus Effect when Attacking |  |  | false | 1 | 388 | skill |
| addStateShort | ptAll | attackAfterFunctionMainOnly | Bonus Effect when Attacking |  |  | false | 1 | 388 | skill |
| addStateShort | self | delayFunction | Preparing Replacement |  |  | false | 1 | 388 | skill |
| addStateShort | self | attackAfterFunction | Bonus Effect with Quick Attack (Quick Resist Down) |  |  | false | 1 | 39 | skill |
| addState | ptOther | subSelfdamage | Damage Cut |  |  | false | 1 | 390 | skill |
| addStateShort | self | commandattackAfterFunction | Protecting the Weak |  |  | false | 1 | 391 | skill |
| addState | self | addIndividuality | Apply Trait (Super Giant) |  |  | false | 1 | 391 | skill |
| addStateShort | self | regainNp | NP Gain Per Turn (Burning) | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 391 | passive |
| addState | ptFull | damageFunction | Activate when damaged (Buff) | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 392 | passive |
| addState | ptOther | damageFunction | Activate when Damaged |  |  | false | 1 | 393 | skill |
| addStateShort | self | upCommandall | Extra Attack Up |  | UnSubStateWhenContinue | false | 1 | 413 | np |
| addStateShort | self | commandattackBeforeFunction |  | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 1 | 413 | passive |
| addStateShort | self | commandattackBeforeFunction |  | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 413 | passive |
| addStateShort | self | commandattackAfterFunction |  |  |  | false | 1 | 413 | passive |
| addStateShort | self | attackBeforeFunction |  | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 413 | passive |
| addStateShort | self | attackAfterFunction |  |  |  | false | 1 | 413 | passive |
| addState | self | delayFunction | Delayed Effect (Turn to Quick) |  |  | false | 1 | 414 | skill |
| addState | self | delayFunction | Delayed Effect (Turn to Arts) |  |  | false | 1 | 414 | skill |
| addState | self | delayFunction | Delayed Effect (Turn to Buster) |  |  | false | 1 | 414 | skill |
| addState | self | subSelfdamage | Damage Cut | checkIndvType | checkIndvType | false | 1 | 415 | passive |
| addState | self | gutsFunction |  |  |  | false | 1 | 415 | passive |
| addState | self | addIndividuality | Robin Counter |  | DisplayPriority | false | 1 | 415 | passive |
| addStateShort | self | commandattackBeforeFunction | Pre-Quick Damage Bonus Effect |  |  | false | 1 | 416 | skill |
| addStateShort | self | commandattackBeforeFunction | Pre-Buster Damage Bonus Effect |  |  | false | 1 | 416 | skill |
| addState | ptAll | upResistInstantdeath | Death Resist Up |  |  | false | 1 | 417 | skill |
| addStateShort | self | commandattackAfterFunction | Spatial Storage |  |  | false | 1 | 417 | passive |
| addStateShort | self | treasureDeviceBeforeFunction |  |  |  | false | 1 | 417 | passive |
| addStateShort | self | attackAfterFunction | Bonus Effect with Quick Attack (DEF Down) |  |  | false | 1 | 42 | skill |
| addStateShort | ptOther | addIndividuality | Preservation Target |  |  | false | 1 | 421 | skill |
| addState | enemyAll | addIndividuality | Non-Preservation Target |  |  | false | 1 | 421 | skill |
| addState | self | selfturnstartFunction | ピクシー・フィンガー |  |  | false | 1 | 426 | skill |
| addStateShort | enemyAll | downDefencecommandall | Critical Attack Resist Down |  |  | false | 1 | 426 | skill |
| addStateShort | self | upGrantInstantdeath | 即死付与率アップ〔人間〕 |  |  | false | 1 | 43 | skill |
| addStateShort | self | attackBeforeFunctionMainOnly | Pre-Buster ATK Damage Bonus Effect |  |  | false | 1 | 435 | skill |
| addState | enemyAll | selfturnendFunction | Triggers each Turn |  |  | false | 1 | 435 | np |
| addStateShort | self | attackAfterFunction | Bonus Effect when Attacking | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 437 | skill |
| addState | self | upDefenceNpdamage | 宝具威力耐性アップ〔サーヴァント〕 |  |  | false | 1 | 439 | passive |
| addState | enemy | addIndividuality | Apply Trait [Chaotic] |  |  | false | 1 | 440 | np |
| addState | enemy | addIndividuality | Apply Trait [Evil] |  |  | false | 1 | 440 | np |
| addStateShort | self | attackAfterFunction | Arts・Buster攻撃時追加効果 |  |  | false | 1 | 442 | skill |
| addStateShort | self | upCommandall | Quickアップ〔月下〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 448 | passive |
| addStateShort | self | upCommandall | Artsアップ〔月下〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 448 | passive |
| addStateShort | self | upCommandall | Busterアップ〔月下〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 448 | passive |
| addState | fieldOther | addIndividuality | 特性付与〔イリヤ〕 |  |  | false | 1 | 449 | skill |
| addStateShort | self | commandattackBeforeFunction |  |  |  | false | 1 | 449 | passive |
| addStateShort | enemyAll | downDefence | 防御力ダウン〔魅了〕 | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 45 | skill |
| addStateShort | enemyAll | downDefenceCriticaldamage | クリティカル威力耐性ダウン |  |  | false | 1 | 451 | np |
| addState | self | upCriticalRateDamageTaken | Decrease Critical Resistance |  |  | false | 1 | 451 | passive |
| addState | self | upCriticalStarDamageTaken | Decrease C. Star Drop Resistance |  |  | false | 1 | 451 | passive |
| addStateShort | self | upCommandall | Artsアップ〔動物がいる間〕 | INDIVIDUALITIE_OR | INDIVIDUALITIE_OR|individualityCondTargetType | false | 1 | 452 | skill |
| addState | self | addIndividuality | 納刀体勢 |  |  | false | 1 | 453 | skill |
| addStateShort | enemyAll | downDefenceCriticaldamage | クリティカル威力耐性ダウン |  |  | false | 1 | 453 | skill |
| addState | ptAll | addIndividuality | 特性付与〔新選組〕 |  |  | false | 1 | 456 | skill |
| addState | ptAll | addIndividuality | 特性付与〔エリザベート〕 |  |  | false | 1 | 457 | skill |
| addStateShort | self | selfturnendFunction | 自焼 |  |  | false | 1 | 458 | skill |
| addStateShort | self | treasureDevicePostAfterFunction | 宝具使用時NP還元 |  |  | false | 1 | 459 | skill |
| addStateShort | self | treasureDevicePostAfterFunction | 宝具使用時チャージ還元 | checkIndvType | checkIndvType | false | 1 | 459 | skill |
| addState | self | subSelfdamage | 結界作成 |  |  | false | 1 | 460 | passive |
| addState | self | delayFunction | エニス・グイトリン |  |  | false | 1 | 461 | skill |
| addStateShort | ptAll | commandattackAfterFunctionMainOnly | Bonus Effect with Normal Attack |  |  | false | 1 | 462 | skill |
| addState | enemyAll | attackAfterFunctionMainOnly | Bonus Effect when Attacking |  |  | false | 1 | 462 | skill |
| addState | ptOtherFull | upTolerance | Debuff Resist Up |  |  | false | 1 | 463 | passive |
| addStateShort | ptAll | commandattackAfterFunctionMainOnly | Normal Quick Attack Bonus Effect |  |  | false | 1 | 464 | skill |
| addStateShort | self | delayFunction | 冥界の花園 |  |  | false | 1 | 464 | skill |
| addStateShort | ptAll | commandattackAfterFunctionMainOnly | Bonus Effect with Critical ATK |  |  | false | 1 | 464 | np |
| addState | ptFull | upGainHp | HP Recovery Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 464 | passive |
| addStateShort | enemyAll | downDefenceNpdamage | 宝具威力耐性ダウン |  |  | false | 1 | 467 | np |
| addStateShort | self | attackBeforeFunctionMainOnly | Pre-ATK Damage Bonus Effect |  |  | false | 1 | 469 | skill |
| addState | self | gutsFunction | Activate when Guts is Triggered (Buster Up) |  |  | false | 1 | 47 | skill |
| addState | enemyAll | addIndividuality |  |  |  | false | 1 | 61 | skill |
| addState | self | fieldIndividuality | フィールドセット〔ハロウィン〕 |  |  | false | 1 | 61 | np |
| addStateShort | self | commandattackBeforeFunction | Pre-ATK Damage Bonus Effect (ATK Up) |  |  | false | 1 | 68 | skill |


---

## Cosmetic / Story / Cutscene

funcTypes or buff types that never affect damage simulation. Listed for completeness.

<details><summary>Expand (353 shapes)</summary>

| funcType | funcTargetType | buff.type | buff.name | script keys | oScript keys | condTarget | count | top-5 servants | sources |
|---|---|---|---|---|---|---|---|---|---|
| addStateShort | self | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 547 | 1, 100, 101, 102, 103 | skill,np,passive |
| hastenNpturn | self |  |  |  |  | false | 450 | 1, 100, 101, 103, 105 | skill,np,passive |
| addStateShort | self | upCriticaldamage | Critical Strength Up |  |  | false | 413 | 1, 101, 102, 105, 106 | skill,passive,np |
| gainStar | self |  |  |  |  | false | 238 | 1, 101, 102, 105, 106 | skill,np |
| hastenNpturn | ptAll |  |  |  |  | false | 135 | 1, 100, 103, 113, 118 | skill,np |
| addStateShort | self | regainStar | Gain C. Stars Each Turn |  |  | false | 127 | 100, 103, 121, 130, 140 | skill,np,passive |
| none | self |  |  |  |  | false | 124 | 1, 114, 132, 136, 138 | np,passive |
| addState | self | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 119 | 108, 109, 11, 110, 112 | skill,passive,np |
| addState | self | avoidance | Evade | ProgressSelfTurn | ProgressSelfTurn | false | 116 | 10, 102, 105, 11, 110 | skill,np |
| addStateShort | self | upStarweight | C. Star Gather Up |  |  | false | 112 | 101, 102, 105, 106, 114 | skill,np,passive |
| addState | self | guts | Guts | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 101 | 101, 107, 112, 120, 123 | skill,np |
| addState | self | upDefence | DEF Up |  |  | false | 98 | 10, 103, 11, 116, 118 | skill,np |
| addState | self | upHate | Target Focus Up |  |  | false | 84 | 1, 10, 113, 133, 140 | skill,np |
| addState | self | invincible | Invincible |  |  | false | 81 | 1, 106, 111, 128, 130 | skill,np |
| gainHp | self |  |  |  |  | false | 79 | 10, 101, 107, 110, 115 | skill,np |
| addStateShort | self | upGrantstate | Debuff Chance Up |  |  | false | 74 | 100, 103, 104, 120, 124 | passive,skill |
| addStateShort | ptAll | upCriticaldamage | Critical Strength Up |  |  | false | 71 | 108, 130, 142, 145, 150 | skill,np |
| addStateShort | self | pierceInvincible | Ignore Invincible |  |  | false | 70 | 1, 102, 109, 119, 127 | skill,np |
| addState | enemyAll | downCriticalrate | Critical Hit Rate Down | missText | missText | false | 64 | 100, 103, 104, 108, 112 | np,skill |
| addState | enemyAll | downCriticalpoint | C. Star Drop Rate Down |  |  | false | 63 | 100, 103, 104, 112, 114 | np,skill |
| hastenNpturn | ptOne |  |  |  |  | false | 55 | 1, 144, 183, 189, 197 | skill |
| addState | enemy | downCriticalrate | Critical Hit Rate Down | missText | missText | false | 49 | 105, 107, 109, 110, 113 | np,skill |
| addState | enemy | downCriticalpoint | C. Star Drop Rate Down |  |  | false | 48 | 105, 107, 109, 110, 113 | np,skill |
| addState | self | avoidState | Debuff Immune |  |  | false | 48 | 127, 135, 154, 164, 171 | skill,passive,np |
| addState | self | breakAvoidance | Sure Hit | ProgressSelfTurn | ProgressSelfTurn | false | 45 | 102, 105, 122, 129, 13 | skill,np |
| gainHp | ptAll |  |  |  |  | false | 42 | 104, 111, 120, 122, 138 | np,skill |
| lossNp | enemy |  |  |  |  | false | 41 | 107, 109, 124, 129, 15 | skill,np |
| addState | enemyAll | reduceHp | Curse |  |  | false | 41 | 147, 18, 19, 230, 297 | np,skill |
| addStateShort | ptOne | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 39 | 103, 117, 141, 179, 188 | skill |
| addState | enemyAll | downAtk | ATK Down |  |  | false | 36 | 10, 103, 11, 112, 117 | np,skill |
| addStateShort | self | regainHp | Restore HP Each Turn |  |  | false | 36 | 127, 130, 139, 155, 214 | skill,np,passive |
| addState | ptAll | upDefence | DEF Up |  |  | false | 35 | 1, 126, 129, 145, 189 | skill,np |
| addStateShort | ptAll | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 33 | 113, 145, 150, 161, 181 | skill,np |
| gainHp | ptOne |  |  |  |  | false | 30 | 111, 116, 133, 136, 141 | skill |
| lossNp | enemyAll |  |  |  |  | false | 29 | 132, 167, 220, 227, 229 | np,skill |
| addStateShort | ptOne | upCriticaldamage | Critical Strength Up |  |  | false | 27 | 116, 150, 197, 215, 269 | skill |
| addState | enemyAll | donotSkill | Skill Seal | ProgressSelfTurn | ProgressSelfTurn | false | 26 | 103, 112, 123, 168, 177 | np,skill |
| lossHpSafe | self |  |  |  |  | false | 25 | 1, 106, 141, 161, 167 | skill,np |
| addState | ptAll | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 25 | 113, 145, 150, 161, 181 | skill,np |
| addState | enemyAll | reduceHp | Burn |  |  | false | 23 | 123, 134, 162, 193, 250 | np,skill |
| addState | enemyAll | donotAct | Stun | ProgressSelfTurn | ProgressSelfTurn | false | 23 | 19, 201, 229, 232, 34 | np,skill |
| addState | enemy | downAtk | ATK Down |  |  | false | 22 | 107, 15, 158, 165, 171 | skill,np |
| hastenNpturn | ptAll |  |  |  |  | false | 22 | 281, 32, 33, 341, 355 | np,skill |
| addStateShort | enemyAll | downTolerance | Debuff Resist Down |  |  | false | 21 | 100, 112, 117, 141, 169 | np,skill |
| addState | ptOtherFull | downTolerance | Debuff Resist Down |  |  | false | 21 | 106, 107, 147, 158, 204 | passive |
| addState | enemy | donotNoble | NP Seal | ProgressSelfTurn | ProgressSelfTurn | false | 20 | 118, 124, 144, 173, 185 | np,skill |
| addState | enemy | reduceHp | Curse |  |  | false | 19 | 106, 128, 202, 260, 288 | np,skill |
| addStateShort | ptOne | upStarweight | C. Star Gather Up |  |  | false | 19 | 233, 254, 269, 281, 295 | skill |
| addState | ptOne | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 18 | 103, 117, 141, 179, 188 | skill |
| addStateShort | ptAll | regainHp | Restore HP Each Turn |  |  | false | 18 | 150, 178, 249, 276, 295 | np,skill |
| addState | enemyAll | donotNoble | NP Seal | ProgressSelfTurn | ProgressSelfTurn | false | 17 | 103, 168, 19, 234, 311 | np,skill |
| addState | ptAll | avoidance | Evade | ProgressSelfTurn | ProgressSelfTurn | false | 17 | 122, 215, 285, 295, 311 | skill,np |
| addStateShort | self | upCriticalrate | Critical Rate Up: Buster |  |  | false | 17 | 123, 147, 233, 247, 270 | np,skill,passive |
| addState | enemy | donotAct | Charm |  |  | false | 17 | 146, 15, 165, 28, 29 | skill,np |
| addStateShort | ptAll | upCriticaldamage | Critical Strength Up |  |  | false | 17 | 280, 294, 295, 297, 322 | skill,np |
| addStateShort | self | upStarweight | C. Star Gather Up: Buster |  |  | false | 16 | 123, 147, 233, 247, 270 | np,skill,passive |
| addState | enemy | donotSkill | Skill Seal | ProgressSelfTurn | ProgressSelfTurn | false | 16 | 124, 134, 185, 19, 246 | np,skill |
| addState | ptOne | guts | Guts | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 16 | 127, 136, 144, 175, 22 | skill |
| addState | enemy | donotAct | Stun | ProgressSelfTurn | ProgressSelfTurn | false | 16 | 146, 166, 176, 201, 409 | np,skill |
| addState | enemy | reduceHp | Burn |  |  | false | 15 | 134, 138, 144, 170, 184 | np,skill |
| addState | ptAll | invincible | Invincible |  |  | false | 15 | 138, 150, 342, 351, 353 | skill,np |
| hastenNpturn | ptOther |  |  |  |  | false | 14 | 294, 305, 347, 349, 363 | np,skill |
| addState | self | downCriticalRateDamageTaken | Critical Resistance Up |  |  | false | 14 | 309, 315, 329, 335, 368 | passive,skill |
| addState | self | downCriticalStarDamageTaken | C. Star Generation Resistance Up |  |  | false | 14 | 309, 315, 329, 335, 368 | passive,skill |
| addState | ptOne | invincible | Invincible |  |  | false | 13 | 1, 188, 241, 244, 245 | skill |
| addState | ptAll | avoidState | Debuff Immune |  |  | false | 13 | 1, 113, 237, 249, 278 | np,skill |
| addState | enemy | reduceHp | Poison |  |  | false | 12 | 124, 170, 225, 378, 433 | skill,np |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up: Arts |  |  | false | 12 | 187, 198, 290, 298, 300 | skill,passive |
| addState | enemyAll | donotAct | Charm |  |  | false | 11 | 10, 112, 183, 221, 274 | np,skill |
| addState | enemyAll | reduceHp | Poison |  |  | false | 11 | 112, 13, 192, 199, 378 | np,skill |
| addStateShort | enemy | downTolerance | Debuff Resist Down |  |  | false | 11 | 122, 148, 166, 167, 201 | np,skill |
| lossNp | self |  |  |  |  | false | 11 | 129, 138, 176, 183, 347 | skill |
| addState | ptAll | downCriticalRateDamageTaken | Critical Resistance Up |  |  | false | 11 | 281, 325, 337, 373, 394 | skill,np |
| addState | ptAll | downCriticalStarDamageTaken | C. Star Generation Resistance Up |  |  | false | 11 | 281, 325, 337, 373, 394 | skill,np |
| addState | enemyAll | downNpdamage | NP Strength Down |  |  | false | 9 | 112, 163, 32, 95, 97 | np,skill |
| addState | enemyAll | avoidState | Nullify Buff |  |  | false | 9 | 117, 139, 237, 263, 305 | skill,np |
| addState | ptOne | avoidState | Debuff Immune |  |  | false | 9 | 136, 166, 213, 301, 315 | skill |
| lossHp | self |  |  |  |  | false | 9 | 139, 347, 408, 42, 57 | np |
| addStateShort | self | upStarweight | C. Star Gather Up: Arts |  |  | false | 9 | 187, 198, 290, 298, 300 | skill |
| addState | ptAll | addMaxhp | Max HP Plus |  |  | false | 8 | 125, 189, 196, 353, 416 | skill,np |
| addStateShort | ptAll | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 8 | 128, 129, 130, 131, 294 | skill |
| addState | enemy | donotAct | Charm |  |  | false | 8 | 128, 239, 240, 29, 41 | skill,np |
| addState | self | downTolerance | Debuff Resist Down |  |  | false | 8 | 131, 189, 217, 245, 25 | skill,passive |
| addStateShort | self | avoidState | Burn Immune |  |  | false | 8 | 176, 220, 250, 282, 328 | skill,passive,np |
| addState | self | addMaxhp | Max HP Plus |  |  | false | 8 | 184, 208, 217, 310, 312 | skill,np |
| addState | ptOne | avoidance | Evade | ProgressSelfTurn | ProgressSelfTurn | false | 7 | 117, 188, 254, 269, 349 | skill |
| addState | self | donotAct | Stun | ProgressSelfTurn | ProgressSelfTurn | false | 7 | 164, 267, 58, 59, 82 | skill,np |
| addState | enemyAll | downGainHp | HP Recover Down |  |  | false | 7 | 174, 35, 429, 433, 435 | skill,np |
| addState | self | downTolerance | 罪の刻印 |  |  | false | 7 | 437 | skill |
| addState | enemy | avoidState | Nullify Buff |  |  | false | 6 | 106, 170, 200, 35 | np,skill |
| addState | ptOne | upHate | Target Focus Up |  |  | false | 6 | 109, 258, 345 | skill |
| hastenNpturn | self |  |  |  |  | false | 6 | 116, 343, 366, 377, 81 | skill |
| addState | ptAll | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 6 | 128, 129, 130, 131, 33 | skill |
| addStateShort | ptOther | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 6 | 159, 222, 257, 307, 315 | skill,np |
| addStateShort | self | reduceHp | Burn (Self/Non-stackable) |  |  | false | 6 | 176, 250, 282, 80, 82 | skill,np |
| addStateShort | ptAll | regainStar | Gain C. Stars Each Turn |  |  | false | 6 | 244, 253, 292, 450, 458 | skill |
| addState | ptOne | upDefence | DEF Up |  |  | false | 5 | 103, 127, 242, 90 | skill |
| addStateShort | ptAll | upGrantstate | Buff Chance Up |  |  | false | 5 | 118, 227, 245, 77 | skill |
| addState | self | avoidInstantdeath | Immune to Death |  |  | false | 5 | 154, 186, 196, 435 | passive,np,skill |
| addStateShort | self | downCriticalrate | Critical Hit Rate Down | missText | missText | false | 5 | 156, 199, 217, 242, 428 | skill,np |
| addStateShort | self | downStarweight | C. Star Gather Down |  |  | false | 5 | 159, 222, 257, 315 | skill,np |
| addState | self | avoidState | Nullify Charm |  |  | false | 5 | 239, 277, 305, 321, 346 | passive,skill |
| addState | self | avoidState | Mental Debuff Immune |  |  | false | 5 | 248, 316, 358, 87 | passive,np |
| addStateShort | self | reduceHp | Curse |  |  | false | 5 | 295, 469 | skill |
| displayBuffstring | self |  |  |  |  | false | 5 | 417, 424, 425, 464 | np,skill |
| addState | self | functionedFunction | 被効果時発動 |  |  | false | 5 | 442, 447 | skill,passive |
| addStateShort | self | upGrantstate | Buff Chance Up |  |  | false | 4 | 110, 139, 5, 7 | skill,np |
| addStateShort | self | downAtk | ATK Down |  |  | false | 4 | 136, 241, 273 | np,skill |
| addState | enemy | donotAct | Petrify |  |  | false | 4 | 147, 23, 384 | skill,np |
| addState | ptOne | addMaxhp | Max HP Plus |  |  | false | 4 | 150, 26, 330, 353 | skill |
| hastenNpturn | ptOther |  |  |  |  | false | 4 | 254, 351, 421, 431 | skill,np |
| addState | enemy | downNpdamage | NP Strength Down |  |  | false | 4 | 36, 59, 88 | skill |
| addStateShort | self | upCriticaldamage | Critical Strength Up |  |  | false | 4 | 366, 448, 81 | skill |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up |  |  | false | 3 | 148, 428 | skill |
| addState | enemy | downCriticaldamage | Critical Down |  |  | false | 3 | 159, 446 | np |
| addState | self | upDefence | DEF Up vs. Humanoid |  |  | false | 3 | 167, 285, 97 | passive,skill |
| addState | enemyAll | donotAct | Charm |  |  | false | 3 | 169, 45 | skill |
| addState | ptOther | guts | Guts | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 3 | 169, 249, 407 | skill,np |
| addState | ptAll | avoidInstantdeath | Immune to Death |  |  | false | 3 | 215, 282 | np,skill |
| addStateShort | ptOne | upGrantstate | Buff Chance Up |  |  | false | 3 | 227, 236, 269 | skill |
| addState | self | avoidState | Skill Seal Immune |  |  | false | 3 | 234, 346, 414 | passive |
| addStateShort | ptOne | regainHp | Restore HP Each Turn |  |  | false | 3 | 245, 413, 465 | skill |
| addStateShort | self | upStarweight | C. Star Gather Rate Up: Quick |  |  | false | 3 | 276, 286, 323 | passive,skill |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up: Quick |  |  | false | 3 | 276, 286, 323 | passive,skill |
| addStateShort | self | upGrantstate | Mental Debuff Chance Up |  |  | false | 3 | 29, 32, 44 | skill |
| addStateShort | ptAll | reduceHp | Curse |  |  | false | 3 | 295, 441, 469 | skill |
| addState | ptOther | invincible | Invincible |  |  | false | 3 | 305, 307, 391 | skill |
| addState | self | avoidState | Terror Immune |  |  | false | 3 | 305, 346, 414 | passive |
| addState | self | upCriticalpoint | C. Star Drop Rate Up: Arts | ProgressSelfTurn | ProgressSelfTurn | false | 3 | 307, 410, 430 | passive |
| addState | enemy | downNpdamage | NP Strength Down |  |  | false | 3 | 32, 36, 59 | skill |
| addStateShort | ptOne | regainStar | Gain C. Stars Each Turn |  |  | false | 3 | 33, 431, 93 | skill |
| addState | self | downTolerance | Charm Resist Down (Mental) |  |  | false | 3 | 344, 87 | skill |
| addState | self | avoidState | Poison Immune |  |  | false | 3 | 369, 381, 409 | passive,skill |
| addState | self | masterSkillValueUp | Master Skill Effect Up |  |  | false | 3 | 371, 430 | passive,skill,np |
| addStateShort | self | confirmCommandFunction |  | checkIndvType | checkIndvType | false | 3 | 417 | passive |
| addStateShort | self | pierceSpecialInvincible | 対粛正防御貫通(回避貫通不能) | NotPierceIndividuality | NotPierceIndividuality | false | 3 | 424, 425, 448 | np,skill |
| addState | enemy | donotAct | Bind |  |  | false | 3 | 59, 93 | skill |
| addState | ptOne | specialInvincible | Anti-Enforcement DEF |  |  | false | 2 | 1 | skill |
| addState | ptOneOther | invincible | Invincible |  |  | false | 2 | 1 | skill |
| lossNp | enemy |  |  |  |  | false | 2 | 101, 224 | np |
| addState | self | gutsRatio | Guts | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 2 | 107 | skill |
| addState | ptAll | guts | Guts | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 2 | 111, 385 | np,skill |
| addState | enemy | donotAct | Stun | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 143 | np |
| addStateShort | ptAll | upGrantstate | Debuff Chance Up |  |  | false | 2 | 145, 373 | skill,passive |
| addStateShort | ptOther | downStarweight | C. Star Gather Down |  |  | false | 2 | 162, 303 | skill |
| addStateShort | ptOther | downNpdamage | NP Strength Down |  |  | false | 2 | 163 | skill |
| addState | enemy | downAtk | ATK Down |  |  | false | 2 | 169 | skill |
| addStateShort | ptAll | pierceInvincible | Ignore Invincible |  |  | false | 2 | 173, 444 | np,skill |
| lossHpSafe | ptOne |  |  |  |  | false | 2 | 179 | skill |
| addState | enemy | donotAct | Pigify | AppId | AppId | false | 2 | 192 | np |
| addState | ptAll | avoidInstantdeath | Immune to Death |  |  | false | 2 | 196, 370 | np,skill |
| addStateShort | self | npattackPrevBuff | Pseudonym "Iseidako" |  |  | false | 2 | 198 | skill |
| addStateShort | self | changeCommandCardType | Command Card Type Change |  |  | false | 2 | 2, 383 | skill |
| gainHp | enemyAll |  |  |  |  | false | 2 | 234 | skill |
| addStateShort | enemyAll | downTolerance | Charm Resist Down (Mental) |  |  | false | 2 | 239, 45 | skill |
| addState | ptOne | donotSkill | Skill Seal | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 244 | skill |
| addStateShort | ptOther | upCriticaldamage | Critical Strength Up |  |  | false | 2 | 254, 434 | skill |
| addStateShort | ptOther | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 254, 307 | skill |
| addState | enemyAll | donotNoble | NP Seal | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 261 | np |
| addStateShort | enemy | upHate | Target Focus Up |  |  | false | 2 | 262 | skill |
| addState | ptAll | breakAvoidance | Sure Hit | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 262, 372 | skill |
| addStateShort | ptOne | pierceInvincible | Ignore Invincible |  |  | false | 2 | 269 | skill |
| addState | self | upHate | Target Focused [Male] |  |  | false | 2 | 275 | skill |
| addState | ptOneOther | upHate | Target Focus Up |  |  | false | 2 | 277 | skill |
| addState | ptAll | specialInvincible | Anti-Enforcement DEF |  |  | false | 2 | 284, 386 | np |
| addState | enemy | donotAct | Sleep | DamageRelease|ReleaseText | DamageRelease|ReleaseText | false | 2 | 289 | skill |
| addStateShort | ptFull | upCriticaldamage | Critical Strength Up |  |  | false | 2 | 302, 416 | passive |
| addState | ptOther | upHate | Target Focus Up |  |  | false | 2 | 307 | skill |
| addState | ptOne | avoidInstantdeath | Immune to Death |  |  | false | 2 | 307, 97 | skill |
| hastenNpturn | ptSelfAnotherFirst |  |  |  |  | false | 2 | 307, 463 | np |
| addState | ptFull | downTolerance | Increase Buff Success Rate when receiving a Buff |  |  | false | 2 | 307, 451 | passive |
| lossHpSafe | ptAll |  |  |  |  | false | 2 | 314, 444 | skill |
| addStateShort | ptOne | upStarweight | C. Star Gather Up: Buster |  |  | false | 2 | 314, 357 | skill |
| addStateShort | ptOne | upCriticalrate | Critical Rate Up: Buster |  |  | false | 2 | 314, 357 | skill |
| addState | enemyAll | donotAct | Sleep | DamageRelease|ReleaseText | DamageRelease|ReleaseText | false | 2 | 316 | np |
| addState | ptOther | invincible | Invincible |  |  | false | 2 | 324 | skill |
| addStateShort | self | reduceHp | Poison |  |  | false | 2 | 326, 378 | skill |
| addState | self | donotNoble | NP Seal | ProgressSelfTurn | ProgressSelfTurn | false | 2 | 343 | skill |
| addState | self | avoidState | Nullify Confusion |  |  | false | 2 | 346, 414 | passive |
| addStateShort | self | downAtk | ATK Down [Yu Mei-ren] |  |  | false | 2 | 352, 420 | passive |
| addState | ptAll | addMaxhp | Max HP Plus |  |  | false | 2 | 367, 430 | skill |
| addStateShort | self | upCriticaldamage | Critical Strength Up [Near Water] | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 372, 422 | passive |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up | INDIVIDUALITIE_OR|ProgressSelfTurn | INDIVIDUALITIE_OR|ProgressSelfTurn | false | 2 | 390 | skill |
| addStateShort | self | upCriticaldamage | Critical STR Up (Human Attribute) |  |  | false | 2 | 390, 391 | passive |
| addStateShort | self | upCriticaldamage | Critical STR Up (Human Attribute) | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 392 | passive |
| addState | self | entryFunction |  | INDIVIDUALITIE | INDIVIDUALITIE | false | 2 | 392 | passive |
| addStateShort | self | reduceHp | Burn |  |  | false | 2 | 409, 466 | np |
| addState | self | continueFunction |  |  |  | false | 2 | 415, 448 | passive |
| addStateShort | self | upCriticaldamage | Critical Strength Up | HP_HIGHER | HP_HIGHER | false | 2 | 418 | skill |
| addState | ptOther | donotSelectCommandcard |  |  |  | false | 2 | 418, 444 | skill |
| addState | self | upHate | タゲ集中アップ〔蛇・竜〕 |  |  | false | 2 | 434 | skill |
| addState | self | upDefence | DEF Up vs. Dragon |  |  | false | 2 | 6 | skill |
| addState | enemyAll | downCriticalrate | Happy Halloween | missText | missText | false | 2 | 61 | skill,np |
| addState | enemyAll | downCriticalpoint | Happy Halloween |  |  | false | 2 | 61 | skill,np |
| addState | self | addMaxhp | Max HP Plus |  | UnSubStateWhenContinue | false | 2 | 81 | np |
| addState | self | upCriticalpoint | C. Star Drop Rate Up vs. Saber |  |  | false | 2 | 86 | skill |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up vs. Saber |  |  | false | 2 | 86 | skill |
| addState | self | avoidance | Chance to Evade |  |  | false | 2 | 87 | skill |
| addState | enemyAll | downCriticaldamage | Critical Down |  |  | false | 2 | 95 | np |
| addStateShort | enemy | downTolerance | Mental Debuff Resist Down |  |  | false | 2 | 99 | np |
| addStateShort | self | skillRankUp |  |  |  | false | 1 | 1 | np |
| addState | self | donotAct | Standby |  |  | false | 1 | 107 | np |
| addStateShort | self | reflectionFunction | Reflect Damage |  |  | false | 1 | 107 | np |
| addState | ptOther | downTolerance | Debuff Resist Down |  |  | false | 1 | 109 | skill |
| addStateShort | self | regainStar | C. Star Gain Per Turn (Sunlight) |  |  | false | 1 | 118 | skill |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up (Sunlight) |  |  | false | 1 | 118 | skill |
| addStateShort | ptAll | upCriticaldamage | Critical STR Up (Sunlight) |  |  | false | 1 | 118 | skill |
| addState | self | donotNoble | NP Seal | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 122 | skill |
| hastenNpturn | enemy |  |  |  |  | false | 1 | 128 | skill |
| addStateShort | ptAll | upGrantstate | Buff Chance Up |  |  | false | 1 | 137 | skill |
| addState | self | downTolerance | Increase Buff Success Rate when receiving a Buff |  |  | false | 1 | 142 | skill |
| addState | self | upCriticalpoint | C. Star Drop Rate Up |  |  | false | 1 | 148 | skill |
| addState | enemy | reduceHp | Burn (Non-stackable) |  |  | false | 1 | 152 | np |
| addStateShort | ptOne | downStarweight | C. Star Gather Down |  |  | false | 1 | 155 | skill |
| addStateShort | ptOneOther | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 155 | skill |
| addState | self | upDefence | DEF Up [Demonic] |  |  | false | 1 | 193 | skill |
| addState | enemy | downGainHp | HP Recover Down |  |  | false | 1 | 194 | np |
| addState | ptAll | downCriticalRateDamageTaken | Critical Resistance Up |  |  | false | 1 | 196 | np |
| addState | ptAll | downCriticalStarDamageTaken | C. Star Generation Resistance Up |  |  | false | 1 | 196 | np |
| addState | self | subMaxhp | Minus Maximum HP |  |  | false | 1 | 200 | skill |
| addState | ptAll | downCriticalpoint | C. Star Drop Rate Down |  |  | false | 1 | 204 | np |
| addStateShort | ptAll | downCriticalrate | Critical Hit Rate Down | missText | missText | false | 1 | 204 | np |
| addState | self | downCriticalpoint | C. Star Drop Rate Down |  |  | false | 1 | 217 | np |
| addState | self | fixCommandcard | Lock Command Cards |  |  | false | 1 | 220 | skill |
| addStateShort | ptOther | upCriticaldamage | Critical Strength Up |  |  | false | 1 | 221 | skill |
| lossHp | enemy |  |  |  |  | false | 1 | 221 | np |
| addState | self | upDefence | DEF Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 229 | skill |
| addState | ptOne | subMaxhp | Minus Maximum HP |  |  | false | 1 | 239 | skill |
| gainHp | ptOther |  |  |  |  | false | 1 | 25 | skill |
| addState | ptOther | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 254 | skill |
| addStateShort | ptOne | upCriticaldamage | Critical Strength Up |  |  | false | 1 | 258 | skill |
| addState | ptOne | addMaxhp | Max HP Plus |  |  | false | 1 | 258 | skill |
| addState | self | donotNobleCondMismatch |  | IncludeIgnoreIndividuality|TargetIndiv | IncludeIgnoreIndividuality|TargetIndiv | false | 1 | 258 | passive |
| addState | ptOne | donotSelectCommandcard |  |  |  | false | 1 | 265 | skill |
| addState | ptOther | avoidState | Nullify Charm |  |  | false | 1 | 268 | skill |
| addState | self | avoidState | Pigify Immune |  |  | false | 1 | 277 | passive |
| addState | enemyAll | downCriticalrate | Enchant | missText | missText | false | 1 | 285 | skill |
| addState | enemyAll | downCriticalpoint | Enchant |  |  | false | 1 | 285 | skill |
| addState | self | avoidState | Poison & Curse Immune |  |  | false | 1 | 292 | passive |
| addStateShort | ptAll | upStarweight | C. Star Gather Up |  |  | false | 1 | 294 | skill |
| addState | self | preventDeathByDamage |  |  |  | false | 1 | 295 | passive |
| addState | self | breakAvoidance | Sure Hit |  |  | false | 1 | 296 | np |
| addStateShort | self | upCriticaldamage | Critical Strength Up | CheckOpponentBuffTypes | CheckOpponentBuffTypes | false | 1 | 302 | skill |
| addState | ptOther | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 307 | skill |
| gainStar | ptOther |  |  |  |  | false | 1 | 307 | skill |
| moveToLastSubmember | self |  |  |  |  | false | 1 | 307 | np |
| lossHpSafe | ptOther |  |  |  |  | false | 1 | 311 | skill |
| gainHp | ptOneHpLowestRate |  |  |  |  | false | 1 | 313 | np |
| addState | ptOne | invincible | Invincible |  |  | false | 1 | 315 | skill |
| addState | ptOne | guts | Guts | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 1 | 315 | skill |
| addStateShort | ptOne | regainHp | Restore HP Each Turn |  |  | false | 1 | 315 | skill |
| addStateShort | enemyAll | invincible | Invincible |  |  | false | 1 | 316 | np |
| addStateShort | ptFull | upGrantstate | Debuff Chance Up | checkIndvType | checkIndvType | false | 1 | 316 | passive |
| addStateShort | ptFull | downGrantstate | Buff Chance Down |  |  | false | 1 | 316 | passive |
| addState | self | avoidState | Nullify Curse |  |  | false | 1 | 316 | passive |
| addState | ptOne | avoidState | Burn Immune |  |  | false | 1 | 323 | skill |
| addState | self | donotSkill | Skill Seal | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 326 | skill |
| addStateShort | ptAll | downStarweight | C. Star Gather Down |  |  | false | 1 | 334 | skill |
| addState | ptAll | upDefence | DEF Up |  |  | false | 1 | 334 | skill |
| addStateShort | ptAll | upStarweight | C. Star Gather Up: Buster |  |  | false | 1 | 339 | skill |
| addStateShort | ptAll | upCriticalrate | Critical Rate Up: Buster |  |  | false | 1 | 339 | skill |
| addState | self | upDefence | DEF Up vs. Divine |  |  | false | 1 | 343 | skill |
| addStateShort | self | upCriticaldamage | Critical Strength Up [Evil] |  |  | false | 1 | 343 | skill |
| hastenNpturn | ptOne |  |  |  |  | false | 1 | 352 | skill |
| addState | enemyAll | downNpturnval | Charge Down Each Turn |  |  | false | 1 | 353 | skill |
| addState | enemyAll | donotAct | Stun | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 358 | skill |
| addState | self | avoidState | Poison & Burn Immune |  |  | false | 1 | 364 | passive |
| addState | self | subIndividuality |  |  | UnSubStateWhenContinue | false | 1 | 366 | skill |
| addState | ptAll | downTolerance | Debuff Resist Down |  |  | false | 1 | 367 | skill |
| addState | self | guts | Guts <High Chance> | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 1 | 369 | skill |
| addState | self | guts | Guts <High Chance> | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 1 | 369 | skill |
| addState | ptAll | downTolerance | Increase Buff Success Rate when receiving a Buff |  |  | false | 1 | 370 | skill |
| addState | ptAll | avoidance | Evade | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 370 | skill |
| addState | ptAll | avoidState | Debuff Immune |  |  | false | 1 | 370 | skill |
| addState | ptAll | avoidState | Invincible Immune |  |  | false | 1 | 371 | skill |
| addState | self | subFieldIndividuality | Negate Field Trait [Sunlight] |  |  | false | 1 | 371 | skill |
| addState | ptOne | breakAvoidance | Sure Hit | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 373 | skill |
| addStateShort | ptOne | upStarweight | C. Star Gather Up: Arts |  |  | false | 1 | 374 | skill |
| addStateShort | ptOne | upCriticalrate | Critical Hit Rate Up: Arts |  |  | false | 1 | 374 | skill |
| addState | enemyAll | donotRecovery | Recovery Disabled |  |  | false | 1 | 376 | skill |
| hastenNpturn | enemyAll |  |  |  |  | false | 1 | 377 | skill |
| addStateShort | self | regainStar | Gain C. Stars Each Turn |  |  | false | 1 | 377 | skill |
| addStateShort | self | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 377 | skill |
| addState | self | avoidState | Debuff Immune |  |  | false | 1 | 377 | skill |
| addStateShort | self | upGrantstate | Ignore Debuff Resist |  |  | false | 1 | 377 | passive |
| addStateShort | self | hpReduceToRegain | [Poison] Recovery |  |  | false | 1 | 378 | skill |
| addStateShort | self | upGrantstate | Inflict Poison Up |  |  | false | 1 | 378 | passive |
| addState | enemy | donotAct | Bind |  |  | false | 1 | 380 | skill |
| addState | enemyAll | donotAct | Bind |  |  | false | 1 | 380 | np |
| addStateShort | ptRandom | upStarweight | C. Star Gather Up |  |  | false | 1 | 382 | skill |
| addStateShort | ptRandom | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 382 | skill |
| addState | ptOther | donotSkill | My Fair Soldier | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 389 | skill |
| addState | ptOther | upDefence | DEF Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 389 | skill |
| addStateShort | ptAll | donotActCommandtype | Arts Seal |  |  | false | 1 | 389 | skill |
| addState | ptFull | upCriticalpoint | C. Star Drop Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 389 | passive |
| addStateShort | ptFull | upCriticalrate | Critical Hit Rate Up | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 389 | passive |
| gainHp | ptOther |  |  |  |  | false | 1 | 391 | skill |
| addState | self | avoidState | Nullify Burn & Spreading Fire | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 391 | passive |
| addState | enemy | downNpturnval | Charge Down Each Turn |  |  | false | 1 | 392 | skill |
| addStateShort | self | upCriticalrate | Throw/Retrieve |  |  | false | 1 | 40 | skill |
| addStateShort | self | regainStar | Throw/Retrieve |  |  | false | 1 | 40 | skill |
| addState | ptOne | avoidFunctionExecuteSelf | Plot Armor |  |  | false | 1 | 413 | skill |
| addState | self | changeBgm |  |  |  | false | 1 | 413 | np |
| addState | self | avoidanceAttackDeathDamage | Evade Lethal Damage | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 414 | skill |
| addStateShort | self | pierceSubdamage | Pierce Damage Cut |  |  | false | 1 | 414 | np |
| addState | self | specialInvincible | Substitution |  | effectText | false | 1 | 415 | skill |
| displayBuffstring | self |  |  |  |  | false | 1 | 415 | skill |
| addState | self | subFuncHpReduce |  |  |  | false | 1 | 415 | passive |
| addState | self | guts | Guts ([Death] Activated) | INDIVIDUALITIE|checkIndvType | DisplayPriority|INDIVIDUALITIE|checkIndvType | false | 1 | 415 | passive |
| addState | self | donotSkillSelect |  | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 415 | passive |
| addStateShort | self | regainStar | C. Star Gain Per Turn [Near Water] | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 416 | passive |
| addStateShort | ptAll | reduceHp | Poison |  |  | false | 1 | 417 | skill |
| addStateShort | self | upCriticaldamage | Critical Strength Up [Servant] |  |  | false | 1 | 417 | passive |
| addState | self | avoidState | Stun, Petrify, Bound and Pigify Immune |  |  | false | 1 | 417 | passive |
| addState | self | fieldIndividualityChangedFunction |  | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 417 | passive |
| addStateShort | self | confirmCommandFunction |  |  |  | false | 1 | 417 | passive |
| addStateShort | self | skillBeforeFunction |  |  |  | false | 1 | 417 | passive |
| addStateShort | self | skillBeforeFunction |  | useFirstTimeInTurn | useFirstTimeInTurn | false | 1 | 417 | passive |
| addState | self | skillTargetedBeforeFunction |  | fromMasterEquip | fromMasterEquip | false | 1 | 417 | passive |
| addState | self | skillTargetedBeforeFunction |  | fromCommandSpell | fromCommandSpell | false | 1 | 417 | passive |
| addState | self | upDefence | DEF Up |  | IndvAddBuffPassive | false | 1 | 421 | passive |
| addStateShort | self | upGrantstate | 呪い付与アップ |  |  | false | 1 | 427 | passive |
| addState | self | upCriticalpoint | スター発生アップ：Buster | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 428 | passive |
| addState | self | downTolerance | 睡眠耐性ダウン |  |  | false | 1 | 438 | passive |
| addState | self | downTolerance | Mental Debuff Resist Down |  |  | false | 1 | 440 | skill |
| addState | self | guts | Guts | INDIVIDUALITIE|checkIndvType | DisplayPriority|INDIVIDUALITIE|checkIndvType | false | 1 | 444 | passive |
| addState | self | reactiveDamageGainHp | ダメージ吸収 |  |  | false | 1 | 445 | skill |
| addState | self | invincible | Invincible |  |  | false | 1 | 448 | skill |
| gainHp | self |  |  |  |  | false | 1 | 448 | skill |
| addStateShort | self | upCriticaldamage | Critical Strength Up | INDIVIDUALITIE | INDIVIDUALITIE | false | 1 | 449 | passive |
| addStateShort | ptAll | upGrantstate | Mental Debuff Chance Up |  |  | false | 1 | 451 | skill |
| displayBuffstring | enemyAll |  |  |  |  | false | 1 | 451 | np |
| addStateShort | ptFull | regainHp | Restore HP Each Turn | INDIVIDUALITIE_OR | INDIVIDUALITIE_OR | false | 1 | 451 | passive |
| addStateShort | ptFull | regainStar | Gain C. Stars Each Turn | INDIVIDUALITIE_OR | INDIVIDUALITIE_OR | false | 1 | 451 | passive |
| addStateShort | ptOther | regainHp | Restore HP Each Turn |  |  | false | 1 | 452 | skill |
| addState | self | guts | ガッツ<低確率> | INDIVIDUALITIE|checkIndvType | INDIVIDUALITIE|checkIndvType | false | 1 | 455 | skill |
| addState | ptOther | downTolerance | Mental Debuff Resist Down |  |  | false | 1 | 457 | skill |
| addState | self | upDefence | 防御力アップ〔七騎士クラス〕 |  |  | false | 1 | 459 | skill |
| addState | self | avoidState | 結界作成 |  |  | false | 1 | 460 | passive |
| addState | self | avoidState |  |  |  | false | 1 | 460 | passive |
| addStateShort | self | reduceHp | HP Loss Per Turn |  |  | false | 1 | 461 | skill |
| addState | self | specialInvincible | Anti-Enforcement DEF |  |  | false | 1 | 461 | skill |
| addState | self | multiGutsBeforeFunction | 騎士叙勲 |  |  | false | 1 | 461 | passive |
| addState | enemyAll | reduceHp | 灰桜 |  |  | false | 1 | 462 | np |
| addState | ptSelfAnotherFirst | addMaxhp | Max HP Plus |  |  | false | 1 | 463 | np |
| addState | ptOther | avoidance | Evade | ProgressSelfTurn | ProgressSelfTurn | false | 1 | 468 | skill |
| addStateShort | ptAll | hpReduceToRegain | 〔呪い〕回復化 |  |  | false | 1 | 469 | np |
| addState | ptOne | downTolerance | Increase Buff Success Rate when receiving a Buff |  |  | false | 1 | 70 | skill |
| addState | enemyAll | downAtk | ATK Down |  |  | false | 1 | 71 | skill |
| addStateShort | self | upGrantstate | Debuff Chance Up |  |  | false | 1 | 81 | skill |
| lossNp | ptOne |  |  |  |  | false | 1 | 91 | skill |
| addState | enemy | downDropnp | NP Gain Down |  |  | false | 1 | 93 | skill |
| addState | enemy | downDropnp | NP Gain Down |  |  | false | 1 | 93 | skill |

</details>
