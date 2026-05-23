import React from 'react';
import { Typography } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import './ServantSelection.css';

// Renders every servant in a compact left-to-right wrapping grid. Filters do not
// remove cards — non-matching servants are dimmed (like AppMedia) so the grid
// stays stable and the full roster is always visible. `matchSet` (collectionNo
// strings) marks which pass the active filters; null/empty => all match.
const ServantSelection = ({ servants = [], handleServantClick, matchSet = null, popularity = null }) => {
  const isMatch = (servant) => !matchSet || matchSet.has(String(servant.collectionNo));
  const pickCount = (servant) => (popularity ? (popularity.get(servant.collectionNo) || 0) : 0);

  return (
    <div className="servant-selection">
      <Typography variant="h6" sx={{ mb: 1 }}>
        Servant Selection
        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'var(--color-text-dim)' }}>
          ({servants.length})
        </Typography>
      </Typography>
      <div className="servant-grid">
        {servants.map((servant) => {
          const dim = !isMatch(servant);
          return (
            <div
              key={servant.collectionNo}
              className={`servant-grid-item ${dim ? 'dimmed' : ''}`}
              onClick={() => handleServantClick(servant)}
              tabIndex={0}
              role="button"
              aria-label={`Select servant ${servant.name || 'Unknown'}`}
              title={servant.name}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleServantClick(servant);
                }
              }}
            >
              <div className="servant-portrait">
                <ServantAvatar servantFace={servant.face_url} />
                {pickCount(servant) > 0 && (
                  <span className="servant-pick-count" title={`Used in ${pickCount(servant)} community run(s)`}>
                    {pickCount(servant)}
                  </span>
                )}
              </div>
              <div className="servant-name">{servant.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServantSelection;
