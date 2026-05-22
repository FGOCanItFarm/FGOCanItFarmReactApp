import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
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
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../supabaseClient';
import '../questSelection.css';

const QuestSelection = ({ setSelectedQuest, selectedQuest }) => {
  const [quests, setQuests]               = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selecting, setSelecting]         = useState(null); // quest id being fetched

  // Deduplicate quests by event + name + recommend level
  const dedupedQuests = useMemo(() => {
    const map = new Map();
    for (const q of quests) {
      const key = `${q.warLongName || ''}||${q.name || ''}||${q.recommendLv || ''}`;
      if (!map.has(key)) map.set(key, q);
    }
    return Array.from(map.values());
  }, [quests]);

  // Group quests by event, sort events newest-first
  const sortedEvents = useMemo(() => {
    const latestByEvent = new Map();
    for (const q of quests) {
      const key = q.warLongName || 'Unknown Event';
      const t = (q.openedAt || 0) * 1000; // stored as Unix seconds
      if (t > (latestByEvent.get(key) || 0)) latestByEvent.set(key, t);
    }
    const groups = new Map();
    for (const q of dedupedQuests) {
      const key = q.warLongName || 'Unknown Event';
      if (!groups.has(key)) {
        groups.set(key, { warLongName: key, quests: [], latestOpenedAt: latestByEvent.get(key) || 0 });
      }
      groups.get(key).quests.push(q);
    }
    return Array.from(groups.values()).sort((a, b) => b.latestOpenedAt - a.latestOpenedAt);
  }, [dedupedQuests, quests]);

  const visibleEvents = useMemo(() => [...sortedEvents].reverse(), [sortedEvents]);

  // Auto-select newest event on load
  useEffect(() => {
    if (!selectedEvent && visibleEvents.length > 0) {
      if (selectedQuest?.warLongName && sortedEvents.some(g => g.warLongName === selectedQuest.warLongName)) {
        setSelectedEvent(selectedQuest.warLongName);
      } else {
        setSelectedEvent(visibleEvents[0].warLongName);
      }
    }
  }, [visibleEvents, selectedEvent, selectedQuest, sortedEvents]);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quests')
      .select('id, name, war_name, recommend_lv, opened_at')
      .order('id');

    if (error) {
      console.error('Error fetching quests:', error);
    } else {
      setQuests((data || []).map(q => ({
        id:           q.id,
        name:         q.name,
        warLongName:  q.war_name,
        recommendLv:  q.recommend_lv,
        openedAt:     q.opened_at,  // Unix seconds integer
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuests(); }, [fetchQuests]);

  const handleEventSelect = (name) => setSelectedEvent(name);

  // When the user picks a quest, lazy-load the full data needed for simulation.
  const handleQuestSelect = async (quest) => {
    setSelecting(quest.id);
    const { data, error } = await supabase
      .from('quests')
      .select('data')
      .eq('id', quest.id)
      .single();

    if (error) {
      console.error('Error fetching quest data:', error);
      setSelecting(null);
      return;
    }

    // Merge structured columns with full data for simulation engine
    setSelectedQuest({
      ...quest,
      // stages kept for enemy display and simulation
      stages:   data?.data?.stages   || [],
      // individuality (field IDs) needed by Quest.js
      individuality: data?.data?.individuality || [],
      _fullData: data?.data,
    });
    setSelecting(null);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ backgroundColor: '#e8f5e9', padding: 2, borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>Events</Typography>
          <Box component={Paper} sx={{ maxHeight: 640, overflow: 'auto', p: 1 }}>
            {visibleEvents.map((event, idx) => (
              <React.Fragment key={event.warLongName || idx}>
                <ListItemButton
                  selected={selectedEvent === event.warLongName}
                  onClick={() => handleEventSelect(event.warLongName)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body1">{event.warLongName}</Typography>
                    {event.latestOpenedAt ? (
                      <Typography variant="caption">
                        Opened: {new Date(event.latestOpenedAt).toLocaleDateString()}
                      </Typography>
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
            {selectedEvent ? (() => {
              const group = sortedEvents.find(g => g.warLongName === selectedEvent);
              if (!group) return <Typography variant="body2">No quests for this event.</Typography>;
              return (
                <Grid container spacing={2}>
                  {group.quests
                    .slice()
                    .sort((a, b) => (b.openedAt || 0) - (a.openedAt || 0))
                    .map((quest, qi) => (
                      <Grid item xs={12} sm={6} key={qi}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6">{quest.name}</Typography>
                            <Typography variant="body2">Recommended Lv: {quest.recommendLv}</Typography>
                            {selectedQuest?.id === quest.id && (
                              <Typography variant="caption" color="primary">&#10003; Selected</Typography>
                            )}
                          </CardContent>

                          {/* Stages accordion — populated after quest is selected */}
                          {selectedQuest?.id === quest.id && selectedQuest.stages?.length > 0 && (
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>Stages</AccordionSummary>
                              <AccordionDetails>
                                {selectedQuest.stages.map((stage, stageIndex) => (
                                  <Box key={stageIndex} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2">Stage {stageIndex + 1}</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                                      {stage.enemies.map((enemy, enemyIndex) => (
                                        <Box key={enemyIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Avatar src={enemy.svt?.face} alt={enemy.svtClassName} sx={{ width: 48, height: 48 }} />
                                          <Box>
                                            <Typography variant="body2">{enemy.svtClassName}</Typography>
                                            <Typography variant="caption">HP: {enemy.hp?.toLocaleString()}</Typography>
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
                            <Button
                              size="small"
                              variant="contained"
                              disabled={selecting === quest.id}
                              onClick={() => handleQuestSelect(quest)}
                            >
                              {selecting === quest.id ? 'Loading…' : 'Select Quest'}
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              );
            })()
            : (
              <Typography variant="body2">
                Select an event to view its quests (newest events listed on the left).
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestSelection;
