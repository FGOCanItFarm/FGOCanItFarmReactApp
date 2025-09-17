import React from 'react';
import { Grid, Typography, Tooltip } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import '../ui-vars.css';

const TeamSection = ({ team, servants, activeServant, handleTeamServantClick, updateServantEffects, pageType }) => {
  return (
    <div className={`${pageType} team-section`}>
      <Typography variant="h6">Team Section</Typography>
      <Grid container spacing={2}>
        {team.map((servantObj, index) => {
          const servant = servants.find(s => s.collectionNo === servantObj.collectionNo);

          const isActive = activeServant !== null && activeServant !== undefined && activeServant === index;
          const borderStyle = isActive ? '2px solid blue' : '1px dashed gray';
          const opacity = isActive ? 1 : 0.5;

          const handleClick = () => {
            handleTeamServantClick(index);
          };

          return (
            <Grid 
              item xs={4} key={index} 
              style={{ opacity }}
            >
              <Tooltip 
                title={servant ? `${servant.name} (Position ${index + 1}) - Click to select` : `Empty Slot ${index + 1} - Click to select`}
                enterDelay={300}
                leaveDelay={200}
                PopperProps={{ 
                  strategy: 'fixed',
                  modifiers: [{ name: 'preventOverflow', enabled: true }]
                }}
              >
                <div 
                  onClick={handleClick}
                  style={{ 
                    width: '100%', 
                    height: '150px', 
                    border: borderStyle, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minWidth: 'var(--btn-min-width)',
                    minHeight: 'var(--btn-min-height)'
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={servant ? `Select ${servant.name} in position ${index + 1}` : `Select empty slot ${index + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick();
                    }
                  }}
                >
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
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default TeamSection;
