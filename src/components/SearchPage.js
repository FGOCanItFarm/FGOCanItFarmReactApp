import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  Paper, Chip, IconButton, Tooltip, Collapse, CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { supabase } from '../supabaseClient';

const waveChipColor = (outcome) => {
  if (outcome === 'guaranteed') return 'success';
  if (outcome === 'rng') return 'warning';
  return 'error';
};

const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const RunCard = ({ run, servantMap }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(run.token_string || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const waveResults = run.wave_results || {};

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        '&:hover': { borderColor: 'var(--color-border-mid)' },
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <Box p={2}>
        <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
          {(run.servant_collection_nos || []).map((cno, i) => {
            const s = servantMap.get(String(cno));
            const npLv = run.np_levels?.[i] ?? 1;
            return (
              <Box key={i} sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                {s?.face_url ? (
                  <img
                    src={s.face_url}
                    alt={s.name || String(cno)}
                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 1,
                      backgroundColor: 'var(--color-surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ color: 'var(--color-text-dim)', fontSize: '0.6rem' }}>
                      #{cno}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    position: 'absolute', bottom: 0, right: 0,
                    backgroundColor: 'var(--color-gold)',
                    borderRadius: '2px 0 4px 0',
                    px: 0.3,
                  }}
                >
                  <Typography sx={{ fontSize: '0.55rem', color: '#000', fontWeight: 'bold', lineHeight: 1.4 }}>
                    NP{npLv}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          <Box sx={{ flex: 1 }} />

          <Chip
            size="small"
            label={`${run.total_np_cost} NPs`}
            sx={{
              backgroundColor: 'var(--color-gold-dim)',
              border: '1px solid var(--color-border-active)',
              color: 'var(--color-gold)',
              fontWeight: 'bold',
            }}
          />

          <Tooltip title={copied ? 'Copied!' : 'Copy token string'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: 'var(--color-text-dim)' }}>
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {expanded
            ? <ExpandLessIcon fontSize="small" sx={{ color: 'var(--color-text-dim)' }} />
            : <ExpandMoreIcon fontSize="small" sx={{ color: 'var(--color-text-dim)' }} />
          }
        </Box>

        <Box display="flex" gap={0.5} flexWrap="wrap" mb={0.5}>
          {Object.entries(waveResults)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([waveNum, wave]) => (
              <Chip
                key={waveNum}
                size="small"
                label={`W${waveNum}: ${wave.outcome || '?'}`}
                color={waveChipColor(wave.outcome)}
              />
            ))
          }
        </Box>

        <Typography variant="caption" sx={{ color: 'var(--color-text-dim)' }}>
          {fmtDate(run.submitted_at)}
        </Typography>
      </Box>

      <Collapse in={expanded}>
        <Box px={2} pb={2}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Token string:
          </Typography>
          <Box
            component="code"
            sx={{
              display: 'block',
              backgroundColor: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              p: 1,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              mb: 1.5,
            }}
          >
            {run.token_string}
          </Box>

          {Object.entries(waveResults)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([waveNum, wave]) => (
              <Box key={waveNum} mb={1}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: 'var(--color-text-dim)' }}>
                  Wave {waveNum}:
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.3}>
                  {wave.hp_required != null && (
                    <Chip size="small" variant="outlined" label={`HP: ${Number(wave.hp_required).toLocaleString()}`} />
                  )}
                  {wave.damage_at_10 != null && (
                    <Chip size="small" variant="outlined" label={`DMG: ${Number(wave.damage_at_10).toLocaleString()}`} />
                  )}
                  {wave.clear_probability != null && (
                    <Chip
                      size="small"
                      label={`${(wave.clear_probability * 100).toFixed(0)}%`}
                      color={waveChipColor(wave.outcome)}
                    />
                  )}
                </Box>
              </Box>
            ))
          }
        </Box>
      </Collapse>
    </Paper>
  );
};

