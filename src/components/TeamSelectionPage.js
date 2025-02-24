import React from 'react';
import { Button, Grid, Typography, Box, Container } from '@mui/material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import { useNavigate } from 'react-router-dom';

const TeamSelectionPage = ({ team, setTeam, servants, filteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/quest-selection');
  };

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
        <Grid item style={{ backgroundColor: '#ffffff', padding: '1rem' }} md={2} spacing={1}>
          <ServantSelection
            servants={filteredServants}
            handleServantClick={handleServantClick}
          />
          <CommonServantsGrid
            servants={servants}
            handleServantClick={handleServantClick}
          />
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleNext} style={{ marginTop: '20px' }}>
        Next
      </Button>
    </Container>
  );
};

export default TeamSelectionPage;