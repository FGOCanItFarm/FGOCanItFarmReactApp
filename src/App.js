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
import { supabase } from './supabaseClient';
import { runSimulation } from './simulation/RunAdapter';
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
  const [activeServant, setActiveServant] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [includeEnemyOnly, setIncludeEnemyOnly] = useState(false);

  const ENEMY_ONLY_BLACKLIST = new Set([
    '240', '436', '83', '411', '149', '443', '333'
  ]);

  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const loadFromLocalStorage = (key) => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : [];
  };

  useEffect(() => {
    const savedTeam = loadFromLocalStorage('team');
    const BLACKLISTED_COLLECTIONNOS = new Set(['316']);
    const normalizeTeam = (raw) => {
      if (!Array.isArray(raw) || raw.length !== 6) return Array.from({ length: 6 }, () => ({ collectionNo: '' }));
      return raw.map(slot => {
        if (!slot || typeof slot !== 'object') return { collectionNo: '' };
        if (!slot.collectionNo || typeof slot.collectionNo !== 'string' || slot.collectionNo.trim() === '' || BLACKLISTED_COLLECTIONNOS.has(String(slot.collectionNo))) return { collectionNo: '' };
        return { collectionNo: slot.collectionNo };
      });
    };

    setTeam(normalizeTeam(savedTeam));
    const savedCommands = loadFromLocalStorage('commands');
    setCommands(savedCommands);
    const savedQuest = loadFromLocalStorage('selectedQuest');
    if (savedQuest && typeof savedQuest === 'object' && ('id' in savedQuest || 'name' in savedQuest)) {
      setSelectedQuest(savedQuest);
    } else {
      setSelectedQuest(null);
    }
    const savedMysticCode = loadFromLocalStorage('selectedMysticCode');
    setSelectedMysticCode(savedMysticCode);
    const savedServantEffects = loadFromLocalStorage('servantEffects');
    setServantEffects(Array.isArray(savedServantEffects) && savedServantEffects.length === 6 ? savedServantEffects : Array(6).fill({}));

    const FILTER_PERSISTENCE = 'reset';
    if (FILTER_PERSISTENCE === 'remember') {
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
      setSearchQuery('');
      setSelectedRarity([]);
      setSelectedClass([]);
      setSelectedNpType([]);
      setSelectedAttackType([]);
      setSortOrder('');
      localStorage.removeItem('fgocif.filters.v1');
    }
  }, []);

  useEffect(() => { saveToLocalStorage('team', team); }, [team]);
  useEffect(() => { saveToLocalStorage('commands', commands); }, [commands]);
  useEffect(() => { saveToLocalStorage('selectedQuest', selectedQuest); }, [selectedQuest]);
  useEffect(() => { saveToLocalStorage('selectedMysticCode', selectedMysticCode); }, [selectedMysticCode]);
  useEffect(() => { saveToLocalStorage('servantEffects', servantEffects); }, [servantEffects]);

  useEffect(() => {
    const FILTER_PERSISTENCE = 'reset';
    if (FILTER_PERSISTENCE === 'remember') {
      const filters = { searchQuery, selectedRarity, selectedClass, selectedNpType, selectedAttackType, sortOrder };
      localStorage.setItem('fgocif.filters.v1', JSON.stringify(filters));
    }
  }, [searchQuery, selectedRarity, selectedClass, selectedNpType, selectedAttackType, sortOrder]);

  const fetchServants = useCallback(async () => {
    const { data, error } = await supabase
      .from('servants')
      .select('collection_no, name, class_name, rarity, np_card, np_card_variable, np_card_options, attack_type, is_enemy_only, face_url, parser_flags')
      .order('collection_no');

    if (error) {
      console.error('Error fetching servants:', error);
      return;
    }

    const mapped = (data || []).map(s => ({
      collectionNo: String(s.collection_no),
      name:         s.name,
      className:    s.class_name,
      rarity:       s.rarity,
      np_card:      s.np_card,
      np_card_variable: s.np_card_variable,
      np_card_options:  s.np_card_options,
      attack_type:  s.attack_type,
      is_enemy_only: s.is_enemy_only,
      face_url:     s.face_url,
      parser_flags: s.parser_flags,
      noblePhantasms: (s.np_card_variable && s.np_card_options)
        ? s.np_card_options.map(card => ({ card, effectFlags: s.attack_type ? [s.attack_type] : [] }))
        : s.np_card
          ? [{ card: s.np_card, effectFlags: s.attack_type ? [s.attack_type] : [] }]
          : [],
    }));

    setServants(mapped);
    setFilteredServants(mapped);
  }, []);

  useEffect(() => { fetchServants(); }, [fetchServants]);

  const handleServantClick = (servant) => {
    // Roster servants carry a String collectionNo; the Atlas-sourced common
    // supports carry a numeric one. Normalise so team lookups (strict ===) and
    // localStorage validation (expects a String) both work.
    const collectionNo = String(servant.collectionNo);
    const newTeam = [...team];
    const count = newTeam.filter(s => s.collectionNo === collectionNo).length;
    if (count < 2) {
      const emptyIndex = newTeam.findIndex(s => s.collectionNo === '');
      if (emptyIndex !== -1) {
        newTeam[emptyIndex] = { collectionNo };
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

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const attackTypeLabels = {
    attackEnemyOne: 'Single Target',
    attackEnemyAll: 'AoE',
    support: 'Support'
  };

  const updateServantEffects = (index, fieldOrObject, maybeValue) => {
    const updateObj = (typeof fieldOrObject === 'object' && fieldOrObject !== null)
      ? fieldOrObject
      : { [fieldOrObject]: maybeValue };

    const newEffects = [...servantEffects];
    newEffects[index] = { ...newEffects[index], ...updateObj };
    setServantEffects(newEffects);

    const newTeam = [...team];
    newTeam[index] = { ...newTeam[index], ...updateObj };
    setTeam(newTeam);
  };

  const handleSubmit = async () => {
    setOpenModal(false);
    setSimulationResult(null);
    setSimulating(true);
    const result = await runSimulation({ team, commands, selectedQuest, selectedMysticCode, servantEffects });
    setSimulationResult(result);
    setSimulating(false);
  };

  const handleSubmitRun = async () => {
    const filledSlots = team
      .map((slot, i) => ({ slot, index: i }))
      .filter(({ slot }) => slot.collectionNo);

    const p_servant_collection_nos = filledSlots.map(({ slot }) => Number(slot.collectionNo));
    const p_np_levels = filledSlots.map(({ index }) =>
      Number(servantEffects[index]?.np ?? servantEffects[index]?.npLevel ?? 1)
    );
    const p_total_np_cost = commands.filter(c => ['4', '5', '6'].includes(c)).length;
    const p_token_string = commands.join(' ');
    const p_quest_id = selectedQuest?.id ?? null;
    const p_wave_results = simulationResult?.stats?.waves ?? {};
    // selectedMysticCode is the id (the <Select> value), not an object.
    const p_mystic_code_id = selectedMysticCode ?? null;
    // FR-11: persist each filled slot's effect inputs (attack / initialCharge /
    // card & NP buffs) so resimulateSavedRun can reproduce the run.
    const p_servant_effects = filledSlots.map(({ index }) => servantEffects[index] || {});

    const { error } = await supabase.rpc('submit_run', {
      p_quest_id,
      p_servant_collection_nos,
      p_np_levels,
      p_total_np_cost,
      p_token_string,
      p_wave_results,
      p_mystic_code_id,
      p_servant_effects,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const handleOpenModal  = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Router>
      <CssBaseline />
      <Sidebar team={team} selectedQuest={selectedQuest} />
      <Container className="app-content" disableGutters maxWidth={false} style={{ marginLeft: 0, marginRight: 'var(--team-panel-width)', marginTop: 'var(--nav-height)', padding: '20px', maxWidth: 'calc(100vw - var(--team-panel-width))', boxSizing: 'border-box' }}>
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
              servantEffects={servantEffects}
              updateServantEffects={updateServantEffects}
              handleTeamServantClick={handleTeamServantClick}
              simulationResult={simulationResult}
              setSimulationResult={setSimulationResult}
              simulating={simulating}
              onSubmitRun={handleSubmitRun}
            />
          } />
          <Route path="/search" element={
            <SearchPage
              team={team}
              selectedQuest={selectedQuest}
              setTeam={setTeam}
              setCommands={setCommands}
              setSelectedQuest={setSelectedQuest}
              setSelectedMysticCode={setSelectedMysticCode}
              setServantEffects={setServantEffects}
            />
          } />
          <Route path="/" element={<Instructions />} />
        </Routes>
      </Container>

      <StickyTeamBar
        team={team}
        servants={servants}
        selectedMysticCode={selectedMysticCode}
        setSelectedMysticCode={setSelectedMysticCode}
        selectedQuest={selectedQuest}
        servantEffects={servantEffects}
        updateServantEffects={updateServantEffects}
        selectedSlot={activeServant}
        setSelectedSlot={setActiveServant}
      />
    </Router>
  );
};

export default App;
