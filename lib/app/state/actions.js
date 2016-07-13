import * as c from './constants';
import FlightPlan from '../../models/FlightPlan';
import Waypoint from '../../models/Waypoint';
import navDataSearch from '../navDataSearch';
import geoSearch from '../geoSearch';

export function setSearchQuery(query) {
  return function (dispatch) {
    dispatch({
      type: c.SET_SEARCH_QUERY,
      query: query
    });

    dispatch(requestSearchResults(query));
  };
}

export function requestSearchResults(query) {
  return function (dispatch) {
    dispatch({
      type: c.REQUEST_SEARCH_RESULTS,
      query: query
    });

    navDataSearch.find(query)
      .then(function (results) {
        dispatch(receiveSearchResults(results));
      });
  }
}

export function receiveSearchResults(results) {
  return {
    type: c.RECEIVE_SEARCH_RESULTS,
    results: results
  };
}

export function requestSearchIndex() {
  return function (dispatch) {
    dispatch({
      type: c.REQUEST_SEARCH_INDEX
    });

    navDataSearch.loadIndex()
      .then(function () {
        dispatch(receiveSearchIndex());
      });
  };
}

export function receiveSearchIndex() {
  return {
    type: c.RECEIVE_SEARCH_INDEX
  };
}

export function locateNavItem(item) {
  return function (dispatch) {
    dispatch({
      type: c.LOCATE_NAV_ITEM,
      navItem: item
    });

    dispatch(setMapCenter(item.lat, item.lon));
    dispatch(setMapZoom(c.MAP_ZOOM_ACTIVE_NAV_ITEM));
    dispatch(locatedNavItem(item));
  };
}

export function locatedNavItem(item) {
  return {
    type: c.LOCATED_NAV_ITEM,
    navItem: item
  };
}

export function setActiveNavItem(item) {
  return {
    type: c.SET_ACTIVE_NAV_ITEM,
    navItem: item
  };
}

export function requestGeoSearchAirways() {
  return function (dispatch) {
    dispatch({
      type: c.REQUEST_GEO_SEARCH_AIRWAYS
    });

    geoSearch.loadAirways()
      .then(function () {
        dispatch(receiveGeoSearchAirways());
      });
  };
}

export function receiveGeoSearchAirways() {
  return {
    type: c.RECEIVE_GEO_SEARCH_AIRWAYS
  };
}

export function requestGeoSearchResults(bounds) {
  return function (dispatch) {
    dispatch({
      type: c.REQUEST_GEO_SEARCH_RESULTS,
      bounds: bounds
    });

    geoSearch.findAllInBounds(bounds)
      .then(function (results) {
        dispatch(receiveGeoSearchResults(results));
      });
  };
}

export function receiveGeoSearchResults(results) {
  return {
    type: c.RECEIVE_GEO_SEARCH_RESULTS,
    results: results
  };
}

export function createWaypoint(data) {
  return {
    type: c.CREATE_WAYPOINT,
    waypoint: Waypoint(data)
  };
}

export function addWaypoint(flightPlanId, waypoint) {
  return {
    type: c.ADD_WAYPOINT,
    flightPlanId: flightPlanId,
    waypoint: waypoint
  };
}

export function addNavItemAsWaypoint(flightPlanId, navItem) {
  return addWaypoint(
    flightPlanId,
    Waypoint({
      navItem: navItem
    })
  );
}

export function removeWaypoint(waypointId) {
  return {
    type: c.REMOVE_WAYPOINT,
    waypointId: waypointId
  };
}

export function setWaypointIndex(waypointId, index) {
  return {
    type: c.SET_WAYPOINT_INDEX,
    waypointId: waypointId,
    index: index
  };
}

export function setWaypointElevation(waypointId, elevation) {
  return {
    type: c.SET_WAYPOINT_ELEVATION,
    waypointId: waypointId,
    elevation: elevation
  };
}

export function setWaypointNavItem(waypointId, navItem) {
  return {
    type: c.SET_WAYPOINT_NAV_ITEM,
    waypointId: waypointId,
    navItem: navItem
  };
}

export function setWaypointLatLon(waypointId, lat, lon) {
  return {
    type: c.SET_WAYPOINT_LAT_LON,
    waypointId: waypointId,
    lat: lat,
    lon: lon
  };
}

export function createFlightPlan(data) {
  return {
    type: c.CREATE_FLIGHT_PLAN,
    flightPlan: FlightPlan(data)
  };
}

export function addFlightPlan(flightPlan) {
  return {
    type: c.ADD_FLIGHT_PLAN,
    flightPlan: flightPlan
  };
}

export function removeFlightPlan(flightPlanId) {
  return {
    type: c.REMOVE_FLIGHT_PLAN,
    flightPlanId: flightPlanId
  };
}

export function setFlightPlanTitle(flightPlanId, title) {
  return {
    type: c.SET_FLIGHT_PLAN_TITLE,
    flightPlanId: flightPlanId,
    title: title
  };
}

export function setFlightPlanColor(flightPlanId, color) {
  return {
    type: c.SET_FLIGHT_PLAN_COLOR,
    flightPlanId: flightPlanId,
    color: color
  };
}

export function setFlightPlanVisibility(flightPlanId, visible) {
  return {
    type: c.SET_FLIGHT_PLAN_VISIBILITY,
    flightPlanId: flightPlanId,
    visible: visible
  };
}

export function setFlightPlanAircraft(flightPlanId, aircraft) {
  return {
    type: c.SET_FLIGHT_PLAN_AIRCRAFT,
    flightPlanId: flightPlanId,
    aircraft: aircraft
  };
}

export function setFlightPlanCruiseSpeed(flightPlanId, cruiseSpeed) {
  return {
    type: c.SET_FLIGHT_PLAN_CRUISE_SPEED,
    flightPlanId: flightPlanId,
    cruiseSpeed: cruiseSpeed
  };
}

export function setFlightPlanFuelConsumption(flightPlanId, fuelConsumption) {
  return {
    type: c.SET_FLIGHT_PLAN_FUEL_CONSUMPTION,
    flightPlanId: flightPlanId,
    fuelConsumption: fuelConsumption
  };
}

export function setFlightPlanPayload(flightPlanId, payload) {
  return {
    type: c.SET_FLIGHT_PLAN_FUEL_PAYLOAD,
    flightPlanId: flightPlanId,
    payload: payload
  };
}

export function exportFlightPlanToFms(flightPlanId) {
  return {
    type: c.EXPORT_FLIGHT_PLAN_TO_FMS,
    flightPlanId: flightPlanId
  };
}

export function setMapCenter(lat, lon) {
  return {
    type: c.SET_MAP_CENTER,
    lat: lat,
    lon: lon
  };
}

export function setMapZoom(zoom) {
  return {
    type: c.SET_MAP_ZOOM,
    zoom: zoom
  };
}

export function setMapView(zoom, lat, lon) {
  return {
    type: c.SET_MAP_VIEW,
    zoom: zoom,
    lat: lat,
    lon: lon
  };
}

export function setMapBaseLayer(baseLayer) {
  return {
    type: c.SET_MAP_BASE_LAYER,
    baseLayer: baseLayer
  };
}
