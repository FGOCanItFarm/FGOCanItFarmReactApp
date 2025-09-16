/* CommandInputMenu.js - Redesigned FGO-style 3-column command input interface
 * UI Changes: Converted to 3-column layout with active servant card, skill groups, and contextual commands
 * Added command preview, test mode toggle, contextual choice flows, and accessibility features
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Button, Typography, Grid, Tooltip, IconButton, Switch, FormControlLabel, Modal, Paper } from '@mui/material';
import { Visibility, VisibilityOff, Undo, Redo, Edit, Delete } from '@mui/icons-material';
import '../CommandInputMenu.css';
import '../ui-vars.css';

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

const renderSkillButtons = (servantIndex, skillIndex, addCommand, team, isDisabled) => (
  <Box className="skill-buttons">
    <Grid container direction="column">
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 0))}
        title={`On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        S1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 1))}
        title={`On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        S2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 2))}
        title={`On Servant 3 (${team[2]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        S3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex))}
        title="No Target"
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        None
      </Button>
    </Grid>
  </Box>
);

const renderChoiceButtons = (servantIndex, skillIndex, addCommand, team, isDisabled) => (
  <Box className="choice-skill-buttons">
    <Grid container direction="column">
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 12))}
        title={`Choice 1 | 2 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|2 on Servant 1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))}
        title={`Choice 2 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|2 on Servant 2
      </Button>
            <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))}
        title={`Choice 2 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|2 on Servant 3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 12))}
        title={`Choice 1 | 2 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|2 on Servant 1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))}
        title={`Choice 2 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|2 on Servant 2
      </Button>
            <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))}
        title={`Choice 2 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|2 on Servant 3
      </Button>

      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 11))}
        title={`Choice 1 | 3 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|3 on Servant 1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 12))}
        title={`Choice 1 | 3 On Servant 2 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|3 on Servant 2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 13))}
        title={`Choice 1 | 3 On Servant 3 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|3 on Servant 3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 21))}
        title={`Choice 2 | 3 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|3 on Servant 1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))}
        title={`Choice 2 | 3 On Servant 2 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|3 on Servant 2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 23))}
        title={`Choice 2 | 3 On Servant 3 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|3 on Servant 3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 31))}
        title={`Choice 3 | 3 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C3|3 on Servant 1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 32))}
        title={`Choice 3 | 3 On Servant 2 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C3|3 on Servant 2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 33))}
        title={`Choice 3 | 3 On Servant 3 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C3|3 on Servant 3
      </Button>

    </Grid>
  </Box>
);

const render2ChoiceTargetButtons = (servantIndex, skillIndex, addCommand, team, isDisabled) => (
  <Box className="choice-skill-buttons">
    <Grid container direction="column">
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 1))}
        title={`Choice 1 | 2 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|2 S1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 2))}
        title={`Choice 1 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|2 S2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 3))}
        title={`Choice 1 | 2 On Servant 3 (${team[2]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C1|2 S3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 1))}
        title={`Choice 2 | 2 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|2 S1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 2))}
        title={`Choice 2 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|2 S2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 3))}
        title={`Choice 2 | 2 On Servant 3 (${team[2]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
        disabled={isDisabled}
      >
        C2|2 S3
      </Button>
    </Grid>
  </Box>
);

const renderButtonsForServant = (servantIndex, skillIndex, collectionNo, addCommand, team, isDisabled) => {
  let buttons = renderSkillButtons(servantIndex, skillIndex, addCommand, team, isDisabled);
  
  switch (collectionNo) {
    case 373:
      if (skillIndex === 1 || skillIndex === 3) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team, isDisabled);
      } else {
        buttons = render2ChoiceTargetButtons(servantIndex, skillIndex, addCommand, team, isDisabled);
      }
      break;
    case 428:
      if (skillIndex === 1) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team, isDisabled);
      }
      break;
    case 268:
      if (skillIndex === 2) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team, isDisabled);
      }
      break;
    case 421:
    case 11:
    case 391:
    case 424:
    case 425:
    case 414:
    case 259:
      if (skillIndex === 3) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team, isDisabled);
      }
      break;
    default:
      break;
  }

  return buttons;
};

const CommandInputMenu = ({ activeServant, updateCommands, team }) => {
  const [commandPreview, setCommandPreview] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [testCommands, setTestCommands] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [currentChoice, setCurrentChoice] = useState(null);
  const [hoveredToken, setHoveredToken] = useState('');

  const isDisabled = activeServant >= 3; // Disable buttons for servants in row 2 (index 3, 4, 5)
  const activeServantData = team[activeServant];

  // Memoize the command functions to prevent unnecessary re-renders
  const addCommand = useCallback((command) => {
    const newCommands = testMode ? 
      [...testCommands, command] : 
      [...(commandHistory[historyIndex] || []), command];
    
    if (testMode) {
      setTestCommands(newCommands);
    } else {
      updateCommands(newCommands);
      setCommandHistory(prev => [...prev.slice(0, historyIndex + 1), newCommands]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [testMode, testCommands, commandHistory, historyIndex, updateCommands]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      updateCommands(commandHistory[historyIndex - 1]);
    }
  }, [historyIndex, commandHistory, updateCommands]);

  const handleRedo = useCallback(() => {
    if (historyIndex < commandHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      updateCommands(commandHistory[historyIndex + 1]);
    }
  }, [historyIndex, commandHistory, updateCommands]);

  const clearTestCommands = useCallback(() => {
    setTestCommands([]);
  }, []);

  // Enhanced choice handling for contextual flows
  const handleChoiceClick = useCallback((servantIndex, skillIndex, collectionNo) => {
    setCurrentChoice({ servantIndex, skillIndex, collectionNo });
    setShowChoiceModal(true);
  }, []);

  const closeChoiceModal = useCallback(() => {
    setShowChoiceModal(false);
    setCurrentChoice(null);
  }, []);

  // Render active servant card (left column)
  const renderActiveServantCard = useMemo(() => (
    <Box className="fgo-card active-servant-card">
      <Typography variant="h6" className="fgo-font-bold">
        {activeServantData?.name || `Position ${activeServant + 1}`}
      </Typography>
      {activeServantData && (
        <>
          <Box className="servant-avatar-section" sx={{ textAlign: 'center', mb: 2 }}>
            {/* Placeholder for servant image */}
            <Box sx={{ 
              width: 80, 
              height: 80, 
              backgroundColor: 'var(--color-surface-variant)', 
              borderRadius: '50%',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="caption">IMG</Typography>
            </Box>
          </Box>
          <Box className="np-skills-section">
            <Typography variant="subtitle2" className="fgo-font-medium">NP & Skills</Typography>
            <Box className="fgo-flex" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {/* NP Icon placeholder */}
              <Box sx={{ 
                width: 40, 
                height: 40, 
                backgroundColor: 'var(--color-primary)', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>NP</Typography>
              </Box>
              {/* Skill icons placeholders */}
              {[1, 2, 3].map(skill => (
                <Box key={skill} sx={{ 
                  width: 40, 
                  height: 40, 
                  backgroundColor: 'var(--color-secondary)', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>{skill}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  ), [activeServant, activeServantData]);

  return (
    <Box className="command-input-redesign" sx={{ minHeight: 'var(--command-panel-min-height)' }}>
      {/* Header with Test Mode Toggle and Command Preview */}
      <Box className="command-header fgo-flex" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" className="fgo-font-bold">
          Command Input
        </Typography>
        <Box className="fgo-flex" sx={{ alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                size="small"
              />
            }
            label="Test Mode"
            sx={{ mr: 2 }}
          />
          <Tooltip title="Undo">
            <IconButton 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              size="small"
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton 
              onClick={handleRedo} 
              disabled={historyIndex >= commandHistory.length - 1}
              size="small"
            >
              <Redo />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Command Preview */}
      {(commandPreview || hoveredToken) && (
        <Box className="command-preview fgo-card" sx={{ 
          backgroundColor: 'var(--color-command-preview)', 
          mb: 2, 
          p: 1 
        }}>
          <Typography variant="caption" className="fgo-font-medium">
            Preview: <code>{commandPreview || hoveredToken}</code>
          </Typography>
        </Box>
      )}

      {/* Test Mode Panel */}
      {testMode && (
        <Box className="test-mode-panel fgo-card" sx={{ mb: 2, p: 2 }}>
          <Box className="fgo-flex" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" className="fgo-font-medium">Test Sandbox</Typography>
            <Button size="small" onClick={clearTestCommands} variant="outlined">
              Clear
            </Button>
          </Box>
          <Box component="pre" sx={{ 
            backgroundColor: 'var(--color-surface)', 
            p: 1, 
            borderRadius: 1, 
            fontSize: 'var(--font-size-sm)',
            minHeight: 40,
            overflow: 'auto'
          }}>
            {testCommands.length > 0 ? testCommands.join(' ') : 'No test commands'}
          </Box>
        </Box>
      )}

      {/* Main 3-column layout */}
      <Grid container spacing={2} className="command-main-grid">
        {/* Left Column: Active Servant Card */}
        <Grid item xs={12} md={4}>
          {renderActiveServantCard}
        </Grid>

        {/* Center Column: Skill Groups */}
        <Grid item xs={12} md={4}>
          <Box className="skill-groups-section">
            <Typography variant="h6" className="fgo-font-medium" sx={{ mb: 2 }}>
              Skills
            </Typography>
            {[1, 2, 3].map((skillIndex) => (
              <Box key={`skill-${skillIndex}`} className="skill-group fgo-card" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 1 }}>
                  Skill {skillIndex}
                </Typography>
                <Box className="skill-buttons-container">
                  {/* All button */}
                  <Tooltip title={`Skill ${skillIndex} - Token: ${generateSkillCommand(activeServant, skillIndex)}`}>
                    <Button
                      className={`fgo-button servant-${activeServant + 1}`}
                      size="small"
                      onMouseEnter={() => setHoveredToken(generateSkillCommand(activeServant, skillIndex))}
                      onMouseLeave={() => setHoveredToken('')}
                      onClick={() => addCommand(generateSkillCommand(activeServant, skillIndex))}
                      disabled={isDisabled}
                      aria-label={`Use Skill ${skillIndex} - Token: ${generateSkillCommand(activeServant, skillIndex)}`}
                      sx={{ mb: 1, mr: 1 }}
                    >
                      All
                    </Button>
                  </Tooltip>
                  
                  {/* Target buttons S1/S2/S3 */}
                  {[0, 1, 2].map(targetIndex => (
                    <Tooltip 
                      key={targetIndex}
                      title={`Skill ${skillIndex} on Servant ${targetIndex + 1} - Token: ${generateSkillCommand(activeServant, skillIndex, targetIndex)}`}
                    >
                      <Button
                        className={`fgo-button servant-${activeServant + 1}`}
                        size="small"
                        onMouseEnter={() => setHoveredToken(generateSkillCommand(activeServant, skillIndex, targetIndex))}
                        onMouseLeave={() => setHoveredToken('')}
                        onClick={() => addCommand(generateSkillCommand(activeServant, skillIndex, targetIndex))}
                        disabled={isDisabled}
                        aria-label={`Use Skill ${skillIndex} on Servant ${targetIndex + 1} - Token: ${generateSkillCommand(activeServant, skillIndex, targetIndex)}`}
                        sx={{ mb: 1, mr: 1 }}
                      >
                        S{targetIndex + 1}
                      </Button>
                    </Tooltip>
                  ))}

                  {/* Choice button if applicable */}
                  {shouldShowChoiceButton(activeServantData?.collectionNo, skillIndex) && (
                    <Tooltip title={`Skill ${skillIndex} has choices - Click to select`}>
                      <Button
                        className="fgo-button choice-button"
                        size="small"
                        variant="outlined"
                        onClick={() => handleChoiceClick(activeServant, skillIndex, activeServantData?.collectionNo)}
                        disabled={isDisabled}
                        sx={{ mb: 1 }}
                      >
                        Choices
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right Column: Contextual Commands */}
        <Grid item xs={12} md={4}>
          <Box className="contextual-commands-section">
            <Typography variant="h6" className="fgo-font-medium" sx={{ mb: 2 }}>
              Commands
            </Typography>
            
            {/* NP Commands */}
            <Box className="command-group fgo-card" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 1 }}>
                Noble Phantasm
              </Typography>
              {[4, 5, 6].map((npToken, index) => (
                <Tooltip key={npToken} title={`Use NP Servant ${index + 1} - Token: ${npToken}`}>
                  <Button
                    className="fgo-button"
                    variant="contained"
                    size="small"
                    onMouseEnter={() => setHoveredToken(npToken.toString())}
                    onMouseLeave={() => setHoveredToken('')}
                    onClick={() => addCommand(npToken.toString())}
                    disabled={isDisabled}
                    aria-label={`Use NP Servant ${index + 1} - Token: ${npToken}`}
                    sx={{ mb: 1, mr: 1, width: 'calc(50% - 4px)' }}
                  >
                    NP {index + 1}
                  </Button>
                </Tooltip>
              ))}
            </Box>

            {/* General Commands */}
            <Box className="command-group fgo-card">
              <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 1 }}>
                General
              </Typography>
              <Tooltip title="End Turn - Token: #">
                <Button
                  className="fgo-button"
                  variant="contained"
                  color="secondary"
                  onMouseEnter={() => setHoveredToken('#')}
                  onMouseLeave={() => setHoveredToken('')}
                  onClick={() => addCommand('#')}
                  disabled={isDisabled}
                  aria-label="End Turn - Token: #"
                  sx={{ width: '100%' }}
                >
                  End Turn
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Choice Modal */}
      {currentChoice && (
        <Modal open={showChoiceModal} onClose={closeChoiceModal}>
          <Paper sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            p: 3,
            minWidth: 300
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Choose Option for Skill {currentChoice.skillIndex}
            </Typography>
            {renderChoiceOptions(currentChoice, addCommand, closeChoiceModal, team)}
          </Paper>
        </Modal>
      )}
    </Box>
  );
};

// Helper function to determine if a skill should show choice button
const shouldShowChoiceButton = (collectionNo, skillIndex) => {
  if (!collectionNo) return false;
  
  switch (collectionNo) {
    case 373:
      return skillIndex === 1 || skillIndex === 2 || skillIndex === 3;
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
};

// Render choice options in modal
const renderChoiceOptions = (currentChoice, addCommand, closeModal, team) => {
  const { servantIndex, skillIndex, collectionNo } = currentChoice;
  
  const handleChoiceWithTarget = (choiceType, needsTarget = false) => {
    if (!needsTarget) {
      addCommand(generateChoiceCommand(servantIndex, skillIndex, choiceType));
      closeModal();
      return;
    }
    
    // Show target selection for choice with target
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Target:
        </Typography>
        {[1, 2, 3].map(targetIndex => (
          <Tooltip key={targetIndex} title={`Choice on Servant ${targetIndex} - Token: ${generateChoiceTargetCommand(servantIndex, skillIndex, choiceType, targetIndex)}`}>
            <Button
              size="small"
              onClick={() => {
                addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, choiceType, targetIndex));
                closeModal();
              }}
              sx={{ mr: 1, mb: 1 }}
              aria-label={`Choice on Servant ${targetIndex} - Token: ${generateChoiceTargetCommand(servantIndex, skillIndex, choiceType, targetIndex)}`}
            >
              Servant {targetIndex}
            </Button>
          </Tooltip>
        ))}
      </Box>
    );
  };

  // Determine choice type based on collection number and skill
  const needsTargetChoice = collectionNo === 373 && skillIndex === 2;
  
  return (
    <Box>
      {/* Standard 2-choice buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title={`Choice 1 - Token: ${generateChoiceCommand(servantIndex, skillIndex, 12)}`}>
          <Button
            variant="outlined"
            onClick={() => handleChoiceWithTarget(12, needsTargetChoice)}
            aria-label={`Choice 1 - Token: ${generateChoiceCommand(servantIndex, skillIndex, 12)}`}
          >
            Choice 1
          </Button>
        </Tooltip>
        <Tooltip title={`Choice 2 - Token: ${generateChoiceCommand(servantIndex, skillIndex, 22)}`}>
          <Button
            variant="outlined"
            onClick={() => handleChoiceWithTarget(22, needsTargetChoice)}
            aria-label={`Choice 2 - Token: ${generateChoiceCommand(servantIndex, skillIndex, 22)}`}
          >
            Choice 2
          </Button>
        </Tooltip>
        
        {/* 3-choice option for certain servants/skills */}
        {(collectionNo === 373 && (skillIndex === 1 || skillIndex === 3)) && (
          <Tooltip title={`Choice 3 - Token: ${generateChoiceCommand(servantIndex, skillIndex, 33)}`}>
            <Button
              variant="outlined"
              onClick={() => handleChoiceWithTarget(33)}
              aria-label={`Choice 3 - Token: ${generateChoiceCommand(servantIndex, skillIndex, 33)}`}
            >
              Choice 3
            </Button>
          </Tooltip>
        )}
      </Box>
      
      {needsTargetChoice && (
        <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
          This choice requires target selection
        </Typography>
      )}
    </Box>
  );
};

export default CommandInputMenu;

