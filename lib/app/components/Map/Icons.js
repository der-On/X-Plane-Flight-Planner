import L from 'leaflet';
import { FLIGHT_PLAN_COLOR_DEFAULT } from '../../constants';

var baseUrl = window.location.href.split('#')[0] + '/images/icons';
L.Icon.Default.imagePath = window.location.href.split('#')[0] + '/images/leaflet';


var defaultOptions = {
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  className: 'nav-item-marker-icon'
};

export function airportIconUrl(airport) {
  // simple air strip
  if (airport.type === 1 &&
      airport.runways.length === 1 &&
      airport.runways[0].type > 2) {
    return baseUrl + '/airport_strip.png';
  }

  // big airport with more than 2 runways
  // TODO: airport size should be defined by runway lengths
  if (airport.runways.length > 2) {
    return baseUrl + '/airport_big.png';
  }

  // seaport
  if (airport.type === 16) {
    return baseUrl + '/airport_sea.png';
  }

  // heliport
  if (airport.type === 17) {
    return baseUrl + '/airport_heli.png';
  }

  return baseUrl + '/airport_default.png';
}

export function navaidIconUrl(navaid) {
  // NDB
  if (navaid.type === 2) {
    return baseUrl + '/navaid_ndb.png';
  }

  // VOR
  if (navaid.type === 3) {
    return baseUrl + '/navaid_vor.png';
  }

  // DME
  if (navaid.type === 12 ||
      navaid.type == 13) {
    return baseUrl + '/navaid_dme.png';
  }

  return baseUrl + '/navaid_dme.png';
}

export function airwayIconUrl(airway) {
  if (airway.type === 2) {
    return baseUrl + '/airway_high.png';
  }

  return baseUrl + '/airway_low.png';
}

export function fixIconUrl(fix) {
  return baseUrl + '/fix.png';
}

export function aircraftIconUrl() {
  return baseUrl + '/aircraft.png';
}

export function gpsIconUrl() {
  return baseUrl + '/gps.png';
}

export default {
  airport: (airport) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: airportIconUrl(airport)
    }));
  },
  navaid: (navaid) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: navaidIconUrl(navaid)
    }));
  },
  fix: (fix) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: fixIconUrl(fix)
    }));
  },
  airway: (airway) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: airwayIconUrl(airway)
    }));
  },
  aircraft: () => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: aircraftIconUrl()
    }));
  },
  waypoint: (flightPlan, waypoint) => {
    var color = flightPlan.color || FLIGHT_PLAN_COLOR_DEFAULT;

    return L.divIcon(Object.assign({}, defaultOptions, {
      className: 'map-waypoint__icon',
      html: `<span style="background-color:${color};border-color:${color};"></span>`
    }));
  }
};
