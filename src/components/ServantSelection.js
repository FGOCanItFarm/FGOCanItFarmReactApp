import React from 'react';
import { Grid, Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const ServantSelection = ({ servants, handleServantClick }) => {
  return (
    <div>
      <Typography variant="h6">Servant Selection</Typography>
      <Grid container spacing={2} style={{ width: '40rem', height: '70vh', overflowY: 'auto' }}>
        {servants.map((servant, index) => (
          <Grid item xs={4} key={index} onClick={() => handleServantClick(servant)}>
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

export default ServantSelection;