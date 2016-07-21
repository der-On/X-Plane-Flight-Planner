import {
  airportIconUrl,
  navaidIconUrl,
  fixIconUrl,
  airwayIconUrl,
  gpsIconUrl
} from './Icons';
import L from 'leaflet';
import Navaid from '../../../apt_nav/models/navaid';
import padEnd from 'lodash/padEnd';

function navItemName(navItem) {
  return [navItem.icao || '', navItem.name || '', navItem.identifier || '']
    .join(' ')
    .trim();
}

function formatFrequency(frequency) {
  return padEnd((frequency / 100).toString(), 6, '0') + 'MHz';
}

function runwayLength(runway) {
  return runway.length ||
    L.latLng(runway.latStart, runway.lonStart)
      .distanceTo(L.latLng(runway.latEnd, runway.lonEnd));
}

function renderRunway(runway) {
  return `<li>
    ${runway.numberStart} - ${runway.numberEnd}: width ${runway.width}m, length ${Math.floor(runwayLength(runway))}m
  </li>`;
}

function renderCommunication(communication) {
  return `<li>
    ${communication.name}: ${formatFrequency(communication.frequency)}
  </li>`;
}

function renderAddAsWaypointLink(type, navItem) {
  return `<a data-add-as-waypoint data-id="${navItem.id}" data-type="${type}" href="javascript:;">add as waypoint</a>`;
}

function renderRemoveWaypointLink(waypoint) {
  return `<a data-remove-waypoint data-id="${waypoint.id}" href="javascript:;">remove waypoint</a>`;
}

function renderAddGpsWaypointLink(lat, lon, elevation) {
  return `<a data-add-gps-waypoint data-lat="${lat}" data-lon="${lon}" data-elevation="${elevation || ''}" href="javascript:;">add as waypoint</a>`;
}

function renderLatLonElevation(navItem) {
  return `lat: ${navItem.lat}, lon: ${navItem.lon}
          ${navItem.elevation ? '<br/>elevation: ' + navItem.elevation + 'ft' : ''}`;
}

function renderLatLonElevationAirwayFrom(navItem) {
  return `lat: ${navItem.fromLat}, lon: ${navItem.fromLon}
          <br/>flight level: top ${navItem.elevationTop}, base ${navItem.elevationBase}`;
}

function renderLatLonElevationAirwayTo(navItem) {
  return `lat: ${navItem.toLat}, lon: ${navItem.toLon}
          <br/>flight level: top ${navItem.elevationTop}, base ${navItem.elevationBase}`;
}

function renderNavItemIcon(type, navItem) {
  var map = {
    airport: airportIconUrl,
    navaid: navaidIconUrl,
    fix: fixIconUrl,
    airway: airwayIconUrl,
    gps: gpsIconUrl
  };

  return `<img class="nav-item-icon" src=${map[type](navItem)} />`;
}

export default {
  airport: (airport) => {
    return `<div class="nav-item-popup-content">
      <h2>
        ${renderNavItemIcon('airport', airport)}
        ${airport.icao} - ${airport.name}
      </h2>
      <p>${renderAddAsWaypointLink('airport', airport)}</p>
      <p>${renderLatLonElevation(airport)}</p>

      <h3>Runways</h3>
      <ul class="airport-runways">
      ${airport.runways.map(renderRunway).join('\n')}
      </ul>

      <h3>Coms</h3>
      <ul class="airport-communications">
      ${airport.communications.map(renderCommunication).join('\n')}
      </ul>
    </div>`;
  },
  navaid: (navaid) => {
    return `<div class="nav-item-popup-content">
      <h2>
        ${renderNavItemIcon('navaid', navaid)}
        ${navaid.identifier} - ${navaid.name}
      </h2>
      <p>${renderAddAsWaypointLink('navaid', navaid)}</p>
      <p>${renderLatLonElevation(navaid)}</p>
      <p>
        ${Navaid.typeName(navaid)} - ${formatFrequency(navaid.frequency)}<br/>
        ${navaid.range ? 'range: ' + navaid.range + 'nm<br/>' : ''}
        ${navaid.icao ? 'airport: ' + navaid.icao + '<br/>' : ''}
        ${navaid.runwayNumber ? 'runway: ' + navaid.runwayNumber + '<br/>' : ''}
        ${navaid.variation ? 'variation: ' + navaid.variation + '<br/>' : ''}
        ${navaid.bearing ? 'bearing: ' + navaid.bearing + '<br/>' : ''}
        ${navaid.bias ? 'bias: ' + navaid.bias + '<br/>' : ''}
    </div>`;
  },
  fix: (fix) => {
    return `<div class="nav-item-popup-content">
      <h2>
        ${renderNavItemIcon('fix', fix)}
        ${fix.name}
      </h2>
      <p>${renderAddAsWaypointLink('fix', fix)}</p>
      <p>${renderLatLonElevation(fix)}</p>
    </div>`;
  },
  airwayFrom: (airway) => {
    return `<div class="nav-item-popup-content">
      <h2>
        ${renderNavItemIcon('airway', airway)}
        ${airway.fromName} - ${airway.name}
      </h2>
      <p>${renderAddGpsWaypointLink(airway.fromLat, airway.fromLon)}</p>
      <p>${renderLatLonElevationAirwayFrom(airway)}</p>
    </div>`;
  },
  airwayTo: (airway) => {
    return `<div class="nav-item-popup-content">
      <h2>
        ${renderNavItemIcon('airway', airway)}
        ${airway.toName} - ${airway.name}
      </h2>
      <p>${renderAddGpsWaypointLink(airway.toLat, airway.toLon)}</p>
      <p>${renderLatLonElevationAirwayTo(airway)}</p>
    </div>`;
  },
  waypoint: (waypoint) => {
    return `<div class="nav-item-popup-content">
      <h2>
        ${waypoint.navItem ?
          renderNavItemIcon(waypoint.navItem._type, waypoint.navItem)
        : renderNavItemIcon('gps', waypoint)
        }
        ${waypoint.navItem ? navItemName(waypoint.navItem) : 'GPS point'}
      </h2>
      <p>${renderRemoveWaypointLink(waypoint)}</p>
      <p>${renderLatLonElevation(waypoint)}</p>
    </div>`;
  }
};
