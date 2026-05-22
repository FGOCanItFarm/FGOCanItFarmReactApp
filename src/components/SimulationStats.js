import React from 'react';
import {
  Box, Typography, Chip, Divider, Grid, Paper, LinearProgress, Tooltip
} from '@mui/material';

const outcomeColor = (outcome) => {
  if (outcome === 'guaranteed') return 'success';
  if (outcome === 'rng') return 'warning';
  return 'error';
};

const outcomeLabel = (outcome) => {
  if (outcome === 'guaranteed') return 'Guaranteed';
  if (outcome === 'rng') return 'RNG';
  return 'Impossible';
};

const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;
const fmtNum = (v) =>
  v == null ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

const WaveCard = ({ waveNum, wave, servants }) => {
  const prob = wave.clear_probability ?? 0;
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          Wave {waveNum}
        </Typography>
        <Chip
          label={outcomeLabel(wave.outcome)}
          color={outcomeColor(wave.outcome)}
          size="small"
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={prob * 100}
        color={outcomeColor(wave.outcome)}
        sx={{ mb: 1, height: 8, borderRadius: 4 }}
      />

      <Typography variant="body2" color="text.secondary" mb={1}>
        Clear probability: <strong>{fmtPct(prob)}</strong>
        {wave.outcome === 'rng' && (
          <> &nbsp;(needs &ge;{wave.min_multiplier_needed?.toFixed(3)}&times; roll)</>
        )}
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={6} sm={3}>
          <Tooltip title="Total enemy HP that must be removed to clear this wave">
            <Box>
              <Typography variant="caption" color="text.secondary">HP Required</Typography>
              <Typography variant="body2">{fmtNum(wave.hp_required)}</Typography>
            </Box>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Tooltip title="NP damage at worst-case 0.9× RNG roll">
            <Box>
              <Typography variant="caption" color="text.secondary">DMG @ 0.9&times;</Typography>
              <Typography variant="body2">{fmtNum(wave.damage_at_09)}</Typography>
            </Box>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Tooltip title="NP damage at average 1.0× roll">
            <Box>
              <Typography variant="caption" color="text.secondary">DMG @ 1.0&times;</Typography>
              <Typography variant="body2">{fmtNum(wave.damage_at_10)}</Typography>
            </Box>
          </Tooltip>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Tooltip title="NP damage at best-case 1.1× roll (what was simulated)">
            <Box>
              <Typography variant="caption" color="text.secondary">DMG @ 1.1&times;</Typography>
              <Typography variant="body2">{fmtNum(wave.damage_at_11)}</Typography>
            </Box>
          </Tooltip>
        </Grid>
      </Grid>

      {servants && servants.length > 0 && (
        <Box mt={1.5}>
          <Typography variant="caption" color="text.secondary">NP gauge at wave end:</Typography>
          <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
            {servants.map((s) => (
              <Chip
                key={s.slot}
                size="small"
                label={`Slot ${s.slot + 1}: ${s.np_gauge}%`}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

const SimulationStats = ({ result }) => {
  if (!result) return null;

  if (!result.success) {
    return (
      <Box mt={4}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="error.main">
          Simulation error: {result.error || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  const {
    stats,
    quest_cleared,
    wave_reached,
    total_waves,
    servants_at_wave_end,
    failed_token_count,
    first_failed_token,
  } = result;

  const waves = stats?.waves || {};
  const overallProb = stats?.overall_clear_probability ?? 0;

  return (
    <Box mt={4}>
      <Divider sx={{ mb: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Simulation Results</Typography>
        <Chip
          label={
            quest_cleared
              ? `Cleared — ${fmtPct(overallProb)} overall`
              : `Stopped at wave ${wave_reached}/${total_waves}`
          }
          color={
            quest_cleared
              ? overallProb >= 1
                ? 'success'
                : 'warning'
              : 'error'
          }
        />
      </Box>

      {Object.entries(waves)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([waveNum, wave]) => (
          <WaveCard
            key={waveNum}
            waveNum={waveNum}
            wave={wave}
            servants={servants_at_wave_end?.[waveNum] || []}
          />
        ))}

      {failed_token_count > 0 && (
        <Typography variant="caption" color="warning.main" display="block" mt={1}>
          {failed_token_count} token{failed_token_count > 1 ? 's' : ''} skipped
          {first_failed_token ? ` — first: “${first_failed_token}”` : ''}
        </Typography>
      )}
    </Box>
  );
};

export default SimulationStats;
