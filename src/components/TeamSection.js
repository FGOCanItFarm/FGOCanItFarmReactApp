import React, { useState } from 'react';
import { Grid, Typography, Box, Accordion, AccordionSummary, AccordionDetails, TextField, FormControlLabel, Checkbox, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ServantAvatar from './ServantAvatar';

const TeamSection = ({ team, servants, activeServant, handleTeamServantClick, updateServantEffects, pageType }) => {
  const [expanded, setExpanded] = useState(false);

  const handleEffectChange = (index, field, value) => {
    updateServantEffects(index, field, value);
  };

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`${pageType} team-section`}>
      <Typography variant="h6">Team Section</Typography>
      <Grid container spacing={2}>
        {team.map((servantId, index) => {
          const servant = servants.find(s => s.collectionNo === servantId);

          const isActive = activeServant !== null && activeServant !== undefined && activeServant === index;
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
