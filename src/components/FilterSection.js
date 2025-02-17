import React from 'react';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Checkbox, FormControlLabel } from '@mui/material';

const FilterSection = ({ sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels }) => {
  return (
    <Grid container spacing={2} style={{ marginBottom: '20px' }}>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Search Servants"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Rarity</Typography>
        <Grid container spacing={1} style={{ width: '30rem'}}>
          {[5, 4, 3, 2, 1, 0].map(rarity => (
            <Grid item key={rarity}>
              <FormControlLabel
                control={<Checkbox value={rarity} onChange={(e) => handleCheckboxChange(e, setSelectedRarity, selectedRarity)} />}
                label={`${rarity} Star`}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Class</Typography>
        <Grid container spacing={1} style={{ width: '30rem'}} >
          {['saber', 'archer', 'lancer', 'rider', 'caster', 'assassin', 'berserker', 'shielder', 'ruler', 'avenger', 'alterEgo', 'moonCancer', 'foreigner', 'pretender', 'beast'].map(className => (
            <Grid item key={className}>
              <FormControlLabel
                control={<Checkbox value={className.toLowerCase()} onChange={(e) => handleCheckboxChange(e, setSelectedClass, selectedClass)} />}
                label={capitalize(className)}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Noble Phantasm Type</Typography>
        <Grid container spacing={1}>
          {['buster', 'arts', 'quick'].map(npType => (
            <Grid item key={npType}>
              <FormControlLabel
                control={<Checkbox value={npType.toLowerCase()} onChange={(e) => handleCheckboxChange(e, setSelectedNpType, selectedNpType)} />}
                label={capitalize(npType)}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Attack Type</Typography>
        <Grid container spacing={1}>
          {['attackEnemyOne', 'attackEnemyAll', 'support'].map(attackType => (
            <Grid item key={attackType}>
              <FormControlLabel
                control={<Checkbox value={attackType} onChange={(e) => handleCheckboxChange(e, setSelectedAttackType, selectedAttackType)} />}
                label={attackTypeLabels[attackType]}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FilterSection;