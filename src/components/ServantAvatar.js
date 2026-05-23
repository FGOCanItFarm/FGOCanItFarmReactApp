import React from 'react';
import '../avatar.css';

// NP card type → accent colour (FGO convention: Buster red, Arts blue, Quick green)
const CARD_ACCENT = {
  buster: 'var(--color-buster)',
  arts:   'var(--color-arts)',
  quick:  'var(--color-quick)',
};

// NP target type → short readable label
const TARGET_LABEL = {
  attackEnemyAll: 'AoE',
  attackEnemyOne: 'ST',
  support:        'Support',
};

const ServantAvatar = ({ bgType, servantFace, tagType }) => {
  const accent   = CARD_ACCENT[bgType] || 'var(--color-border-mid)';
  const cardName = bgType ? bgType.charAt(0).toUpperCase() + bgType.slice(1) : null;
  const target   = TARGET_LABEL[tagType] || null;
  const label    = [cardName, target].filter(Boolean).join(' · ');

  return (
    <div className="servant-card" style={{ '--card-accent': accent }}>
      {servantFace ? (
        <img className="servant-card__face" src={servantFace} alt="servant" />
      ) : (
        <div className="servant-card__face servant-card__face--empty" aria-hidden="true" />
      )}
      {label && <span className="servant-card__label">{label}</span>}
    </div>
  );
};

export default ServantAvatar;
