import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Search from './Search';
import Map from './Map';
import Sidebar from './Sidebar';

const muiTheme = getMuiTheme({});

const Main = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div className="main">
      <Search />
      <Sidebar />
      <Map />
    </div>
  </MuiThemeProvider>
);

export default Main;
