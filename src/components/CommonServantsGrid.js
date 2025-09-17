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
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>Common Servants</Typography>
      <div className="common-servants-horizontal">
        {servants.map((servant, index) => (
          <div
            key={index}
            className="common-servant-item"
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

export default CommonServantsGrid;