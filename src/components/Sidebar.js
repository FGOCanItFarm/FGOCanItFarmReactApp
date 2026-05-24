import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DataUpdateButton from './DataUpdateButton';

// Ordered as a left-to-right workflow (flowchart): pick team → quest → build
// commands → browse community runs. Instructions sits at the front as the entry.
const NAV = [
  { label: 'Instructions',    path: '/instructions' },
  { label: 'Team',            path: '/team-selection' },
  { label: 'Quest',           path: '/quest-selection' },
  { label: 'Command',         path: '/command-input' },
  { label: 'Search',          path: '/search' },
];

const Sidebar = ({ team, selectedQuest }) => {
  const location        = useLocation();
  const isTeamValid     = team.filter(m => m && m.collectionNo).length >= 3;
  const isQuestSelected = !!selectedQuest;

  const badge = (path) => {
    if (path === '/team-selection')
      return isTeamValid
        ? <CheckCircleIcon sx={{ fontSize: 14, color: 'var(--color-success)', flexShrink: 0 }} />
        : <ErrorIcon       sx={{ fontSize: 14, color: 'var(--color-error)',   flexShrink: 0 }} />;
    if (path === '/quest-selection')
      return isQuestSelected
        ? <CheckCircleIcon sx={{ fontSize: 14, color: 'var(--color-success)', flexShrink: 0 }} />
        : <ErrorIcon       sx={{ fontSize: 14, color: 'var(--color-error)',   flexShrink: 0 }} />;
    return null;
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        zIndex: 'var(--z-tooltip)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto',
      }}
    >
      {/* Brand */}
      <Typography sx={{
        color: 'var(--color-gold)',
        fontWeight: 700,
        fontSize: '0.78rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        mr: 1,
      }}>
        FGO Can It Farm
      </Typography>

      {/* Flowchart nav */}
      <Box component="nav" sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        {NAV.map(({ label, path }, i) => {
          const active = location.pathname === path
            || (path === '/instructions' && location.pathname === '/');
          return (
            <React.Fragment key={path}>
              {i > 0 && <ChevronRightIcon sx={{ fontSize: 16, color: 'var(--color-text-dim)', flexShrink: 0 }} />}
              <Box
                component={Link}
                to={path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.6,
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-gold)' : 'var(--color-text-dim)',
                  backgroundColor: active ? 'var(--color-gold-dim)' : 'transparent',
                  transition: 'background-color 0.14s, color 0.14s',
                  '&:hover': { color: 'var(--color-text)', backgroundColor: 'rgba(255,255,255,0.04)' },
                }}
              >
                <span>{label}</span>
                {badge(path)}
              </Box>
            </React.Fragment>
          );
        })}
      </Box>

      {/* Data sync */}
      <Box sx={{ flexShrink: 0 }}>
        <DataUpdateButton />
      </Box>
    </Box>
  );
};

export default Sidebar;
