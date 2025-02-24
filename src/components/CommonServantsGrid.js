import React from 'react';
import { Grid, Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const CommonServantsGrid = ({ servants, handleServantClick, style }) => {
  return (
    <div style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>Common Servants</Typography>
      <Grid container spacing={2} style={{ flexDirection: 'column', overflowY: 'auto' }}>
        {servants.map((servant, index) => (
          <Grid
            item
            key={index}
            onClick={() => handleServantClick(servant)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
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

export default CommonServantsGrid;