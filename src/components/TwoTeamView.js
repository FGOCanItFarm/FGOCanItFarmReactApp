import React, { useState } from 'react';
import { Button, Typography, Tooltip, Modal, Box } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import MysticCodeCommand from './MysticCodeCommand';
import '../ui-vars.css';
import { ChoiceSelector } from './CommandInputMenu';

// Import command generation functions to preserve existing APIs
const generateSkillCommand = (servantIndex, skillIndex, targetIndex = null) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  if (targetIndex !== null) {
    command += `${targetIndex + 1}`;
  }
  return command || `Skill ${skillIndex}`;
};

// Preserved for API compatibility - may be used in future
// const generateChoiceCommand = (servantIndex, skillIndex, choice, targetIndex = null) => {
//   const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
//   let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
//   switch (choice) {
//     case 12: command += `[Ch2A]`; break;
//     case 22: command += `[Ch2B]`; break;
//     case 13: command += `[Ch3A]`; break;
//     case 23: command += `[Ch3B]`; break;
//     case 33: command += `[Ch3C]`; break;
//     default: break;
//   }
//   if (targetIndex !== null) {
//     command += `${targetIndex + 1}`;
//   }
//   return command || `Skill ${skillIndex} Choice ${choice}`;
// };

// const generateChoiceTargetCommand = (servantIndex, skillIndex, choice, targetIndex) => {
//   const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
//   let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
//   switch (choice) {
//     case 12: command += `([Ch2A]${targetIndex})`; break;
//     case 22: command += `([Ch2B]${targetIndex})`; break;
//     case 13: command += `([Ch3A]${targetIndex})`; break;
//     case 23: command += `([Ch3B]${targetIndex})`; break;
//     case 33: command += `([Ch3C]${targetIndex})`; break;
//     default: break;
//   }
//   return command;
// };

