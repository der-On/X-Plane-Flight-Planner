import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const Loader = () => (
  <div className="loader">
    <CircularProgress />
    <p>Loading data please wait ...</p>
  </div>
);

export default Loader;
