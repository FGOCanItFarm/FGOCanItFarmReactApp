import React from 'react';
import { Button, Typography, Box, Container, Modal } from '@mui/material';
// MysticCodeCommand moved into TwoTeamView
import '../CommandInputPage.css';
import SourceTargetCommandInput from './SourceTargetCommandInput';

const CommandInputPage = ({ team, servants, setTeam, activeServant, setActiveServant, commands, setCommands, selectedQuest, selectedMysticCode, setSelectedMysticCode, handleSubmit, openModal, handleOpenModal, handleCloseModal, updateServantEffects }) => {
  // (handleTeamServantClick and handleEffectChange were removed because they were unused in this component)

  // Two-Team view toggle and adapter to append commands into the shared `commands` state
  // History stack to support undo for commands editor
  const [commandsHistory, setCommandsHistory] = React.useState([]);
  const addCommand = (command) => {
    setCommands(prev => {
      setCommandsHistory(h => [...h, prev]);
      return [...prev, command];
    });
  };

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

  return (
    <Container className="command-input-container">
      {/* Always show the Two-Team view here (no toggle). Mystic Code UI moved into TwoTeamView. */}
  <SourceTargetCommandInput team={team} servants={servants} setTeam={setTeam} selectedMysticCode={selectedMysticCode} setSelectedMysticCode={setSelectedMysticCode} addCommand={addCommand} updateCommands={setCommands} setActiveServant={setActiveServant} />

      {/* Center bottom team popout removed — using the sticky bottom-right team popout instead */}

      {/* Commands editor: textarea for copy/paste/edit, plus copy/paste/undo/clear/submit buttons */}
      <Box mt={4}>
        <Typography variant="h6">Commands</Typography>
        <textarea
          aria-label="Commands editor"
          value={commands.join(' ')}
          onChange={(e) => {
            const val = e.target.value.trim();
            const parsed = val.length ? val.split(/\s+/) : [];
            setCommandsWithHistory(parsed);
          }}
          style={{ width: '100%', minHeight: '6rem', fontFamily: 'monospace', padding: '8px', boxSizing: 'border-box' }}
        />
        <Box mt={2} display="flex" gap="0.5rem" flexWrap="wrap">
          <Button variant="outlined" onClick={copyCommands}>Copy</Button>
          <Button variant="outlined" onClick={() => pasteCommands(false)}>Paste (replace)</Button>
          <Button variant="outlined" onClick={() => pasteCommands(true)}>Paste (append)</Button>
          <Button variant="outlined" onClick={undoCommands} disabled={commandsHistory.length === 0}>Undo</Button>
          <Button variant="outlined" color="secondary" onClick={() => setCommandsWithHistory([])}>Clear</Button>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>Submit Team</Button>
        </Box>
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box p={4} bgcolor="white" borderRadius="8px" boxShadow={3} style={{ margin: 'auto', marginTop: '10%', width: '50%' }}>
          <Typography variant="h6">Confirm Submission</Typography>
          <Typography variant="body1"><strong>Team:</strong> {JSON.stringify(team, null, 2)}</Typography>
          <Typography variant="body1"><strong>Mystic Code ID:</strong> {selectedMysticCode}</Typography>
          <Typography variant="body1"><strong>Quest ID:</strong> {selectedQuest?.id}</Typography>
          <Typography variant="body1"><strong>Commands:</strong> {commands.join(' ')}</Typography>
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