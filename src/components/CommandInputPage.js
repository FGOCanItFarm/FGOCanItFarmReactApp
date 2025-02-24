import React from 'react';
import { Button, Grid, Typography, Box, Container, Modal, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CommandInputMenu from './CommandInputMenu';
import TeamSection from './TeamSection';
import MysticCodeSelection from './MysticCodeSelection';
import { useNavigate } from 'react-router-dom';

const CommandInputPage = ({ team, servants, activeServant, setActiveServant, commands, setCommands, selectedQuest, selectedMysticCode, setSelectedMysticCode, handleSubmit, openModal, handleOpenModal, handleCloseModal, updateServantEffects, handleTeamServantClick }) => {
  const navigate = useNavigate();

  const handleMysticCodeChange = (event) => {
    setSelectedMysticCode(event.target.value);
  };

  return (
    <Container>
      <Typography variant="h4">Team</Typography>
      <Grid container spacing={2} direction="row">
        <Grid item xs={12} md={8}>
          <Typography variant="h4">Input Commands</Typography>
          <Box mt={4}>
            <CommandInputMenu updateCommands={setCommands} team={team} activeServant={activeServant} />
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
        </Grid>
        <Grid item xs={12} md={4}>
          <TeamSection
            team={team}
            servants={servants}
            activeServant={activeServant}
            handleTeamServantClick={handleTeamServantClick}
            updateServantEffects={updateServantEffects}
            setActiveServant={setActiveServant}
            style={{ height: '100%' }}
          />
          <Box mt={4}>
            <MysticCodeSelection
              team={team}
              setTeam={setTeam}
              updateCommands={setCommands}
              selectedMysticCode={selectedMysticCode}
              setSelectedMysticCode={setSelectedMysticCode}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CommandInputPage;