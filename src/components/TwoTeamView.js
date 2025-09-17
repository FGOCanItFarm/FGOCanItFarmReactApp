import React, { useState } from 'react';
import { Box, Button, Typography, Grid, Tooltip } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import '../ui-vars.css';

// Import command generation functions to preserve existing APIs
const generateSkillCommand = (servantIndex, skillIndex, targetIndex = null) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  if (targetIndex !== null) {
    command += `${targetIndex + 1}`;
  }
  return command || `Skill ${skillIndex}`;
};

const generateChoiceCommand = (servantIndex, skillIndex, choice, targetIndex = null) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  switch (choice) {
    case 12: command += `[Ch2A]`; break;
    case 22: command += `[Ch2B]`; break;
    case 13: command += `[Ch3A]`; break;
    case 23: command += `[Ch3B]`; break;
    case 33: command += `[Ch3C]`; break;
    default: break;
  }
  if (targetIndex !== null) {
    command += `${targetIndex + 1}`;
  }
  return command || `Skill ${skillIndex} Choice ${choice}`;
};

const generateChoiceTargetCommand = (servantIndex, skillIndex, choice, targetIndex) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  switch (choice) {
    case 12: command += `([Ch2A]${targetIndex})`; break;
    case 22: command += `([Ch2B]${targetIndex})`; break;
    case 13: command += `([Ch3A]${targetIndex})`; break;
    case 23: command += `([Ch3B]${targetIndex})`; break;
    case 33: command += `([Ch3C]${targetIndex})`; break;
    default: break;
  }
  return command;
};

const TwoTeamView = ({ team, servants, selectedMysticCode, addCommand }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const handleSourceClick = (index) => {
    setSelectedSource(index);
  };

  const handleTargetClick = (index) => {
    setSelectedTarget(index);
  };

  const handleSkillClick = (skillIndex) => {
    if (selectedSource !== null) {
      const command = generateSkillCommand(selectedSource, skillIndex, selectedTarget);
      addCommand(command);
      // Reset selection after using skill
      setSelectedSource(null);
      setSelectedTarget(null);
    }
  };

  const handleEndTurn = () => {
    addCommand('z');
  };

  const handleNP = (npIndex) => {
    addCommand(`n${npIndex}`);
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
      {/* Mystic Code Section (above, centered) */}
      <div className="mystic-code-center">
        <Typography variant="h6" align="center" gutterBottom>
          Mystic Code: {selectedMysticCode ? mysticCodeNames[selectedMysticCode] || `ID: ${selectedMysticCode}` : 'None'}
        </Typography>
      </div>

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
                    <div className="empty-slot">
                      <Typography variant="caption">{index + 1}</Typography>
                    </div>
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
                  disabled={selectedSource === null}
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
    </div>
  );
};

export default TwoTeamView;