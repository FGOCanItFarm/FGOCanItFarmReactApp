import React, { useState } from 'react';
import { Box, Button, Select, MenuItem, Typography } from '@mui/material';

const mysticCodes = [
  { id: 410, name: 'Winter Casual' },
  { id: 210, name: 'Chaldea Uniform - Decisive Battle' },
  { id: 100, name: 'A Fragment of 2004' },
  { id: 40, name: 'Atlas Institute Uniform' },
  { id: 20, name: 'Chaldea Combat Uniform' },
];

const MysticCodeCommand = ({ team = [], setTeam = () => {}, updateCommands = () => {}, selectedMysticCode, setSelectedMysticCode, onSwap = () => {} }) => {
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);

  const swapServants = (index1, index2) => {
    const newTeam = [...team];
    [newTeam[index1], newTeam[index2]] = [newTeam[index2], newTeam[index1]];
    setTeam(newTeam);
    // Notify parent that a swap occurred so it can update selections or other UI
    try { onSwap(index1, index2); } catch (e) { /* noop */ }
  };

  const addCommand = (cmd) => updateCommands((prev) => [...prev, cmd]);

  const isSwapMC = selectedMysticCode === 20 || selectedMysticCode === 210;

  return (
    <div style={{ backgroundColor: '#e0f7fa', padding: 8, width: '30rem' }}>
      <Typography variant="h6">Mystic Codes</Typography>

      <Select
        value={selectedMysticCode ?? ''}
        onChange={(e) => setSelectedMysticCode(e.target.value)}
        displayEmpty
        fullWidth
        style={{ marginBottom: 12 }}
      >
        <MenuItem value="" disabled>Select Mystic Code</MenuItem>
        {mysticCodes.map((mc) => (
          <MenuItem key={mc.id} value={mc.id}>{mc.name}</MenuItem>
        ))}
      </Select>

      <Box display="flex" gap={8} mb={1}>
        <Button variant="outlined" onClick={() => addCommand('j')}>Skill 1</Button>
        <Button variant="outlined" onClick={() => addCommand('k')}>Skill 2</Button>
        {!isSwapMC && <Button variant="outlined" onClick={() => addCommand('l')}>Skill 3</Button>}
      </Box>

      {isSwapMC && (
        <Box display="flex" gap={8} alignItems="center">
          <Select
            value={selectedTop ?? ''}
            onChange={(e) => setSelectedTop(e.target.value === '' ? null : Number(e.target.value))}
            displayEmpty
            style={{ minWidth: 140 }}
          >
            <MenuItem value="">Top 1-3</MenuItem>
            {team.slice(0, 3).map((s, i) => (
              <MenuItem key={i} value={i} disabled={!s || !s.collectionNo}>{s && s.collectionNo ? `${s.collectionNo}` : `Empty ${i + 1}`}</MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (selectedTop !== null && selectedBottom !== null) {
                swapServants(selectedTop, selectedBottom);
                // emit a compact swap token: x<topIndex+1><bottomIndex+1>
                const cmd = `x${selectedTop + 1}${selectedBottom + 1}`;
                addCommand(cmd);
                setSelectedTop(null);
                setSelectedBottom(null);
              }
            }}
            disabled={selectedTop === null || selectedBottom === null || !team[selectedTop] || !team[selectedBottom]}
          >
            Swap
          </Button>

          <Select
            value={selectedBottom ?? ''}
            onChange={(e) => setSelectedBottom(e.target.value === '' ? null : Number(e.target.value))}
            displayEmpty
            style={{ minWidth: 140 }}
          >
            <MenuItem value="">Bottom 4-6</MenuItem>
            {team.slice(3, 6).map((s, i) => (
              <MenuItem key={i} value={i + 3} disabled={!s || !s.collectionNo}>{s && s.collectionNo ? `${s.collectionNo}` : `Empty ${i + 4}`}</MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </div>
  );
};

export default MysticCodeCommand;