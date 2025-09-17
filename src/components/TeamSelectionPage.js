import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container, Tooltip } from '@mui/material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import SimpleMysticCodeSelection from './SimpleMysticCodeSelection';
import TwoTeamView from './TwoTeamView';
import { useNavigate } from 'react-router-dom';
import '../TeamSelectionPage.css';
import '../ui-vars.css';

const TeamSelectionPage = ({ team, setTeam, servants, filteredServants, setFilteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels, selectedMysticCode, setSelectedMysticCode}) => {
  const navigate = useNavigate();
  const [showTwoTeamView, setShowTwoTeamView] = useState(false);
  const [commands, setCommands] = useState([]);

  const handleGotoQuest = () => {
    navigate('/quest-selection');
  };

  const handleGotoSearch = () => {
    navigate('/search');
  };

  const addCommand = (command) => {
    setCommands(prev => [...prev, command]);
  };

  const toggleTwoTeamView = () => {
    setShowTwoTeamView(!showTwoTeamView);
  };

  useEffect(() => {
    const filterServants = () => {
      let filtered = servants;

      if (selectedRarity.length > 0) {
        filtered = filtered.filter(servant => selectedRarity.includes(servant.rarity.toString()));
      }
      if (selectedClass.length > 0) {
        filtered = filtered.filter(servant => selectedClass.includes(servant.className.toLowerCase()));
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
  }, [selectedRarity, selectedClass, selectedNpType, selectedAttackType, searchQuery, sortOrder, servants, team, setFilteredServants]);

  return (
    <Container>
      <Typography variant="h4">Select Your Team</Typography>
      
      {/* Toggle between views */}
      <Box mt={2} mb={2}>
        <Tooltip 
          title={showTwoTeamView ? "Switch to normal team selection view" : "Switch to two-team command view"}
          enterDelay={300}
          leaveDelay={200}
        >
          <Button 
            variant="outlined" 
            onClick={toggleTwoTeamView}
            style={{
              minWidth: 'var(--btn-min-width)',
              minHeight: 'var(--btn-min-height)'
            }}
            aria-label={showTwoTeamView ? "Switch to normal view" : "Switch to two-team view"}
          >
            {showTwoTeamView ? 'Normal View' : 'Two-Team View'}
          </Button>
        </Tooltip>
      </Box>

      {showTwoTeamView ? (
        /* Two-Team View */
        <TwoTeamView
          team={team}
          servants={servants}
          selectedMysticCode={selectedMysticCode}
          addCommand={addCommand}
        />
      ) : (
        /* Normal View */
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
          <div className="team-mystic-code">
            <div className="team-section">
              <TeamSection
                team={team}
                servants={servants}
                activeServant={null}
                handleTeamServantClick={handleTeamServantClick}
                updateServantEffects={updateServantEffects}
                pageType="team-selection-page"
              />
            </div>
            <div className="mystic-code-selection">
              <SimpleMysticCodeSelection
                selectedMysticCode={selectedMysticCode}
                setSelectedMysticCode={setSelectedMysticCode}
              />
            </div>
          </div>
        </>
      )}

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

      {/* Commands display (if any) */}
      {commands.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Generated Commands:</Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1, 
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            wordBreak: 'break-all'
          }}>
            {commands.join(', ')}
          </Box>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setCommands([])}
            style={{ marginTop: 'var(--spacing-sm)' }}
          >
            Clear Commands
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default TeamSelectionPage;