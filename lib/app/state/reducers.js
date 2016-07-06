import { combineReducers } from 'redux'
import * as c from './constants';

// helper function to update data table by id
function updateItemById(state, id, data) {
  return state[id] ?
    Object.assign({}, state, {
      [id]: Object.assign({}, state[id], data)
    })
  : state;
}

function addItem(state, item) {
  return Object.assign({}, state, {
    [item.id]: Object.assign({}, item)
  });
}

function removeItemById(state, id) {
  if (state[id]) {
    state = Object.assign({}, state);
    delete state[id];
  }

  return state;
}

function search(state, action) {
  state = state || {
    query: '',
    results: {
      airports: [],
      navaids: [],
      fixes: []
    },
    indexLoading: false,
    resultsLoading: false
  };

  switch (action.type) {
    case c.SET_SEARCH_QUERY:
      return Object.assign({}, state, {
        query: setSearchQuery(state.query, action)
      });
    case c.REQUEST_SEARCH_RESULTS:
      return requestSearchResults(state, action);
    case c.RECEIVE_SEARCH_RESULTS:
      return receiveSearchResults(state, action);
    case c.REQUEST_SEARCH_INDEX:
      return requestSearchIndex(state, action);
    case c.RECEIVE_SEARCH_INDEX:
      return receiveSearchIndex(state, action);
  }

  return state;
}

function setSearchQuery(state = '', action) {
  return action.query;
}

function requestSearchResults(state = { resultsLoading: false }, action) {
  return Object.assign({}, state, {
    resultsLoading: true
  });
}

function receiveSearchResults(state = { resultsLoading: false, results: {} }, action) {
  return Object.assign({}, state, {
    resultsLoading: false,
    results: action.results
  });
}

function requestSearchIndex(state = { indexLoading: false }, action) {
  return Object.assign({}, state, {
    indexLoading: true
  });
}

function receiveSearchIndex(state = { indexLoading: false }, action) {
  return Object.assign({}, state, {
    indexLoading: false
  });
}

function waypoints(state = {}, action) {
  var map = {
    [c.ADD_WAYPOINT]: addWaypoint,
    [c.REMOVE_WAYPOINT]: removeWaypoint,
    [c.SET_WAYPOINT_INDEX]: setWaypointIndex,
    [c.SET_WAYPOINT_ELEVATION]: setWaypointElevation,
    [c.SET_WAYPOINT_NAV_ITEM]: setWaypointNavItem,
    [c.SET_WAYPOINT_LAT_LON]: setWaypointLatLon
  };

  return map[action.type] ?
    map[action.type](state, action)
  : state;
}

function addWaypoint(state = {}, action) {
  return addItem(state, action.waypoint);
}

function removeWaypoint(state, action) {
  return removeItemById(state, action.waypointId);
}

function setWaypointIndex(state, action) {
  return updateItemById(state, action.waypointId, {
    index: action.index
  });
}

function setWaypointElevation(state, action) {
  return updateItemById(state, action.waypointId, {
    elevation: action.elevation
  });
}

function setWaypointNavItem(state, action) {
  return updateItemById(state, action.waypointId, {
    navItem: Object.assign({}, action.navItem)
  });
}

function setWaypointLatLon(state, action) {
  return updateItemById(state, action.waypointId, {
    lat: action.lat,
    lon: action.lon
  });
}

function flightPlans(state = {}, action) {
  var map = {
    [c.ADD_FLIGHT_PLAN]: addFlightPlan,
    [c.REMOVE_FLIGHT_PLAN]: removeFlightPlan,
    [c.SET_FLIGHT_PLAN_TITLE]: setFlightPlanTitle,
    [c.SET_FLIGHT_PLAN_COLOR]: setFlightPlanColor,
    [c.SET_FLIGHT_PLAN_VISIBILITY]: setFlightPlanVisibility,
    [c.SET_FLIGHT_PLAN_AIRCRAFT]: setFlightPlanAircraft,
    [c.SET_FLIGHT_PLAN_CRUISE_SPEED]: setFlightPlanCruiseSpeed,
    [c.SET_FLIGHT_PLAN_FUEL_CONSUMPTION]: setFlightPlanFuelConsumption,
    [c.SET_FLIGHT_PLAN_PAYLOAD]: setFlightPlanPayload,
    [c.EXPORT_FLIGHT_PLAN_TO_FMS]: exportFlightPlanToFms
  };

  return map[action.type] ?
    map[action.type](state, action)
  : state;
}

function addFlightPlan(state = {}, action) {
  return addItem(state, action.flightPlan);
}

function removeFlightPlan(state = {}, action) {
  return removeItemById(state, action.flightPlanId);
}

function setFlightPlanTitle(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    title: action.title
  });
}

function setFlightPlanColor(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    color: action.color
  });
}

function setFlightPlanVisibility(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    visible: action.visible
  });
}

function setFlightPlanAircraft(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    aircraft: action.aircraft
  });
}

function setFlightPlanCruiseSpeed(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    cruiseSpeed: action.cruiseSpeed
  });
}

function setFlightPlanFuelConsumption(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    fuelConsumption: action.fuelConsumption
  });
}

function setFlightPlanPayload(state = {}, action) {
  return updateItemById(state, action.flightPlanId, {
    payload: action.payload
  });
}

function exportFlightPlanToFms(state = {}, action) {
  return state;
}

function geoSearch(state = {}, action) {
  switch (action.type) {
    case c.REQUEST_GEO_SEARCH_AIRWAYS:
      return requestGeoSearchAirways(state, action);
    case c.RECEIVE_GEO_SEARCH_AIRWAYS:
      return receiveGeoSearchAirways(state, action);
    case c.REQUEST_GEO_SERACH_RESULTS:
      return requestGeoSearchResults(state, action);
    case c.RECEIVE_GEO_SERACH_RESULTS:
      return receiveGeoSearch(state, action);
  }

  return state;
}


function requestGeoSearchAirways(state = { airwaysLoading: false }, action) {
  return Object.assign({}, state, {
    airwaysLoading: true
  });
}

function receiveGeoSearchAirways(state = { airwaysLoading: false }, action) {
  return Object.assign({}, state, {
    airwaysLoading: false
  });
}

function requestGeoSearchResults(state = { resultsLoading: false }, action) {
  return Object.assign({}, state, {
    bounds: action.bounds,
    resultsLoading: true
  });
}

function receiveGeoSearchResults(state = { resultsLoading: false, results: {} }, action) {
  return Object.assign({}, state, {
    resultsLoading: false,
    results: action.results
  });
}

function navItem(state = null, action) {
  switch (action.type) {
    case c.LOCATE_NAV_ITEM:
      return locateNavItem(state, action);
    case c.LOCATED_NAV_ITEM:
      return locatedNavItem(state, action);
    case c.SET_ACTIVE_NAV_ITEM:
      return setActiveNavItem(state, action);
  }

  return state;
}

function locateNavItem(state = null, action) {
  return Object.assign({}, action.navItem);
}

function locatedNavItem(state = null, action) {
  return Object.assign({}, action.navItem);
}

function setActiveNavItem(state = null, action) {
  return action.navItem ?
    Object.assign({}, action.navItem)
  : null;
}

const rootReducer = combineReducers({
  search: search,
  waypoints: waypoints,
  flightPlans: flightPlans,
  geoSearch: geoSearch,
  activeNavItem: navItem
});

export default rootReducer;
