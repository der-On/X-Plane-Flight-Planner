import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import persistState from 'redux-localstorage';

const loggerMiddleware = createLogger();

const middlewares = [
  thunkMiddleware/*,
  loggerMiddleware*/
];

const enhancer = compose(
  persistState([
    'waypoints',
    'flightPlans',
    'activeFlightPlanId',
    'sidebar',
    'map'
  ], {
    key: 'X-Plane-Flight-Planner'
  }),
  applyMiddleware.apply(null, middlewares)
);

export default function configureStore(initialState = {}) {
  return window.devToolsExtension ?
    compose(
      enhancer,
      window.devToolsExtension()
    )(createStore)(
      rootReducer,
      initialState
    )
  : createStore(
    rootReducer,
    initialState,
    enhancer
  );
};
