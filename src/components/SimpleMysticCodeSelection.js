import React from 'react';
import { Typography, Select, MenuItem } from '@mui/material';

const mysticCodes = [
  { id: 410, name: 'Winter Casual' },
  { id: 210, name: 'Chaldea Uniform - Decisive Battle' },
  { id: 100, name: 'A Fragment of 2004' },
  { id: 40, name: 'Atlas Institute Uniform' },
  { id: 20, name: 'Chaldea Combat Uniform' },
];

const SimpleMysticCodeSelection = ({ selectedMysticCode, setSelectedMysticCode }) => {
  const handleMysticCodeChange = (event) => {
    setSelectedMysticCode(event.target.value);
  };

  return (
    <div style={{ backgroundColor: '#e0f7fa', padding: '20px', borderRadius: '8px', width: '30rem' }}>
      <Typography variant="h6">Mystic Codes</Typography>
      <Select
        value={selectedMysticCode}
        onChange={handleMysticCodeChange}
        displayEmpty
        fullWidth
        style={{ marginBottom: '20px', minWidth: '200px' }}
      >
        <MenuItem value="" disabled>Select Mystic Code</MenuItem>
        {mysticCodes.map((mysticCode) => (
          <MenuItem key={mysticCode.id} value={mysticCode.id} style={{ whiteSpace: 'normal' }}>
            {mysticCode.name}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default SimpleMysticCodeSelection;