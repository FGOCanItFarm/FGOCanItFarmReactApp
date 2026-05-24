import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
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
    <div className="common-servants-grid">
      <Typography variant="h6" sx={{ mb: 1 }}>Common Servants</Typography>
      <div className="common-servants-row">
        {servants.map((servant, index) => (
          <div
            key={index}
            className="servant-grid-item"
            onClick={() => handleServantClick(servant)}
            title={servant.name}
          >
            <div className="servant-portrait">
              <ServantAvatar servantFace={servant.extraAssets?.faces?.ascension?.['1']} />
            </div>
            <div className="servant-name">{servant.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommonServantsGrid;