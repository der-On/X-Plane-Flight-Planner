import React from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Map from './Map';
import Sidebar from './Sidebar';
import FlashMessages from './FlashMessages';
import GeoSearchProgress from './GeoSearchProgress';
import Feedback from './Feedback';
import Donate from './Donate';

const muiTheme = getMuiTheme({});

const Main = () => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div className="main">
      <Sidebar />
      <Map />
      <GeoSearchProgress />
      <FlashMessages />
      <Donate />
      <Feedback />
    </div>
  </MuiThemeProvider>
);

export default Main;
