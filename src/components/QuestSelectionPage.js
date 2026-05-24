import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import QuestSelection from './QuestSelection';
import { useNavigate } from 'react-router-dom';

const QuestSelectionPage = ({ selectedQuest, setSelectedQuest }) => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/command-input');
  };

  return (
    <Box sx={{ py: 3, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Select Farming Node
      </Typography>
  <QuestSelection setSelectedQuest={setSelectedQuest} selectedQuest={selectedQuest} />
      <Button variant="contained" color="primary" onClick={handleNext} sx={{ mt: 3 }}>
        Next
      </Button>
    </Box>
  );
};

export default QuestSelectionPage;