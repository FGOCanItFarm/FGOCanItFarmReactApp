import React from 'react';
import { Typography, TextField, Box } from '@mui/material';
import './FilterSection.css';

// Filter persistence configuration
// Set to 'remember' to persist filters across page refreshes using localStorage
// Set to 'reset' to always reset filters to defaults on page load
// Note: This constant is used in App.js for implementation
// const FILTER_PERSISTENCE = 'remember';

const FilterSection = ({ sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels, includeEnemyOnly = false, setIncludeEnemyOnly = () => {} }) => {
  
  // Class data with English names for compact UI
  const classData = [
    { key: 'saber', name: 'Saber' },
    { key: 'archer', name: 'Archer' },
    { key: 'lancer', name: 'Lancer' },
    { key: 'rider', name: 'Rider' },
    { key: 'caster', name: 'Caster' },
    { key: 'assassin', name: 'Assassin' },
    { key: 'berserker', name: 'Berserker' },
    { key: 'shielder', name: 'Shielder' },
    { key: 'ruler', name: 'Ruler' },
    { key: 'avenger', name: 'Avenger' },
    { key: 'alterego', name: 'Alter Ego' },
    { key: 'mooncancer', name: 'Moon Cancer' },
    { key: 'foreigner', name: 'Foreigner' },
    { key: 'pretender', name: 'Pretender' },
    { key: 'beast', name: 'Beast' }
  ];

  const handleClassToggle = (className) => {
    if (selectedClass.includes(className)) {
      setSelectedClass(selectedClass.filter(item => item !== className));
    } else {
      setSelectedClass([...selectedClass, className]);
    }
  };

  const handleRarityToggle = (rarity) => {
    const rarityStr = rarity.toString();
    if (selectedRarity.includes(rarityStr)) {
      setSelectedRarity(selectedRarity.filter(item => item !== rarityStr));
    } else {
      setSelectedRarity([...selectedRarity, rarityStr]);
    }
  };

  const handleNpToggle = (npType) => {
    if (selectedNpType.includes(npType)) {
      setSelectedNpType(selectedNpType.filter(item => item !== npType));
    } else {
      setSelectedNpType([...selectedNpType, npType]);
    }
  };

  const handleAttackToggle = (attackType) => {
    if (selectedAttackType.includes(attackType)) {
      setSelectedAttackType(selectedAttackType.filter(item => item !== attackType));
    } else {
      setSelectedAttackType([...selectedAttackType, attackType]);
    }
  };

  return (
    <div className="filter-container">
      <Typography variant="h6" gutterBottom>Filters</Typography>
      
      {/* Search Field */}
      <Box mb={2}>
        <TextField
          label="Search Servants"
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
      </Box>

      {/* Compact Class Filter */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>Class</Typography>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={includeEnemyOnly} onChange={(e) => setIncludeEnemyOnly(e.target.checked)} />
            <Typography variant="caption">Include enemy-only servants</Typography>
          </label>
        </div>
        <div className="filter-grid-wrapper">
          <div className="filter-grid">
            {classData.map(classItem => (
              <button
                key={classItem.key}
                className={`filter-item ${selectedClass.includes(classItem.key.toLowerCase()) ? 'active' : ''}`}
                onClick={() => handleClassToggle(classItem.key.toLowerCase())}
                data-filter="class"
                data-val={classItem.key}
                tabIndex={0}
                aria-pressed={selectedClass.includes(classItem.key.toLowerCase())}
                title={`Toggle ${classItem.name} class filter`}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/class-icons/${classItem.key}.png`}
                  alt={classItem.name}
                  onError={(e) => {
                    // Fallback: hide the broken image and show full text label in the existing span
                    try {
                      e.target.style.display = 'none';
                      const textSpan = e.target.parentElement.querySelector('.filter-item-text');
                      if (textSpan) textSpan.textContent = classItem.name;
                    } catch (err) {
                      // Last resort: replace innerHTML with the full name
                      e.target.parentElement.innerHTML = classItem.name;
                    }
                  }}
                  style={{ width: '32px', height: '32px' }}
                />
                <span className="filter-item-text">{classItem.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Box>

      {/* Compact Rarity Filter */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>Rarity</Typography>
        <div className="filter-grid-wrapper">
          <div className="filter-grid">
            {[5, 4, 3, 2, 1, 0].map(rarity => (
              <button
                key={rarity}
                className={`filter-item ${selectedRarity.includes(rarity.toString()) ? 'active' : ''}`}
                onClick={() => handleRarityToggle(rarity)}
                data-filter="rarity"
                data-val={rarity}
                tabIndex={0}
                aria-pressed={selectedRarity.includes(rarity.toString())}
                title={`Toggle ${rarity} star rarity filter`}
              >
                {rarity}★
              </button>
            ))}
            {/* Add placeholder to complete 7 columns */}
            <div style={{ visibility: 'hidden' }}></div>
          </div>
        </div>
      </Box>

      {/* Compact NP Type Filter */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>NP Type</Typography>
        <div className="filter-grid-wrapper">
          <div className="filter-grid">
            {['buster', 'arts', 'quick'].map(npType => (
              <button
                key={npType}
                className={`filter-item ${selectedNpType.includes(npType.toLowerCase()) ? 'active' : ''}`}
                onClick={() => handleNpToggle(npType.toLowerCase())}
                data-filter="npType"
                data-val={npType}
                tabIndex={0}
                aria-pressed={selectedNpType.includes(npType.toLowerCase())}
                title={`Toggle ${npType} NP type filter`}
              >
                {capitalize(npType)}
              </button>
            ))}
          </div>
        </div>
      </Box>

      {/* Compact Attack Type Filter */}
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>Attack Type</Typography>
        <div className="filter-grid-wrapper">
          <div className="filter-grid">
            {['attackEnemyOne', 'attackEnemyAll', 'support'].map(attackType => (
              <button
                key={attackType}
                className={`filter-item ${selectedAttackType.includes(attackType) ? 'active' : ''}`}
                onClick={() => handleAttackToggle(attackType)}
                data-filter="attackType"
                data-val={attackType}
                tabIndex={0}
                aria-pressed={selectedAttackType.includes(attackType)}
                title={`Toggle ${attackTypeLabels[attackType]} attack type filter`}
              >
                {attackTypeLabels[attackType]}
              </button>
            ))}
          </div>
        </div>
      </Box>
    </div>
  );
};

export default FilterSection;