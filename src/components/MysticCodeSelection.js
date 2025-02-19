import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardMedia, CardContent, Box, Button } from '@mui/material';

const MysticCodeSelection = ({ team, setTeam }) => {
  const [mysticCodes, setMysticCodes] = useState([]);
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
    if (selectedTop !== null && selectedBottom !== null) {
      swapServants(selectedTop, selectedBottom);
      setSelectedTop(null);
      setSelectedBottom(null);
    }
  };

  const renderButtons = (mysticCodeId) => {
    if (mysticCodeId === 210 || mysticCodeId === 20) {
      return (
        <Box>
          <Box style={{ backgroundColor: '#d0ba98'}}>
            <Button>On Servant 1</Button>
            <Button>On Servant 2</Button>
            <Button>On Servant 3</Button>
            <Button>No Target</Button>
          </Box>
          <Box style={{ backgroundColor: '#d0ba98'}}>
            <Button>On Servant 1</Button>
            <Button>On Servant 2</Button>
            <Button>On Servant 3</Button>
            <Button>No Target</Button>
          </Box>
          <Grid container spacing={1} style={{ backgroundColor: '#021825'}}>
            <Grid item xs={4}>
              <Button 
                size="small" 
                variant={selectedTop === 0 ? "contained" : "outlined"} 
                onClick={() => setSelectedTop(0)}
              >
                1
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                size="small" 
                variant={selectedTop === 1 ? "contained" : "outlined"} 
                onClick={() => setSelectedTop(1)}
              >
                2
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                size="small" 
                variant={selectedTop === 2 ? "contained" : "outlined"} 
                onClick={() => setSelectedTop(2)}
              >
                3
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                size="small" 
                variant={selectedBottom === 3 ? "contained" : "outlined"} 
                onClick={() => setSelectedBottom(3)}
              >
                4
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                size="small" 
                variant={selectedBottom === 4 ? "contained" : "outlined"} 
                onClick={() => setSelectedBottom(4)}
              >
                5
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button 
                size="small" 
                variant={selectedBottom === 5 ? "contained" : "outlined"} 
                onClick={() => setSelectedBottom(5)}
              >
                6
              </Button>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSwap}
              disabled={selectedTop === null || selectedBottom === null}
            >
              Swap
            </Button>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box>
          <Box>
            <Button>On Servant 1</Button>
            <Button>On Servant 2</Button>
            <Button>On Servant 3</Button>
            <Button>No Target</Button>
          </Box>
          <Box>
            <Button>On Servant 1</Button>
            <Button>On Servant 2</Button>
            <Button>On Servant 3</Button>
            <Button>No Target</Button>
          </Box>
          <Box>
            <Button>On Servant 1</Button>
            <Button>On Servant 2</Button>
            <Button>On Servant 3</Button>
            <Button>No Target</Button>
          </Box>
        </Box>
      );
    }
  };

  return (
    <div style={{ backgroundColor: '#e0f7fa', padding: '20px', borderRadius: '8px' }}>
      <Typography variant="h5">Mystic Codes</Typography>
      <Grid container spacing={2}>
        {mysticCodes.map((mysticCode) => (
          <Grid item xs={12} sm={6} md={4} key={mysticCode._id}>
            <Card>
              <CardMedia
                component="img"
                alt={mysticCode.name}
                height="80"
                width="80"
                image={mysticCode.extraAssets?.item?.male}
              />
              <CardContent>
                <Typography variant="h6">{mysticCode.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {mysticCode.description}
                </Typography>
                {renderButtons(mysticCode.id)}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default MysticCodeSelection;
