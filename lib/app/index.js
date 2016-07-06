import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './components/Main';
import store from './store';
import { requestSearchIndex, requestGeoSearchAirways } from './state/actions';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

ReactDOM.render(
  <Provider store = { store }>
    <Main />
  </Provider>,
  document.getElementById('app')
);

store.dispatch(requestSearchIndex());
store.dispatch(requestGeoSearchAirways());
