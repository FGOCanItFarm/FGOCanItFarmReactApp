import React, { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Typography, Box, Chip, Tooltip, LinearProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { supabase } from '../supabaseClient';

// Sync runs as a Cloudflare Pages Function at /api/sync (same origin as the
// app), so no separate Worker URL is needed. REACT_APP_WORKER_URL only matters
// for local dev if you proxy the function from another origin.
const SYNC_URL = `${process.env.REACT_APP_WORKER_URL || ''}/api/sync`;

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
  const [notice, setNotice]           = useState(null);
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
    fetch(SYNC_URL)
      .then(r => setWorkerOk(r.ok))
      .catch(() => setWorkerOk(false));
  }, []);

  const handleSync = async () => {
    setRunning(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(SYNC_URL, { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (res.status === 429 || body.status === 'skipped') {
        setNotice('Data is already up to date — try again later.');
        return;
      }
      if (body.status === 'up_to_date') {
        setNotice('Already on the latest game version.');
        return;
      }
      if (!res.ok) throw new Error(`Sync ${res.status}`);
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

      {notice && (
        <Chip
          label={notice}
          size="small"
          onDelete={() => setNotice(null)}
          sx={{ fontSize: '0.65rem', height: 20 }}
        />
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
