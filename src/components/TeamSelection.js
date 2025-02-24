import React, { useState, useEffect, useCallback } from 'react';
import { Button, Grid, Typography, Box, Container, Modal } from '@mui/material';
import axios from 'axios';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import CommandInputMenu from './CommandInputMenu';
import QuestSelection from './QuestSelection';
import MysticCodeSelection from './MysticCodeSelection';

// Set the base URL for axios
// axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const TeamSelection = () => {
  // const [team, setTeam] = useState(Array(6).fill(''));
  // const [servants, setServants] = useState([]);
  // const [filteredServants, setFilteredServants] = useState([]);
  // const [sortOrder, setSortOrder] = useState('');
  // const [searchQuery, setSearchQuery] = useState('');
  // const [error, setError] = useState(null);
  // const [selectedRarity, setSelectedRarity] = useState([]);
  // const [selectedClass, setSelectedClass] = useState([]);
  // const [selectedNpType, setSelectedNpType] = useState([]);
  // const [selectedAttackType, setSelectedAttackType] = useState([]);
  // const [activeServant, setActiveServant] = useState(null);
  // const [commands, setCommands] = useState([]);
  // const [selectedQuest, setSelectedQuest] = useState(null); // State to hold the selected quest
  // const [selectedMysticCode, setSelectedMysticCode] = useState(null); // State to hold the selected mystic code
  // const [openModal, setOpenModal] = useState(false); // State to control the modal
  // const [servantEffects, setServantEffects] = useState(Array(6).fill({})); // State to hold the custom effects for each servant

  
  const handleTeamServantClick = (servant) => {
    setActiveServant(servant);
  };

  const handleServantClick = (servant) => {
    const newTeam = [...team];
    const count = newTeam.filter(s => s === servant.collectionNo).length;
    if (count < 2) {
      const emptyIndex = newTeam.findIndex(s => s === '');
      if (emptyIndex !== -1) {
        newTeam[emptyIndex] = servant.collectionNo;
        setTeam(newTeam);
      } else {
        alert('Your team is full.');
      }
    } else {
      alert('You can only have 2 duplicates of a servant.');
    }
  };

  const clearTeam = () => {
    setTeam(Array(6).fill(''));
  };

  const clearCommands = () => {
    setCommands([]);
  };


  const updateServantEffects = (index, field, value) => {
    const newEffects = [...servantEffects];
    newEffects[index] = {
      ...newEffects[index],
      [field]: value
    };
    setServantEffects(newEffects);
  };

  return (
    <Container>
      <Typography variant="h4">Select Your Team</Typography>
      {error && <Typography color="error">{error}</Typography>}
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
            <Grid>
            <TeamSection
              team={team}
              servants={servants}
              activeServant={activeServant}
              handleTeamServantClick={handleTeamServantClick}
              updateServantEffects={updateServantEffects}
            />
            </Grid>
          <Grid container spacing={2} direction="row">
            <Typography variant="h4" style={{marginBottom:"2rem"}}>Select Mystic Code</Typography>
            <MysticCodeSelection
              team={team}
              setTeam={setTeam}
              updateCommands={setCommands}
              selectedMysticCode={selectedMysticCode}
              setSelectedMysticCode={setSelectedMysticCode}
            />
          </Grid>
          </Grid>
          </Box>
        </Grid>
        
        <Grid item style={{ backgroundColor: '#ffffff', padding: '1rem' }} md={2} spacing={1}>
          <ServantSelection style={{ padding: '0.5rem', borderRadius: '0.5rem', borderColor: '#d8caa9' }}
            servants={filteredServants}
            handleServantClick={handleServantClick}
          />
          <CommonServantsGrid style={{ padding: '0.5rem', borderRadius: '0.5rem', borderColor: '#d8caa9' }}
            servants={servants}
            handleServantClick={handleServantClick}
          />
        </Grid>
      </Grid>

      <Grid style={{ padding: '20px', borderRadius: '8px' }}>
          {activeServant && (
            <Box mt={4}>
              <CommandInputMenu activeServant={activeServant} updateCommands={setCommands} team={team} />
            </Box>
          )}
      </Grid>
      <Box mt={4}>
        <Typography variant="h6">Commands</Typography>
        <Box component="pre" p={2} border="1px solid black" bgcolor="#f5f5f5" style={{ whiteSpace: 'nowrap' }}>
          {commands.join(' ')}
        </Box>
      </Box>

      <Button variant="contained" color="secondary" onClick={clearCommands} style={{ marginTop: '20px' }}>
        Clear Commands
      </Button>

      <Typography variant="h4" style={{marginBottom:"2rem"}}>Select Farming Node</Typography>
      <Grid container spacing={2} direction="row">
        <QuestSelection setSelectedQuest={setSelectedQuest} />
      </Grid>

      <Button variant="contained" color="primary" onClick={handleOpenModal} style={{ marginTop: '20px' }}>
        Submit Team
      </Button>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box p={4} bgcolor="white" borderRadius="8px" boxShadow={3} style={{ margin: 'auto', marginTop: '10%', width: '50%' }}>
          <Typography variant="h6">Confirm Submission</Typography>
          <Typography variant="body1"><strong>Team:</strong> {JSON.stringify(team.map((collectionNo, index) => ({
            servant_id: collectionNo,
            append_2: servantEffects[index].append_2 || false,
            append_5: servantEffects[index].append_5 || false,
            ...servantEffects[index]
          })), null, 2)}</Typography>
          <Typography variant="body1"><strong>Mystic Code ID:</strong> {selectedMysticCode}</Typography>
          <Typography variant="body1"><strong>Quest ID:</strong> {selectedQuest?.id}</Typography>
          <Typography variant="body1"><strong>Commands:</strong> {commands.join(' ')}</Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginRight: '10px' }}>
              Confirm
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default TeamSelection;
