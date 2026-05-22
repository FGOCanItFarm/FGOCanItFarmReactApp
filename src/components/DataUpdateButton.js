import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button,
  CircularProgress,
  Chip,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';

const POLL_INTERVAL_MS = 5000;

function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
}

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export default function DataUpdateButton() {
  const [statusInfo, setStatusInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const pollTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/update-status');
      if (!res.ok) return;
      const data = await res.json();
      setStatusInfo(data);
      if (data.wait_seconds > 0) {
        setCountdown(data.wait_seconds);
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch update status', err);
    }
  }, []);

  // Start / stop polling while running
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(async () => {
      const data = await fetchStatus();
      if (data && data.status !== 'running') {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }, POLL_INTERVAL_MS);
  }, [fetchStatus]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (countdown > 0) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
            // Refresh status when cooldown expires
            fetchStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [countdown, fetchStatus]);

  // Initial fetch on mount; resume polling if already running
  useEffect(() => {
    fetchStatus().then((data) => {
      if (data && data.status === 'running') {
        startPolling();
      }
    });
    return () => {
      stopPolling();
    };
  }, [fetchStatus, startPolling, stopPolling]);

  const handleClick = async () => {
    try {
      const res = await fetch('/api/trigger-update', { method: 'POST' });
      if (res.status === 429) {
        const data = await res.json();
        setStatusInfo((prev) => ({ ...prev, status: data.status, wait_seconds: data.wait_seconds, ready: false }));
        setCountdown(data.wait_seconds);
        return;
      }
      if (res.status === 202) {
        setStatusInfo((prev) => ({ ...prev, status: 'running', ready: false }));
        startPolling();
      }
    } catch (err) {
      console.error('Failed to trigger update', err);
    }
  };

  if (!statusInfo) {
    return (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  const { status, last_complete } = statusInfo;
  const inCooldown = countdown > 0;
  const isRunning = status === 'running';
  const isFailed = status === 'failed';
  const buttonDisabled = isRunning || inCooldown;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {isFailed && (
        <Chip
          label="Last update failed"
          color="error"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
        />
      )}
      {!isRunning && last_complete && !inCooldown && (
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatRelativeTime(last_complete)}
        </Typography>
      )}
      {inCooldown && (
        <Typography variant="caption" color="text.secondary">
          Next update in {formatCountdown(countdown)}
        </Typography>
      )}
      <Tooltip title="Syncs servant, quest, and mystic code data from Atlas Academy">
        <span>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClick}
            disabled={buttonDisabled}
            startIcon={isRunning ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ width: '100%' }}
          >
            {isRunning ? 'Updating…' : 'Update Game Data'}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
