import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, FormControl, FormControlLabel, Checkbox, FormGroup, Select, MenuItem } from '@mui/material';

const QuestSelection = () => {
  const [warLongNames, setWarLongNames] = useState([]);
  const [selectedWarLongNames, setSelectedWarLongNames] = useState([]);
  const [quests, setQuests] = useState([]);
  const [recommendLv, setRecommendLv] = useState('90');

  useEffect(() => {
    const fetchWarLongNames = async () => {
      try {
        const response = await axios.get(`/api/quests/warLongNames`);
        setWarLongNames(response.data);
      } catch (error) {
        console.error('Error fetching warLongNames', error);
      }
    };

    fetchWarLongNames();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await axios.get(`/api/quests`, {
        params: {
          warLongNames: selectedWarLongNames,
          recommendLv
        }
      });
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests', error);
    }
  };

  useEffect(() => {
    if (selectedWarLongNames.length > 0) {
      fetchQuests();
    }
  }, [selectedWarLongNames, recommendLv]);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedWarLongNames((prev) =>
      checked ? [...prev, value] : prev.filter((name) => name !== value)
    );
  };

  return (
    <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
      <Box>
        <FormControl component="fieldset">
          <Typography variant="h6">War Long Names</Typography>
          <FormGroup>
            {warLongNames.map((name, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    value={name}
                    checked={selectedWarLongNames.includes(name)}
                    onChange={handleCheckboxChange}
                  />
                }
                label={name}
              />
            ))}
          </FormGroup>
        </FormControl>

        <FormControl fullWidth style={{ marginTop: '16px' }}>
          <Typography variant="h6">Recommended Level</Typography>
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

        {Array.isArray(quests) && quests.map((quest, index) => (
          <Box key={index} mt={2}>
            <Typography variant="h6">War: {quest.warLongName}</Typography>
            <Typography variant="body1">Quest: {quest.name}</Typography>
            <Typography variant="body2">Recommended Lv: {quest.recommendLv}</Typography>
            {quest.stages.map((stage, stageIndex) => (
              <Box key={stageIndex} mt={2}>
                <Typography variant="body2">Wave: {stage.wave}</Typography>
                <Box display="flex" flexDirection="row" flexWrap="wrap">
                  {stage.enemies.map((enemy, enemyIndex) => (
                    <Box key={enemyIndex} display="flex" alignItems="center" mb={1} mr={2}>
                      <Typography>{enemy.svtClassName}</Typography>
                      <Typography>{enemy.hp}</Typography>
                      <img src={enemy.svt.face} alt={`${enemy.svtClassName} face`} style={{ marginLeft: '8px', width: '50px' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default QuestSelection;
