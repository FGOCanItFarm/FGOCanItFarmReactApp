import React, { useEffect } from 'react';
import { Button, Grid, Typography, Box, Container } from '@mui/material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import SimpleMysticCodeSelection from './SimpleMysticCodeSelection';
import { useNavigate } from 'react-router-dom';
import '../TeamSelectionPage.css';

const TeamSelectionPage = ({ team, setTeam, servants, filteredServants, setFilteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels, selectedMysticCode, setSelectedMysticCode }) => {
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

      // Ensure team members are included in the filtered list
      const teamMembers = servants.filter(servant => team.includes(servant.collectionNo));
      filtered = [...new Set([...filtered, ...teamMembers])];

      setFilteredServants(filtered);
    };

    filterServants();
  }, [selectedRarity, selectedClass, selectedNpType, selectedAttackType, searchQuery, sortOrder, servants, team, setFilteredServants]);

  return (
    <Container>
      <Typography variant="h4">Select Your Team</Typography>
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
        <div className="common-servants-grid">
          <CommonServantsGrid
            handleServantClick={handleServantClick}
          />
        </div>
        <div className="servant-selection">
          <ServantSelection
            servants={filteredServants}
            handleServantClick={handleServantClick}
          />
        </div>
      </div>
      <Box mt={2}>
        <Button variant="contained" color="secondary" onClick={clearTeam}>
          Clear Team
        </Button>
      </Box>
      <div className="team-mystic-code">
        <div className="team-section">
          <TeamSection
            team={team}
            servants={servants}
            activeServant={null}
            handleTeamServantClick={handleTeamServantClick}
            updateServantEffects={updateServantEffects}
          />
        </div>
        <div className="mystic-code-selection">
          <SimpleMysticCodeSelection
            selectedMysticCode={selectedMysticCode}
            setSelectedMysticCode={setSelectedMysticCode}
          />
        </div>
      </div>
      <div className="team-selection-buttons">
        <Button variant="contained" color="primary" onClick={handleGotoQuest}>
          GOTO Quests
        </Button>
        <Button variant="contained" color="primary" onClick={handleGotoSearch}>
          GOTO Search
        </Button>
      </div>
    </Container>
  );
};

export default TeamSelectionPage;