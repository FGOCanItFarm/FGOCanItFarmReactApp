/**
 * Renders the current command sequence as deletable chips (FR-6).
 *
 * Each token becomes one MUI Chip labelled by `humanizeToken`; clicking the
 * chip's ✕ removes that token from the command list.
 *
 * Three chip states:
 *   - "invalid"      — token fails the cheap syntactic check
 *                      (`classifyToken` returns null). Red tint; typical of a
 *                      manual paste typo.
 *   - "failed"       — token at index === failedIndex (the first engine-level
 *                      refusal: skill on cooldown, NP gauge insufficient,
 *                      target out of range). Red tint, same as invalid.
 *   - "invalidated"  — index > failedIndex. Greyed out: these tokens still
 *                      exist in the list (per spec they're NOT silently
 *                      dropped) but they would never execute on the current
 *                      engine state until the failing token is fixed.
 *
 * Props:
 *   - commands: string[]
 *   - team: [{ collectionNo, ... }] × 6 — only used so chip labels can resolve
 *     ally targets to readable names.
 *   - servants: Servant[] (the roster from props) — for collectionNo → name lookup.
 *   - setCommands: (next: string[]) => void
 *   - failedIndex: number (default -1) — index of the first token rejected by
 *     a real engine replay (`buildEngineAt`), or -1 when every token applies.
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

const ERROR_SX = {
  borderColor: 'var(--color-error)',
  color: 'var(--color-error)',
  backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
};

const INVALIDATED_SX = {
  borderColor: 'var(--color-text-dim)',
  color: 'var(--color-text-dim)',
  opacity: 0.55,
  textDecoration: 'line-through',
};

const CommandChips = ({ commands = [], team = [], servants = [], setCommands = () => {}, failedIndex = -1 }) => {
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
        const syntactic = classifyToken(token) === null && token !== '#';
        const failedHere = failedIndex === i;
        const invalidated = failedIndex >= 0 && i > failedIndex;
        const errored = syntactic || failedHere;
        const label = syntactic ? `Invalid: ${token}` : humanizeToken(token, snapshot);
        const sx = errored ? ERROR_SX : invalidated ? INVALIDATED_SX : undefined;
        const title = failedHere ? 'Engine refused this token (cooldown / NP gauge / target?). Fix or delete it.'
          : invalidated ? 'Will not run until the earlier failing token is fixed.'
          : undefined;
        return (
          <Chip
            key={`${i}-${token}`}
            role="listitem"
            size="small"
            label={`${i + 1}. ${label}`}
            onDelete={() => deleteAt(i)}
            sx={sx}
            variant="outlined"
            title={title}
            aria-label={`Token ${i + 1}: ${label}${errored ? ' — failed' : invalidated ? ' — invalidated' : ''}`}
          />
        );
      })}
    </Box>
  );
};

export default CommandChips;
