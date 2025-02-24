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
      <Grid container spacing={2} direction="row">
        <Grid item xs={12} md={8}>
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
          <Box>
            <Button variant="contained" color="secondary" onClick={clearTeam} style={{ marginTop: '20px' }}>
              Clear Team
            </Button>
            <Grid>
              <TeamSection
                team={team}
                servants={servants}
                activeServant={null}
                handleTeamServantClick={handleTeamServantClick}
                updateServantEffects={updateServantEffects}
              />
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={4} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          <Box style={{ width: '20%', marginRight: '1rem' }}>
            <CommonServantsGrid
              servants={servants}
              handleServantClick={handleServantClick}
              style={{ height: '100%', overflowY: 'auto' }}
            />
          </Box>
          <Box style={{ width: '80%' }}>
            <ServantSelection
              servants={filteredServants}
              handleServantClick={handleServantClick}
            />
          </Box>
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleNext} style={{ marginTop: '20px' }}>
        Next
      </Button>
    </Container>
  );
};

export default TeamSelectionPage;