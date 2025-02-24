import React from 'react';
import { Button, Grid, Typography, Box, Container, Modal } from '@mui/material';
import CommandInputMenu from './CommandInputMenu';
import { useHistory } from 'react-router-dom';

const CommandInputPage = ({ team, commands, setCommands, selectedQuest, selectedMysticCode, handleSubmit, openModal, handleOpenModal, handleCloseModal }) => {
  return (
    <Container>
      <Typography variant="h4">Input Commands</Typography>
      <Grid container spacing={2} direction="row">
        <Grid item xs={12}>
          <Box mt={4}>
            <CommandInputMenu updateCommands={setCommands} team={team} />
          </Box>
        </Grid>
      </Grid>
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