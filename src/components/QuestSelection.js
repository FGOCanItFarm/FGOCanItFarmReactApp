import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, FormControlLabel, Checkbox, FormGroup, FormControl, Typography, Select, MenuItem } from '@mui/material';

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

  const fetchQuests = useCallback(async () => {
    try {
      const response = await axios.get(`/api/quests/filter`, {
        params: {
          warLongNames: selectedWarLongNames,
          recommendLv
        }
      });
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests', error);
    }
  }, [selectedWarLongNames, recommendLv]);

  useEffect(() => {
    if (selectedWarLongNames.length > 0) {
      fetchQuests();
    }
  }, [selectedWarLongNames, recommendLv, fetchQuests]);

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
          <FormGroup style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {warLongNames.map((name, index) => (
              <Box key={index} style={{ border: '1px solid lightgray', borderRadius: '4px', padding: '8px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value={name}
                      checked={selectedWarLongNames.includes(name)}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label={name}
                />
              </Box>
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
            <MenuItem value="90*">90**</MenuItem>
          </Select>
        </FormControl>

        {Array.isArray(quests) && quests.length > 0 && (
          <Box mt={2}>
            <Typography variant="h6">War: {quests[0].warLongName}</Typography>
            <Typography variant="body1">Quest: {quests[0].name}</Typography>
            <Typography variant="body2">Recommended Lv: {quests[0].recommendLv}</Typography>

            {quests[0].stages && quests[0].stages.map((stage, stageIndex) => (
              <Box key={stageIndex} mt={2}>
                <Typography variant="body2">Stage {stageIndex + 1}</Typography>
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
        )}
      </Box>
    </div>
  );
};

export default QuestSelection;
