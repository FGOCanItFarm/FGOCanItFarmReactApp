/**
 * Renders the current command sequence as deletable chips (FR-6).
 *
 * Each token becomes one MUI Chip labelled by `humanizeToken`; clicking the
 * chip's ✕ removes that token from the command list. Tokens that fail the
 * cheap syntactic check (`classifyToken` returns null) render with an
 * "invalid" tint — typically the result of a manual paste/edit, so the user
 * sees what's wrong instead of silently losing it. Engine-level legality
 * (skill cooldown, NP gauge insufficient) lives in a follow-up that wires
 * `buildEngineAt`'s `failedIndex` into the same row.
 *
 * Props:
 *   - commands: string[]
 *   - team: [{ collectionNo, ... }] × 6 — only used so chip labels can resolve
 *     ally targets to readable names.
 *   - servants: Servant[] (the roster from props) — for collectionNo → name lookup.
 *   - setCommands: (next: string[]) => void
 */
import React, { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { classifyToken, humanizeToken } from '../simulation/CommandState';
import '../CommandInputPage.css';
import '../ui-vars.css';

function buildSnapshot(team, servants) {
  const front = team.slice(0, 3).map((slot) => {
    if (!slot?.collectionNo) return { name: '' };
    const s = servants.find((sv) => String(sv.collectionNo) === String(slot.collectionNo));
    return { name: s?.name || `#${slot.collectionNo}` };
  });
  return { front };
}

const CommandChips = ({ commands = [], team = [], servants = [], setCommands = () => {} }) => {
  const snapshot = useMemo(() => buildSnapshot(team, servants), [team, servants]);

  if (commands.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
        No commands yet — pick a skill or NP to start.
      </Typography>
    );
  }

  const deleteAt = (index) => setCommands(commands.filter((_, i) => i !== index));

  return (
    <Box display="flex" flexWrap="wrap" gap={0.5} role="list" aria-label="Command sequence">
      {commands.map((token, i) => {
        const invalid = classifyToken(token) === null && token !== '#';
        const label = invalid ? `Invalid: ${token}` : humanizeToken(token, snapshot);
        return (
          <Chip
            key={`${i}-${token}`}
            role="listitem"
            size="small"
            label={`${i + 1}. ${label}`}
            onDelete={() => deleteAt(i)}
            sx={invalid ? {
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)',
              backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
            } : undefined}
            variant="outlined"
            aria-label={`Token ${i + 1}: ${label}`}
          />
        );
      })}
    </Box>
  );
};

export default CommandChips;
