import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Sidebar from './components/Sidebar';
import TeamSelection from './components/TeamSelection';
import QuestSelection from './components/QuestSelection';
import ResultsTable from './components/ResultsTable';
import ServantAvatar from './components/ServantAvatar';


// TODO create GridComponentItem that has an inverted border in the corners that allows 
//     NPTYPE and ATTACKTYPE to be displayed
//     https://codepen.io/kristen17/pen/poMzXob?editors=1100

// TODO Ensure SupportsList servants remain regardless of filter selection
// TODO move SupposrtsList to right hand side
// TODO Query mongodb for lists of executed CanItFarm logs
// TODO Make the Grid items dynamically drag and droppable to reorder them on the fly
// TODO create script entry that conforms to the same standards as FGA

// TODO create mongodb credentials for read only access
//  TODO create mystic code db 
//       update servant db
//       


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

        </Routes>
      </Container>
    </Router>
  );
}

export default App;