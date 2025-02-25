import React from 'react';
import { Box, Typography, Grid, TextField, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';

const SelectedServantDetails = ({ servant, handleEffectChange }) => {
  if (!servant) return null;

  const handleChange = (field) => (event) => {
    handleEffectChange(field, event.target.value);
  };

  return (
    <Box mt={2} style={{ minHeight: '300px' }}>
      <Typography variant="h6">{servant.name}</Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={servant.append_2 || false}
            onChange={(e) => handleEffectChange('append_2', e.target.checked)}
          />
        }
        label="Append 2"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={servant.append_5 || false}
            onChange={(e) => handleEffectChange('append_5', e.target.checked)}
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
            onChange={(e) => handleEffectChange('attack', e.target.value)}
            fullWidth
            margin="dense"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Atk Up"
            type="number"
            value={servant.atkUp || ''}
            onChange={(e) => handleEffectChange('atkUp', e.target.value)}
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
            value={servant.artsUp || ''}
            onChange={(e) => handleEffectChange('artsUp', e.target.value)}
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
            value={servant.artsDamageUp || ''}
            onChange={(e) => handleEffectChange('artsDamageUp', e.target.value)}
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
            value={servant.quickUp || ''}
            onChange={(e) => handleEffectChange('quickUp', e.target.value)}
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
            value={servant.quickDamageUp || ''}
            onChange={(e) => handleEffectChange('quickDamageUp', e.target.value)}
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
            value={servant.busterUp || ''}
            onChange={(e) => handleEffectChange('busterUp', e.target.value)}
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
            value={servant.busterDamageUp || ''}
            onChange={(e) => handleEffectChange('busterDamageUp', e.target.value)}
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
            value={servant.npUp || ''}
            onChange={(e) => handleEffectChange('npUp', e.target.value)}
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
            value={servant.initialCharge || ''}
            onChange={(e) => handleEffectChange('initialCharge', e.target.value)}
            fullWidth
            margin="dense"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Effect 1"
            value={servant.effect1 || ''}
            onChange={handleChange('effect1')}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Effect 2"
            value={servant.effect2 || ''}
            onChange={handleChange('effect2')}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Effect 3"
            value={servant.effect3 || ''}
            onChange={handleChange('effect3')}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Effect 4"
            value={servant.effect4 || ''}
            onChange={handleChange('effect4')}
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelectedServantDetails;