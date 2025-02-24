import React from 'react';
import { Grid, Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const ServantSelection = ({ servants, handleServantClick }) => {
  return (
    <div>
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>Servant Selection</Typography>
      <Grid container spacing={2} style={{ width: '40rem', height: '70vh', overflowY: 'auto' }}>
        {servants.map((servant, index) => (
          <Grid
            item
            xs={4}
            key={index}
            onClick={() => handleServantClick(servant)}
            sx={{
              width: '128px', // Set the width to 128px or 144px as needed
              height: '128px', // Set the height to 128px or 144px as needed
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
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

export default ServantSelection;