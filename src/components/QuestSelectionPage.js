import React from 'react';
import { Button, Grid, Typography, Container } from '@mui/material';
import QuestSelection from './QuestSelection';
import { useHistory } from 'react-router-dom';

const QuestSelectionPage = ({ selectedQuest, setSelectedQuest }) => {
  const history = useHistory();

  const handleNext = () => {
    history.push('/command-input');
  };

  return (
    <Container>
      <Typography variant="h4">Select Farming Node</Typography>
      <Grid container spacing={2} direction="row">
        <QuestSelection setSelectedQuest={setSelectedQuest} />
      </Grid>
      <Button variant="contained" color="primary" onClick={handleNext} style={{ marginTop: '20px' }}>
        Next
      </Button>
    </Container>
  );
};

export default QuestSelectionPage;