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
            onChange={handleChange('attack')}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Atk Up"
            type="number"
            value={servant.atkUp || ''}
            onChange={handleChange('atkUp')}
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
            onChange={handleChange('artsUp')}
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
            onChange={handleChange('artsDamageUp')}
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
            onChange={handleChange('quickUp')}
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
            onChange={handleChange('quickDamageUp')}
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
            onChange={handleChange('busterUp')}
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
            onChange={handleChange('busterDamageUp')}
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
            onChange={handleChange('npUp')}
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
            onChange={handleChange('initialCharge')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </Grid>

      </Grid>
    </Box>
  );
};

export default SelectedServantDetails;