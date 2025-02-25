import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const TeamSection = ({ team, activeServant, handleTeamServantClick, updateServantEffects, setActiveServant }) => {
  const handleEffectChange = (index, field, value) => {
    updateServantEffects(index, field, value);
  };

  return (
    <div>
      <Typography variant="h6" style={{ marginTop: '20px' }}>Team Section</Typography>
      <Grid container spacing={2} style={{ width: '32rem', height: '35rem', overflowY: 'auto', marginRight: '0.5rem', marginLeft: '0.5rem' }}>
        {team.map((servantId, index) => {
          const isActive = activeServant === index;
          const borderStyle = isActive ? '2px solid blue' : '1px dashed gray';
          const opacity = isActive ? 1 : 0.5;

          const handleClick = () => {
            handleTeamServantClick(index);
          };

          return (
            <Grid 
              item xs={4} key={index} 
              onClick={handleClick}
              style={{ opacity }}
            >
              <div style={{ 
                width: '100%', 
                height: '150px', 
                border: borderStyle, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {servantId ? (
                  <ServantAvatar
                    servantFace={`/path/to/servant/images/${servantId}.png`} // Assuming you have a way to get the image by collectionNo
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">Empty Slot</Typography>
                )}
              </div>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default TeamSection;
