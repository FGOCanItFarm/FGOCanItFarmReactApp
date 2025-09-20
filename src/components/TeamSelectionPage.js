import React, { useEffect } from 'react';
import { Button, Typography, Box, Container, Tooltip } from '@mui/material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import CommonServantsGrid from './CommonServantsGrid';
import { useNavigate } from 'react-router-dom';
import '../TeamSelectionPage.css';
import '../ui-vars.css';

const TeamSelectionPage = ({ team, setTeam, servants, filteredServants, setFilteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels, selectedMysticCode, setSelectedMysticCode, includeEnemyOnly = false, setIncludeEnemyOnly = () => {}, enemyOnlyBlacklist = new Set() }) => {
  const navigate = useNavigate();

  const handleGotoQuest = () => {
    navigate('/quest-selection');
  };

  const handleGotoSearch = () => {
    navigate('/search');
  };

  

  useEffect(() => {
    const filterServants = () => {
      let filtered = servants;

      if (selectedRarity.length > 0) {
        filtered = filtered.filter(servant => selectedRarity.includes(servant.rarity.toString()));
      }
      if (selectedClass.length > 0) {
        filtered = filtered.filter(servant => {
          const cls = (servant.className || '').toLowerCase();
          // Allow matches where the servant class contains or startsWith the selected class
          return selectedClass.some(sel => cls === sel || cls.startsWith(sel) || cls.includes(sel));
        });
      }
      if (selectedNpType.length > 0) {
        filtered = filtered.filter(servant =>
          servant.noblePhantasms &&
          servant.noblePhantasms.some(np => selectedNpType.includes(np.card.toLowerCase()))
        );
      }
      if (selectedAttackType.length > 0) {
        filtered = filtered.filter(servant =>
          servant.noblePhantasms &&
          servant.noblePhantasms.some(np =>
            np.effectFlags &&
            np.effectFlags.some(flag => selectedAttackType.includes(flag))
          )
        );
      }
      if (searchQuery) {
        filtered = filtered.filter(servant => servant.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      if (sortOrder) {
        filtered = filtered.sort((a, b) => a[sortOrder].localeCompare(b[sortOrder]));
      }

      // Exclude known enemy-only servants unless the user explicitly includes them
      if (!includeEnemyOnly && enemyOnlyBlacklist && enemyOnlyBlacklist.size > 0) {
        filtered = filtered.filter(servant => !enemyOnlyBlacklist.has(String(servant.collectionNo)));
      }

      // By default do NOT force-include team members into the filtered list.
      // Previously we always merged team members which caused them to show
      // regardless of active filters. Make this behavior optional via
      // `includeTeamMembers` so it can be enabled deliberately if desired.
      const includeTeamMembers = false; // set to true to preserve old behavior
      if (includeTeamMembers) {
        const teamMembers = servants.filter(servant => team.includes(servant.collectionNo));
        filtered = [...new Set([...filtered, ...teamMembers])];
      }

      setFilteredServants(filtered);
    };

    filterServants();
  }, [selectedRarity, selectedClass, selectedNpType, selectedAttackType, searchQuery, sortOrder, servants, team, setFilteredServants, includeEnemyOnly, enemyOnlyBlacklist]);

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
                  servants={filteredServants}
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