const SearchPage = ({ team, selectedQuest: activeQuest }) => {
  const [quests, setQuests] = useState([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [questSearch, setQuestSearch] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState('');

  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [servantMap, setServantMap] = useState(new Map());

  const [filterNo, setFilterNo] = useState('');

  useEffect(() => {
    const loadQuests = async () => {
      setQuestsLoading(true);
      const { data } = await supabase
        .from('quests')
        .select('id, name, war_name, recommend_lv, opened_at')
        .order('opened_at', { ascending: false });
      setQuests(data || []);
      setQuestsLoading(false);
    };
    loadQuests();
  }, []);

  useEffect(() => {
    if (activeQuest?.id && !selectedQuestId) {
      setSelectedQuestId(String(activeQuest.id));
    }
  }, [activeQuest, selectedQuestId]);

  useEffect(() => {
    if (!selectedQuestId) { setRuns([]); return; }
    const loadRuns = async () => {
      setRunsLoading(true);
      const { data: runData } = await supabase
        .from('saved_runs')
        .select('*')
        .eq('quest_id', Number(selectedQuestId))
        .order('total_np_cost', { ascending: true })
        .limit(100);

      const fetched = runData || [];
      setRuns(fetched);

      const allCnos = [...new Set(fetched.flatMap(r => (r.servant_collection_nos || []).map(String)))];
      if (allCnos.length > 0) {
        const { data: servantData } = await supabase
          .from('servants')
          .select('collection_no, name, face_url')
          .in('collection_no', allCnos.map(Number));

        setServantMap(prev => {
          const next = new Map(prev);
          for (const s of (servantData || [])) {
            next.set(String(s.collection_no), s);
          }
          return next;
        });
      }
      setRunsLoading(false);
    };
    loadRuns();
  }, [selectedQuestId]);

  const filteredQuests = quests.filter(q => {
    if (!questSearch) return true;
    const lc = questSearch.toLowerCase();
    return (
      q.name?.toLowerCase().includes(lc) ||
      q.war_name?.toLowerCase().includes(lc)
    );
  });

  const displayRuns = filterNo
    ? runs.filter(r => (r.servant_collection_nos || []).some(cno => String(cno) === filterNo.trim()))
    : runs;

  return (
    <Box>
      <Typography variant="h5" mb={3}>Community Runs</Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={3} alignItems="flex-end">
        <TextField
          label="Search quests"
          value={questSearch}
          onChange={e => setQuestSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Select Quest</InputLabel>
          <Select
            value={selectedQuestId}
            label="Select Quest"
            onChange={e => setSelectedQuestId(e.target.value)}
          >
            <MenuItem value=""><em>— choose quest —</em></MenuItem>
            {questsLoading ? (
              <MenuItem disabled>
                <CircularProgress size={16} sx={{ mr: 1 }} /> Loading…
              </MenuItem>
            ) : filteredQuests.map(q => (
              <MenuItem key={q.id} value={String(q.id)}>
                [{q.recommend_lv}] {q.war_name} — {q.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Filter by servant #"
          value={filterNo}
          onChange={e => setFilterNo(e.target.value)}
          size="small"
          sx={{ width: 160 }}
          placeholder="e.g. 268"
        />
      </Box>

      {runsLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : !selectedQuestId ? (
        <Typography variant="body2" sx={{ color: 'var(--color-text-dim)' }}>
          Select a quest above to browse community runs.
        </Typography>
      ) : displayRuns.length === 0 ? (
        <Box
          mt={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
          sx={{ color: 'var(--color-text-dim)' }}
        >
          <Typography variant="h6">No runs found</Typography>
          <Typography variant="body2">
            Complete a simulation and submit your run!
          </Typography>
        </Box>
      ) : (
        displayRuns.map((run, i) => (
          <RunCard key={run.id ?? i} run={run} servantMap={servantMap} />
        ))
      )}
    </Box>
  );
};

export default SearchPage;
