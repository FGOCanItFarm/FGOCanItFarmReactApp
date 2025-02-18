import React, { useState, useEffect, useCallback } from 'react';
import { Button, Grid, Typography, Box, Container } from '@mui/material';
import axios from 'axios';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import CommandInputMenu from './CommandInputMenu';
import QuestSelection from './QuestSelection';
import MysticCodeSelection from './MysticCodeSelection';

// Set the base URL for axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
// console.log('Axios base URL:', axios.defaults.baseURL);

const TeamSelection = () => {
  const [team, setTeam] = useState(Array(6).fill(''));
  const [servants, setServants] = useState([]);
  const [filteredServants, setFilteredServants] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [selectedRarity, setSelectedRarity] = useState([]);
  const [selectedClass, setSelectedClass] = useState([]);
  const [selectedNpType, setSelectedNpType] = useState([]);
  const [selectedAttackType, setSelectedAttackType] = useState([]);
  const [activeServant, setActiveServant] = useState(null);
  const [commands, setCommands] = useState([]);

  // Function to save data to local storage
  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Function to load data from local storage
  const loadFromLocalStorage = (key) => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : [];
  };

  // Load team and commands data from local storage when the component mounts
  useEffect(() => {
    const savedTeam = loadFromLocalStorage('team');
    setTeam(savedTeam);
    const savedCommands = loadFromLocalStorage('commands');
    setCommands(savedCommands);
  }, []);

  // Save team data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('team', team);
  }, [team]);

  // Save commands data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('commands', commands);
  }, [commands]);

  const fetchServants = useCallback(async () => {
    try {
      const response = await axios.get(`/api/servants`);
      console.log('API Response:', response.data); // Log the API response
      setServants(response.data);
      setFilteredServants(response.data);
    } catch (error) {
      console.error('There was an error fetching the servant data!', error);
      setError('There was an error fetching the servant data.');
    }
  }, []);

  useEffect(() => {
    fetchServants();
  }, [fetchServants]);

  useEffect(() => {
    console.log('Filtered Servants:', filteredServants); // Log the filtered servants
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
  }, [selectedRarity, selectedClass, selectedNpType, selectedAttackType, searchQuery, sortOrder, servants, team]);

  const handleTeamServantClick = (servant) => {
    setActiveServant(servant);
  };

  const handleTeamServantDrag = (fromIndex, toIndex) => {
    const newTeam = [...team];
    const [movedServant] = newTeam.splice(fromIndex, 1);
    newTeam.splice(toIndex, 0, movedServant);
    setTeam(newTeam);
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

  const handleCheckboxChange = (event, setState, state) => {
    const value = event.target.value;
    if (state.includes(value)) {
      setState(state.filter(item => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const attackTypeLabels = {
    attackEnemyOne: 'Single Target',
    attackEnemyAll: 'AoE',
    support: 'Support'
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

          {/* TODO add mystic code selection */}
          <Typography variant="h4">Select Mystic Code</Typography>
          <Grid container spacing={2} direction="row">
            <MysticCodeSelection />
          </Grid>

          <Button variant="contained" color="secondary" onClick={clearTeam} style={{ marginTop: '20px' }}>
            Clear Team
          </Button>

          <TeamSection
            team={team}
            servants={servants}
            activeServant={activeServant}
            handleTeamServantClick={handleTeamServantClick}
            handleTeamServantDrag={handleTeamServantDrag}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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

      {activeServant && (
        <Box mt={4}>
          <CommandInputMenu activeServant={activeServant} updateCommands={setCommands} />
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="h6">Commands</Typography>
        <Box component="pre" p={2} border="1px solid black" bgcolor="#f5f5f5" style={{ whiteSpace: 'nowrap' }}>
          {commands.join(' ')}
        </Box>
      </Box>

      <Button variant="contained" color="secondary" onClick={clearCommands} style={{ marginTop: '20px' }}>
        Clear Commands
      </Button>

      {/* TODO add farming node selection section */}
      <Typography variant="h4">Select Farming Node</Typography>
      <Grid container spacing={2} direction="row">
        <QuestSelection />
      </Grid>

      <Button variant="contained" color="primary" onClick={() => console.log('Submit team', team)} style={{ marginTop: '20px' }}>
        Submit Team
      </Button>
    </Container>
  );
};

export default TeamSelection;
