import * as c from '../constants';
import FlightPlan from '../../models/FlightPlan';
import Waypoint from '../../models/Waypoint';
import navDataSearch from '../navDataSearch';
import geoSearch from '../geoSearch';
import padStart from 'lodash/padStart';
import round from 'lodash/round';

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

export function addWaypoint(waypoint) {
  return {
    type: c.ADD_WAYPOINT,
    waypoint: waypoint
  };
}

export function addWaypointAt(waypoint, index) {
  return {
    type: c.ADD_WAYPOINT_AT,
    waypoint: waypoint,
    index: index
  };
}

export function addGpsWaypoint(flightPlanId, lat, lon, elevation) {
  return (dispatch) => {
    dispatch(addWaypoint(
      Waypoint({
        flightPlanId: flightPlanId,
        lat: lat,
        lon: lon,
        elevation: elevation || null
      })
    ));

    dispatch(addFlashMessage(`GPS Waypoint added at lat: ${round(lat, 4)}, lon: ${round(lon, 4)}.`));
  };
}

export function addNavItemAsWaypoint(flightPlanId, navItem) {
  return (dispatch) => {
    dispatch(addWaypoint(
      Waypoint({
        flightPlanId: flightPlanId,
        navItem: navItem,
        lat: navItem.lat,
        lon: navItem.lon,
        elevation: navItem.elevation
      })
    ));

    var title = [navItem.icao || '', navItem.name || '', navItem.identifier || '']
      .join(' ')
      .trim();

    dispatch(addFlashMessage(`Waypoint ${title} added.`));
  };
}

export function removeWaypoint(waypointId, undo) {
  return (dispatch) => {
    dispatch({
      type: c.REMOVE_WAYPOINT,
      waypointId: waypointId
    });

    dispatch(addFlashMessage('Waypoint removed.', c.WARNING, undo));
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
    navItem: navItem,
    lat: navItem.lat,
    lon: navItem.lon,
    elevation: navItem.elevation
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

export function setWaypointFlightPlan(waypointId, flightPlanId) {
  return {
    type: c.SET_WAYPOINT_FLIGHT_PLAN,
    waypointId: waypointId,
    flightPlanId: flightPlanId
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

export function setActiveFlightPlan(id) {
  return {
    type: c.SET_ACTIVE_FLIGHT_PLAN,
    flightPlanId: id
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
    type: c.SET_FLIGHT_PLAN_PAYLOAD,
    flightPlanId: flightPlanId,
    payload: payload
  };
}

export function exportFlightPlan(flightPlanId, format) {
  return {
    type: c.EXPORT_FLIGHT_PLAN,
    flightPlanId: flightPlanId,
    format: format
  };
}

export function importFlightPlan(json) {
  return {
    type: c.IMPORT_FLIGHT_PLAN,
    json: json
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

export function setMapOverlays(overlays) {
  return {
    type: c.SET_MAP_OVERLAYS,
    overlays: overlays
  };
}

export function collapseSidebar() {
  return {
    type: c.COLLAPSE_SIDEBAR
  };
}

export function expandSidebar() {
  return {
    type: c.EXPAND_SIDEBAR
  };
}

export function toggleSidebar() {
  return {
    type: c.TOGGLE_SIDEBAR
  };
}

export function setSidebarContext(context) {
  return {
    type: c.SET_SIDEBAR_CONTEXT,
    context: context
  };
}

export function addFlashMessage(message, type, undo) {
  return {
    type: c.ADD_FLASH_MESSAGE,
    messageBody: message,
    messageType: type || c.INFO,
    messageUndo: undo || null
  };
}

export function popFlashMessage() {
  return {
    type: c.POP_FLASH_MESSAGE
  };
}

export function clearFlashMessages() {
  return {
    type: c.CLEAR_FLASH_MESSAGES
  };
}
