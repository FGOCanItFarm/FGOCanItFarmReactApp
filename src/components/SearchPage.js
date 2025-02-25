import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';

const SearchPage = ({ team, selectedQuest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (team.filter(member => member).length < 3) {
      setError('Please select at least 3 team members.');
    } else if (!selectedQuest) {
      setError('Please select a quest.');
    } else {
      setError('');
    }
  }, [team, selectedQuest]);

  const handleSearch = async () => {
    if (team.filter(member => member).length < 3) {
      setError('Please select at least 3 team members.');
      return;
    }
    if (!selectedQuest) {
      setError('Please select a quest.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/search', { team, query: searchQuery, questId: selectedQuest.id });
      setResults(response.data);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Search Page</Typography>
      <Typography variant="body1">Team: {JSON.stringify(team, null, 2)}</Typography>
      <Typography variant="body1">Selected Quest: {selectedQuest ? selectedQuest.id : 'None'}</Typography>
      <TextField
        label="Search Query"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSearch} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Search'}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      <Box mt={4}>
        {results.length > 0 ? (
          results.map((result, index) => (
            <Box key={index} mb={2} p={2} border="1px solid #ccc" borderRadius="8px">
              <Typography variant="h6">Quest ID: {result.questId}</Typography>
              <Typography variant="body1">Success: {result.success ? 'Yes' : 'No'}</Typography>
              <Typography variant="body2">Details: {result.details}</Typography>
            </Box>
          ))
        ) : (
          <Typography>No results found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default SearchPage;