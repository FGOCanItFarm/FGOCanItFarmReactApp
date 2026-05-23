import React, { useState } from 'react';
import { Button, Typography, Box, Chip, Divider } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import StatsPanel from './StatsPanel';
import MysticCodeCommand from './MysticCodeCommand';
import '../ui-vars.css';
import '../CommandInputPage.css';
import { generateSkillCommand, ChoiceSelector } from './CommandInputMenu';

// Servants whose skills open a choice/target sub-menu (handled by ChoiceSelector
// so the generated tokens match the simulation grammar exactly).
const isChoiceSkill = (collectionNo, skillIndex) => {
  const num = Number(collectionNo);
  switch (num) {
    case 373: return true;
    case 428: return skillIndex === 1;
    case 268: return skillIndex === 2;
    case 421: case 11: case 391: case 424: case 425: case 414: case 259:
      return skillIndex === 3;
    default: return false;
  }
};

const SourceTargetCommandInput = ({
  team = [],
  servants = [],
  setTeam = () => {},
  selectedMysticCode,
  setSelectedMysticCode = () => {},
  addCommand = () => {},
  updateCommands = () => {},
  setActiveServant = () => {},
  servantEffects = [],
  updateServantEffects = () => {},
  skillInfo = {},
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pendingSkill, setPendingSkill] = useState(null); // skill awaiting an ally target
  const [choiceSkill, setChoiceSkill] = useState(null);    // skill showing the choice sub-menu

  const slotServant = (idx) => {
    const s = team[idx];
    return s && s.collectionNo ? servants.find(x => String(x.collectionNo) === String(s.collectionNo)) : null;
  };

  // team enriched with names so ChoiceSelector tooltips read nicely
  const namedTeam = team.map(s => {
    const serv = s && s.collectionNo ? servants.find(x => String(x.collectionNo) === String(s.collectionNo)) : null;
    return { ...s, name: serv?.name };
  });

  const selectedServant = selectedSlot !== null ? slotServant(selectedSlot) : null;
  const selectedSkills = (selectedServant && skillInfo[String(selectedServant.collectionNo)]) || null;
  const isFrontRow = selectedSlot !== null && selectedSlot < 3;

  const handleSlotClick = (idx) => {
    setPendingSkill(null);
    setChoiceSkill(null);
    setSelectedSlot(prev => (prev === idx ? null : idx));
    try { setActiveServant(idx); } catch (e) { /* noop */ }
  };

  const fireSkill = (skillIndex, targetIndex = null) => {
    addCommand(generateSkillCommand(selectedSlot, skillIndex, targetIndex));
    setPendingSkill(null);
    setChoiceSkill(null);
  };

  const handleSkillClick = (skillIndex) => {
    if (!isFrontRow || !selectedServant) return;
    setPendingSkill(null);
    if (isChoiceSkill(selectedServant.collectionNo, skillIndex)) {
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

  const skillLabel = (skillIndex) => {
    const info = selectedSkills ? selectedSkills[skillIndex - 1] : null;
    return info?.name || `Skill ${skillIndex}`;
  };
  const skillTargetLabel = (skillIndex) => {
    const info = selectedSkills ? selectedSkills[skillIndex - 1] : null;
    return info?.label || '';
  };

  return (
    <div className="cmd-builder">
      {/* Left: command-building controls */}
      <div className="cmd-main">
        <Typography variant="h6" gutterBottom>Skills</Typography>

        {selectedSlot === null && (
          <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
            Select a unit from the column on the right to use its skills.
          </Typography>
        )}

        {selectedSlot !== null && !isFrontRow && (
          <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
            Backline unit. Swap it into positions 1–3 (Mystic Code) to use its skills.
          </Typography>
        )}

        {isFrontRow && !selectedServant && (
          <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
            Empty slot.
          </Typography>
        )}

        {isFrontRow && selectedServant && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {!selectedSkills && (
              <Typography variant="caption" sx={{ color: 'var(--color-text-dim)' }}>
                Loading skill details…
              </Typography>
            )}
            {[1, 2, 3].map(si => (
              <div key={si}>
                <Button
                  fullWidth
                  variant={choiceSkill === si || pendingSkill === si ? 'contained' : 'outlined'}
                  onClick={() => handleSkillClick(si)}
                  className="cmd-skill-btn"
                  sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                >
                  <span>S{si} · {skillLabel(si)}</span>
                  {skillTargetLabel(si) && (
                    <Chip size="small" label={skillTargetLabel(si)} sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                  )}
                </Button>

                {/* Contextual ally-target picker */}
                {pendingSkill === si && (
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-dim)', width: '100%' }}>
                      Choose target ally:
                    </Typography>
                    {[0, 1, 2].map(ally => (
                      <Button key={ally} size="small" variant="outlined"
                        disabled={!team[ally]?.collectionNo}
                        onClick={() => fireSkill(si, ally)}>
                        {slotServant(ally)?.name?.split(' ')[0] || `Ally ${ally + 1}`}
                      </Button>
                    ))}
                    <Button size="small" onClick={() => fireSkill(si, null)}>No target</Button>
                  </Box>
                )}

                {/* Choice sub-menu for choice servants */}
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
            <Button key={slot} variant="outlined" disabled={!team[slot]?.collectionNo}
              onClick={() => handleNP(slot)}>
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

      {/* Middle: vertical team column */}
      <div className="cmd-team-col">
        <Typography variant="caption" sx={{ color: 'var(--color-text-dim)', textAlign: 'center', display: 'block', mb: 0.5 }}>
          Front
        </Typography>
        {team.map((servantObj, index) => {
          const servant = slotServant(index);
          const selected = selectedSlot === index;
          return (
            <React.Fragment key={index}>
              {index === 3 && (
                <Typography variant="caption" sx={{ color: 'var(--color-text-dim)', textAlign: 'center', display: 'block', my: 0.5 }}>
                  Back
                </Typography>
              )}
              <div
                className={`cmd-team-slot ${selected ? 'selected' : ''}`}
                onClick={() => handleSlotClick(index)}
                role="button"
                tabIndex={0}
                aria-label={servant ? `${servant.name} (slot ${index + 1})` : `Empty slot ${index + 1}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSlotClick(index); } }}
              >
                <span className="cmd-slot-num">{index + 1}</span>
                {servant
                  ? <ServantAvatar servantFace={servant.face_url} />
                  : <div className="cmd-slot-empty" />}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: persistent stats panel for the selected unit */}
      <div className="cmd-stats-wrap">
        <StatsPanel
          slotIndex={selectedSlot}
          servant={selectedServant}
          effects={servantEffects[selectedSlot] || {}}
          onChange={updateServantEffects}
        />
      </div>
    </div>
  );
};

export default SourceTargetCommandInput;
