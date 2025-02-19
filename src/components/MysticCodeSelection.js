import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography, Card, CardMedia, CardContent, Box, Button } from '@mui/material';

const MysticCodeSelection = ({ team, setTeam }) => {
  const [mysticCodes, setMysticCodes] = useState([]);

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

  const renderButtons = (mysticCodeId) => {
    if (mysticCodeId === 210 || mysticCodeId === 20) {
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
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Button size="sm" onClick={() => swapServants(0, 3)}>1 & 4</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(0, 4)}>1 & 5</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(0, 5)}>1 & 6</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(1, 3)}>2 & 4</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(1, 4)}>2 & 5</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(1, 5)}>2 & 6</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(2, 3)}>3 & 4</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(2, 4)}>3 & 5</Button>
            </Grid>
            <Grid item xs={4}>
              <Button size="small" onClick={() => swapServants(2, 5)}>3 & 6</Button>
            </Grid>
          </Grid>
        </Box>
      );
    } else {
      return (
        <Box>
          <Button>On Servant 1</Button>
          <Button>On Servant 2</Button>
          <Button>On Servant 3</Button>
          <Button>No Target</Button>
          <Button>On Servant 1</Button>
          <Button>On Servant 2</Button>
          <Button>On Servant 3</Button>
          <Button>No Target</Button>
          <Button>On Servant 1</Button>
          <Button>On Servant 2</Button>
          <Button>On Servant 3</Button>
          <Button>No Target</Button>
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
                {renderButtons(mysticCode._id)}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default MysticCodeSelection;
