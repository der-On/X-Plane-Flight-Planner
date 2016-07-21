import expect from 'expect.js';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers'
import InitialState from './initial';
import * as actions from './actions';

const configureStore = (initialState) => {
  return createStore(
    rootReducer,
    initialState || InitialState(),
    applyMiddleware(thunkMiddleware)
  );
}

describe('state/store', () => {
  it('should have empty and active flight plan', () => {
    var store = configureStore();
    var state = store.getState();

    expect(Object.keys(state.flightPlans).length).to.be(1);

    var id = Object.keys(state.flightPlans)[0];
    expect(id).not.to.be(null);

    expect(state.activeFlightPlanId).to.be(id);
  });

  it('should add waypoint from nav items', () => {
    var store = configureStore();
    var state = store.getState();
    var navItem = {
      id: 1,
      icao: 'TEST',
      _type: 'airport',
      lat: 1, lon: 2, elevation: 3
    };

    store.dispatch(actions.addNavItemAsWaypoint(
      state.activeFlightPlanId,
      navItem
    ));

    state = store.getState();
    expect(Object.keys(state.waypoints).length).to.be(1);

    var id = Object.keys(state.waypoints)[0];
    expect(id).not.to.be(null);

    var waypoint = state.waypoints[id];
    expect(waypoint).to.eql({
      id: id,
      lat: 1, lon: 2, elevation: 3,
      navItem: navItem,
      flightPlanId: state.activeFlightPlanId,
      index: 0,
      name: null
    });
  });

  it('should add multiple waypoints from nav items', () => {
    var store = configureStore();
    var state = store.getState();
    var navItems = [{
      id: 1,
      icao: 'TEST',
      _type: 'airport',
      lat: 1, lon: 2, elevation: 3
    }, {
      id: 2,
      icao: 'TEST2',
      _type: 'airport',
      lat: 4, lon: 5, elevation: 6
    }, {
      id: 3,
      icao: 'TEST§',
      _type: 'airport',
      lat: 7, lon: 8, elevation: 9
    }];

    navItems.forEach(function (navItem) {
      store.dispatch(actions.addNavItemAsWaypoint(
        state.activeFlightPlanId,
        navItem
      ));
    });

    state = store.getState();
    expect(Object.keys(state.waypoints).length).to.be(navItems.length);

    Object.keys(state.waypoints).forEach(function (id, index) {
      expect(id).not.to.be(null);
      var waypoint = state.waypoints[id];
      var navItem = navItems[index];

      expect(waypoint).to.eql({
        id: id,
        lat: navItem.lat,
        lon: navItem.lon,
        elevation: navItem.elevation,
        navItem: navItem,
        flightPlanId: state.activeFlightPlanId,
        index: index,
        name: null
      });
    });
  });

  it('should remove waypoints and reindex them', () => {
    var store = configureStore({
      flightPlans: {
        '1': {
          id: '1'
        }
      },
      waypoints: {
        '1': {
          id: '1',
          index: 0
        },
        '2': {
          id: '2',
          index: 1
        },
        '3': {
          id: '3',
          index: 2
        }
      }
    });

    store.dispatch(actions.removeWaypoint('2'));

    var state = store.getState();
    expect(state.waypoints['3'].index).to.be(1);
  });
});
