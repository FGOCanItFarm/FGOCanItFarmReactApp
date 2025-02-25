import React, { useState } from 'react';
import { Grid, Typography, Box, Accordion, AccordionSummary, AccordionDetails, TextField, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ServantAvatar from './ServantAvatar';

const TeamSection = ({ team, servants, activeServant, handleTeamServantClick, updateServantEffects, pageType }) => {
  const [expanded, setExpanded] = useState(false);

  const handleEffectChange = (index, field, value) => {
    updateServantEffects(index, field, value);
  };

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`${pageType} team-section`}>
      <Typography variant="h6">Team Section</Typography>
      <Grid container spacing={2}>
        {team.map((servantId, index) => {
          const servant = servants.find(s => s.collectionNo === servantId);

          const isActive = activeServant !== null && activeServant !== undefined && activeServant === index;
          const borderStyle = isActive ? '2px solid blue' : '1px dashed gray';
          const opacity = isActive ? 1 : 0.5;

          const handleClick = () => {
            if (index < 3) { // Only top row servants can be activated
              handleTeamServantClick(index);
            }
          };

          return (
            <Grid 
              item xs={4} key={index} 
              onClick={handleClick}
              style={{ opacity }}
            >
              <div style={{ 
                width: '100%', 
                height: '150px', 
                border: borderStyle, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {servant ? (
                  <ServantAvatar
                    servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                    bgType={servant.noblePhantasms?.[0]?.card}
                    tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">Empty Slot</Typography>
                )}
              </div>
            </Grid>
          );
        })}
      </Grid>
      {activeServant !== null && activeServant !== undefined && (
        <Accordion expanded={expanded} onChange={handleAccordionToggle}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{servants[activeServant]?.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={servants[activeServant]?.append_2 || false}
                    onChange={(e) => handleEffectChange(activeServant, 'append_2', e.target.checked)}
                  />
                }
                label="Append 2"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={servants[activeServant]?.append_5 || false}
                    onChange={(e) => handleEffectChange(activeServant, 'append_5', e.target.checked)}
                  />
                }
                label="Append 5"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Attack"
                    type="number"
                    value={servants[activeServant]?.attack || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'attack', e.target.value)}
                    fullWidth
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Atk Up"
                    type="number"
                    value={servants[activeServant]?.atkUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'atkUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Arts Up"
                    type="number"
                    value={servants[activeServant]?.artsUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'artsUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Arts Damage Up"
                    type="number"
                    title='Acts like Valentines 2025 color boost chocolate or Class Score'
                    value={servants[activeServant]?.artsDamageUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'artsDamageUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Quick Up"
                    type="number"
                    value={servants[activeServant]?.quickUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'quickUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Quick Damage Up"
                    type="number"
                    title='Acts like Valentines 2025 color boost chocolate or Class Score'
                    value={servants[activeServant]?.quickDamageUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'quickDamageUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Buster Up"
                    type="number"
                    value={servants[activeServant]?.busterUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'busterUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Buster Damage Up"
                    type="number"
                    title='Acts like Valentines 2025 color boost chocolate or Class Score'
                    value={servants[activeServant]?.busterDamageUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'busterDamageUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="NP Up"
                    type="number"
                    value={servants[activeServant]?.npUp || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'npUp', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Initial Charge"
                    type="number"
                    value={servants[activeServant]?.initialCharge || ''}
                    onChange={(e) => handleEffectChange(activeServant, 'initialCharge', e.target.value)}
                    fullWidth
                    margin="dense"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                {/* Add more fields as needed */}
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};

export default TeamSection;
