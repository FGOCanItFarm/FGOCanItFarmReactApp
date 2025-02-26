import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';
import '../SelectedServantDetail.css';

const SelectedServantDetails = ({ servant, handleEffectChange }) => {
  if (!servant) return null;

  const handleChange = (field) => (event) => {
    const value = Math.max(0, event.target.value); // Ensure value is not below 0
    handleEffectChange(field, value);
  };

  const handleCheckboxChange = (field) => (event) => {
    const checked = event.target.checked;
    handleEffectChange(field, checked);
    if (field === 'append_2' && checked) {
      handleEffectChange('initialCharge', Math.max(servant.initialCharge, 20));
    }
  };

  return (
    <Box mt={2} style={{ minHeight: '300px' }}>
      <Typography variant="h6">{servant.name}</Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={servant.append_2 || false}
            onChange={handleCheckboxChange('append_2')}
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
          <label>Level</label>
          <TextField
            type="number"
            value={servant.level || 90}
            onChange={handleChange('level')}
            autoComplete="off"
            inputProps={{ min: 1,max: 120 }}
          />
        </div>
        <div className="detail-item">
          <label>Attack</label>
          <TextField
            type="number"
            value={servant.attack || 0}
            onChange={handleChange('attack')}
            autoComplete="off"
            inputProps={{ min: 0 }}
          />
        </div>
        <div className="detail-item">
          <label>Starting Charge</label>
          <TextField
            type="number"
            value={servant.initialCharge || 0}
            onChange={handleChange('initialCharge')}
            autoComplete="off"
            inputProps={{ min: servant.append_2 ? 20 : 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Atk Up</label>
          <TextField
            type="number"
            value={servant.atkUp || 0}
            onChange={handleChange('atkUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Arts Up</label>
          <TextField
            type="number"
            value={servant.artsUp || 0}
            onChange={handleChange('artsUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
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
            value={servant.artsDamageUp || 0}
            onChange={handleChange('artsDamageUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Quick Up</label>
          <TextField
            type="number"
            value={servant.quickUp || 0}
            onChange={handleChange('quickUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
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
            value={servant.quickDamageUp || 0}
            onChange={handleChange('quickDamageUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Buster Up</label>
          <TextField
            type="number"
            value={servant.busterUp || 0}
            onChange={handleChange('busterUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
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
            value={servant.busterDamageUp || 0}
            onChange={handleChange('busterDamageUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>NP Up</label>
          <TextField
            type="number"
            value={servant.npUp || 0}
            onChange={handleChange('npUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <div className="detail-item">
          <label>Generic Damage Up</label>
          <TextField
            type="number"
            value={servant.damageUp || 0}
            onChange={handleChange('damageUp')}
            autoComplete="off"
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
      </div>
    </Box>
  );
};

export default SelectedServantDetails;