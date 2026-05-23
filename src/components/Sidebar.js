import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DataUpdateButton from './DataUpdateButton';

const NAV = [
  { label: 'Instructions',    path: '/instructions' },
  { label: 'Team Selection',  path: '/team-selection' },
  { label: 'Quest Selection', path: '/quest-selection' },
  { label: 'Command Input',   path: '/command-input' },
  { label: 'Search',          path: '/search' },
];

const Sidebar = ({ team, selectedQuest }) => {
  const location       = useLocation();
  const isTeamValid    = team.filter(m => m && m.collectionNo).length >= 3;
  const isQuestSelected = !!selectedQuest;

  const badge = (path) => {
    if (path === '/team-selection')
      return isTeamValid
        ? <CheckCircleIcon sx={{ fontSize: 13, color: 'var(--color-success)', flexShrink: 0 }} />
        : <ErrorIcon       sx={{ fontSize: 13, color: 'var(--color-error)',   flexShrink: 0 }} />;
    if (path === '/quest-selection')
      return isQuestSelected
        ? <CheckCircleIcon sx={{ fontSize: 13, color: 'var(--color-success)', flexShrink: 0 }} />
        : <ErrorIcon       sx={{ fontSize: 13, color: 'var(--color-error)',   flexShrink: 0 }} />;
    return null;
  };

  return (
    <Box sx={{
      width: 192,
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100%',
      backgroundColor: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 'var(--z-sticky)',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: '1px solid var(--color-border)' }}>
        <Typography sx={{
          color: 'var(--color-gold)',
          fontWeight: 700,
          fontSize: '0.78rem',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}>
          FGO Can It Farm
        </Typography>
      </Box>

      {/* Nav */}
      <Box component="nav" sx={{ flex: 1, py: 1 }}>
        {NAV.map(({ label, path }) => {
          const active = location.pathname === path
            || (path === '/instructions' && location.pathname === '/');
          return (
            <Box
              key={path}
              component={Link}
              to={path}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mx: 1,
                my: 0.3,
                px: 1.5,
                py: 1.05,
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.855rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-gold)' : 'var(--color-text-dim)',
                backgroundColor: active ? 'var(--color-gold-dim)' : 'transparent',
                borderLeft: active
                  ? '2px solid var(--color-gold)'
                  : '2px solid transparent',
                transition: 'background-color 0.14s, color 0.14s',
                '&:hover': {
                  color: 'var(--color-text)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                },
              }}
            >
              <span>{label}</span>
              {badge(path)}
            </Box>
          );
        })}
      </Box>

      {/* Data sync */}
      <Box sx={{ p: 1.5, borderTop: '1px solid var(--color-border)' }}>
        <DataUpdateButton />
      </Box>
    </Box>
  );
};

export default Sidebar;
