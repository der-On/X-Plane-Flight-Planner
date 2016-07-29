import converter from 'flight-plan-converter';
import Navaid from '../apt_nav/models/navaid';

const navaidTypeMap = {
  'NDB': 'ndb',
  'VOR': 'vor'
}
const navaidFallbackType = 'vor';

const extMap = {
  'xplane_fms': 'fms',
  'json': 'json',
  'kml': 'kml',
  'geojson': 'geojson'
};

const mimeMap = {
  'xplane_fms': 'text/plain',
  'json': 'application/json',
  'kml': 'text/xml'
};

function navItemType(navItem) {
  switch(navItem._type) {
    case 'airport':
    case 'fix':
      return navItem._type;
      break;
    case 'navaid':
      return navaidTypeMap[Navaid.typeName(navItem)] || navaidFallbackType;
      break;
  }

  return null;
}

function convertWaypoint(waypoint) {
  var _navItemType = waypoint.navItem ?
    navItemType(waypoint.navItem)
  : null;

  var converted = {
    lat: waypoint.lat, lon: waypoint.lon,
    elevation: waypoint.elevation || 0,
    type: waypoint.navItem ?
      _navItemType : converter.types.GPS
  };

  if (waypoint.navItem) {
    switch(_navItemType) {
      case converter.types.AIRPORT:
        converted.airport = {
          icao: waypoint.navItem.icao
        };
        break;
      case converter.types.FIX:
        converted.fix = {
          name: waypoint.navItem.name
        };
        break;
      case converter.types.NDB:
        converted.ndb = {
          identifier: waypoint.navItem.identifier
        };
        break;
      case converter.types.VOR:
        converted.vor = {
          identifier: waypoint.navItem.identifier
        };
        break;
    }
  }

  return converted;
}

function extension(format) {
  return extMap[format];
}

function mimetype(format) {
  return mimeMap[format] || 'text/plain';
}

export default function downloadFlightPlan(flightPlan, waypoints, format) {
  var converted;
  const json = {
    title: flightPlan.title,
    waypoints: waypoints.map(convertWaypoint)
  };

  if (format === 'json') {
    converted = JSON.stringify(json, null, 2);
  } else {
    converted = converter.convert(json, format);
  }

  var uri = 'data:' + mimetype(format) + ';charset=utf-8,' + encodeURIComponent(converted);

  var element = document.createElement('a');
  element.setAttribute('href', uri);
  element.setAttribute('download', flightPlan.title + '.' + extension(format));

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
