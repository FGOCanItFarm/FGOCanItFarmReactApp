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
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../supabaseClient';
import '../questSelection.css';

// camelCase / lowercase AA slugs → readable labels ("threatToHumanity" → "Threat To Humanity")
const prettify = (s) =>
  String(s)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());

// Canonical class display order; anything unlisted sorts to the end alphabetically.
const CLASS_ORDER = [
  'saber', 'archer', 'lancer', 'rider', 'caster', 'assassin', 'berserker',
  'shielder', 'ruler', 'avenger', 'moonCancer', 'alterEgo', 'foreigner',
  'pretender', 'beast',
];

const QuestSelection = ({ setSelectedQuest, selectedQuest }) => {
  const [quests, setQuests]               = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [selecting, setSelecting]         = useState(null); // quest id being fetched

  const [classFilter, setClassFilter]   = useState(() => new Set());
  const [attrFilter, setAttrFilter]     = useState(() => new Set());
  const [traitFilter, setTraitFilter]   = useState(() => new Set());

  const toggle = (setter) => (value) => setter(prev => {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value); else next.add(value);
    return next;
  });

  // Available filter options + frequency, derived from all quests so options
  // never vanish as the user narrows the selection.
  const filterOptions = useMemo(() => {
    const count = (key) => {
      const tally = new Map();
      for (const q of quests) {
        for (const v of (q[key] || [])) tally.set(v, (tally.get(v) || 0) + 1);
      }
      return tally;
    };
    const classes = [...count('enemyClasses').keys()]
      .sort((a, b) => {
        const ia = CLASS_ORDER.indexOf(a), ib = CLASS_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
    const attrs = [...count('enemyAttributes').keys()].sort();
    const traitTally = count('enemyTraits');
    // Sort traits by frequency (most common first); cap to keep the row usable.
    const traits = [...traitTally.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 30)
      .map(([name]) => name);
    return { classes, attrs, traits };
  }, [quests]);

  const matchesFilters = useCallback((q) => {
    const okClass = classFilter.size === 0 || (q.enemyClasses || []).some(c => classFilter.has(c));
    const okAttr  = attrFilter.size  === 0 || (q.enemyAttributes || []).some(a => attrFilter.has(a));
    const okTrait = traitFilter.size === 0 || (q.enemyTraits || []).some(t => traitFilter.has(t));
    return okClass && okAttr && okTrait;
  }, [classFilter, attrFilter, traitFilter]);

  const hasActiveFilters = classFilter.size + attrFilter.size + traitFilter.size > 0;

  // Deduplicate quests by event + name + recommend level
  const dedupedQuests = useMemo(() => {
    const map = new Map();
    for (const q of quests) {
      const key = `${q.warLongName || ''}||${q.name || ''}||${q.recommendLv || ''}`;
      if (!map.has(key)) map.set(key, q);
    }
    return Array.from(map.values());
  }, [quests]);

  const filteredQuests = useMemo(
    () => dedupedQuests.filter(matchesFilters),
    [dedupedQuests, matchesFilters]
  );

  // Group quests by event, sort events newest-first
  const sortedEvents = useMemo(() => {
    const latestByEvent = new Map();
    for (const q of quests) {
      const key = q.warLongName || 'Unknown Event';
      const t = (q.openedAt || 0) * 1000; // stored as Unix seconds
      if (t > (latestByEvent.get(key) || 0)) latestByEvent.set(key, t);
    }
    const groups = new Map();
    for (const q of filteredQuests) {
      const key = q.warLongName || 'Unknown Event';
      if (!groups.has(key)) {
        groups.set(key, { warLongName: key, quests: [], latestOpenedAt: latestByEvent.get(key) || 0 });
      }
      groups.get(key).quests.push(q);
    }
    return Array.from(groups.values()).sort((a, b) => b.latestOpenedAt - a.latestOpenedAt);
  }, [filteredQuests, quests]);

  const visibleEvents = useMemo(() => [...sortedEvents].reverse(), [sortedEvents]);

  // Auto-select newest event on load, and re-pick if the current event is
  // filtered out of view.
  useEffect(() => {
    if (visibleEvents.length === 0) return;
    const stillVisible = selectedEvent && visibleEvents.some(e => e.warLongName === selectedEvent);
    if (stillVisible) return;
    if (selectedQuest?.warLongName && sortedEvents.some(g => g.warLongName === selectedQuest.warLongName)) {
      setSelectedEvent(selectedQuest.warLongName);
    } else {
      setSelectedEvent(visibleEvents[0].warLongName);
    }
  }, [visibleEvents, selectedEvent, selectedQuest, sortedEvents]);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quests')
      .select('id, name, war_name, recommend_lv, opened_at, enemy_classes, enemy_attributes, enemy_traits')
      .order('id');

    if (error) {
      console.error('Error fetching quests:', error);
    } else {
      setQuests((data || []).map(q => ({
        id:               q.id,
        name:             q.name,
        warLongName:      q.war_name,
        recommendLv:      q.recommend_lv,
        openedAt:         q.opened_at,  // Unix seconds integer
        enemyClasses:     q.enemy_classes || [],
        enemyAttributes:  q.enemy_attributes || [],
        enemyTraits:      q.enemy_traits || [],
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

  const renderChipRow = (label, options, selected, onToggle, labelFn = prettify) => (
    options.length > 0 && (
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'var(--color-text-dim)' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {options.map(opt => (
            <Chip
              key={opt}
              label={labelFn(opt)}
              size="small"
              color={selected.has(opt) ? 'primary' : 'default'}
              variant={selected.has(opt) ? 'filled' : 'outlined'}
              onClick={() => onToggle(opt)}
            />
          ))}
        </Box>
      </Box>
    )
  );

  return (
    <Box sx={{ backgroundColor: '#e8f5e9', padding: 2, borderRadius: 1 }}>
      <Box component={Paper} sx={{ p: 1.5, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Filter by enemies</Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={() => { setClassFilter(new Set()); setAttrFilter(new Set()); setTraitFilter(new Set()); }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
        {renderChipRow('Class', filterOptions.classes, classFilter, toggle(setClassFilter))}
        {renderChipRow('Attribute', filterOptions.attrs, attrFilter, toggle(setAttrFilter))}
        {renderChipRow('Traits', filterOptions.traits, traitFilter, toggle(setTraitFilter))}
        {hasActiveFilters && (
          <Typography variant="caption" sx={{ color: 'var(--color-text-dim)' }}>
            {filteredQuests.length} matching quest{filteredQuests.length === 1 ? '' : 's'}
          </Typography>
        )}
      </Box>
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
