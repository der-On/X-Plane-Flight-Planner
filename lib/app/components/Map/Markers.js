import Icons from './Icons';
import Popups from './Popups';
import partial from 'lodash/partial';
import L from 'leaflet';
window.L = L;
require('../../../leaflet.label-patched');

var zIndexes = {
  aircraft: 6000,
  waypoint: 5000,
  flightPlanPath: 4000,
  airport: 3000,
  navaid: 2000,
  fix: 1000,
  airway: 3500,
  airwayLine: 3400
};

function navItemLabel(navItem) {
  return navItem.icao || navItem.name || navItem.identifier;
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
  ], {
    dashArray: '5, 5',
    lineCap: 'butt',
    weight: 2,
    clickable: false,
    color: airway.type === 2 ? '#4f6f3e' : '#3161a4',
    zIndexOffset: zIndexes.airwayLine
  }).bindLabel(airway.name);
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
  waypoint: (waypoint) => {
    var latLng = L.latLng(waypoint.lat, waypoint.lon);
    return L.marker(latLng, {
      zIndexOffset: zIndexes.waypoint
    });
  },
  flightPlanPath: (flightPlan, waypoints) => {
    // TODO: implement
  },
  aircraft: () => {
    return L.marker([0, 0], {
      icon: Icons.aircraft(),
      zIndexOffset: zIndexes.aircraft
    });
  }
};
