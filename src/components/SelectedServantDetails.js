import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';
import '../SelectedServantDetail.css';

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
      <div className="detail-item-container">
        <div className="detail-item">
          <label>Attack</label>
          <TextField
            type="number"
            value={servant.attack || ''}
            onChange={handleChange('attack')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Atk Up</label>
          <TextField
            type="number"
            value={servant.atkUp || ''}
            onChange={handleChange('atkUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Arts Up</label>
          <TextField
            type="number"
            value={servant.artsUp || ''}
            onChange={handleChange('artsUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Arts Damage Up</label>
          <TextField
            type="number"
            title='Acts like Valentines 2025 color boost chocolate or Class Score'
            value={servant.artsDamageUp || ''}
            onChange={handleChange('artsDamageUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Quick Up</label>
          <TextField
            type="number"
            value={servant.quickUp || ''}
            onChange={handleChange('quickUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Quick Damage Up</label>
          <TextField
            type="number"
            title='Acts like Valentines 2025 color boost chocolate or Class Score'
            value={servant.quickDamageUp || ''}
            onChange={handleChange('quickDamageUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Buster Up</label>
          <TextField
            type="number"
            value={servant.busterUp || ''}
            onChange={handleChange('busterUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Buster Damage Up</label>
          <TextField
            type="number"
            title='Acts like Valentines 2025 color boost chocolate or Class Score'
            value={servant.busterDamageUp || ''}
            onChange={handleChange('busterDamageUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>NP Up</label>
          <TextField
            type="number"
            value={servant.npUp || ''}
            onChange={handleChange('npUp')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Initial Charge</label>
          <TextField
            type="number"
            value={servant.initialCharge || ''}
            onChange={handleChange('initialCharge')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Effect 1</label>
          <TextField
            value={servant.effect1 || ''}
            onChange={handleChange('effect1')}
          />
        </div>
        <div className="detail-item">
          <label>Effect 2</label>
          <TextField
            value={servant.effect2 || ''}
            onChange={handleChange('effect2')}
          />
        </div>
        <div className="detail-item">
          <label>Effect 3</label>
          <TextField
            value={servant.effect3 || ''}
            onChange={handleChange('effect3')}
          />
        </div>
        <div className="detail-item">
          <label>Effect 4</label>
          <TextField
            value={servant.effect4 || ''}
            onChange={handleChange('effect4')}
          />
        </div>
      </div>
    </Box>
  );
};

export default SelectedServantDetails;