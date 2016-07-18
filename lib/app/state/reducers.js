import { combineReducers } from 'redux'
import * as c from './constants';
import filter from 'lodash/filter';

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


function reindexWaypoints(waypoints, flightPlanId) {
  var list = filter(waypoints, function (waypoint, id) {
    return waypoint.flightPlanId === flightPlanId;
  }).sort(function (a, b) {
    if (a.index === b.index) return 0;
    return a.index < b.index ? -1 : 1;
  });

  var waypoints = {};

  list.forEach(function (waypoint, index) {
    waypoints[waypoint.id] = Object.assign({}, waypoint, {
      index: index
    });
  });

  return waypoints;
}

function newWaypointIndex(waypoints, flightPlanId) {
  return filter(waypoints, function (waypoint, id) {
    return waypoint.flightPlanId === flightPlanId;
  }).length;
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
    [c.ADD_WAYPOINT_AT]: addWaypointAt,
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
  state = Object.assign({}, state,
    reindexWaypoints(state, action.waypoint.flightPlanId)
  );

  return addItem(state, Object.assign({}, action.waypoint, {
    index: newWaypointIndex(state, action.waypoint.flightPlanId)
  }));
}

function addWaypointAt(state = {}, action) {
  state = addItem(state, Object.assign({}, action.waypoint, {
    index: action.index
  }));
  return Object.assign({}, state,
    reindexWaypoints(state, action.waypoint.flightPlanId)
  );
}

function removeWaypoint(state, action) {
  var waypoint = state[action.waypointId];
  if (!waypoint) return state;

  state = removeItemById(state, action.waypointId);

  return Object.assign({}, state,
    reindexWaypoints(state, waypoint.flightPlanId)
  );
}

function setWaypointIndex(state, action) {
  var waypoint = state[action.waypointId];
  if (!waypoint) return state;

  state = updateItemById(state, action.waypointId, {
    index: action.index
  });

  return Object.assign({}, state,
    reindexWaypoints(state, waypoint.flightPlanId)
  );
}

function setWaypointElevation(state, action) {
  return updateItemById(state, action.waypointId, {
    elevation: action.elevation
  });
}

function setWaypointNavItem(state, action) {
  return updateItemById(state, action.waypointId, {
    navItem: Object.assign({}, action.navItem),
    lat: navItem.lat,
    lon: navItem.lon
  });
}

function setWaypointLatLon(state, action) {
  return updateItemById(state, action.waypointId, {
    lat: action.lat,
    lon: action.lon
  });
}

function setWaypointFlightPlan(state, action) {
  return updateItemById(state, action.waypointId, {
    flightPlanId: action.flightPlanId,
    index: newWaypointIndex(state, action.flightPlanId)
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

function geoSearch(state, action) {
  state = state || {
    results: {
      airports: [],
      navaids: [],
      fixes: [],
      airways: []
    },
    airwaysLoading: false,
    resultsLoading: false
  };

  switch (action.type) {
    case c.REQUEST_GEO_SEARCH_AIRWAYS:
      return requestGeoSearchAirways(state, action);
    case c.RECEIVE_GEO_SEARCH_AIRWAYS:
      return receiveGeoSearchAirways(state, action);
    case c.REQUEST_GEO_SERACH_RESULTS:
      return requestGeoSearchResults(state, action);
    case c.RECEIVE_GEO_SEARCH_RESULTS:
      return receiveGeoSearchResults(state, action);
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

function map(state, action) {
  state = state || {
    center: c.MAP_CENTER_DEFAULT,
    zoom: c.MAP_ZOOM_DEFAULT,
    baseLayer: c.MAP_BASE_LAYER_DEFAULT
  };

  switch (action.type) {
    case c.SET_MAP_CENTER:
      return Object.assign({}, state, {
        center: setMapCenter(state.center, action)
      });
    case c.SET_MAP_ZOOM:
      return Object.assign({}, state, {
        zoom: setMapZoom(state.zoom, action)
      });
    case c.SET_MAP_BASE_LAYER:
      return Object.assign({}, state, {
        baseLayer: setMapBaseLayer(state.baseLayer, action)
      });
    case c.SET_MAP_VIEW:
      return setMapView(state, action);
  }

  return state;
}

function setMapCenter(state = c.MAP_CENTER_DEFAULT, action) {
  return [action.lat, action.lon];
}

function setMapZoom(state = c.MAP_ZOOM_DEFAULT, action) {
  return action.zoom;
}

function setMapView(state = {}, action) {
  return Object.assign({}, state, {
    zoom: action.zoom,
    lat: action.lat,
    lon: action.lon
  });
}

function setMapBaseLayer(state = c.MAP_BASE_LAYER_DEFAULT, action) {
  return action.baseLayer;
}

function sidebar(state, action) {
  state = state || {
    expanded: false
  };

  switch(action.type) {
    case c.COLLAPSE_SIDEBAR:
      return Object.assign({}, state, {
        expanded: collapseSidebar(state.expanded, action)
      });
    case c.EXPAND_SIDEBAR:
      return Object.assign({}, state, {
        expanded: expandSidebar(state.expanded, action)
      });
    case c.TOGGLE_SIDEBAR:
      return Object.assign({}, state, {
        expanded: toggleSidebar(state.expanded, action)
      });
  }

  return state;
}

function collapseSidebar(state, action) {
  return false;
}

function expandSidebar(state, action) {
  return true;
}

function toggleSidebar(state, action) {
  return state ? false : true;
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

function setActiveFlightPlan(state, action) {
  return action.flightPlanId || state || null;
}

function flashMessages(state = [], action) {
  switch(action.type) {
    case c.ADD_FLASH_MESSAGE:
      return addFlashMessage(state, action);
    case c.POP_FLASH_MESSAGE:
      return popFlashMessage(state, action);
    case c.CLEAR_FLASH_MESSAGES:
      return clearFlashMessages(state, action);
  }

  return state;
}

function addFlashMessage(state = [], action) {
  return [
    ...
    state,
    {
      type: action.messageType,
      body: action.messageBody,
      undo: action.messageUndo
    }
  ];
}

function popFlashMessage(state = [], action) {
  return state.slice(0, state.length - 2);
}

function clearFlashMessages(state = [], action) {
  return [];
}

const rootReducer = combineReducers({
  search: search,
  waypoints: waypoints,
  flightPlans: flightPlans,
  geoSearch: geoSearch,
  map: map,
  sidebar: sidebar,
  activeNavItem: navItem,
  activeFlightPlanId: setActiveFlightPlan,
  flashMessages: flashMessages
});

export default rootReducer;
