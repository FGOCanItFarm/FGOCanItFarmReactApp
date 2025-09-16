/* CommandInputPage.js - Enhanced command input page with editable commands and validation
 * UI Changes: Added editable command area, paste/normalize behavior, token validation, and improved layout
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Button, Grid, Typography, Box, Container, Modal, TextField, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, ContentPaste, Check, Clear, Warning } from '@mui/icons-material';
import CommandInputMenu from './CommandInputMenu';
import TeamSection from './TeamSection';
import MysticCodeCommand from './MysticCodeCommand';
import SelectedServantDetails from './SelectedServantDetails';
import { useNavigate } from 'react-router-dom';
import '../CommandInputPage.css';
import '../ui-vars.css';

const CommandInputPage = ({ team, servants, setTeam, activeServant, setActiveServant, commands, setCommands, selectedQuest, selectedMysticCode, setSelectedMysticCode, handleSubmit, openModal, handleOpenModal, handleCloseModal, updateServantEffects }) => {
  const navigate = useNavigate();
  const [isEditingCommands, setIsEditingCommands] = useState(false);
  const [editCommandText, setEditCommandText] = useState('');
  const [invalidTokens, setInvalidTokens] = useState([]);

  // Known valid tokens for validation
  const validTokens = useMemo(() => new Set([
    // Skill tokens (a-i)
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    // Skill with targets (a1-i3)
    ...Array.from({length: 9}, (_, i) => String.fromCharCode(97 + i)).flatMap(letter => 
      [1, 2, 3].map(num => `${letter}${num}`)
    ),
    // Choice commands with square brackets
    ...Array.from({length: 9}, (_, i) => String.fromCharCode(97 + i)).flatMap(letter => [
      `${letter}[Ch2A]`, `${letter}[Ch2B]`, `${letter}[Ch3A]`, `${letter}[Ch3B]`, `${letter}[Ch3C]`,
      `${letter}([Ch2A]1)`, `${letter}([Ch2A]2)`, `${letter}([Ch2A]3)`,
      `${letter}([Ch2B]1)`, `${letter}([Ch2B]2)`, `${letter}([Ch2B]3)`,
      `${letter}([Ch3A]1)`, `${letter}([Ch3A]2)`, `${letter}([Ch3A]3)`,
      `${letter}([Ch3B]1)`, `${letter}([Ch3B]2)`, `${letter}([Ch3B]3)`,
      `${letter}([Ch3C]1)`, `${letter}([Ch3C]2)`, `${letter}([Ch3C]3)`
    ]),
    // NP tokens
    '4', '5', '6',
    // End turn
    '#',
    // Mystic code tokens
    'j', 'j1', 'j2', 'j3', 'k', 'k1', 'k2', 'k3', 'l', 'l1', 'l2', 'l3',
    // Swap tokens (x followed by two digits)
    ...Array.from({length: 3}, (_, i) => 
      Array.from({length: 3}, (_, j) => `x${i+1}${j+1}`)
    ).flat()
  ]), []);

  const handleTeamServantClick = (index) => {
    setActiveServant(index);
  };

  const handleEffectChange = (field, value) => {
    const updatedTeam = team.map((servant, index) => {
      if (index === activeServant) {
        return { ...servant, [field]: value };
      }
      return servant;
    });
    setTeam(updatedTeam);
  };

  // Enhanced command editing functionality
  const handleEditCommands = useCallback(() => {
    setEditCommandText(commands.join(' '));
    setIsEditingCommands(true);
  }, [commands]);

  const handleSaveCommands = useCallback(() => {
    const tokens = parseCommandText(editCommandText);
    const invalid = tokens.filter(token => !validTokens.has(token));
    setInvalidTokens(invalid);
    
    if (invalid.length === 0) {
      setCommands(tokens);
      setIsEditingCommands(false);
    }
  }, [editCommandText, validTokens, setCommands]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingCommands(false);
    setEditCommandText('');
    setInvalidTokens([]);
  }, []);

  const handlePasteCommands = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const normalizedText = normalizeCommandText(text);
      setEditCommandText(normalizedText);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, []);

  const parseCommandText = useCallback((text) => {
    // Handle both space-separated and comma-separated formats
    return text
      .replace(/,/g, ' ')  // Convert commas to spaces
      .split(/\s+/)        // Split on whitespace
      .filter(token => token.length > 0)  // Remove empty tokens
      .map(token => token.trim());  // Trim whitespace
  }, []);

  const normalizeCommandText = useCallback((text) => {
    const tokens = parseCommandText(text);
    return tokens.join(' ');  // Always display as space-separated
  }, [parseCommandText]);

  const handleDeleteToken = useCallback((index) => {
    const newCommands = [...commands];
    newCommands.splice(index, 1);
    setCommands(newCommands);
  }, [commands, setCommands]);

  const renderCommandChips = useMemo(() => (
    <Box className="command-chips-container" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2 }}>
      {commands.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No commands yet. Use the command menu below to add commands.
        </Typography>
      ) : (
        commands.map((command, index) => (
          <Chip
            key={index}
            label={command}
            onDelete={() => handleDeleteToken(index)}
            deleteIcon={<Clear />}
            variant={validTokens.has(command) ? "filled" : "outlined"}
            color={validTokens.has(command) ? "primary" : "error"}
            size="small"
            sx={{ fontFamily: 'monospace' }}
          />
        ))
      )}
    </Box>
  ), [commands, validTokens, handleDeleteToken]);

  return (
    <Container className="command-input-container">
      <Typography variant="h4">Team</Typography>
      
      {/* Team and Mystic Code Grid */}
      <Box className="command-input-grid fgo-grid" sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 3 
      }}>
        <Box className="team-section">
          <TeamSection
            team={team}
            servants={servants}
            activeServant={activeServant}
            handleTeamServantClick={handleTeamServantClick}
            updateServantEffects={updateServantEffects}
            pageType="command-input-page"
          />
        </Box>
        <Box className="mystic-code-section">
          <MysticCodeCommand
            team={team}
            setTeam={setTeam}
            updateCommands={setCommands}
            selectedMysticCode={selectedMysticCode}
            setSelectedMysticCode={setSelectedMysticCode}
          />
        </Box>
      </Box>

      {/* Enhanced Command Input Menu */}
      <Box className="command-input-menu">
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <CommandInputMenu updateCommands={setCommands} team={team} activeServant={activeServant} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <SelectedServantDetails servant={team[activeServant]} handleEffectChange={handleEffectChange} />
          </Grid>
        </Grid>
      </Box>

      {/* Enhanced Commands Display */}
      <Box className="commands-section fgo-card" sx={{ mt: 4 }}>
        <Box className="commands-header" sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6" className="fgo-font-bold">Commands</Typography>
          <Box className="command-actions">
            <Tooltip title="Paste from clipboard">
              <IconButton onClick={handlePasteCommands} size="small">
                <ContentPaste />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit commands manually">
              <IconButton onClick={handleEditCommands} size="small">
                <Edit />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Command Edit Mode */}
        {isEditingCommands ? (
          <Box className="command-edit-mode">
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editCommandText}
              onChange={(e) => setEditCommandText(e.target.value)}
              placeholder="Enter commands separated by spaces or commas (e.g., 'a b c #' or 'a,b,c,#')"
              sx={{ mb: 2 }}
              error={invalidTokens.length > 0}
              helperText={invalidTokens.length > 0 ? `Invalid tokens: ${invalidTokens.join(', ')}` : 'Space-separated or comma-separated tokens'}
            />
            <Box className="edit-actions" sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Check />}
                onClick={handleSaveCommands}
                disabled={invalidTokens.length > 0}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="text"
                startIcon={<ContentPaste />}
                onClick={handlePasteCommands}
              >
                Paste
              </Button>
            </Box>
            {invalidTokens.length > 0 && (
              <Box sx={{ mt: 1, p: 1, backgroundColor: 'var(--color-command-invalid)', borderRadius: 1 }}>
                <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning fontSize="small" />
                  Invalid tokens found. Please correct them before saving.
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          /* Command Display Mode */
          <Box className="command-display-mode">
            {renderCommandChips}
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box className="action-buttons" sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => setCommands([])}
          className="fgo-button"
        >
          Clear Commands
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenModal}
          className="fgo-button"
        >
          Submit Team
        </Button>
      </Box>

      {/* Submit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box className="fgo-card" sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '70%', md: '50%' },
          maxHeight: '80vh',
          overflow: 'auto',
          p: 4
        }}>
          <Typography variant="h6" className="fgo-font-bold" sx={{ mb: 2 }}>
            Confirm Submission
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Team:</strong> {JSON.stringify(team, null, 2)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Mystic Code ID:</strong> {selectedMysticCode}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Quest ID:</strong> {selectedQuest?.id}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Commands:</strong> <code>{commands.join(' ')}</code>
          </Typography>
          <Box className="modal-actions" sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              className="fgo-button"
            >
              Confirm
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleCloseModal}
              className="fgo-button"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default CommandInputPage;