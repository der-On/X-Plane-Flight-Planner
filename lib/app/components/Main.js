import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Loader from './Loader';
import MenuBar from './MenuBar';

const muiTheme = getMuiTheme({});

const Main = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div className="app">
      <MenuBar />
      <Loader />
    </div>
  </MuiThemeProvider>
);

export default Main;
