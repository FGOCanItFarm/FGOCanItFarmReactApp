import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardMedia, CardContent, Box, Button } from '@mui/material';

const MysticCodeSelection = ({ team, setTeam }) => {
    const [mysticCodes, setMysticCodes] = useState([]);
    const [selectedMysticCode, setSelectedMysticCode] = useState(null);
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
    
    const renderButtons = (mysticCodeId) => {
        if (mysticCodeId === 210 || mysticCodeId === 20) {
            return (
                <Box>
                <Box>
                <Box>
                <Typography variant="h6">Skill 1</Typography>
                </Box>
                <Grid>
                <Button size="sm" onClick={() => addCommand(`j1`)}>On Servant 1</Button>
                <Button size="sm" onClick={() => addCommand(`j2`)}>On Servant 2</Button>
                <Button size="sm" onClick={() => addCommand(`j3`)}>On Servant 3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`j`)}>No Target</Button>
                </Box>
                <Box>
                <Box>
                <Typography variant="h6">Skill 2</Typography>
                </Box>
                <Grid>
                <Button size="sm" onClick={() => addCommand(`k1`)}>On Servant 1</Button>
                <Button size="sm" onClick={() => addCommand(`k2`)}>On Servant 2</Button>
                <Button size="sm" onClick={() => addCommand(`k3`)}>On Servant 3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`k`)}>No Target</Button>
                </Box>
                <Box>
                <Typography variant="h6">Skill 3</Typography>
                </Box>
                <Grid container spacing={1} style={{ padding: '10px' }}>
                <Grid item xs={4}>
                <Button size="sm" variant={selectedTop === 0 ? "contained" : "outlined"} onClick={() => setSelectedTop(0)}>1
                </Button>
                </Grid>
                <Grid item xs={4}>
                <Button size="sm" variant={selectedTop === 1 ? "contained" : "outlined"} onClick={() => setSelectedTop(1)}>2
                </Button>
                </Grid>
                <Grid item xs={4}>
                <Button size="sm" variant={selectedTop === 2 ? "contained" : "outlined"} onClick={() => setSelectedTop(2)}>3
                </Button>
                </Grid>
                <Grid item xs={4}>
                <Button size="sm" variant={selectedBottom === 3 ? "contained" : "outlined"} onClick={() => setSelectedBottom(3)}>4
                </Button>
                </Grid>
                <Grid item xs={4}>
                <Button size="sm" variant={selectedBottom === 4 ? "contained" : "outlined"} onClick={() => setSelectedBottom(4)}>5
                </Button>
                </Grid>
                <Grid item xs={4}>
                <Button size="sm" variant={selectedBottom === 5 ? "contained" : "outlined"} onClick={() => setSelectedBottom(5)}>6
                </Button>
                </Grid>
                </Grid>
                <Box display="flex" justifyContent="center" mt={2}>
                <Button 
                variant="contained" 
                color="primary" onClick={handleSwap}disabled={selectedTop === null || selectedBottom === null || !team[selectedTop] || !team[selectedBottom]}>Swap
                </Button>
                </Box>
                </Box>
            );
        } else {
            return (
                <Box>
                <Box>
                <Box>
                <Typography variant="h6">Skill 1</Typography>
                </Box>
                <Grid>
                <Button size="sm" onClick={() => addCommand(`j1`)}>On Servant 1</Button>
                <Button size="sm" onClick={() => addCommand(`j2`)}>On Servant 2</Button>
                <Button size="sm" onClick={() => addCommand(`j3`)}>On Servant 3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`j`)}>No Target</Button>
                </Box>
                <Box>
                <Box>
                <Typography variant="h6">Skill 2</Typography>
                </Box>
                <Grid>
                <Button size="sm" onClick={() => addCommand(`k1`)}>On Servant 1</Button>
                <Button size="sm" onClick={() => addCommand(`k2`)}>On Servant 2</Button>
                <Button size="sm" onClick={() => addCommand(`k3`)}>On Servant 3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`k`)}>No Target</Button>
                </Box>
                <Box>
                <Box>
                <Typography variant="h6">Skill 3</Typography>
                </Box>
                <Grid>
                <Button size="sm" onClick={() => addCommand(`l1`)}>Servant 1</Button>
                <Button size="sm" onClick={() => addCommand(`l2`)}>Servant 2</Button>
                <Button size="sm" onClick={() => addCommand(`l3`)}>Servant 3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`l`)}>No Target</Button>
                </Box>
                </Box>
            );
        }
    };
    
    const addCommand = (command) => {
        // Implement the logic to add the command to the list of commands
        console.log(`Command added: ${command}`);
    };
    
    return (
        <div style={{ backgroundColor: '#e0f7fa', padding: '20px', borderRadius: '8px' }}>
        <Typography variant="h5">Mystic Codes</Typography>
        <Grid container spacing={2}>
        {mysticCodes.map((mysticCode) => (
            <Grid item xs={12} sm={6} md={4} key={mysticCode.id}>
            <Card
            onClick={() => setSelectedMysticCode(mysticCode.id)}
            style={{
                backgroundColor: selectedMysticCode === mysticCode.id ? '#d0ba98' : '#fff',
                opacity: selectedMysticCode === mysticCode.id ? 1 : 0.5,
            }}
            >
            <CardMedia
            component="img"
            alt={mysticCode.name}
            height="160"
            width="160"
            image={mysticCode.extraAssets?.item?.male}
            />
            <CardContent>
            <Typography variant="h6">{mysticCode.name}</Typography>
            <Typography variant="body2" color="textSecondary">
            {mysticCode.description}
            </Typography>
            {selectedMysticCode === mysticCode.id && renderButtons(mysticCode.id)}
            </CardContent>
            </Card>
            </Grid>
        ))}
        </Grid>
        </div>
    );
};

export default MysticCodeSelection;
