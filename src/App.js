import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Sidebar from './components/Sidebar';
import TeamSelectionPage from './components/TeamSelectionPage';
import QuestSelectionPage from './components/QuestSelectionPage';
import CommandInputPage from './components/CommandInputPage';
import Instructions from './components/Instructions';
import axios from 'axios';

const App = () => {
  const [team, setTeam] = useState(Array(6).fill(''));
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

  const handleTeamServantClick = (servant) => {
    setActiveServant(servant);
  };

  const clearTeam = () => {
    setTeam(Array(6).fill(''));
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
  };

  const handleSubmit = () => {
    const teamData = {
      team: team.map((collectionNo, index) => ({
        servant_id: collectionNo,
        append_2: servantEffects[index].append_2 || false,
        append_5: servantEffects[index].append_5 || false,
        ...servantEffects[index]
      })),
      mc_id: selectedMysticCode,
      quest_id: selectedQuest?.id,
      commands
    };
    console.log('Submit team', teamData);
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
      <Sidebar />
      <Container style={{ marginLeft: 240, padding: '20px' }}>
        <Routes>
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/team-selection" element={
            <TeamSelectionPage
              team={team}
              setTeam={setTeam}
              servants={servants}
              filteredServants={filteredServants}
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
              commands={commands}
              setCommands={setCommands}
              selectedQuest={selectedQuest}
              selectedMysticCode={selectedMysticCode}
              handleSubmit={handleSubmit}
              openModal={openModal}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
            />
          } />
          <Route path="/" element={<Instructions />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;