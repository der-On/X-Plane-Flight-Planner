import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuBar from './MenuBar';
import Map from './Map';
import Sidebar from './Sidebar';

const muiTheme = getMuiTheme({});

const Main = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div className="main">
      <MenuBar />
      <Map />
      <Sidebar />
    </div>
  </MuiThemeProvider>
);

export default Main;
