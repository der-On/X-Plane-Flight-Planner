import React from 'react';
import AppBar from 'material-ui/AppBar';
import Search from './Search';

const MenuBar = () => (
  <AppBar
    title="X-Plane Flight-Planner"
    iconElementRight={
      <Search />
    }
  />
);

export default MenuBar;
