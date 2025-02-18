import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const supportsList = [316, 284, 314, 357, 215];

const CommonServantsGrid = ({ handleServantClick }) => {
  const [servants, setServants] = useState([]);

  useEffect(() => {
    // Fetch servant data based on collectionNo
    const fetchServants = async () => {
      try {
        const fetchedServants = await Promise.all(
          supportsList.map(async (collectionNo) => {
            const response = await axios.get(`/api/servants/${collectionNo}`);
            return response.data;
          })
        );
        setServants(fetchedServants);
      } catch (error) {
        console.error('Error fetching servant data:', error);
      }
    };

    fetchServants();
  }, []);

  return (
    <div>
      <Typography variant="h6" style={{ marginTop: '20px' }}>Commonly Used Servants</Typography>
      <Grid container spacing={2} style={{ width: '40rem', height: '25rem', overflowY: 'auto' }}>
        {servants.map((servant, index) => (
          <Grid item xs={4} key={index} onClick={() => handleServantClick(servant)}>
            <ServantAvatar
              servantFace={servant.extraAssets?.faces?.ascension?.['4']}
              bgType={servant.noblePhantasms?.[0]?.card}
              tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default CommonServantsGrid