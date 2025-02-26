import React, { useState } from 'react';
import { Button, Grid, Typography, Box, Container, Modal } from '@mui/material';
import CommandInputMenu from './CommandInputMenu';
import TeamSection from './TeamSection';
import MysticCodeCommand from './MysticCodeCommand';
import SelectedServantDetails from './SelectedServantDetails';
import { useNavigate } from 'react-router-dom';
import '../CommandInputPage.css';

const CommandInputPage = ({ team, servants, setTeam, activeServant, setActiveServant, commands, setCommands, selectedQuest, selectedMysticCode, setSelectedMysticCode, handleSubmit, openModal, handleOpenModal, handleCloseModal, updateServantEffects }) => {
  const navigate = useNavigate();

  const handleTeamServantClick = (index) => {
    setActiveServant(index);
  };

  const handleEffectChange = (field, value) => {
    const updatedTeam = team.map((servant, index) => {
      if (index === activeServant) {
        return { ...servant, [field]: value };
      }
      return servant;
    });
    setTeam(updatedTeam);
  };

  return (
    <Container className="command-input-container">
      <Typography variant="h4">Team</Typography>
      <Box className="command-input-grid">
        <Box className="team-section">
          <TeamSection
            team={team}
            servants={servants}
            activeServant={activeServant}
            handleTeamServantClick={handleTeamServantClick}
            updateServantEffects={updateServantEffects}
            pageType="command-input-page"
          />
        </Box>
        <Box className="mystic-code-section">
          <MysticCodeCommand
            team={team}
            setTeam={setTeam}
            updateCommands={setCommands}
            selectedMysticCode={selectedMysticCode}
            setSelectedMysticCode={setSelectedMysticCode}
          />
        </Box>
      </Box>
      <Box className="command-input-menu">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CommandInputMenu updateCommands={setCommands} team={team} activeServant={activeServant} />
          </Grid>
          <Grid item xs={6}>
            <SelectedServantDetails servant={team[activeServant]} handleEffectChange={handleEffectChange} />
          </Grid>
        </Grid>
      </Box>
      <Box mt={4}>
        <Typography variant="h6">Commands</Typography>
        <Box component="pre" p={2} border="1px solid black" bgcolor="#f5f5f5" style={{ whiteSpace: 'nowrap' }}>
          {commands.join(' ')}
        </Box>
      </Box>
      <Button variant="contained" color="secondary" onClick={() => setCommands([])} style={{ marginTop: '20px' }}>
        Clear Commands
      </Button>
      <Button variant="contained" color="primary" onClick={handleOpenModal} style={{ marginTop: '20px' }}>
        Submit Team
      </Button>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box p={4} bgcolor="white" borderRadius="8px" boxShadow={3} style={{ margin: 'auto', marginTop: '10%', width: '50%' }}>
          <Typography variant="h6">Confirm Submission</Typography>
          <Typography variant="body1"><strong>Team:</strong> {JSON.stringify(team, null, 2)}</Typography>
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

export default CommandInputPage;