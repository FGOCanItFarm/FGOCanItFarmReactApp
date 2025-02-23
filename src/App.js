import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Sidebar from './components/Sidebar';
import TeamSelection from './components/TeamSelection';
import QuestSelection from './components/QuestSelection';
import ResultsTable from './components/ResultsTable';
import ServantAvatar from './components/ServantAvatar';
import HowToUse from './components/Instructions';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Sidebar />
      <Container style={{ marginLeft: 240, padding: '20px' }}>
        <Routes>
          <Route path="/" element={<ResultsTable />} />
          <Route path="/teams" element={<TeamSelection />} />
          <Route path="/quests" element={<QuestSelection />} />
          <Route path="/test" element={<ServantAvatar />} />
          <Route path="/how-to-use" element={<HowToUse />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;