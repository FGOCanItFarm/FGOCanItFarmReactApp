import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FormControlLabel, Checkbox, Typography, Select, MenuItem, Button } from '@mui/material';
import '../questSelection.css';

const QuestSelection = ({ setSelectedQuest }) => {
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

  const handleQuestSelect = (quest) => {
    setSelectedQuest(quest); // Store the selected quest in parent state
  };

  return (
    <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px' }}>
      <div>
        <div style={{ marginTop: '16px' }}>
          <Typography variant="h6">Event Titles</Typography>
          <div className="masonry">
            {warLongNames.map((name, index) => (
              <div key={index} className="masonry-item">
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
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <Typography variant="h6">Recommended Level</Typography>
          <Select
            value={recommendLv}
            onChange={(e) => setRecommendLv(e.target.value)}
            fullWidth
          >
            <MenuItem value="90">90</MenuItem>
            <MenuItem value="90+">90+</MenuItem>
            <MenuItem value="90++">90++</MenuItem>
            <MenuItem value="90*">90*</MenuItem>
            <MenuItem value="90**">90**</MenuItem>
          </Select>
        </div>

        {Array.isArray(quests) && quests.length > 0 && quests.map((quest, questIndex) => (
          <div key={questIndex} style={{ marginTop: '16px', border: '1px solid lightgray', borderRadius: '8px', padding: '16px' }}>
            <Typography variant="h6">War: {quest.warLongName}</Typography>
            <Typography variant="body1">Quest: {quest.name}</Typography>
            <Typography variant="body2">Recommended Lv: {quest.recommendLv}</Typography>

            {quest.stages && quest.stages.map((stage, stageIndex) => {
              return (
                <div key={stageIndex} style={{ marginTop: '16px' }}>
                  <Typography variant="body2">Stage {stageIndex + 1}</Typography>
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {stage.enemies.map((enemy, enemyIndex) => (
                      <div key={enemyIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', marginRight: '16px' }}>
                        <Typography>{enemy.svtClassName}</Typography>
                        <Typography>{enemy.hp}</Typography>
                        <img src={enemy.svt.face} alt={`${enemy.svtClassName} face`} style={{ marginLeft: '8px', width: '50px' }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <Button variant="contained" color="primary" onClick={() => handleQuestSelect(quest)} style={{ marginTop: '16px' }}>
              Select Quest
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestSelection;