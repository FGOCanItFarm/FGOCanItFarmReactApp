import React from 'react';
import { Grid, Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const TeamSection = ({ servants, team, activeServant, handleTeamServantClick }) => {
  const maxServants = 6;

  return (
    <div>
      <Typography variant="h6" style={{ marginTop: '20px' }}>Team Section</Typography>
      <Grid container spacing={2} style={{ width: '40rem', height: '25rem', overflowY: 'auto' }}>
        {Array.from({ length: maxServants }).map((_, index) => {
          const collectionNo = team[index];
          const servant = servants.find(s => s.collectionNo === collectionNo);

          const isActive = activeServant?.index === index;
          const borderStyle = isActive ? '2px solid blue' : '1px dashed gray';
          const opacity = isActive ? 1 : 0.5;

          const handleClick = () => {
            if (index < 3) {
              handleTeamServantClick({ ...servant, index });
            }
          };

          return (
            <Grid 
              item xs={4} key={index} 
              onClick={servant ? handleClick : null}
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
                {servant ? (
                  <ServantAvatar
                    servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                    bgType={servant.noblePhantasms?.[0]?.card}
                    tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
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
