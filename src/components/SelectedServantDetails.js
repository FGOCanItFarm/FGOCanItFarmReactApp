/* SelectedServantDetails.js - Enhanced servant configuration interface
 * UI Changes: Improved layout with better grouping and visual hierarchy
 */
import React, { useMemo } from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, InputAdornment, Select, MenuItem, Grid, Paper } from '@mui/material';
import '../SelectedServantDetail.css';
import '../ui-vars.css';

const SelectedServantDetails = ({ servant, handleEffectChange }) => {
  const basicFields = useMemo(() => [
    { field: 'level', label: 'Level', min: 1, max: 120, defaultValue: 90 },
    { field: 'attack', label: 'Attack', min: 0, defaultValue: 0 },
    { field: 'initialCharge', label: 'Starting Charge', min: servant?.append2 ? 20 : 0, defaultValue: 0, unit: '%' }
  ], [servant?.append2]);

  const buffFields = useMemo(() => [
    { field: 'atkUp', label: 'Atk Up', unit: '%' },
    { field: 'artsUp', label: 'Arts Up', unit: '%' },
    { field: 'artsDamageUp', label: 'Arts Damage Up', unit: '%', tooltip: 'Acts like Valentines 2025 color boost chocolate or Class Score' },
    { field: 'quickUp', label: 'Quick Up', unit: '%' },
    { field: 'quickDamageUp', label: 'Quick Damage Up', unit: '%', tooltip: 'Acts like Valentines 2025 color boost chocolate or Class Score' },
    { field: 'busterUp', label: 'Buster Up', unit: '%' },
    { field: 'busterDamageUp', label: 'Buster Damage Up', unit: '%', tooltip: 'Acts like Valentines 2025 color boost chocolate or Class Score' },
    { field: 'npUp', label: 'NP Up', unit: '%' },
    { field: 'damageUp', label: 'Generic Damage Up', unit: '%' }
  ], []);

  if (!servant) {
    return (
      <Box className="servant-details-empty fgo-card" sx={{ 
        minHeight: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--color-surface-variant)'
      }}>
        <Typography variant="body2" color="text.secondary" className="fgo-text-md">
          Select a servant to configure
        </Typography>
      </Box>
    );
  }

  const handleChange = (field) => (event) => {
    const value = Math.max(0, event.target.value);
    handleEffectChange(field, value);
  };

  const handleCheckboxChange = (field) => (event) => {
    const checked = event.target.checked;
    handleEffectChange(field, checked);
    if (field === 'append2' && checked) {
      handleEffectChange('initialCharge', Math.max(servant.initialCharge, 20));
    }
  };

  return (
    <Box className="servant-details-container fgo-card" sx={{ minHeight: 300 }}>
      <Typography variant="h6" className="fgo-font-bold" sx={{ mb: 3 }}>
        {servant.name || 'Servant Configuration'}
      </Typography>

      {/* Basic Configuration */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: 'var(--color-surface-variant)' }}>
        <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 2 }}>
          Basic Configuration
        </Typography>
        
        {/* Append Skills */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={servant.append2 || false}
                onChange={handleCheckboxChange('append2')}
                size="small"
              />
            }
            label="Append 2"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={servant.append_5 || false}
                onChange={(e) => handleEffectChange('append5', e.target.checked)}
                size="small"
              />
            }
            label="Append 5"
          />
        </Box>

        {/* NP Level */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
            NP Level
          </Typography>
          <Select
            value={servant.npLevel || 1}
            onChange={handleChange('npLevel')}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level}>
                NP{level}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Basic Stats */}
        <Grid container spacing={2}>
          {basicFields.map(({ field, label, min, max, defaultValue, unit }) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                label={label}
                type="number"
                size="small"
                fullWidth
                value={servant[field] || defaultValue}
                onChange={handleChange(field)}
                inputProps={{ min, max }}
                InputProps={unit ? {
                  endAdornment: <InputAdornment position="end">{unit}</InputAdornment>
                } : undefined}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Buff Configuration */}
      <Paper elevation={1} sx={{ p: 2, backgroundColor: 'var(--color-surface-variant)' }}>
        <Typography variant="subtitle2" className="fgo-font-medium" sx={{ mb: 2 }}>
          Buffs & Effects
        </Typography>
        
        <Grid container spacing={2}>
          {buffFields.map(({ field, label, unit, tooltip }) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                label={label}
                type="number"
                size="small"
                fullWidth
                title={tooltip}
                value={servant[field] || 0}
                onChange={handleChange(field)}
                inputProps={{ min: 0 }}
                InputProps={unit ? {
                  endAdornment: <InputAdornment position="end">{unit}</InputAdornment>
                } : undefined}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default SelectedServantDetails;