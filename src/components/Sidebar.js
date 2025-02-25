import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const Sidebar = ({ team, selectedQuest }) => {
  const isTeamValid = team.filter(member => member).length >= 3;
  const isQuestSelected = !!selectedQuest;

  return (
    <div style={{ width: 192, position: 'fixed', top: 0, left: 0, height: '100%', backgroundColor: '#f5f5f5' }}>
      <List>
        <ListItem button component={Link} to="/instructions">
          <ListItemText primary="Instructions" />
        </ListItem>
        <ListItem button component={Link} to="/team-selection">
          <ListItemText primary="Team Selection" />
          <ListItemIcon>
            {isTeamValid ? <CheckCircleIcon style={{ color: 'green' }} /> : <ErrorIcon style={{ color: 'red' }} />}
          </ListItemIcon>
        </ListItem>
        <ListItem button component={Link} to="/quest-selection">
          <ListItemText primary="Quest Selection" />
          <ListItemIcon>
            {isQuestSelected ? <CheckCircleIcon style={{ color: 'green' }} /> : <ErrorIcon style={{ color: 'red' }} />}
          </ListItemIcon>
        </ListItem>
        <ListItem button component={Link} to="/command-input">
          <ListItemText primary="Command Input" />
        </ListItem>
        <ListItem button component={Link} to="/search">
          <ListItemText primary="Search" />
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;