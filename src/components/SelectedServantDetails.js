import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, InputAdornment, Select, MenuItem } from '@mui/material';
import '../SelectedServantDetail.css';

const SelectedServantDetails = ({ servant, handleEffectChange }) => {
  if (!servant) return null;

  const handleChange = (field) => (event) => {
    const value = Math.max(0, event.target.value); // Ensure value is not below 0
    handleEffectChange(field, value);
  };

  // Buff fields are stored as decimals (0.20) but entered/shown as percent (20%).
  const handlePct = (field) => (event) => {
    handleEffectChange(field, Math.max(0, Number(event.target.value) || 0) / 100);
  };
  const PctField = ({ label, field, title }) => (
    <div className="detail-item">
      <label>{label}</label>
      <TextField
        type="number"
        title={title}
        value={Math.round((servant[field] || 0) * 100)}
        onChange={handlePct(field)}
        autoComplete="off"
        inputProps={{ min: 0 }}
        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
      />
    </div>
  );

  const handleCheckboxChange = (field) => (event) => {
    const checked = event.target.checked;
    handleEffectChange(field, checked);
    if (field === 'append2' && checked) {
      handleEffectChange('initialCharge', Math.max(servant.initialCharge, 20));
    }
  };

  return (
    <Box mt={2} style={{ minHeight: '300px' }}>
      <Typography variant="h6">{servant.name}</Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={servant.append2 || false}
            onChange={handleCheckboxChange('append2')}
          />
        }
        label="Append 2"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={servant.append_5 ?? servant.append5 ?? true}
            onChange={(e) => handleEffectChange('append5', e.target.checked)}
          />
        }
        label="Append 5"
      />
      <FormControlLabel
        control={
          <Select
            value={servant.npLevel || 1}
            onChange={handleChange('npLevel')}
            displayEmpty
            fullWidth
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
        }
        label="NP Level"
      />
      <div className="detail-item-container">
        <div className="detail-item">
          <label>Level</label>
          <TextField
            type="number"
            value={servant.level || 90}
            onChange={handleChange('level')}
            autoComplete="off"
            inputProps={{ min: 1, max: 120 }}
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
            inputProps={{ min: servant.append2 ? 20 : 0 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </div>
        <PctField label="Atk Up" field="atkUp" />
        <PctField label="Arts Up (card)" field="artsUp" />
        <PctField label="Arts Damage Up" field="artsDamageUp" title="Acts like Valentines 2025 color boost chocolate or Class Score" />
        <PctField label="Quick Up (card)" field="quickUp" />
        <PctField label="Quick Damage Up" field="quickDamageUp" title="Acts like Valentines 2025 color boost chocolate or Class Score" />
        <PctField label="Buster Up (card)" field="busterUp" />
        <PctField label="Buster Damage Up" field="busterDamageUp" title="Acts like Valentines 2025 color boost chocolate or Class Score" />
        <PctField label="NP Damage Up" field="npUp" title="Increases Noble Phantasm DAMAGE (not gauge gain)." />
        <PctField label="NP Gen Up" field="npGenUp" title="Increases NP gauge gain rate (e.g. some event/CE bonuses)." />
        <PctField label="Generic Damage Up" field="damageUp" />
      </div>
    </Box>
  );
};

export default SelectedServantDetails;