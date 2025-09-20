import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Avatar,
  Paper,
  ListItemButton,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '../questSelection.css';

// (removed recommend-level normalization to avoid ambiguous client-side mapping)

const QuestSelection = ({ setSelectedQuest }) => {
  const [warLongNames, setWarLongNames] = useState([]);
  const [quests, setQuests] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Deduplicate quests by warLongName + name + recommendLv to avoid repeated cards
  const dedupedQuests = useMemo(() => {
    if (!Array.isArray(quests)) return [];
    const map = new Map();
    for (const q of quests) {
      const key = `${q.warLongName || ''}||${q.name || ''}||${q.recommendLv || ''}`;
      if (!map.has(key)) {
        map.set(key, q);
      }
    }
    return Array.from(map.values());
  }, [quests]);

  // Sort deduped quests by openedAt descending (most recently opened at top)
  const sortedQuests = useMemo(() => {
    const arr = Array.isArray(dedupedQuests) ? dedupedQuests.slice() : [];
    arr.sort((a, b) => {
      const parseTime = (v) => {
        if (!v) return 0;
        // If numeric (timestamp), use it; otherwise try Date.parse
        if (typeof v === 'number') return v;
        const t = Date.parse(v);
        return Number.isNaN(t) ? 0 : t;
      };
      return parseTime(b.openedAt) - parseTime(a.openedAt);
    });
    return arr;
  }, [dedupedQuests]);

  // Group deduped quests by event (warLongName) and compute latest openedAt per event
  const sortedEvents = useMemo(() => {
    // helper to parse openedAt values consistently (normalize seconds -> ms)
    const parseTime = (v) => {
      if (!v) return 0;
      if (typeof v === 'number') {
        // If value looks like seconds (10 digits), convert to ms
        if (v < 1e12) return v * 1000;
        return v;
      }
      const t = Date.parse(v);
      return Number.isNaN(t) ? 0 : t;
    };

    // Build a map of latest openedAt across ALL quests (not just deduped) grouped by event
    const latestByEvent = new Map();
    for (const q of quests || []) {
      const key = q.warLongName || 'Unknown Event';
      const t = parseTime(q.openedAt);
      const prev = latestByEvent.get(key) || 0;
      if (t > prev) latestByEvent.set(key, t);
    }

    // Now build groups from dedupedQuests (so duplicates removed) and attach latestOpenedAt from map
    const groups = new Map();
    for (const q of dedupedQuests) {
      const key = q.warLongName || 'Unknown Event';
      if (!groups.has(key)) groups.set(key, { warLongName: key, quests: [], latestOpenedAt: latestByEvent.get(key) || 0 });
      const entry = groups.get(key);
      entry.quests.push(q);
    }

    const arr = Array.from(groups.values());
    arr.sort((a, b) => b.latestOpenedAt - a.latestOpenedAt);
    return arr;
  }, [dedupedQuests, quests]);

  // Auto-select newest event when events list updates
  useEffect(() => {
    if (!selectedEvent && Array.isArray(sortedEvents) && sortedEvents.length > 0) {
      // Render newest-first by reversing the sortedEvents when displaying. Ensure auto-select matches that view.
      const visible = [...sortedEvents].reverse();
      setSelectedEvent(visible[0].warLongName);
    }
  }, [sortedEvents, selectedEvent]);

  const visibleEvents = useMemo(() => {
    return Array.isArray(sortedEvents) ? [...sortedEvents].reverse() : [];
  }, [sortedEvents]);

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
      // Fetch all quests (no filter) so we can compute event ordering by openedAt
      console.debug('QuestSelection: fetching all quests for event ordering');
      const response = await axios.get(`/api/quests/filter`);
      setQuests(response.data || []);
    } catch (error) {
      console.error('Error fetching quests', error.response ? error.response.data : error.message);
    }
  }, []);

  // Fetch all quests on mount (so we can build event ordering). Also refetch when war list changes.
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests, warLongNames]);

  const handleEventSelect = (name) => {
    setSelectedEvent(name);
  };

  const handleQuestSelect = (quest) => {
    setSelectedQuest(quest); // Store the selected quest in parent state
  };

  return (
    <Box sx={{ backgroundColor: '#e8f5e9', padding: 2, borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>Events</Typography>
          <Box component={Paper} sx={{ maxHeight: 640, overflow: 'auto', p: 1 }}>
            {visibleEvents.map((event, idx) => (
              <React.Fragment key={event.warLongName || idx}>
                <ListItemButton selected={selectedEvent === event.warLongName} onClick={() => handleEventSelect(event.warLongName)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body1">{event.warLongName}</Typography>
                    {event.latestOpenedAt ? (
                      <Typography variant="caption">Opened: {new Date(event.latestOpenedAt).toLocaleDateString()}</Typography>
                    ) : null}
                  </Box>
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6">Quests</Typography>
          <Box sx={{ mt: 1 }}>
            {selectedEvent ? (
              // find the selected event group
              (() => {
                const group = sortedEvents.find((g) => g.warLongName === selectedEvent);
                if (!group) return <Typography variant="body2">No quests available for this event.</Typography>;
                return (
                  <Grid container spacing={2}>
                    {group.quests
                      .slice()
                      .sort((a, b) => {
                        const p = (v) => {
                          if (!v) return 0;
                          if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
                          const t = Date.parse(v);
                          return Number.isNaN(t) ? 0 : t;
                        };
                        return p(b.openedAt) - p(a.openedAt);
                      })
                      .map((quest, qi) => (
                        <Grid item xs={12} sm={6} key={qi}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6">{quest.name}</Typography>
                              <Typography variant="body2">Recommended Lv: {quest.recommendLv}</Typography>
                            </CardContent>
                            {quest.stages && (
                              <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Stages</AccordionSummary>
                                <AccordionDetails>
                                  {quest.stages.map((stage, stageIndex) => (
                                    <Box key={stageIndex} sx={{ mb: 2 }}>
                                      <Typography variant="subtitle2">Stage {stageIndex + 1}</Typography>
                                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                                        {stage.enemies.map((enemy, enemyIndex) => (
                                          <Box key={enemyIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={enemy.svt.face} alt={enemy.svtClassName} sx={{ width: 48, height: 48 }} />
                                            <Box>
                                              <Typography variant="body2">{enemy.svtClassName}</Typography>
                                              <Typography variant="caption">HP: {enemy.hp}</Typography>
                                            </Box>
                                          </Box>
                                        ))}
                                      </Box>
                                    </Box>
                                  ))}
                                </AccordionDetails>
                              </Accordion>
                            )}
                            <CardActions>
                              <Button size="small" variant="contained" onClick={() => handleQuestSelect(quest)}>
                                Select Quest
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                );
              })()
            ) : (
              <Typography variant="body2">Select an event to view its quests (newest events are listed on the left).</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestSelection;