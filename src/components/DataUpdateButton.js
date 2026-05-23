import React, { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Typography, Box, Chip, Tooltip, LinearProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { supabase } from '../supabaseClient';

const WORKER_URL = process.env.REACT_APP_WORKER_URL;

function fmtAge(iso) {
  if (!iso) return null;
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DataUpdateButton() {
  const [lastUpdated, setLastUpdated] = useState(undefined);
  const [running, setRunning]         = useState(false);
  const [error, setError]             = useState(null);
  const [workerOk, setWorkerOk]       = useState(null);

  const fetchLastUpdated = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('metadata')
        .select('value')
        .eq('key', 'aa_version')
        .maybeSingle();
      setLastUpdated(data?.value?.updated_at ?? null);
    } catch {
      setLastUpdated(null);
    }
  }, []);

  useEffect(() => { fetchLastUpdated(); }, [fetchLastUpdated]);

  useEffect(() => {
    if (!WORKER_URL) return;
    fetch(`${WORKER_URL}/health`)
      .then(r => setWorkerOk(r.ok))
      .catch(() => setWorkerOk(false));
  }, []);

  const handleSync = async () => {
    if (!WORKER_URL) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/run`, { method: 'POST' });
      if (!res.ok) throw new Error(`Worker ${res.status}`);
      setTimeout(fetchLastUpdated, 5000);
      setTimeout(fetchLastUpdated, 15000);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const ageText = lastUpdated === undefined ? null
    : lastUpdated ? `Updated ${fmtAge(lastUpdated)}`
    : 'Never synced';

  if (!WORKER_URL) {
    return (
      <Box>
        <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', mb: 0.5, lineHeight: 1.4 }}>
          Data sync not configured. Add to .env.local:
        </Typography>
        <Box
          component="code"
          sx={{
            display: 'block',
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-gold)',
            p: 0.75,
            borderRadius: 0.5,
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            userSelect: 'all',
            wordBreak: 'break-all',
          }}
        >
          REACT_APP_WORKER_URL=https://…
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      {error && (
        <Tooltip title={error}>
          <Chip
            label="Sync error"
            size="small"
            color="error"
            onDelete={() => setError(null)}
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
        </Tooltip>
      )}

      {ageText && (
        <Box display="flex" alignItems="center" gap={0.5}>
          {workerOk === true && (
            <CheckCircleIcon sx={{ fontSize: 12, color: 'var(--color-success)' }} />
          )}
          {workerOk === false && (
            <WarningIcon sx={{ fontSize: 12, color: 'var(--color-error)' }} />
          )}
          {!running && (
            <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', lineHeight: 1.3 }}>
              {ageText}
            </Typography>
          )}
        </Box>
      )}

      {running && (
        <LinearProgress sx={{ height: 2 }} />
      )}

      <Button
        variant="outlined"
        size="small"
        onClick={handleSync}
        disabled={running}
        startIcon={
          running
            ? <CircularProgress size={12} color="inherit" />
            : <SyncIcon sx={{ fontSize: '14px !important' }} />
        }
        sx={{
          fontSize: '0.75rem',
          py: 0.6,
          borderColor: 'var(--color-border-active)',
          color: 'var(--color-gold)',
          '&:hover': {
            borderColor: 'var(--color-gold)',
            backgroundColor: 'var(--color-gold-dim)',
          },
          '&.Mui-disabled': { opacity: 0.5 },
        }}
      >
        {running ? 'Syncing…' : 'Sync Game Data'}
      </Button>
    </Box>
  );
}
