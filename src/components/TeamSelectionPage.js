import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container, Tooltip } from '@mui/material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import CommonServantsGrid from './CommonServantsGrid';
import { useNavigate } from 'react-router-dom';
import '../TeamSelectionPage.css';
import '../ui-vars.css';

const TeamSelectionPage = ({ team, setTeam, servants, setFilteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels, selectedMysticCode, setSelectedMysticCode, includeEnemyOnly = false, setIncludeEnemyOnly = () => {}, enemyOnlyBlacklist = new Set() }) => {
  const navigate = useNavigate();
  const [displayList, setDisplayList] = useState([]);
  const [matchSet, setMatchSet] = useState(null);

  const handleGotoQuest = () => {
    navigate('/quest-selection');
  };

  const handleGotoSearch = () => {
    navigate('/search');
  };

  

  useEffect(() => {
    // Base list: full roster minus enemy-only servants (unless opted in), sorted.
    let base = servants;
    if (!includeEnemyOnly && enemyOnlyBlacklist && enemyOnlyBlacklist.size > 0) {
      base = base.filter(servant => !enemyOnlyBlacklist.has(String(servant.collectionNo)));
    }
    if (sortOrder) {
      base = [...base].sort((a, b) => String(a[sortOrder] ?? '').localeCompare(String(b[sortOrder] ?? '')));
    }

    // Filters no longer remove cards — they build the set of matching ids so
    // the grid can dim everything else while keeping the full roster visible.
    const passes = (servant) => {
      if (selectedRarity.length > 0 && !selectedRarity.includes(String(servant.rarity))) return false;
      if (selectedClass.length > 0) {
        const cls = (servant.className || '').toLowerCase();
        if (!selectedClass.some(sel => cls === sel || cls.startsWith(sel) || cls.includes(sel))) return false;
      }
      if (selectedNpType.length > 0) {
        if (!servant.noblePhantasms?.some(np => selectedNpType.includes(np.card?.toLowerCase()))) return false;
      }
      if (selectedAttackType.length > 0) {
        if (!servant.noblePhantasms?.some(np => np.effectFlags?.some(flag => selectedAttackType.includes(flag)))) return false;
      }
      if (searchQuery && !servant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    };

    const anyFilter = selectedRarity.length || selectedClass.length || selectedNpType.length || selectedAttackType.length || searchQuery;
    const matched = anyFilter ? new Set(base.filter(passes).map(s => String(s.collectionNo))) : null;

    setDisplayList(base);
    setMatchSet(matched);
    setFilteredServants(matched ? base.filter(s => matched.has(String(s.collectionNo))) : base);
  }, [selectedRarity, selectedClass, selectedNpType, selectedAttackType, searchQuery, sortOrder, servants, setFilteredServants, includeEnemyOnly, enemyOnlyBlacklist]);

  return (
    <Container>
      <Typography variant="h4">Select Your Team</Typography>
      
      {/* Normal View */}
      <>
          <div className="filter-common-servants">
            <div className="filter-section">
              <FilterSection
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedRarity={selectedRarity}
                setSelectedRarity={setSelectedRarity}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                selectedNpType={selectedNpType}
                setSelectedNpType={setSelectedNpType}
                selectedAttackType={selectedAttackType}
                setSelectedAttackType={setSelectedAttackType}
                capitalize={capitalize}
                handleCheckboxChange={handleCheckboxChange}
                attackTypeLabels={attackTypeLabels}
                includeEnemyOnly={includeEnemyOnly}
                setIncludeEnemyOnly={setIncludeEnemyOnly}
              />
            </div>
            <div className="servants-container">
              <div className="common-servants-wrapper">
                <CommonServantsGrid
                  handleServantClick={handleServantClick}
                />
              </div>
              <div className="servant-selection-wrapper">
                <ServantSelection
                  servants={displayList}
                  matchSet={matchSet}
                  handleServantClick={handleServantClick}
                />
              </div>
            </div>
          </div>
          {/* Team and Mystic Code moved to Command Input page. This area now focuses on filters and servant listing. */}
        </>

      {/* Common buttons section */}
      <Box mt={2}>
        <Tooltip 
          title="Clear all servants from the team"
          enterDelay={300}
          leaveDelay={200}
          PopperProps={{ 
            strategy: 'fixed',
            modifiers: [{ name: 'preventOverflow', enabled: true }]
          }}
        >
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={clearTeam}
            style={{
              minWidth: 'var(--btn-min-width)',
              minHeight: 'var(--btn-min-height)',
              marginRight: 'var(--spacing-sm)'
            }}
            aria-label="Clear all servants from team"
          >
            Clear Team
          </Button>
        </Tooltip>
      </Box>
      
      <div className="team-selection-buttons">
        <Tooltip 
          title="Navigate to quest selection page"
          enterDelay={300}
          leaveDelay={200}
          PopperProps={{ 
            strategy: 'fixed',
            modifiers: [{ name: 'preventOverflow', enabled: true }]
          }}
        >
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGotoQuest}
            style={{
              minWidth: 'var(--btn-min-width)',
              minHeight: 'var(--btn-min-height)'
            }}
            aria-label="Go to quest selection page"
          >
            GOTO Quests
          </Button>
        </Tooltip>
        <Tooltip 
          title="Navigate to search page"
          enterDelay={300}
          leaveDelay={200}
          PopperProps={{ 
            strategy: 'fixed',
            modifiers: [{ name: 'preventOverflow', enabled: true }]
          }}
        >
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGotoSearch}
            style={{
              minWidth: 'var(--btn-min-width)',
              minHeight: 'var(--btn-min-height)'
            }}
            aria-label="Go to search page"
          >
            GOTO Search
          </Button>
        </Tooltip>
      </div>

      {/* Commands display removed from this page; CommandInputPage owns command list */}
    </Container>
  );
};

export default TeamSelectionPage;