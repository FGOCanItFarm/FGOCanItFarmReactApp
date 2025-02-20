import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, Box, Button, Select, MenuItem } from '@mui/material';

const MysticCodeSelection = ({ team, setTeam, updateCommands }) => {
    const [mysticCodes, setMysticCodes] = useState([]);
    const [selectedMysticCode, setSelectedMysticCode] = useState('');
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedBottom, setSelectedBottom] = useState(null);

    useEffect(() => {
        // Fetch mystic codes data from API
        const fetchMysticCodes = async () => {
            try {
                const response = await axios.get('/api/mysticcodes');
                setMysticCodes(response.data);
            } catch (error) {
                console.error('Error fetching mystic codes:', error);
            }
        };

        fetchMysticCodes();
    }, []);

    const swapServants = (index1, index2) => {
        const newTeam = [...team];
        [newTeam[index1], newTeam[index2]] = [newTeam[index2], newTeam[index1]];
        setTeam(newTeam);
    };

    const handleSwap = () => {
        if (selectedTop !== null && selectedBottom !== null && team[selectedTop] && team[selectedBottom]) {
            swapServants(selectedTop, selectedBottom);
            setSelectedTop(null);
            setSelectedBottom(null);
        }
    };

    const addCommand = (command) => {
        updateCommands((prevCommands) => [...prevCommands, command]);
    };

    const renderButtons = (mysticCodeId) => {
        if (mysticCodeId === 210 || mysticCodeId === 20) {
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
                        <Grid container spacing={1} style={{ padding: '10px' }}>
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <Grid item xs={4} key={index}>
                                    <Button
                                        size="small"
                                        variant={selectedTop === index || selectedBottom === index ? "contained" : "outlined"}
                                        onClick={() => {
                                            if (index < 3) {
                                                setSelectedTop(index);
                                            } else {
                                                setSelectedBottom(index);
                                            }
                                        }}
                                        style={{ border: '1px solid lightgray' }}
                                        title={`Swap with ${team[index]?.name}`}
                                    >
                                        {index + 1}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                        <Box display="flex" justifyContent="center" mt={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => { handleSwap(); addCommand(`x${selectedTop}${selectedBottom}`); }}
                                disabled={selectedTop === null || selectedBottom === null || !team[selectedTop] || !team[selectedBottom]}
                            >
                                Swap
                            </Button>
                        </Box>
                    </Box>
                </Box>
            );
        } else {
            return (
                <Box>
                    <Box>
                        <Typography variant="h6">Skill 1</Typography>
                        <Grid>
                            <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j1`)} title={`Use Skill 1 on Servant 1 ${team[0]?.name}`}>1</Button>
                            <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j2`)} title={`Use Skill 1 on Servant 2 ${team[1]?.name}`}>2</Button>
                            <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j3`)} title={`Use Skill 1 on Servant 3 ${team[2]?.name}`}>3</Button>
                        </Grid>
                        <Button size="small" style={{ border: '1px solid lightgray' }} onClick={() => addCommand(`j`)} title={`Use Skill 1 on Self/Team`}>None</Button>
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

    return (
        <div style={{ backgroundColor: '#e0f7fa', padding: '20px', borderRadius: '8px', width: '30rem' }}>
            <Typography variant="h6">Mystic Codes</Typography>
            <Select
                value={selectedMysticCode}
                onChange={(e) => setSelectedMysticCode(e.target.value)}
                displayEmpty
                fullWidth
                style={{ marginBottom: '20px' }}
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

export default MysticCodeSelection;