const TwoTeamView = ({ team, servants, setTeam = () => {}, selectedMysticCode, setSelectedMysticCode, addCommand, updateCommands }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [choiceModal, setChoiceModal] = useState({ open: false, servantIndex: null, skillIndex: null, targetIndex: null });

  const handleSourceClick = (index) => {
    // Only allow selecting a source if that slot has a servant assigned.
    const hasCollection = Boolean(team[index]?.collectionNo);
    if (hasCollection) {
      setSelectedSource(index);
    } else {
      // If user clicked an empty slot, clear any existing selection instead of selecting it.
      setSelectedSource(null);
    }
  };

  const handleTargetClick = (index) => {
    setSelectedTarget(index);
  };

  const handleSkillClick = (skillIndex) => {
    if (selectedSource !== null) {
      // Guard: ensure the selected source slot actually has a servant with a collectionNo
      const sourceServant = team[selectedSource] && team[selectedSource].collectionNo ? servants.find(s => s.collectionNo === team[selectedSource].collectionNo) : null;
      if (!sourceServant) {
        // No servant in the selected source slot — ignore the skill click to avoid generating commands for empty slots.
        return;
      }

      // Some servants/skills are choice-based. We'll detect that by checking
      // the collectionNo and skillIndex against known choice mappings. If it
      // looks like a choice skill, open a modal with options via ChoiceSelector.
      const collectionNo = sourceServant.collectionNo;
      const isChoice = (() => {
        // Mirror the mapping in CommandInputMenu.renderButtonsForServant
        switch (collectionNo) {
          case 373:
            // 373: skill 1 and 3 are choice-style; skill 2 uses 2-choice-with-target layout
            return (skillIndex === 1 || skillIndex === 3);
          case 428:
            return skillIndex === 1;
          case 268:
            return skillIndex === 2;
          case 421:
          case 11:
          case 391:
          case 424:
          case 425:
          case 414:
          case 259:
            return skillIndex === 3;
          default:
            return false;
        }
      })();

      if (isChoice) {
        setChoiceModal({ open: true, servantIndex: selectedSource, skillIndex, targetIndex: selectedTarget });
      } else {
        const command = generateSkillCommand(selectedSource, skillIndex, selectedTarget);
        addCommand(command);
        // Reset selection after using skill
        setSelectedSource(null);
        setSelectedTarget(null);
      }
    }
  };

  const handleEndTurn = () => {
    addCommand('z');
  };

  const handleNP = (npIndex) => {
    // NP buttons should emit tokens 4,5,6 (one-based) rather than 'n1','n2','n3'
    const token = String(3 + Number(npIndex)); // 1->4, 2->5, 3->6
    addCommand(token);
  };

  const mysticCodeNames = {
    410: 'Winter Casual',
    210: 'Chaldea Uniform - Decisive Battle',
    100: 'A Fragment of 2004',
    40: 'Atlas Institute Uniform',
    20: 'Chaldea Combat Uniform'
  };

  return (
    <div className="two-team-view">
      {/* Three-column layout */}
      <div className="three-column-layout">
        {/* Left: Full 6-unit team */}
        <div className="left-full-team">
          <Typography variant="h6" gutterBottom>Team (Select Source)</Typography>
          <div className="full-team-grid">
            {team.map((servantObj, index) => {
              const servant = servants.find(s => s.collectionNo === servantObj.collectionNo);
              const isSelected = selectedSource === index;
              
              return (
                <div
                  key={index}
                  className={`team-servant-slot ${isSelected ? 'selected-source' : ''}`}
                  onClick={() => handleSourceClick(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={servant ? `Select ${servant.name} as source (position ${index + 1})` : `Select empty slot ${index + 1} as source`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSourceClick(index);
                    }
                  }}
                >
                        {servant ? (
                          <ServantAvatar
                            servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                            bgType={servant.noblePhantasms?.[0]?.card}
                            tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
                          />
                        ) : (
                          <ServantAvatar
                            bgType={null}
                            tagType={null}
                          />
                        )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Menu options */}
        <div className="center-menu">
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <div className="skill-buttons-grid">
            {[1, 2, 3].map(skillIndex => (
              <Tooltip
                key={skillIndex}
                title={`Use skill ${skillIndex} ${selectedSource !== null ? `from servant ${selectedSource + 1}` : '(select source first)'}`}
                enterDelay={300}
              >
                <Button
                  variant="outlined"
                  onClick={() => handleSkillClick(skillIndex)}
                  disabled={
                    // disabled if no source selected or the selected slot lacks a servant
                    selectedSource === null || !(team[selectedSource] && team[selectedSource].collectionNo)
                  }
                  className="skill-button"
                  aria-label={`Skill ${skillIndex}`}
                >
                  Skill {skillIndex}
                </Button>
              </Tooltip>
            ))}
          </div>
          
          <div className="menu-controls">
            <Typography variant="subtitle2" gutterBottom style={{ marginTop: '1rem' }}>
              Selection: {selectedSource !== null ? `Source: ${selectedSource + 1}` : 'No source'} 
              {selectedTarget !== null ? `, Target: ${selectedTarget + 1}` : ''}
            </Typography>
          </div>
        </div>

        {/* Right: Preview (first 3 units) */}
        <div className="right-preview">
          <Typography variant="h6" gutterBottom>Targets (First 3)</Typography>
          <div className="preview-team-grid">
            {team.slice(0, 3).map((servantObj, index) => {
              const servant = servants.find(s => s.collectionNo === servantObj.collectionNo);
              const isSelected = selectedTarget === index;
              
              return (
                <div
                  key={index}
                  className={`team-servant-slot ${isSelected ? 'selected-target' : ''}`}
                  onClick={() => handleTargetClick(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={servant ? `Select ${servant.name} as target (position ${index + 1})` : `Select empty slot ${index + 1} as target`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTargetClick(index);
                    }
                  }}
                >
                  {servant ? (
                    <ServantAvatar
                      servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                      bgType={servant.noblePhantasms?.[0]?.card}
                      tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
                    />
                  ) : (
                    <div className="empty-slot">
                      <Typography variant="caption">{index + 1}</Typography>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mystic Code selector now shown under Targets */}
          <div style={{ marginTop: '1rem' }}>
              <MysticCodeCommand
                team={team}
                setTeam={setTeam}
                updateCommands={updateCommands}
                selectedMysticCode={selectedMysticCode}
                setSelectedMysticCode={setSelectedMysticCode}
                onSwap={(topIndex, bottomIndex) => {
                  // If the swap brings a servant into the front 3 (indices 0-2), select it as source
                  // For example swapping bottomIndex -> topIndex where bottomIndex < 3 means a unit entered the field
                  // We will prefer selecting the index that now contains the previously-bottom servant if it's in 0-2
                  if (bottomIndex >= 0 && bottomIndex < 3) {
                    setSelectedSource(bottomIndex);
                  } else if (topIndex >= 0 && topIndex < 3) {
                    setSelectedSource(topIndex);
                  }
                }}
              />
          </div>
        </div>
      </div>

      {/* General commands (below, centered) */}
      <div className="general-commands">
        <Typography variant="h6" align="center" gutterBottom>General Commands</Typography>
        <div className="general-commands-row">
          <Tooltip title="End the current turn" enterDelay={300}>
            <Button
              variant="contained"
              onClick={handleEndTurn}
              className="general-command-button"
              aria-label="End Turn"
            >
              End Turn
            </Button>
          </Tooltip>
          {[1, 2, 3].map(npIndex => (
            <Tooltip key={npIndex} title={`Use NP ${npIndex}`} enterDelay={300}>
              <Button
                variant="outlined"
                onClick={() => handleNP(npIndex)}
                className="general-command-button"
                aria-label={`NP ${npIndex}`}
              >
                NP {npIndex}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>
      {/* Choice modal for skills that require selecting one of multiple options */}
      <Modal open={choiceModal.open} onClose={() => setChoiceModal({ open: false })}>
        <Box p={2} bgcolor="white" style={{ margin: 'auto', marginTop: '10%', width: '80%', maxWidth: '600px' }}>
          <Typography variant="h6">Choose Skill Option</Typography>
          {choiceModal.open && (
            <ChoiceSelector
              servantIndex={choiceModal.servantIndex}
              skillIndex={choiceModal.skillIndex}
              addCommand={(cmd) => {
                addCommand(cmd);
                setChoiceModal({ open: false });
                setSelectedSource(null);
                setSelectedTarget(null);
              }}
              team={team}
              isDisabled={false}
            />
          )}
          <Box mt={2}>
            <Button variant="outlined" onClick={() => setChoiceModal({ open: false })}>Cancel</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default TwoTeamView;