import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
const API_BASE_URL = process.env.REACT_APP_API_URL;

const QuestSelection = () => {
  const [warLongNames, setWarLongNames] = useState([]);
  const [selectedWarLongName, setSelectedWarLongName] = useState('');
  const [quests, setQuests] = useState([]);
  const [recommendLv, setRecommendLv] = useState('90');

  useEffect(() => {
    const fetchWarLongNames = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/quests/warLongNames`)
        console.log('Fetched warLongNames:', response.data);
        setWarLongNames(response.data);
      } catch (error) {
        console.error('Error fetching warLongNames', error);
      }
    };

    fetchWarLongNames();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/servants}`, {
        params: {
          warLongName: selectedWarLongName,
          recommendLv
        }
      });
      console.log('Fetched quests data:', response.data);
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests', error);
    }
  };

  useEffect(() => {
    if (selectedWarLongName) {
      fetchQuests();
    }
  }, [selectedWarLongName, recommendLv]);

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>War Long Name</InputLabel>
        <Select
          value={selectedWarLongName}
          onChange={(e) => setSelectedWarLongName(e.target.value)}
          style={{ width: '100%' }} // Ensure the Select component has full width
        >
          {warLongNames.map((name, index) => (
            <MenuItem key={index} value={name} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth style={{ marginTop: '16px' }}>
        <InputLabel>Recommended Level</InputLabel>
        <Select
          value={recommendLv}
          onChange={(e) => setRecommendLv(e.target.value)}
        >
          <MenuItem value="90">90</MenuItem>
          <MenuItem value="90+">90+</MenuItem>
          <MenuItem value="90++">90++</MenuItem>
          <MenuItem value="90*">90*</MenuItem>
        </Select>
      </FormControl>

      {Array.isArray(quests) && quests.map((group, index) => (
        <Box key={index} mt={2}>
          <Typography variant="h6">War: {group.warLongName}</Typography>
          {group.quests.map((quest, questIndex) => (
            <Box key={questIndex} mt={2}>
              <Typography variant="body1">Quest: {quest.name}</Typography>
              <Typography variant="body2">Recommended Lv: {quest.recommendLv}</Typography>
              {quest.stages.map((stage, stageIndex) => (
                <Box key={stageIndex} mt={2}>
                  <Typography variant="body2">Wave: {stage.wave}</Typography>
                  {stage.enemies.map((enemy, enemyIndex) => (
                    <Box key={enemyIndex} display="flex" alignItems="center" mb={1}>
                      <Typography>{enemy.svtClassName}</Typography>
                      <img src={enemy.svt.face} alt={`${enemy.svtClassName} face`} style={{ marginLeft: '8px', width: '50px' }} />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default QuestSelection;
