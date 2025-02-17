import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Group, Assignment } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 160; // Set a fixed width for the drawer

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <List sx={{ display: 'flex', flexDirection: 'column' }}>
        <ListItem button component={Link} to="/">
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/teams">
          <ListItemIcon><Group /></ListItemIcon>
          <ListItemText primary="Teams" />
        </ListItem>
        <ListItem button component={Link} to="/quests">
          <ListItemIcon><Assignment /></ListItemIcon>
          <ListItemText primary="Quests" />
        </ListItem>
        <ListItem button component={Link} to="/test">
          <ListItemIcon><Assignment /></ListItemIcon>
          <ListItemText primary="test" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;