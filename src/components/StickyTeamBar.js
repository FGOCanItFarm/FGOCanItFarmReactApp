import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Popover, Portal, Modal } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import '../ui-vars.css';
import '../team-sticky.css';

const StickyTeamBar = ({ team, servants, selectedMysticCode, selectedQuest, servantEffects = [], updateServantEffects = () => {} }) => {
  // Start the sticky team bar popped out by default
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredServant, setHoveredServant] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editState, setEditState] = useState({ append2: false, append5: false, extraJson: '' });

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleServantMouseEnter = (event, servant, index) => {
    if (servant && servants) {
      const fullServant = servants.find(s => s.collectionNo === servant.collectionNo);
      if (fullServant) {
        setAnchorEl(event.currentTarget);
        setHoveredServant(fullServant);
      }
    }
  };

  const handleServantMouseLeave = () => {
    setAnchorEl(null);
    setHoveredServant(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setExpanded(false);
    }
  };

  const openEditForIndex = (index) => {
    const effects = servantEffects[index] || {};
    setEditState({
      append2: !!effects.append2,
      append5: !!effects.append5,
      extraJson: effects.extraJson ? JSON.stringify(effects.extraJson, null, 2) : ''
    });
    setEditIndex(index);
  };

  const closeEdit = () => {
    setEditIndex(null);
    setEditState({ append2: false, append5: false, extraJson: '' });
  };

  const saveEdit = () => {
    try {
      let parsedExtra = {};
      if (editState.extraJson && editState.extraJson.trim()) {
        parsedExtra = JSON.parse(editState.extraJson);
      }
      updateServantEffects(editIndex, 'append2', editState.append2);
      updateServantEffects(editIndex, 'append5', editState.append5);
      updateServantEffects(editIndex, 'extraJson', parsedExtra);
    } catch (err) {
      // If JSON parse fails, still set as raw string under a different key to avoid losing data
      updateServantEffects(editIndex, 'extraJsonRaw', editState.extraJson);
    }
    closeEdit();
  };

  const mysticCodeNames = {
    410: 'Winter Casual',
    210: 'Chaldea Uniform - Decisive Battle',
    100: 'A Fragment of 2004',
    40: 'Atlas Institute Uniform',
    20: 'Chaldea Combat Uniform'
  };

  return (
    <>
      <div className="sticky-team-control">
        <Button
          variant="contained"
          color="primary"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="sticky-team-toggle"
          aria-label={expanded ? "Minimize team view" : "Expand team view"}
          aria-expanded={expanded}
        >
          Team {expanded ? '▼' : '▲'}
        </Button>
      </div>

      {expanded && (
        <Portal>
          <Paper 
            className="sticky-team-panel"
            elevation={8}
            role="dialog"
            aria-label="Team overview panel"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            <Box className="sticky-team-content">
              <div className="sticky-team-grid">
                {team.slice(0, 6).map((servantObj, index) => {
                  const servant = servants?.find(s => s.collectionNo === servantObj.collectionNo);
                  
                    return (
                    <div 
                      key={index}
                      className="sticky-servant-slot"
                      onMouseEnter={(e) => handleServantMouseEnter(e, servantObj, index)}
                      onMouseLeave={handleServantMouseLeave}
                      aria-label={servant ? `${servant.name} in position ${index + 1}` : `Empty slot ${index + 1}`}
                    >
                      {servant ? (
                        <div className="sticky-servant-avatar" onClick={() => openEditForIndex(index)} role="button" tabIndex={0} aria-label={`Edit stats for slot ${index + 1}`}>
                          <ServantAvatar
                            servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                            bgType={servant.noblePhantasms?.[0]?.card}
                            tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
                          />
                        </div>
                      ) : (
                        <div className="sticky-servant-empty" onClick={() => openEditForIndex(index)} role="button" tabIndex={0} aria-label={`Edit stats for empty slot ${index + 1}`}>
                          <Typography variant="caption">{index + 1}</Typography>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="sticky-team-info">
                <div className="info-pill mystic-code-pill">
                  <Typography variant="caption">
                    MC: {selectedMysticCode ? mysticCodeNames[selectedMysticCode] || `ID: ${selectedMysticCode}` : 'None'}
                  </Typography>
                </div>
                <div className="info-pill quest-pill">
                  <Typography variant="caption">
                    Quest: {selectedQuest?.name || 'None'}
                  </Typography>
                </div>
              </div>
            </Box>
          </Paper>
        </Portal>
      )}

      <Popover
        open={Boolean(anchorEl) && Boolean(hoveredServant)}
        anchorEl={anchorEl}
        onClose={handleServantMouseLeave}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            style: {
              maxWidth: '400px',
              maxHeight: '300px',
              overflow: 'auto',
              zIndex: 'var(--z-popover)'
            }
          }
        }}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {hoveredServant?.name || 'Servant Info'}
          </Typography>
          <Box component="pre" sx={{ 
            fontSize: '0.75rem', 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0
          }}>
            {hoveredServant ? JSON.stringify(hoveredServant, null, 2) : '{}'}
          </Box>
        </Paper>
      </Popover>

      {/* Edit modal for per-unit extra stats */}
      <Modal open={editIndex !== null} onClose={closeEdit}>
        <Paper sx={{ p: 2, width: 420, margin: 'auto', marginTop: '10%' }}>
          <Typography variant="h6">Edit Unit Extras {editIndex !== null ? `- Slot ${editIndex + 1}` : ''}</Typography>
          <Box mt={1}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={editState.append2} onChange={(e) => setEditState(s => ({ ...s, append2: e.target.checked }))} />
              <Typography variant="body2">Append2</Typography>
            </label>
          </Box>
          <Box mt={1}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={editState.append5} onChange={(e) => setEditState(s => ({ ...s, append5: e.target.checked }))} />
              <Typography variant="body2">Append5</Typography>
            </label>
          </Box>
          <Box mt={1}>
            <Typography variant="caption">Extra JSON</Typography>
            <textarea value={editState.extraJson} onChange={(e) => setEditState(s => ({ ...s, extraJson: e.target.value }))} style={{ width: '100%', minHeight: '8rem', fontFamily: 'monospace' }} />
          </Box>
          <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={closeEdit}>Cancel</Button>
            <Button variant="contained" onClick={saveEdit} color="primary">Save</Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default StickyTeamBar;