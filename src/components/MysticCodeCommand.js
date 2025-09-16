/* MysticCodeCommand.js - Enhanced mystic code interface with improved UX
 * UI Changes: Compact layout with better visual hierarchy and consistent token display
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Grid, Typography, Box, Button, Select, MenuItem, Tooltip } from '@mui/material';
import '../ui-vars.css';

const mysticCodes = [
  { id: 410, name: 'Winter Casual' },
  { id: 210, name: 'Chaldea Uniform - Decisive Battle' },
  { id: 100, name: 'A Fragment of 2004' },
  { id: 40, name: 'Atlas Institute Uniform' },
  { id: 20, name: 'Chaldea Combat Uniform' },
];

const MysticCodeCommand = ({ team, setTeam, updateCommands, selectedMysticCode, setSelectedMysticCode }) => {
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [hoveredToken, setHoveredToken] = useState('');

  const swapServants = useCallback((index1, index2) => {
    const newTeam = [...team];
    [newTeam[index1], newTeam[index2]] = [newTeam[index2], newTeam[index1]];
    setTeam(newTeam);
  }, [team, setTeam]);

  const handleSwap = useCallback(() => {
    if (selectedTop !== null && selectedBottom !== null) {
      swapServants(selectedTop, selectedBottom);
      setSelectedTop(null);
      setSelectedBottom(null);
    }
  }, [selectedTop, selectedBottom, swapServants]);

  const addCommand = useCallback((command) => {
    updateCommands((prevCommands) => [...prevCommands, command]);
  }, [updateCommands]);

  const handleMysticCodeChange = useCallback((event) => {
    setSelectedMysticCode(event.target.value);
  }, [setSelectedMysticCode]);

  const selectedMysticCodeData = useMemo(() => 
    mysticCodes.find(mc => mc.id === selectedMysticCode),
  [selectedMysticCode]);

  const renderMysticCodeButtons = useMemo(() => {
    if (!selectedMysticCode) return null;

    const isSwapMC = selectedMysticCode === 20 || selectedMysticCode === 210;
    
    return (
      <Box className="mystic-code-skills" sx={{ mt: 2 }}>
        {/* Skill 1 */}
        <Box className="skill-group fgo-card" sx={{ mb: 2, p: 2 }}>
          <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 1 }}>
            Skill 1
          </Typography>
          <Box className="skill-buttons" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[1, 2, 3].map(targetIndex => (
              <Tooltip key={targetIndex} title={`Use Skill 1 on Servant ${targetIndex} - Token: j${targetIndex}`}>
                <Button 
                  size="small" 
                  className="fgo-button"
                  onMouseEnter={() => setHoveredToken(`j${targetIndex}`)}
                  onMouseLeave={() => setHoveredToken('')}
                  onClick={() => addCommand(`j${targetIndex}`)}
                  aria-label={`Use Skill 1 on Servant ${targetIndex} - Token: j${targetIndex}`}
                  sx={{ minWidth: 40 }}
                >
                  {targetIndex}
                </Button>
              </Tooltip>
            ))}
            <Tooltip title="Use Skill 1 on Self/Team - Token: j">
              <Button 
                size="small" 
                className="fgo-button"
                variant="outlined"
                onMouseEnter={() => setHoveredToken('j')}
                onMouseLeave={() => setHoveredToken('')}
                onClick={() => addCommand('j')}
                aria-label="Use Skill 1 on Self/Team - Token: j"
              >
                Self
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Skill 2 */}
        <Box className="skill-group fgo-card" sx={{ mb: 2, p: 2 }}>
          <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 1 }}>
            Skill 2
          </Typography>
          <Box className="skill-buttons" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[1, 2, 3].map(targetIndex => (
              <Tooltip key={targetIndex} title={`Use Skill 2 on Servant ${targetIndex} - Token: k${targetIndex}`}>
                <Button 
                  size="small" 
                  className="fgo-button"
                  onMouseEnter={() => setHoveredToken(`k${targetIndex}`)}
                  onMouseLeave={() => setHoveredToken('')}
                  onClick={() => addCommand(`k${targetIndex}`)}
                  aria-label={`Use Skill 2 on Servant ${targetIndex} - Token: k${targetIndex}`}
                  sx={{ minWidth: 40 }}
                >
                  {targetIndex}
                </Button>
              </Tooltip>
            ))}
            <Tooltip title="Use Skill 2 on Self/Team - Token: k">
              <Button 
                size="small" 
                className="fgo-button"
                variant="outlined"
                onMouseEnter={() => setHoveredToken('k')}
                onMouseLeave={() => setHoveredToken('')}
                onClick={() => addCommand('k')}
                aria-label="Use Skill 2 on Self/Team - Token: k"
              >
                Self
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Skill 3 or Swap for Combat Uniform */}
        {isSwapMC ? (
          <Box className="skill-group fgo-card" sx={{ p: 2 }}>
            <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 2 }}>
              Order Change
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Select
                value={selectedTop || ''}
                onChange={(e) => setSelectedTop(e.target.value)}
                displayEmpty
                fullWidth
                size="small"
              >
                <MenuItem value="">Select Front Servant</MenuItem>
                {team.slice(0, 3).map((servant, index) => (
                  <MenuItem key={index} value={index}>
                    Position {index + 1} {servant.name ? `(${servant.name})` : '(Empty)'}
                  </MenuItem>
                ))}
              </Select>
              <Select
                value={selectedBottom || ''}
                onChange={(e) => setSelectedBottom(e.target.value)}
                displayEmpty
                fullWidth
                size="small"
              >
                <MenuItem value="">Select Back Servant</MenuItem>
                {team.slice(3, 6).filter(servant => servant.collectionNo !== "").map((servant, index) => (
                  <MenuItem key={index} value={index + 3}>
                    Position {index + 4} {servant.name ? `(${servant.name})` : '(Empty)'}
                  </MenuItem>
                ))}
              </Select>
              <Tooltip title={`Swap servants - Token: x${selectedTop + 1}${selectedBottom + 1 - 3}`}>
                <Button
                  variant="contained"
                  color="primary"
                  className="fgo-button"
                  onClick={() => { 
                    handleSwap(); 
                    addCommand(`x${selectedTop + 1}${selectedBottom + 1 - 3}`); 
                  }}
                  onMouseEnter={() => selectedTop !== null && selectedBottom !== null && setHoveredToken(`x${selectedTop + 1}${selectedBottom + 1 - 3}`)}
                  onMouseLeave={() => setHoveredToken('')}
                  disabled={selectedTop === null || selectedBottom === null || !team[selectedTop] || !team[selectedBottom]}
                  aria-label={`Swap servants - Token: x${selectedTop + 1}${selectedBottom + 1 - 3}`}
                  fullWidth
                >
                  Swap Servants
                </Button>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box className="skill-group fgo-card" sx={{ p: 2 }}>
            <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 1 }}>
              Skill 3
            </Typography>
            <Box className="skill-buttons" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[1, 2, 3].map(targetIndex => (
                <Tooltip key={targetIndex} title={`Use Skill 3 on Servant ${targetIndex} - Token: l${targetIndex}`}>
                  <Button 
                    size="small" 
                    className="fgo-button"
                    onMouseEnter={() => setHoveredToken(`l${targetIndex}`)}
                    onMouseLeave={() => setHoveredToken('')}
                    onClick={() => addCommand(`l${targetIndex}`)}
                    aria-label={`Use Skill 3 on Servant ${targetIndex} - Token: l${targetIndex}`}
                    sx={{ minWidth: 40 }}
                  >
                    {targetIndex}
                  </Button>
                </Tooltip>
              ))}
              <Tooltip title="Use Skill 3 on Self/Team - Token: l">
                <Button 
                  size="small" 
                  className="fgo-button"
                  variant="outlined"
                  onMouseEnter={() => setHoveredToken('l')}
                  onMouseLeave={() => setHoveredToken('')}
                  onClick={() => addCommand('l')}
                  aria-label="Use Skill 3 on Self/Team - Token: l"
                >
                  Self
                </Button>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
    );
  }, [selectedMysticCode, team, selectedTop, selectedBottom, addCommand, handleSwap, hoveredToken]);

  return (
    <Box className="mystic-code-section fgo-card" sx={{ 
      backgroundColor: 'var(--color-surface)', 
      padding: 'var(--spacing-lg)', 
      borderRadius: 'var(--border-radius-lg)',
      minHeight: 200
    }}>
      <Typography variant="h6" className="fgo-font-bold" sx={{ mb: 2 }}>
        Mystic Code
      </Typography>
      
      {/* Token Preview */}
      {hoveredToken && (
        <Box sx={{ 
          mb: 2, 
          p: 1, 
          backgroundColor: 'var(--color-command-preview)', 
          borderRadius: 1,
          border: '1px solid var(--color-border)'
        }}>
          <Typography variant="caption" className="fgo-font-medium">
            Token: <code>{hoveredToken}</code>
          </Typography>
        </Box>
      )}

      {/* Mystic Code Selection */}
      <Select
        value={selectedMysticCode || ''}
        onChange={handleMysticCodeChange}
        displayEmpty
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      >
        <MenuItem value="" disabled>Select Mystic Code</MenuItem>
        {mysticCodes.map((mysticCode) => (
          <MenuItem key={mysticCode.id} value={mysticCode.id}>
            {mysticCode.name}
          </MenuItem>
        ))}
      </Select>

      {/* Selected Mystic Code Info */}
      {selectedMysticCodeData && (
        <Box sx={{ mb: 2, p: 1, backgroundColor: 'var(--color-surface-variant)', borderRadius: 1 }}>
          <Typography variant="caption" className="fgo-font-medium">
            Selected: {selectedMysticCodeData.name}
          </Typography>
        </Box>
      )}

      {/* Mystic Code Skills */}
      {renderMysticCodeButtons}
    </Box>
  );
};

export default MysticCodeCommand;