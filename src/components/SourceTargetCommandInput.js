import React, { useState } from 'react';
import { Button, Typography, Box, Chip, Divider } from '@mui/material';
import MysticCodeCommand from './MysticCodeCommand';
import '../ui-vars.css';
import '../CommandInputPage.css';
import { generateSkillCommand, ChoiceSelector } from './CommandInputMenu';

// Skills that open a choice/target sub-menu (rendered by ChoiceSelector so the
// generated tokens match the simulation grammar exactly). Detection is
// data-driven via parseServantSkills(): NP-type-chooser skills are spotted
// from `script.selectTreasureDeviceInfo` or 2+ suffixed `tdTypeChange*`
// functions, so new servants (Emiya / Space Ishtar / future swaps) light up
// without code edits. The hardcoded fallback covers target-mode choosers
// (Sieg's S3 alignment trait pick, Castoria/Tamamo-style ally-mode skills,
// etc.) whose choice doesn't go through tdTypeChange.
const HARDCODED_CHOICE_SKILLS = (num, skillIndex) => {
  switch (num) {
    case 373: return true;
    case 428: return skillIndex === 1;
    case 424: case 425: case 414: case 259:
      return skillIndex === 3;
    default: return false;
  }
};

const isChoiceSkill = (collectionNo, skillIndex, selectedSkills = null) => {
  const fromData = selectedSkills?.[skillIndex - 1]?.isChoice;
  if (fromData) return true;
  return HARDCODED_CHOICE_SKILLS(Number(collectionNo), skillIndex);
};

// Command controls for the unit currently selected in the right-hand Team panel.
// Skills/NP/MC only — the team column and stat editing live in StickyTeamBar.
const SourceTargetCommandInput = ({
  team = [],
  servants = [],
  setTeam = () => {},
  selectedMysticCode,
  setSelectedMysticCode = () => {},
  addCommand = () => {},
  updateCommands = () => {},
  selectedSlot = 0,
  setSelectedSlot = () => {},
  skillInfo = {},
}) => {
  const [pendingSkill, setPendingSkill] = useState(null); // skill awaiting an ally target
  const [choiceSkill, setChoiceSkill] = useState(null);    // skill showing the choice sub-menu

  const slotServant = (idx) => {
    const s = team[idx];
    return s && s.collectionNo ? servants.find(x => String(x.collectionNo) === String(s.collectionNo)) : null;
  };

  const namedTeam = team.map(s => {
    const serv = s && s.collectionNo ? servants.find(x => String(x.collectionNo) === String(s.collectionNo)) : null;
    return { ...s, name: serv?.name };
  });

  const selectedServant = slotServant(selectedSlot);
  const selectedSkills = (selectedServant && skillInfo[String(selectedServant.collectionNo)]) || null;
  const isFrontRow = selectedSlot >= 0 && selectedSlot < 3;

  const fireSkill = (skillIndex, targetIndex = null) => {
    addCommand(generateSkillCommand(selectedSlot, skillIndex, targetIndex));
    setPendingSkill(null);
    setChoiceSkill(null);
  };

  const handleSkillClick = (skillIndex) => {
    if (!isFrontRow || !selectedServant) return;
    setPendingSkill(null);
    if (isChoiceSkill(selectedServant.collectionNo, skillIndex, selectedSkills)) {
      setChoiceSkill(prev => (prev === skillIndex ? null : skillIndex));
      return;
    }
    setChoiceSkill(null);
    const info = selectedSkills ? selectedSkills[skillIndex - 1] : null;
    if (info && info.needsAllyTarget) {
      setPendingSkill(skillIndex);
      return;
    }
    fireSkill(skillIndex, null);
  };

  const handleNP = (slot) => addCommand(String(4 + slot)); // slot 0->4, 1->5, 2->6
  const handleEndTurn = () => addCommand('#');

  const skillLabel = (skillIndex) => selectedSkills?.[skillIndex - 1]?.name || `Skill ${skillIndex}`;
  const skillTargetLabel = (skillIndex) => selectedSkills?.[skillIndex - 1]?.label || '';

  return (
    <div className="cmd-main">
      <Typography variant="h6" gutterBottom>
        Commands{selectedServant ? ` — ${selectedServant.name} (Slot ${selectedSlot + 1})` : ''}
      </Typography>

      <Typography variant="subtitle2" gutterBottom>Skills</Typography>

      {!isFrontRow && (
        <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
          Backline unit selected. Swap it into positions 1–3 (Mystic Code below) to use its skills.
        </Typography>
      )}

      {isFrontRow && !selectedServant && (
        <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
          Empty slot — add a servant from Team Selection, or pick a filled slot in the Team panel on the right.
        </Typography>
      )}

      {isFrontRow && selectedServant && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 460 }}>
          {!selectedSkills && (
            <Typography variant="caption" sx={{ color: 'var(--color-text-dim)' }}>Loading skill details…</Typography>
          )}
          {[1, 2, 3].map(si => (
            <div key={si}>
              <Button
                fullWidth
                variant={choiceSkill === si || pendingSkill === si ? 'contained' : 'outlined'}
                onClick={() => handleSkillClick(si)}
                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
              >
                <span>S{si} · {skillLabel(si)}</span>
                {skillTargetLabel(si) && (
                  <Chip size="small" label={skillTargetLabel(si)} sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                )}
              </Button>

              {pendingSkill === si && (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-dim)', width: '100%' }}>Choose target ally:</Typography>
                  {[0, 1, 2].map(ally => (
                    <Button key={ally} size="small" variant="outlined" disabled={!team[ally]?.collectionNo}
                      onClick={() => fireSkill(si, ally)}>
                      {slotServant(ally)?.name?.split(' ')[0] || `Ally ${ally + 1}`}
                    </Button>
                  ))}
                  <Button size="small" onClick={() => fireSkill(si, null)}>No target</Button>
                </Box>
              )}

              {choiceSkill === si && (
                <Box sx={{ mt: 0.5, mb: 0.5 }}>
                  <ChoiceSelector
                    servantIndex={selectedSlot}
                    skillIndex={si}
                    addCommand={(cmd) => { addCommand(cmd); setChoiceSkill(null); }}
                    team={namedTeam}
                    isDisabled={false}
                  />
                </Box>
              )}
            </div>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>Noble Phantasms</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {[0, 1, 2].map(slot => (
          <Button key={slot} variant="outlined" disabled={!team[slot]?.collectionNo} onClick={() => handleNP(slot)}>
            NP {slot + 1}{slotServant(slot) ? `: ${slotServant(slot).name.split(' ')[0]}` : ''}
          </Button>
        ))}
        <Button variant="contained" color="primary" onClick={handleEndTurn}>End Turn</Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <MysticCodeCommand
        team={team}
        servants={servants}
        setTeam={setTeam}
        updateCommands={updateCommands}
        selectedMysticCode={selectedMysticCode}
        setSelectedMysticCode={setSelectedMysticCode}
        onSwap={(topIndex, bottomIndex) => {
          if (bottomIndex >= 0 && bottomIndex < 3) setSelectedSlot(bottomIndex);
          else if (topIndex >= 0 && topIndex < 3) setSelectedSlot(topIndex);
        }}
      />
    </div>
  );
};

export default SourceTargetCommandInput;
