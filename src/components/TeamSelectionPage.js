import React, { useEffect } from 'react';
import { Button, Grid, Typography, Box, Container } from '@mui/material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import { useNavigate } from 'react-router-dom';

const TeamSelectionPage = ({ team, setTeam, servants, filteredServants, setFilteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/quest-selection');
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
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
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
        </Grid>
        <Grid item xs={12} md={1}>
          <CommonServantsGrid
            handleServantClick={handleServantClick}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <ServantSelection
            servants={filteredServants}
            handleServantClick={handleServantClick}
          />
        </Grid>
      </Grid>
      <Box mt={2}>
        <Button variant="contained" color="secondary" onClick={clearTeam}>
          Clear Team
        </Button>
      </Box>
      <Box mt={2}>
        <TeamSection
          team={team}
          servants={servants}
          activeServant={null}
          handleTeamServantClick={handleTeamServantClick}
          updateServantEffects={updateServantEffects}
        />
      </Box>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Container>
  );
};

export default TeamSelectionPage;