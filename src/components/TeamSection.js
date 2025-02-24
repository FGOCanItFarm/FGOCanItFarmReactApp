import React, { useState } from 'react';
import { Grid, Typography, TextField, Box, FormControlLabel, Checkbox, Accordion, AccordionSummary, AccordionDetails, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ServantAvatar from './ServantAvatar';

const TeamSection = ({ servants, team, activeServant, handleTeamServantClick, updateServantEffects }) => {
  const maxServants = 6;

  const handleEffectChange = (index, field, value) => {
    updateServantEffects(index, field, value);
  };

  return (
    <div>
      <Typography variant="h6" style={{ marginTop: '20px' }}>Team Section</Typography>
      <Grid container spacing={2} style={{ width: '35rem', height: '35rem', overflowY: 'auto', marginRight: '0.5rem', marginLeft: '0.5rem' }}>
        {Array.from({ length: maxServants }).map((_, index) => {
          const collectionNo = team[index];
          const servant = servants.find(s => s.collectionNo === collectionNo);

          const isActive = activeServant?.index === index;
          const borderStyle = isActive ? '2px solid blue' : '1px dashed gray';
          const opacity = isActive ? 1 : 0.5;

          const handleClick = () => {
            if (index < 3) {
              handleTeamServantClick({ ...servant, index });
            }
          };

          return (
            <Grid 
              item xs={4} key={index} 
              onClick={servant ? handleClick : null}
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
              {servant && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{servant.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box mt={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={servant.append_2 || false}
                            onChange={(e) => handleEffectChange(index, 'append_2', e.target.checked)}
                          />
                        }
                        label="Append 2"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={servant.append_5 || false}
                            onChange={(e) => handleEffectChange(index, 'append_5', e.target.checked)}
                          />
                        }
                        label="Append 5"
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Attack"
                            type="number"
                            value={servant.attack || ''}
                            onChange={(e) => handleEffectChange(index, 'attack', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Atk Up"
                            type="number"
                            value={servant.atkUp || ''}
                            onChange={(e) => handleEffectChange(index, 'atkUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Arts Up"
                            type="number"
                            value={servant.artsUp || ''}
                            onChange={(e) => handleEffectChange(index, 'artsUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
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
                            value={servant.artsDamageUp || ''}
                            onChange={(e) => handleEffectChange(index, 'artsDamageUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Quick Up"
                            type="number"
                            value={servant.quickUp || ''}
                            onChange={(e) => handleEffectChange(index, 'quickUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
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
                            value={servant.artsDamageUp || ''}
                            onChange={(e) => handleEffectChange(index, 'quickDamageUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Buster Up"
                            type="number"
                            value={servant.busterUp || ''}
                            onChange={(e) => handleEffectChange(index, 'busterUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
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
                            value={servant.artsDamageUp || ''}
                            onChange={(e) => handleEffectChange(index, 'busterDamageUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="NP Up"
                            type="number"
                            value={servant.npUp || ''}
                            onChange={(e) => handleEffectChange(index, 'npUp', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Initial Charge"
                            type="number"
                            value={servant.initialCharge || ''}
                            onChange={(e) => handleEffectChange(index, 'initialCharge', e.target.value)}
                            fullWidth
                            margin="dense"
                            inputProps={{
                              style: { padding: '4px' },
                              autoComplete: 'off'
                            }}
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
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default TeamSection;
