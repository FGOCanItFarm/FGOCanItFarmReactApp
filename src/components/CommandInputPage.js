import React from 'react';
import { Button, Typography, Box, Container, Modal, Chip, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../CommandInputPage.css';
import CombatDashboard from './CombatDashboard';
import SimulationStats from './SimulationStats';
import CommandChips from './CommandChips';
import { prepareSimInputs } from '../simulation/RunAdapter';
import { buildEngineAt } from '../simulation/CommandState';

const CommandInputPage = ({
  team, servants,
  commands, setCommands, selectedQuest, selectedMysticCode,
  servantEffects,
  handleSubmit, openModal, handleOpenModal, handleCloseModal,
  simulationResult, setSimulationResult,
  simulating = false,
  onSubmitRun = null,
}) => {
  const [commandsHistory, setCommandsHistory] = React.useState([]);
  const [submitStatus, setSubmitStatus] = React.useState(null);
  const [submitError, setSubmitError] = React.useState('');
  const [simInputs, setSimInputs] = React.useState(null); // engine-replay validation source

  // Keyed by the team's collection numbers — drives the simInputs rebuild below.
  const teamKey = team.map(s => s.collectionNo || '').join(',');

  React.useEffect(() => {
    setSubmitStatus(null);
    setSubmitError('');
  }, [simulationResult]);

  // FR-6: build a fresh simInputs whenever the team / quest / MC / effects
  // change so chip validation can replay the prefix through a real engine
  // (catches "skill on cooldown" / "NP not ready" mid-sequence, not just
  // syntactic invalid tokens). Quietly no-ops if the quest data hasn't been
  // hydrated yet — chips fall back to syntactic-only validation in that case.
  const fxKey = JSON.stringify(servantEffects);
  React.useEffect(() => {
    if (!selectedQuest?._fullData || team.every(s => !s.collectionNo)) {
      setSimInputs(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const next = await prepareSimInputs({ team, selectedQuest, selectedMysticCode, servantEffects });
        if (!cancelled) setSimInputs(next);
      } catch {
        if (!cancelled) setSimInputs(null);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamKey, selectedQuest?.id, selectedMysticCode, fxKey]);

  // Engine-replay failedIndex. -1 means every token applied cleanly; ≥ 0 marks
  // the first token that the engine refused (cooldown / charge / missing
  // target / unknown grammar). When simInputs isn't ready CommandChips falls
  // back to its own syntactic check.
  const failedIndex = React.useMemo(() => {
    if (!simInputs || commands.length === 0) return -1;
    try {
      return buildEngineAt(simInputs, commands).failedIndex;
    } catch {
      return -1;
    }
  }, [simInputs, commands]);

  const filledCount = team.filter(s => s.collectionNo).length;
  const canRun = commands.length > 0 && !!selectedQuest && filledCount > 0;

  const setCommandsWithHistory = (newCommands) => {
    setCommands(prev => {
      setCommandsHistory(h => [...h, prev]);
      return newCommands;
    });
  };

  const undoCommands = () => {
    setCommandsHistory(h => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setCommands(last);
      return h.slice(0, -1);
    });
  };

  const copyCommands = async () => {
    try {
      await navigator.clipboard.writeText(commands.join(' '));
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const pasteCommands = async (append = false) => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = text.trim().length ? text.trim().split(/\s+/) : [];
      if (append) {
        setCommandsWithHistory([...commands, ...parsed]);
      } else {
        setCommandsWithHistory(parsed);
      }
    } catch (e) {
      console.error('Paste failed', e);
    }
  };

  const handleCommunitySubmit = async () => {
    if (!onSubmitRun) return;
    setSubmitStatus('submitting');
    const result = await onSubmitRun();
    if (result?.success) {
      setSubmitStatus('done');
    } else {
      setSubmitStatus('error');
      setSubmitError(result?.error || 'Unknown error');
    }
  };

  return (
    <Container className="command-input-container" disableGutters maxWidth={false} style={{ marginRight: 'var(--team-panel-width)' }}>
      <CombatDashboard
        team={team}
        selectedQuest={selectedQuest}
        selectedMysticCode={selectedMysticCode}
        servantEffects={servantEffects}
        commands={commands}
        setCommands={setCommandsWithHistory}
      />

      <Box mt={4}>
        <Typography variant="h6">Commands</Typography>

        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
          <Chip
            size="small"
            variant="outlined"
            label={selectedQuest?.name || 'No quest selected'}
            color={selectedQuest ? 'success' : 'warning'}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${filledCount} / 6 servants`}
            color={filledCount >= 3 ? 'success' : 'warning'}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${commands.length} tokens`}
          />
        </Box>

        <Box mb={1}>
          <CommandChips
            commands={commands}
            team={team}
            servants={servants}
            setCommands={setCommandsWithHistory}
            failedIndex={failedIndex}
          />
        </Box>

        <textarea
          aria-label="Commands editor"
          value={commands.join(' ')}
          rows={2}
          onChange={(e) => {
            const val = e.target.value.trim();
            const parsed = val.length ? val.split(/\s+/) : [];
            setCommandsWithHistory(parsed);
          }}
          style={{ width: '100%', maxHeight: '4.5rem', overflowY: 'auto', fontFamily: 'monospace', padding: '8px', boxSizing: 'border-box', resize: 'vertical' }}
        />
        <Box mt={2} display="flex" gap="0.5rem" flexWrap="wrap">
          <Button variant="outlined" onClick={copyCommands}>Copy</Button>
          <Button variant="outlined" onClick={() => pasteCommands(false)}>Paste (replace)</Button>
          <Button variant="outlined" onClick={() => pasteCommands(true)}>Paste (append)</Button>
          <Button variant="outlined" onClick={undoCommands} disabled={commandsHistory.length === 0}>Undo</Button>
          <Button variant="outlined" color="secondary" onClick={() => setCommandsWithHistory([])}>Clear</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (setSimulationResult) setSimulationResult(null);
              handleOpenModal();
            }}
            disabled={!canRun || simulating}
            startIcon={simulating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {simulating ? 'Simulating…' : 'Submit Team'}
          </Button>
        </Box>
      </Box>

      <SimulationStats result={simulationResult} />

      {simulationResult?.success && simulationResult?.quest_cleared && (
        <Box
          mt={3}
          p={2}
          sx={{
            backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)',
            borderRadius: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckCircleIcon sx={{ color: 'var(--color-success)' }} />
            <Typography variant="h6" sx={{ color: 'var(--color-success)' }}>
              Quest Cleared!
            </Typography>
          </Box>
          <Typography variant="body2" mb={2}>
            Your team successfully cleared this quest. Share your strategy with the community!
          </Typography>
          {submitStatus === 'done' && (
            <Alert severity="success" sx={{ mb: 1 }}>Run submitted successfully!</Alert>
          )}
          {submitStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 1 }}>{submitError}</Alert>
          )}
          {onSubmitRun && (
            <Button
              variant="contained"
              disabled={submitStatus === 'submitting' || submitStatus === 'done'}
              onClick={handleCommunitySubmit}
              startIcon={submitStatus === 'submitting' ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                backgroundColor: 'var(--color-success)',
                '&:hover': { backgroundColor: 'color-mix(in srgb, var(--color-success) 80%, black)' },
                '&.Mui-disabled': { opacity: 0.5 },
              }}
            >
              {submitStatus === 'submitting' ? 'Submitting…' : 'Submit to Community'}
            </Button>
          )}
        </Box>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          p={4}
          borderRadius="8px"
          boxShadow={3}
          style={{ margin: 'auto', marginTop: '10%', width: '50%' }}
          sx={{ backgroundColor: 'var(--color-surface)' }}
        >
          <Typography variant="h6">Confirm Simulation</Typography>
          <Typography variant="body2" mt={1} mb={0.5}>
            <strong>Quest:</strong> {selectedQuest?.name || 'None'}
          </Typography>
          <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
            {team.filter(s => s.collectionNo).map((s, i) => (
              <Chip key={i} size="small" label={`#${s.collectionNo}`} variant="outlined" />
            ))}
          </Box>
          <Typography variant="body2" mb={1}>
            <strong>Mystic Code:</strong> {selectedMysticCode || 'None'}
          </Typography>
          <Typography variant="body2" mb={2}>
            <strong>Tokens:</strong>{' '}
            <code style={{ fontSize: '0.75rem' }}>
              {commands.slice(0, 24).join(' ')}{commands.length > 24 ? ' …' : ''}
            </code>
          </Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginRight: '10px' }}>
              Confirm
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default CommandInputPage;
