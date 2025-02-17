import React, { useState } from 'react';
import { Box, Button, Typography, Grid, TextareaAutosize } from '@mui/material';
import '../buttons.css'


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

const renderSkillButtons = (servantIndex, skillIndex, addCommand) => (
  <Box className="skill-buttons">
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 0))}>On Servant 1</Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 1))} > On Servant 2 </Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex, 2))} > On Servant 3 </Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateSkillCommand(servantIndex, skillIndex))} > No Target </Button> 
  </Box>
);

const renderChoiceButtons = (servantIndex, skillIndex, addCommand, targetIndex=null) => (
  <Box className="choice-skill-buttons">
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 12))} > Choice 1 | 2 </Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 22))} > Choice 2 | 2 </Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 13))} > Choice 1 | 3 </Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 23))} > Choice 2 | 3 </Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceCommand(servantIndex, skillIndex, 33))} > Choice 3 | 3 </Button> 
  </Box> 
);
const render2ChoiceTargetButtons = (servantIndex, skillIndex, addCommand) => ( 
  <Box className="choice-skill-buttons">
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 1))} > Choice 1 | 2 On Servant 1</Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 2))} > Choice 1 | 2 On Servant 2</Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 12, 3))} > Choice 1 | 2 On Servant 3</Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 1))} > Choice 2 | 2 On Servant 1</Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 2))} > Choice 2 | 2 On Servant 2</Button>
  <Button className={`servant-${servantIndex+1}`} onClick={() => addCommand(generateChoiceTargetCommand(servantIndex, skillIndex, 22, 3))} > Choice 2 | 2 On Servant 3</Button>

  </Box>
);

const renderButtonsForServant = (servantIndex, skillIndex, collectionNo, addCommand) => {
  let buttons = renderSkillButtons(servantIndex, skillIndex, addCommand);
  
  switch (collectionNo) {
    case 373:
    if (skillIndex === 1 || skillIndex === 3) {
      buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand);
    } else {
      buttons = render2ChoiceTargetButtons(servantIndex, skillIndex, addCommand);
      
    }
    break;
    case 428:
    if (skillIndex === 1) {
      buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand);
    }
    break;
    case 268:
    if (skillIndex === 2) {
      buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand);
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
      buttons = renderChoiceButtons(servantIndex, skillIndex, addCommand);
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
        {renderButtonsForServant(servantIndex, skillIndex, collectionNo, addCommand)}
        </Box>
        </Grid>
      ))}
      </Grid>
    );
  };
  
  return (
    <Box mt={4} p={2} border="1px solid gray" bgcolor="#f0f0f0">
    <Typography variant="h6">Menu Options for {activeServant?.name} (Position {activeServant?.index + 1}) </Typography>
    <Grid className="margin-left-grid" container spacing={2} justifyContent="center">
    {renderSpecificButtons()}
    </Grid>
    </Box>
  );
};

export default CommandInputMenu;

