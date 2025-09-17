import React, { useEffect, useRef } from 'react';
import { Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import './ServantSelection.css';

const ServantSelection = ({ servants, handleServantClick }) => {
  const viewportRef = useRef(null);

  useEffect(() => {
    // Add scroll indicator class when content overflows
    const viewport = viewportRef.current;
    if (viewport) {
      const hasScroll = viewport.scrollWidth > viewport.clientWidth;
      if (hasScroll) {
        viewport.classList.add('has-scroll');
      } else {
        viewport.classList.remove('has-scroll');
      }
    }
  }, [servants]);

  return (
    <div className="servant-selection">
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>Servant Selection</Typography>
      <div className="servant-selection-viewport" ref={viewportRef}>
        <div className="servant-grid">
          {servants.map((servant, index) => (
            <div
              key={index}
              className="servant-grid-item"
              onClick={() => handleServantClick(servant)}
              tabIndex={0}
              role="button"
              aria-label={`Select servant ${servant.name || 'Unknown'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleServantClick(servant);
                }
              }}
            >
              <ServantAvatar
                className="servant-avatar"
                servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                bgType={servant.noblePhantasms?.['0']?.card}
                tagType={servant.noblePhantasms?.['0']?.effectFlags?.['0']}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServantSelection;