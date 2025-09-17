import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Popover, Portal } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import '../ui-vars.css';
import '../team-sticky.css';

const StickyTeamBar = ({ team, servants, selectedMysticCode, selectedQuest }) => {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredServant, setHoveredServant] = useState(null);

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
                        <div className="sticky-servant-avatar">
                          <ServantAvatar
                            servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                            bgType={servant.noblePhantasms?.[0]?.card}
                            tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
                          />
                        </div>
                      ) : (
                        <div className="sticky-servant-empty">
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
    </>
  );
};

export default StickyTeamBar;