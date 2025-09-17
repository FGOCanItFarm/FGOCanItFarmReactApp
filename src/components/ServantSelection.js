import React from 'react';
import { Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';

const ServantSelection = ({ servants, handleServantClick }) => {
  return (
    <div className="servant-selection">
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>Servant Selection</Typography>
      <div className="servant-selection-horizontal">
        {servants.map((servant, index) => (
          <div
            key={index}
            className="servant-selection-item"
            onClick={() => handleServantClick(servant)}
          >
            <ServantAvatar
              servantFace={servant.extraAssets?.faces?.ascension?.['4']}
              bgType={servant.noblePhantasms?.['0']?.card}
              tagType={servant.noblePhantasms?.['0']?.effectFlags?.['0']}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServantSelection;