import React from 'react';
import { Box, Typography, TextField, Checkbox, Button, InputAdornment } from '@mui/material';

// Persistent inline editor for a single team slot's effects. Reads straight from
// the effects object and writes each change through updateServantEffects, which
// merges partial updates — so no local mirror state is needed.
const PCT_FIELDS = [
  ['atkUp', 'ATK'],
  ['npUp', 'NP Gen'],
  ['artsUp', 'Arts'],
  ['busterUp', 'Buster'],
  ['quickUp', 'Quick'],
  ['artsDamageUp', 'Arts DMG'],
  ['busterDamageUp', 'Buster DMG'],
  ['quickDamageUp', 'Quick DMG'],
];

const StatsPanel = ({ slotIndex, servant, effects = {}, onChange }) => {
  const set = (field, value) => onChange(slotIndex, { [field]: value });

  if (slotIndex === null || slotIndex === undefined) {
    return (
      <Box className="cmd-stats-empty">
        <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
          Select a unit to view and edit its stats.
        </Typography>
      </Box>
    );
  }

  const npLevel = effects.np ?? effects.npLevel ?? 1;
  const append5 = effects.append_5 !== undefined ? !!effects.append_5 : !!effects.append5;
  const mode = effects.mode || effects.formMode || 1;

  return (
    <Box className="cmd-stats">
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {servant ? servant.name : `Slot ${slotIndex + 1}`}
      </Typography>
      {servant && (
        <Typography variant="caption" sx={{ color: 'var(--color-text-dim)', display: 'block', mb: 1 }}>
          {servant.className ? servant.className[0].toUpperCase() + servant.className.slice(1) : ''}
          {servant.rarity != null ? `  ·  ${servant.rarity}★` : ''}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          label="NP Lv" type="number" size="small" inputProps={{ min: 1, max: 5 }}
          value={npLevel} onChange={(e) => set('np', Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
          sx={{ width: 80 }}
        />
        <TextField
          label="Charge %" type="number" size="small"
          value={effects.initialCharge ?? 0} onChange={(e) => set('initialCharge', Number(e.target.value) || 0)}
          sx={{ flex: 1 }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {PCT_FIELDS.map(([field, label]) => (
          <TextField
            key={field}
            label={label} type="number" size="small"
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            value={effects[field] ?? 0}
            onChange={(e) => set(field, Number(e.target.value) || 0)}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Checkbox size="small" checked={append5} onChange={(e) => onChange(slotIndex, { append_5: e.target.checked, append5: e.target.checked })} />
        <Typography variant="body2">Append 5 (NP gauge)</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="body2">Form</Typography>
        {[1, 2, 3].map(m => (
          <Button key={m} size="small" variant={mode === m ? 'contained' : 'outlined'} onClick={() => set('mode', m)} sx={{ minWidth: 36 }}>
            {m}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default StatsPanel;
