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
            fullWidth
            margin="dense"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Atk Up"
            type="number"
            value={servant.atkUp || ''}
            onChange={handleChange('atkUp')}
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
            onChange={handleChange('artsUp')}
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
            onChange={handleChange('artsDamageUp')}
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
            onChange={handleChange('quickUp')}
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
            onChange={handleChange('quickDamageUp')}
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
            onChange={handleChange('busterUp')}
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
            onChange={handleChange('busterDamageUp')}
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
            onChange={handleChange('npUp')}
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
            onChange={handleChange('initialCharge')}
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