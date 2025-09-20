import React, { useState } from 'react';
import { Button, Typography, Tooltip, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ServantAvatar from './ServantAvatar';
import MysticCodeCommand from './MysticCodeCommand';
import '../ui-vars.css';
import { generateSkillCommand, generateChoiceCommand, generateChoiceTargetCommand } from './CommandInputMenu';

// Single, clean SourceTargetCommandInput component.
const SourceTargetCommandInput = ({
  team = [],
  servants = [],
  setTeam = () => {},
  selectedMysticCode,
  setSelectedMysticCode = () => {},
  addCommand = () => {},
  updateCommands = () => {},
  setActiveServant = () => {}
}) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [choiceState, setChoiceState] = useState({ open: false, servantIndex: null, skillIndex: null, targetIndex: null });

  const handleSourceClick = (index) => {
    const hasCollection = Boolean(team[index]?.collectionNo);
    if (hasCollection) setSelectedSource(prev => (prev === index ? null : index));
    else setSelectedSource(null);
  };

  const handleTargetClick = (index) => setSelectedTarget(prev => (prev === index ? null : index));

  const openEditorFor = (index, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try { setActiveServant(index); } catch (err) {}
    window.dispatchEvent(new CustomEvent('fgocif:open-edit', { detail: { index } }));
  };

  const isChoiceSkill = (servantCollectionNo, skillIndex) => {
    if (!servantCollectionNo) return false;
    const num = Number(servantCollectionNo);
    switch (num) {
      case 373: return (skillIndex === 1 || skillIndex === 3);
      case 428: return skillIndex === 1;
      case 268: return skillIndex === 2;
      case 421:
      case 11:
      case 391:
      case 424:
      case 425:
      case 414:
      case 259:
        return skillIndex === 3;
      default: return false;
    }
  };

  const handleSkillClick = (skillIndex) => {
    if (selectedSource === null) return;
    const src = team[selectedSource];
    const sourceServant = src && src.collectionNo ? servants.find(s => String(s.collectionNo) === String(src.collectionNo)) : null;
    if (!sourceServant) return;

    if (isChoiceSkill(sourceServant.collectionNo, skillIndex)) {
      setChoiceState({ open: true, servantIndex: selectedSource, skillIndex, targetIndex: selectedTarget });
      return;
    }

    const cmd = generateSkillCommand(selectedSource, skillIndex, selectedTarget);
    addCommand(cmd);
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const handleEndTurn = () => addCommand('z');
  const handleNP = (npIndex) => addCommand(String(3 + Number(npIndex)));

  const performChoice = (choice) => {
    const { servantIndex, skillIndex, targetIndex } = choiceState;
    const collectionNo = team?.[servantIndex]?.collectionNo ? Number(team[servantIndex].collectionNo) : null;

    // Determine if this skill uses the special 2-choice-with-target format (e.g. collection 373, skill 2)
    const isTwoChoiceWithTarget = (collectionNo === 373 && skillIndex === 2);

    // Map user's choice (1/2/3) into the internal code expected by generateChoiceCommand
    // Code format: <choice><optionsCount> — e.g. 22 means choice 2 of 2, 33 means choice 3 of 3
    const optionsCount = isTwoChoiceWithTarget ? 2 : 3;
    const choiceCode = Number(`${choice}${optionsCount}`);

    let cmd;
    if (isTwoChoiceWithTarget && targetIndex !== null) {
      // generateChoiceTargetCommand expects a 1-based target index and outputs the parenthesized form
      cmd = generateChoiceTargetCommand(servantIndex, skillIndex, choiceCode, targetIndex + 1);
    } else {
      // For the general case use generateChoiceCommand; it will append a target if provided
      cmd = generateChoiceCommand(servantIndex, skillIndex, choiceCode, targetIndex);
    }

    addCommand(cmd);
    setChoiceState({ open: false, servantIndex: null, skillIndex: null, targetIndex: null });
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  return (
    <div className="two-team-view">
      <div className="three-column-layout">
        <div className="left-full-team">
          <Typography variant="h6" gutterBottom>Team (Select Source)</Typography>
          <div className="full-team-grid">
            {team.map((servantObj, index) => {
              const servant = servants.find(s => String(s.collectionNo) === String(servantObj.collectionNo));
              const isSelected = selectedSource === index;
              return (
                <div key={index} className={`team-servant-slot ${isSelected ? 'selected-source' : ''}`} onClick={() => handleSourceClick(index)} role="button" tabIndex={0}>
                  <div style={{ position: 'relative' }}>
                    <ServantAvatar
                      servantFace={servant?.extraAssets?.faces?.ascension?.['4']}
                      bgType={servant?.noblePhantasms?.[0]?.card}
                      tagType={servant?.noblePhantasms?.[0]?.effectFlags?.[0]}
                    />
                    <IconButton size="small" aria-label={`Edit slot ${index + 1}`} sx={{ position: 'absolute', top: 6, right: 6 }} onClick={(e) => openEditorFor(index, e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="center-menu">
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <div className="skill-buttons-grid">
            {[1,2,3].map(si => (
              <Tooltip key={si} title={`Use skill ${si}`} enterDelay={300}>
                <Button variant="outlined" onClick={() => handleSkillClick(si)} disabled={selectedSource === null || !(team[selectedSource] && team[selectedSource].collectionNo)} className="skill-button">Skill {si}</Button>
              </Tooltip>
            ))}
          </div>
          <div className="menu-controls">
            <Typography variant="subtitle2" gutterBottom style={{ marginTop: '1rem' }}>Selection: {selectedSource !== null ? `Source: ${selectedSource + 1}` : 'No source'}{selectedTarget !== null ? `, Target: ${selectedTarget + 1}` : ''}</Typography>
          </div>
        </div>

        <div className="right-preview">
          <Typography variant="h6" gutterBottom>Targets (First 3)</Typography>
          <div className="preview-team-grid">
            {team.slice(0,3).map((servantObj, index) => {
              const servant = servants.find(s => String(s.collectionNo) === String(servantObj.collectionNo));
              const isSelected = selectedTarget === index;
              return (
                <div key={index} className={`team-servant-slot ${isSelected ? 'selected-target' : ''}`} onClick={() => handleTargetClick(index)} role="button" tabIndex={0}>
                  <div style={{ position: 'relative' }}>
                    <ServantAvatar servantFace={servant?.extraAssets?.faces?.ascension?.['4']} bgType={servant?.noblePhantasms?.[0]?.card} tagType={servant?.noblePhantasms?.[0]?.effectFlags?.[0]} />
                    <IconButton size="small" aria-label={`Edit slot ${index + 1}`} sx={{ position: 'absolute', top: 6, right: 6 }} onClick={(e) => openEditorFor(index, e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <MysticCodeCommand team={team} servants={servants} setTeam={setTeam} updateCommands={updateCommands} selectedMysticCode={selectedMysticCode} setSelectedMysticCode={setSelectedMysticCode} onSwap={(topIndex, bottomIndex) => { if (bottomIndex >= 0 && bottomIndex < 3) setSelectedSource(bottomIndex); else if (topIndex >= 0 && topIndex < 3) setSelectedSource(topIndex); }} />
          </div>
        </div>
      </div>

      {/* Inline Choice bar (renders only when a choice skill was triggered) */}
      {choiceState.open && (
        <Box sx={{ mt: 2, p: 1, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Choose option:</Typography>
          <Button variant="outlined" onClick={() => performChoice(1)}>Choice 1</Button>
          <Button variant="outlined" onClick={() => performChoice(2)}>Choice 2</Button>
          <Button variant="outlined" onClick={() => performChoice(3)}>Choice 3</Button>
          <Button onClick={() => setChoiceState({ open: false, servantIndex: null, skillIndex: null, targetIndex: null })}>Cancel</Button>
        </Box>
      )}

      <div className="general-commands">
        <Typography variant="h6" align="center" gutterBottom>General Commands</Typography>
        <div className="general-commands-row">
          <Tooltip title="End the current turn" enterDelay={300}>
            <Button variant="contained" onClick={handleEndTurn} className="general-command-button" aria-label="End Turn">End Turn</Button>
          </Tooltip>
          {[1,2,3].map(npIndex => (
            <Tooltip key={npIndex} title={`Use NP ${npIndex}`} enterDelay={300}>
              <Button variant="outlined" onClick={() => handleNP(npIndex)} className="general-command-button" aria-label={`NP ${npIndex}`}>NP {npIndex}</Button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SourceTargetCommandInput;