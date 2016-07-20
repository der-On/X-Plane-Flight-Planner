import Icons from './Icons';
import Popups from './Popups';
import partial from 'lodash/partial';
import L from 'leaflet';
window.L = L;
require('../../../leaflet.label-patched');
import {
  FLIGHT_PLAN_COLORS,
  DEFAULT_FLIGHT_PLAN_COLOR
} from '../../state/constants';

var zIndexes = {
  aircraft: 6000,
  airport: 3000,
  navaid: 2000,
  fix: 1000,
  airway: 3500,
  airwayLine: 3400,
  waypoint: 500,
  flightPlan: 300
};

const flightPlanOptions = {
  fill: false,
  clickable: false,
  className: 'map__flight-plan-path',
  opacity: 0.75,
  width: 6,
  zIndexOffset: zIndexes.flightPlan
};

const waypointOptions = {
  clickable: false,
  className: 'map__flight-plan-waypoint',
  opacity: 0.75,
  zIndexOffset: zIndexes.waypoint
};

const airwayLineOptions = {
  dashArray: '5, 5',
  lineCap: 'butt',
  weight: 2,
  clickable: false,
  zIndexOffset: zIndexes.airwayLine
};

function navItemLabel(navItem) {
  return navItem.icao || navItem.name || navItem.identifier;
}

function navItemLatLng(navItem) {
  return L.latLng(navItem.lat || 0, navItem.lon || 0);
}

function navItemMarker(type, navItem) {
  var latLng = L.latLng(navItem.lat, navItem.lon);
  return L.marker(latLng, {
    icon: Icons[type](navItem),
    zIndexOffset: zIndexes[type] || 0
  })
    .bindLabel(navItemLabel(navItem))
    .bindPopup(Popups[type](navItem));
}

function airwayMarker(airway, lat, lon, label) {
  var latLng = L.latLng(lat, lon);
  return L.marker(latLng, {
    icon: Icons.airway(airway),
    zIndexOffset: zIndexes.airway
  }).bindLabel(label);
}

function airwayLine(airway) {
  return L.polyline([
    [airway.fromLat, airway.fromLon],
    [airway.toLat, airway.toLon]
  ], Object.assign({}, airwayLineOptions, {
    color: airway.type === 2 ? '#4f6f3e' : '#3161a4'
  })).bindLabel(airway.name);
}

export default {
  airport: partial(navItemMarker, 'airport'),
  navaid: partial(navItemMarker, 'navaid'),
  fix: partial(navItemMarker, 'fix'),
  airway: (airway) => {
    return L.layerGroup([
      airwayMarker(airway, airway.fromLat, airway.fromLon, airway.fromName),
      airwayMarker(airway, airway.toLat, airway.toLon, airway.toName),
      airwayLine(airway)
    ]);
  },
  waypoint: (flightPlan, waypoint) => {
    return L.marker(navItemLatLng(waypoint),
      Object.assign({}, waypointOptions, {
        icon: Icons.waypoint(flightPlan, waypoint),
        draggable: !waypoint.navItem, // make gps waypoints draggable
        clickable: !waypoint.navItem
      })
    );
  },
  flightPlan: (flightPlan, waypoints) => {
    return L.polyline(waypoints.map(navItemLatLng),
      Object.assign({}, flightPlanOptions, {
        color: flightPlan.color || DEFAULT_FLIGHT_PLAN_COLOR
      })
    );
  },
  aircraft: () => {
    return L.marker([0, 0], {
      icon: Icons.aircraft(),
      zIndexOffset: zIndexes.aircraft
    });
  }
};
