import React from 'react';
import '../avatar.css';

// Clean face-only avatar. Fills its parent slot edge-to-edge; the slot owns the
// frame/hover styling. NP card type / target type are conveyed elsewhere.
const ServantAvatar = ({ servantFace }) => (
  <div className="servant-card">
    {servantFace ? (
      <img className="servant-card__face" src={servantFace} alt="servant" loading="lazy" />
    ) : (
      <div className="servant-card__face servant-card__face--empty" aria-hidden="true" />
    )}
  </div>
);

export default ServantAvatar;
