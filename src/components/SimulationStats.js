import React from 'react';
import {
  Box, Typography, Chip, Divider, Grid, Paper, LinearProgress, Tooltip, Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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

const outcomeVar = (outcome) => {
  if (outcome === 'guaranteed') return '--color-success';
  if (outcome === 'rng') return '--color-gold';
  return '--color-error';
};

const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;
const fmtNum = (v) =>
  v == null ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

const WaveCard = ({ waveNum, wave, servants }) => {
  const [expanded, setExpanded] = React.useState(false);
  const prob = wave.clear_probability ?? 0;
  const v = outcomeVar(wave.outcome);

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: `color-mix(in srgb, var(${v}) 8%, transparent)`,
        border: `1px solid color-mix(in srgb, var(${v}) 30%, transparent)`,
        overflow: 'hidden',
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.5}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Wave {waveNum}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={outcomeLabel(wave.outcome)}
            color={outcomeColor(wave.outcome)}
            size="small"
          />
          <Typography variant="body2" sx={{ color: 'var(--color-text-dim)', minWidth: 44, textAlign: 'right' }}>
            {fmtPct(prob)}
          </Typography>
          {expanded
            ? <ExpandLessIcon fontSize="small" sx={{ color: 'var(--color-text-dim)' }} />
            : <ExpandMoreIcon fontSize="small" sx={{ color: 'var(--color-text-dim)' }} />
          }
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={prob * 100}
        color={outcomeColor(wave.outcome)}
        sx={{ height: 4 }}
      />

      <Collapse in={expanded}>
        <Box px={2} pb={2} pt={1.5}>
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
                  <Typography variant="caption" color="text.secondary">DMG @ 0.9×</Typography>
                  <Typography variant="body2">{fmtNum(wave.damage_at_09)}</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Tooltip title="NP damage at average 1.0× roll">
                <Box>
                  <Typography variant="caption" color="text.secondary">DMG @ 1.0×</Typography>
                  <Typography variant="body2">{fmtNum(wave.damage_at_10)}</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Tooltip title="NP damage at best-case 1.1× roll — waves advance on this roll">
                <Box>
                  <Typography variant="caption" color="text.secondary">DMG @ 1.1×</Typography>
                  <Typography variant="body2">{fmtNum(wave.damage_at_11)}</Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>

          {wave.outcome === 'rng' && wave.min_multiplier_needed != null && (
            <Typography variant="caption" color="warning.main" display="block" mt={1}>
              Needs ≥{wave.min_multiplier_needed.toFixed(3)}× roll — clears ~{fmtPct(prob)} of the time
            </Typography>
          )}

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
        </Box>
      </Collapse>
    </Paper>
  );
};

// Render the runtime verbose trace (result.debug) as a copy-pasteable text log:
// per-wave enemy rosters (class / attribute / traits) and per-NP damage
// breakdowns (every multiplier, per-hit damage, active buffs). Generated each
// run, never stored — handy for debugging a non-clear and for bug reports.
const formatTrace = (debug) => {
  const lines = [];
  for (const e of debug) {
    if (e.type === 'wave') {
      lines.push(`── Wave ${e.wave} ──`);
      for (const en of e.enemies) {
        lines.push(`  [${en.index}] ${en.name} · ${en.className || '?'} · ${en.attribute || '?'} · HP ${fmtNum(en.maxHp)} · traits [${(en.traits || []).join(', ')}]`);
      }
    } else if (e.type === 'np') {
      const b = e.breakdown || {};
      lines.push(`▸ W${e.wave} ${e.servant.name} [${e.servant.className}] NP (${e.card}) → ${e.target.name}`);
      lines.push(`    total ${fmtNum(e.total)} · perHit [${(e.perHit || []).map(fmtNum).join(', ')}]`);
      lines.push(`    ATK ${fmtNum(b.baseAtk)} × npMult ${b.npMult} × card ${b.card} × class ${b.classAdv} × attr ${b.attribute} × SE ${b.superEffective} × roll ${b.rollMultiplier}`);
      lines.push(`    +mods: atkMod ${b.atkMod} · npDmg ${b.npDmgMod} · power ${b.powerMod} · cardMod ${b.cardMod}${b.flatDamage ? ` · flat ${fmtNum(b.flatDamage)}` : ''}`);
      const buffs = (e.activeBuffs || []).filter(x => x.name);
      lines.push(`    buffs: ${buffs.length ? buffs.map(x => `${x.name}(${x.value}${x.turns >= 0 ? `,${x.turns}t` : ''})`).join(', ') : '—'}`);
    }
  }
  return lines.join('\n');
};

const DebugLog = ({ debug }) => {
  const [open, setOpen] = React.useState(false);
  if (!debug || debug.length === 0) return null;
  const npCount = debug.filter(e => e.type === 'np').length;
  return (
    <Box mt={2}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        <Typography variant="subtitle2">Detailed run log ({npCount} NP hit{npCount === 1 ? '' : 's'})</Typography>
      </Box>
      <Collapse in={open}>
        <Box
          component="pre"
          sx={{
            fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'pre-wrap', m: 0, mt: 1,
            p: 1.5, borderRadius: 1, maxHeight: 480, overflow: 'auto',
            backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text)',
          }}
        >
          {formatTrace(debug)}
        </Box>
      </Collapse>
    </Box>
  );
};

const SimulationStats = ({ result }) => {
  if (!result) return null;

  if (!result.success) {
    return (
      <Box
        mt={4}
        p={2}
        sx={{
          backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
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
    debug,
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
          {first_failed_token ? ` — first: "${first_failed_token}"` : ''}
        </Typography>
      )}

      <DebugLog debug={debug} />
    </Box>
  );
};

export default SimulationStats;
