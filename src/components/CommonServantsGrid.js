import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const supportsList = [316, 284, 314, 357, 215];

const CommonServantsGrid = ({ handleServantClick, team }) => {
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
    <div style={{ maxWidth: '16rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>Common Servants</Typography>
      <Grid container spacing={2} style={{ flexDirection: 'column' }}>
        {servants.map((servant, index) => (
          <Grid
            item
            key={index}
            xs={12}
            onClick={() => handleServantClick(servant)}
            style={{ cursor: 'pointer' }}
          >
            <ServantAvatar
              servantFace={servant.extraAssets?.faces?.ascension?.['4']}
              bgType={servant.noblePhantasms?.['0']?.card}
              tagType={servant.noblePhantasms?.['0']?.effectFlags?.['0']}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default CommonServantsGrid;