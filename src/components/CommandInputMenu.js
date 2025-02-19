import React, { useState } from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';
import '../buttons.css';

// Function to save data to local storage
const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Function to load data from local storage
const loadFromLocalStorage = (key) => {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : [];
};

const generateSkillCommand = (servantIndex, skillIndex, targetIndex = null) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  if (targetIndex !== null) {
    command += `${targetIndex + 1}`;
  }
  return command || `Skill ${skillIndex}`;
};

const generateChoiceCommand = (servantIndex, skillIndex, choice, targetIndex = null) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  switch (choice) {
    case 12: command += `[Ch2A]`; break;
    case 22: command += `[Ch2B]`; break;
    case 13: command += `[Ch3A]`; break;
    case 23: command += `[Ch3B]`; break;
    case 33: command += `[Ch3C]`; break;
    default: break;
  }
  if (targetIndex !== null) {
    command += `${targetIndex + 1}`;
  }
  return command || `Skill ${skillIndex} Choice ${choice}`;
};

const generateChoiceTargetCommand = (servantIndex, skillIndex, choice, targetIndex) => {
  const skillLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
  let command = skillLabels[servantIndex * 3 + (skillIndex - 1)];
  switch (choice) {
    case 12: command += `([Ch2A]${targetIndex})`; break;
    case 22: command += `([Ch2B]${targetIndex})`; break;
    case 13: command += `([Ch3A]${targetIndex})`; break;
    case 23: command += `([Ch3B]${targetIndex})`; break;
    case 33: command += `([Ch3C]${targetIndex})`; break;
    default: break;
  }
  return command;
};

const renderSkillButtons = (servantIndex, skillIndex, addCommand, team) => (
  <Box className="skill-buttons">
    <Grid>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 0))}
        title={`On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        S1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 1))}
        title={`On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        S2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 2))}
        title={`On Servant 3 (${team[2]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        S3
      </Button>
    </Grid>
    <Button
      className={`servant-${servantIndex + 1}`}
      onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex))}
      title="No Target"
      style={{ border: '1px solid lightgray' }}
    >
      NT
    </Button>
  </Box>
);

const renderChoiceButtons = (servantIndex, skillIndex, addCommand, team) => (
  <Box className="choice-skill-buttons">
    <Grid>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 12))}
        title="Choice 1 | 2"
        style={{ border: '1px solid lightgray' }}
      >
        C1|2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))}
        title="Choice 2 | 2"
        style={{ border: '1px solid lightgray' }}
      >
        C2|2
      </Button>
    </Grid>
    <Grid>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 13))}
        title="Choice 1 | 3"
        style={{ border: '1px solid lightgray' }}
      >
        C1|3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 23))}
        title="Choice 2 | 3"
        style={{ border: '1px solid lightgray' }}
      >
        C2|3
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 33))}
        title="Choice 3 | 3"
        style={{ border: '1px solid lightgray' }}
      >
        C3|3
      </Button>
    </Grid>
  </Box>
);

const render2ChoiceTargetButtons = (servantIndex, skillIndex, addCommand, team) => (
  <Box className="choice-skill-buttons">
    <Grid>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 1))}
        title={`Choice 1 | 2 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        C1|2 S1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 2))}
        title={`Choice 1 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        C1|2 S2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 3))}
        title={`Choice 1 | 2 On Servant 3 (${team[2]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        C1|2 S3
      </Button>
    </Grid>
    <Grid>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 1))}
        title={`Choice 2 | 2 On Servant 1 (${team[0]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        C2|2 S1
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 2))}
        title={`Choice 2 | 2 On Servant 2 (${team[1]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        C2|2 S2
      </Button>
      <Button
        className={`servant-${servantIndex + 1}`}
        onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 3))}
        title={`Choice 2 | 2 On Servant 3 (${team[2]?.name || 'Empty'})`}
        style={{ border: '1px solid lightgray' }}
      >
        C2|2 S3
      </Button>
    </Grid>
  </Box>
);

const renderButtonsForServant = (servantIndex, skillIndex, collectionNo, addCommand, team) => {
  let buttons = renderSkillButtons(servantIndex, skillIndex, addCommand, team);

  switch (collectionNo) {
    case 373:
      if (skillIndex === 1 || skillIndex === 3) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team);
      } else {
        buttons = render2ChoiceTargetButtons(servantIndex, skillIndex, addCommand, team);
      }
      break;
    case 428:
      if (skillIndex === 1) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team);
      }
      break;
    case 268:
      if (skillIndex === 2) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team);
      }
      break;
    case 421:
    case 11:
    case 391:
    case 424:
    case 425:
    case 414:
    case 259:
      if (skillIndex === 3) {
        buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand, team);
      }
      break;
    default:
      break;
  }

  return buttons;
};

const CommandInputMenu = ({ activeServant, updateCommands, team, setTeam }) => {
  const [commands, setCommands] = useState([]);

  const addCommand = (command) => {
    updateCommands((prevCommands) => [...prevCommands, command]);
  };

  const renderSpecificButtons = () => {
    if (!activeServant) return null;

    const servantIndex = activeServant.index;
    const collectionNo = activeServant.collectionNo;

    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map((skillIndex) => (
          <Grid item key={`skill-${skillIndex}`}>
            <Typography className="skill-text"> {`Skill ${skillIndex}`}</Typography>
            <Box>
              {renderButtonsForServant(servantIndex, skillIndex, collectionNo, addCommand, team)}
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box mt={4} p={2} border="1px solid gray" bgcolor="#f0f0f0">
      <Typography variant="h6">
        Menu Options for {activeServant?.name} (Position {activeServant?.index + 1})
      </Typography>
      <Grid className="margin-left-grid" container spacing={2} justifyContent="center">
        {renderSpecificButtons()}
      </Grid>
    </Box>
  );
};

export default CommandInputMenu;

