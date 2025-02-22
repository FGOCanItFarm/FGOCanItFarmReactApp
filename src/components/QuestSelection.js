import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, FormControlLabel, Checkbox, FormGroup, FormControl, Typography, Select, MenuItem, Tabs, Tab, Button } from '@mui/material';

const QuestSelection = ({ setSelectedQuest }) => {
  const [warLongNames, setWarLongNames] = useState([]);
  const [selectedWarLongNames, setSelectedWarLongNames] = useState([]);
  const [quests, setQuests] = useState([]);
  const [recommendLv, setRecommendLv] = useState('90');
  const [region, setRegion] = useState('JP'); // Default to "EN"

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
      const params = new URLSearchParams();
      selectedWarLongNames.forEach(name => params.append('warLongNames', name));
      if (recommendLv) {
        params.append('recommendLv', recommendLv);
      }

      const response = await axios.get(`/api/quests/filter`, { params });
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests', error.response ? error.response.data : error.message);
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

  const getHighestHpEnemy = (enemies) => {
    return enemies.reduce((max, enemy) => (enemy.hp > max.hp ? enemy : max), enemies[0]);
  };

  const handleRegionChange = (event, newRegion) => {
    setRegion(newRegion);
  };

  const handleQuestSelect = (quest) => {
    setSelectedQuest(quest); // Store the selected quest in parent state
  };

  const filteredQuests = quests.filter(quest => {
    if (region === 'EN') {
      return quest.id < 94081909;
    } else {
      return quest.id >= 94081909;
    }
  });

  return (
    <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
      <Box>
        <Tabs
          value={region}
          onChange={handleRegionChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="EN" value="EN" style={{ backgroundColor: '#f0f0f0' }} />
          <Tab label="JP" value="JP" style={{ backgroundColor: '#e0e0e0' }} />
        </Tabs>

        <FormControl component="fieldset" style={{ marginTop: '16px' }}>
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
            <MenuItem value="90**">90**</MenuItem>
          </Select>
        </FormControl>

        {Array.isArray(filteredQuests) && filteredQuests.length > 0 && filteredQuests.map((quest, questIndex) => (
          <Box key={questIndex} mt={2} border="1px solid lightgray" borderRadius="8px" padding="16px">
            <Typography variant="h6">War: {quest.warLongName}</Typography>
            <Typography variant="body1">Quest: {quest.name}</Typography>
            <Typography variant="body2">Recommended Lv: {quest.recommendLv}</Typography>

            {quest.stages && quest.stages.map((stage, stageIndex) => {
              return (
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
              );
            })}

            <Button variant="contained" color="primary" onClick={() => handleQuestSelect(quest)} style={{ marginTop: '16px' }}>
              Select Quest
            </Button>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default QuestSelection;