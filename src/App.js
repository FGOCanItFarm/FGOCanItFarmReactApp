import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Sidebar from './components/Sidebar';
import TeamSelectionPage from './components/TeamSelectionPage';
import QuestSelectionPage from './components/QuestSelectionPage';
import CommandInputPage from './components/CommandInputPage';
import Instructions from './components/Instructions';
import SearchPage from './components/SearchPage';
import StickyTeamBar from './components/StickyTeamBar';
import axios from 'axios';
import './ui-vars.css';

const App = () => {
  const [team, setTeam] = useState(Array.from({ length: 6 }, () => ({ collectionNo: '' })));
  const [servants, setServants] = useState([]);
  const [filteredServants, setFilteredServants] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState([]);
  const [selectedClass, setSelectedClass] = useState([]);
  const [selectedNpType, setSelectedNpType] = useState([]);
  const [selectedAttackType, setSelectedAttackType] = useState([]);
  const [commands, setCommands] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [selectedMysticCode, setSelectedMysticCode] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [servantEffects, setServantEffects] = useState(Array(6).fill({}));
  const [activeServant, setActiveServant] = useState(null);
  // Control whether enemy-only NPCs are included in filtered lists (default: false)
  const [includeEnemyOnly, setIncludeEnemyOnly] = useState(false);

  // Small hard-coded blacklist of known enemy-only / NPC collectionNos to hide by default.
  // Add collectionNos here as strings (e.g., '123', '456').
  const ENEMY_ONLY_BLACKLIST = new Set([
    '240', '436', '83', '411', '149', '443', '333'
  ]);

  axios.defaults.baseURL = process.env.REACT_APP_API_URL;

  // Function to save data to local storage
  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Function to load data from local storage
  const loadFromLocalStorage = (key) => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : [];
  };

  // Load team, commands, quest, and mystic code data from local storage when the component mounts
  useEffect(() => {
    const savedTeam = loadFromLocalStorage('team');
    // Normalize saved team: must be array of length 6 with objects containing collectionNo.
    const BLACKLISTED_COLLECTIONNOS = new Set(['316']);
    const normalizeTeam = (raw) => {
      if (!Array.isArray(raw) || raw.length !== 6) return Array.from({ length: 6 }, () => ({ collectionNo: '' }));
      // Ensure each slot is an object with a valid collectionNo string; if invalid, replace with empty slot
      return raw.map(slot => {
        if (!slot || typeof slot !== 'object') return { collectionNo: '' };
        if (!slot.collectionNo || typeof slot.collectionNo !== 'string' || slot.collectionNo.trim() === '' || BLACKLISTED_COLLECTIONNOS.has(String(slot.collectionNo))) return { collectionNo: '' };
        // If collectionNo was a numeric id that we removed from supports, it's still valid as a string here; keep it
        return { collectionNo: slot.collectionNo };
      });
    };

    setTeam(normalizeTeam(savedTeam));
    const savedCommands = loadFromLocalStorage('commands');
    setCommands(savedCommands);
    const savedQuest = loadFromLocalStorage('selectedQuest');
    setSelectedQuest(savedQuest);
    const savedMysticCode = loadFromLocalStorage('selectedMysticCode');
    setSelectedMysticCode(savedMysticCode);
  const savedServantEffects = loadFromLocalStorage('servantEffects');
  setServantEffects(Array.isArray(savedServantEffects) && savedServantEffects.length === 6 ? savedServantEffects : Array(6).fill({}));

    // Filter persistence logic - forcing reset on refresh/navigation
    const FILTER_PERSISTENCE = 'reset'; // 'remember' or 'reset'
    
    if (FILTER_PERSISTENCE === 'remember') {
      // Load filters from localStorage
      const savedFilters = localStorage.getItem('fgocif.filters.v1');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          setSearchQuery(filters.searchQuery || '');
          setSelectedRarity(filters.selectedRarity || []);
          setSelectedClass(filters.selectedClass || []);
          setSelectedNpType(filters.selectedNpType || []);
          setSelectedAttackType(filters.selectedAttackType || []);
          setSortOrder(filters.sortOrder || '');
        } catch (error) {
          console.error('Error loading filters from localStorage:', error);
        }
      }
    } else {
      // Reset filters to defaults
      setSearchQuery('');
      setSelectedRarity([]);
      setSelectedClass([]);
      setSelectedNpType([]);
      setSelectedAttackType([]);
      setSortOrder('');
      // Clear localStorage filters
      localStorage.removeItem('fgocif.filters.v1');
    }
  }, []);

  // Save team data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('team', team);
  }, [team]);

  // Save commands data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('commands', commands);
  }, [commands]);

  // Save selected quest data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('selectedQuest', selectedQuest);
  }, [selectedQuest]);

  // Save selected mystic code data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('selectedMysticCode', selectedMysticCode);
  }, [selectedMysticCode]);

  // Save servant effects data to local storage whenever it changes
  useEffect(() => {
    saveToLocalStorage('servantEffects', servantEffects);
  }, [servantEffects]);

  // Save filters to localStorage whenever they change (if persistence is enabled)
  useEffect(() => {
    const FILTER_PERSISTENCE = 'reset'; // 'remember' or 'reset'
    
    if (FILTER_PERSISTENCE === 'remember') {
      const filters = {
        searchQuery,
        selectedRarity,
        selectedClass,
        selectedNpType,
        selectedAttackType,
        sortOrder
      };
      localStorage.setItem('fgocif.filters.v1', JSON.stringify(filters));
    }
  }, [searchQuery, selectedRarity, selectedClass, selectedNpType, selectedAttackType, sortOrder]);

  const fetchServants = useCallback(async () => {
    try {
      const response = await axios.get(`/api/servants`);
      setServants(response.data);
      setFilteredServants(response.data);
    } catch (error) {
      console.error('There was an error fetching the servant data!', error);
    }
  }, []);

  useEffect(() => {
    fetchServants();
  }, [fetchServants]);

  const handleServantClick = (servant) => {
    const newTeam = [...team];
    const count = newTeam.filter(s => s.collectionNo === servant.collectionNo).length;
    if (count < 2) {
      const emptyIndex = newTeam.findIndex(s => s.collectionNo === '');
      if (emptyIndex !== -1) {
        newTeam[emptyIndex] = { collectionNo: servant.collectionNo };
        setTeam(newTeam);
      } else {
        alert('Your team is full.');
      }
    } else {
      alert('You can only have 2 duplicates of a servant.');
    }
  };

  const handleTeamServantClick = (index) => {
    setActiveServant(index);
  };

  const clearTeam = () => {
    // create unique empty objects for each slot to avoid shared references
    setTeam(Array.from({ length: 6 }, () => ({ collectionNo: '' })));
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

  const updateServantEffects = (index, field, value) => {
    const newEffects = [...servantEffects];
    newEffects[index] = {
      ...newEffects[index],
      [field]: value
    };
    setServantEffects(newEffects);

    const newTeam = [...team];
    newTeam[index] = {
      ...newTeam[index],
      [field]: value
    };
    setTeam(newTeam);
  };

  const handleSubmit = async () => {
    const teamData = {
      team: team.map((servant, index) => ({
        servant_id: servant.collectionNo,
        append2: servantEffects[index].append2 || false,
        append5: servantEffects[index].append5 || false,
        ...servantEffects[index]
      })),
      mc_id: selectedMysticCode,
      quest_id: selectedQuest?.id,
      commands
    };
    try {
      await axios.post('/api/submit-team', teamData); // Adjust endpoint if needed
      console.log('Team submitted successfully');
    } catch (error) {
      console.error('Error submitting team:', error);
    }
    setOpenModal(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Router>
      <CssBaseline />
      <Sidebar team={team} selectedQuest={selectedQuest} />
      <Container style={{ marginLeft: 192, padding: '20px' }}>
        <Routes>
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/team-selection" element={
            <TeamSelectionPage
              team={team}
              setTeam={setTeam}
              servants={servants}
              filteredServants={filteredServants}
              setFilteredServants={setFilteredServants}
              handleServantClick={handleServantClick}
              handleTeamServantClick={handleTeamServantClick}
              updateServantEffects={updateServantEffects}
              clearTeam={clearTeam}
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
              selectedMysticCode={selectedMysticCode}
              setSelectedMysticCode={setSelectedMysticCode}
              includeEnemyOnly={includeEnemyOnly}
              setIncludeEnemyOnly={setIncludeEnemyOnly}
              enemyOnlyBlacklist={ENEMY_ONLY_BLACKLIST}
            />
          } />
          <Route path="/quest-selection" element={
            <QuestSelectionPage
              selectedQuest={selectedQuest}
              setSelectedQuest={setSelectedQuest}
            />
          } />
          <Route path="/command-input" element={
            <CommandInputPage
              team={team}
              servants={servants}
              setTeam={setTeam}
              activeServant={activeServant}
              setActiveServant={setActiveServant}
              commands={commands}
              setCommands={setCommands}
              selectedQuest={selectedQuest}
              selectedMysticCode={selectedMysticCode}
              setSelectedMysticCode={setSelectedMysticCode}
              handleSubmit={handleSubmit}
              openModal={openModal}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
              updateServantEffects={updateServantEffects}
              handleTeamServantClick={handleTeamServantClick}
            />
          } />
          <Route path="/search" element={
            <SearchPage
              team={team}
              selectedQuest={selectedQuest}
            />
          } />
          <Route path="/" element={<Instructions />} />
        </Routes>
      </Container>
      
      {/* Sticky Team Bar - always visible */}
      <StickyTeamBar 
        team={team}
        servants={servants}
        selectedMysticCode={selectedMysticCode}
        selectedQuest={selectedQuest}
        servantEffects={servantEffects}
        updateServantEffects={updateServantEffects}
      />
    </Router>
  );
};

export default App;