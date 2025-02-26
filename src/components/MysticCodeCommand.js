import React, { useState } from 'react';
import { Grid, Typography, Box, Button, Select, MenuItem } from '@mui/material';

const mysticCodes = [
  { id: 410, name: 'Winter Casual' },
  { id: 210, name: 'Chaldea Uniform - Decisive Battle' },
  { id: 100, name: 'A Fragment of 2004' },
  { id: 40, name: 'Atlas Institute Uniform' },
  { id: 20, name: 'Chaldea Combat Uniform' },
];

const MysticCodeCommand = ({ team, setTeam, updateCommands, selectedMysticCode, setSelectedMysticCode }) => {
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);

  const swapServants = (index1, index2) => {
    const newTeam = [...team];
    [newTeam[index1], newTeam[index2]] = [newTeam[index2], newTeam[index1]];
    setTeam(newTeam);
  };

  const handleSwap = () => {
    if (selectedTop !== null && selectedBottom !== null) {
      swapServants(selectedTop, selectedBottom);
      setSelectedTop(null);
      setSelectedBottom(null);
    }
  };

  const addCommand = (command) => {
    updateCommands((prevCommands) => [...prevCommands, command]);
  };

  const renderButtons = (mysticCodeId) => {

    switch (mysticCodeId) {
      case 20 || 210: // Chaldea Combat Uniform
        return (
          <div>
            <Box>
              <Typography variant="h6">Skill 1</Typography>
              <Grid>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j1`)} title={`Use Skill 1 on Servant 1: ${team[0]?.name}`}>1</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j2`)} title={`Use Skill 1 on Servant 2: ${team[1]?.name}`}>2</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j3`)} title={`Use Skill 1 on Servant 3: ${team[2]?.name}`}>3</Button>
              </Grid>
              <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j`)} title={`Use Skill on Self/Team`}>None</Button>
            </Box>
            <Box>
              <Typography variant="h6">Skill 2</Typography>
              <Grid>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k1`)} title={`Use Skill 2 on Servant 1 ${team[0]?.name}`}>1</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k2`)} title={`Use Skill 2 on Servant 2 ${team[1]?.name}`}>2</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k3`)} title={`Use Skill 2 on Servant 3 ${team[2]?.name}`}>3</Button>
              </Grid>
              <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k`)} title={`Use Skill 2 on Self/Team`}>None</Button>
            </Box>
            <Select
              value={selectedTop}
              onChange={(e) => setSelectedTop(e.target.value)}
              displayEmpty
              fullWidth
              style={{ marginBottom: '20px', minWidth: '200px' }}
            >
              <MenuItem value="">Select Top Servant</MenuItem>
              {team.map((servant, index) => (
                <MenuItem key={index} value={index}>
                  {servant.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              value={selectedBottom}
              onChange={(e) => setSelectedBottom(e.target.value)}
              displayEmpty
              fullWidth
              style={{ marginBottom: '20px', minWidth: '200px' }}
            >
              <MenuItem value="">Select Bottom Servant</MenuItem>
              {team.map((servant, index) => (
                <MenuItem key={index} value={index}>
                  {servant.name}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              color="primary"
              onClick={() => { handleSwap(); addCommand(`x${selectedTop+1}${selectedBottom+1}`); }}
              disabled={selectedTop === null || selectedBottom === null || !team[selectedTop] || !team[selectedBottom]}
            >
              Swap
            </Button>
          </div>
        );
      default:
        return (
          <Box>
            <Box>
              <Typography variant="h6">Skill 1</Typography>
              <Grid>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j1`)} title={`Use Skill 1 on Servant 1: ${team[0]?.name}`}>1</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j2`)} title={`Use Skill 1 on Servant 2: ${team[1]?.name}`}>2</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j3`)} title={`Use Skill 1 on Servant 3: ${team[2]?.name}`}>3</Button>
              </Grid>
              <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j`)} title={`Use Skill on Self/Team`}>None</Button>
            </Box>
            <Box>
              <Typography variant="h6">Skill 2</Typography>
              <Grid>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k1`)} title={`Use Skill 2 on Servant 1 ${team[0]?.name}`}>1</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k2`)} title={`Use Skill 2 on Servant 2 ${team[1]?.name}`}>2</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k3`)} title={`Use Skill 2 on Servant 3 ${team[2]?.name}`}>3</Button>
              </Grid>
              <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`k`)} title={`Use Skill 2 on Self/Team`}>None</Button>
            </Box>
            <Box>
              <Typography variant="h6">Skill 3</Typography>
              <Grid>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`l1`)} title={`Use Skill 3 on Servant 1 ${team[0]?.name}`}>1</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`l2`)} title={`Use Skill 3 on Servant 2 ${team[1]?.name}`}>2</Button>
                <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`l3`)} title={`Use Skill 3 on Servant 3 ${team[2]?.name}`}>3</Button>
              </Grid>
              <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`l`)} title={`Use Skill 3 on Self/Team`}>None</Button>
            </Box>
          </Box>
        );
    }
  };

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
      {selectedMysticCode && renderButtons(selectedMysticCode)}
    </div>
  );
};

export default MysticCodeCommand;