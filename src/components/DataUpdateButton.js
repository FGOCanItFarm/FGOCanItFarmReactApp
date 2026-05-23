import React, { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Typography, Box, Chip } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
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
  const [lastUpdated, setLastUpdated] = useState(undefined); // undefined = loading
  const [running, setRunning]         = useState(false);
  const [error, setError]             = useState(null);

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

  const handleSync = async () => {
    if (!WORKER_URL) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/run`, { method: 'POST' });
      if (!res.ok) throw new Error(`Worker ${res.status}`);
      // Give the worker a moment to write the metadata record, then refresh
      setTimeout(fetchLastUpdated, 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const ageText = lastUpdated === undefined ? null
    : lastUpdated ? `Updated ${fmtAge(lastUpdated)}`
    : 'Never synced';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      {error && (
        <Chip
          label={error}
          size="small"
          color="error"
          onDelete={() => setError(null)}
          sx={{ fontSize: '0.65rem', height: 20 }}
        />
      )}
      {ageText && !running && (
        <Typography sx={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', lineHeight: 1.3 }}>
          {ageText}
        </Typography>
      )}
      {!WORKER_URL ? (
        <Typography sx={{ fontSize: '0.68rem', color: 'var(--color-text-dim)', lineHeight: 1.4 }}>
          Set REACT_APP_WORKER_URL to enable sync
        </Typography>
      ) : (
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
      )}
    </Box>
  );
}
