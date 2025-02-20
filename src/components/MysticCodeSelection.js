import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardMedia, CardContent, Box, Button } from '@mui/material';

const MysticCodeSelection = ({ team = [], setTeam, updateCommands, addCommand }) => {
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
                <Button size="sm" onClick={() => addCommand(`j1`)}>1</Button>
                <Button size="sm" onClick={() => addCommand(`j2`)}>2</Button>
                <Button size="sm" onClick={() => addCommand(`j3`)}>3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`j`)}>None</Button>
                </Box>
                <Box>
                <Box>
                <Typography variant="h6">Skill 2</Typography>
                </Box>
                <Grid>
                <Button size="sm" onClick={() => addCommand(`k1`)}>1</Button>
                <Button size="sm" onClick={() => addCommand(`k2`)}>2</Button>
                <Button size="sm" onClick={() => addCommand(`k3`)}>3</Button>
                </Grid>
                <Button size="sm" onClick={() => addCommand(`k`)}>None</Button>
                </Box>
                <Box>
                <Typography variant="h6">Skill 3</Typography>
                </Box>
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
                                    title={`Swap with ${team[index]?.name || 'Empty'}`}
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
                            onClick={handleSwap}
                            disabled={selectedTop === null || selectedBottom === null || !team[selectedTop] || !team[selectedBottom]}
                        >
                            Swap
                        </Button>
                    </Box>
                </Box>
            );
        } else {
            return (
                <Box>
                    {[1, 2, 3].map((skillIndex) => (
                        <Box key={skillIndex}>
                            <Button
                                size="small"
                                onClick={() => addCommand(`k${skillIndex}`)}
                                style={{ border: '1px solid lightgray' }}
                                title={`Skill ${skillIndex} on ${team[0]?.name || 'Empty'}`}
                            >
                                S{skillIndex}
                            </Button>
                            <Button
                                size="small"
                                onClick={() => addCommand(`k${skillIndex}`)}
                                style={{ border: '1px solid lightgray' }}
                                title={`Skill ${skillIndex} on ${team[1]?.name || 'Empty'}`}
                            >
                                S{skillIndex}
                            </Button>
                            <Button
                                size="small"
                                onClick={() => addCommand(`k${skillIndex}`)}
                                style={{ border: '1px solid lightgray' }}
                                title={`Skill ${skillIndex} on ${team[2]?.name || 'Empty'}`}
                            >
                                S{skillIndex}
                            </Button>
                            <Button
                                size="small"
                                onClick={() => addCommand(`k`)}
                                style={{ border: '1px solid lightgray' }}
                                title={`Skill ${skillIndex} No Target`}
                            >
                                None
                            </Button>
                        </Box>
                    ))}
                </Box>
            );
        }
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
