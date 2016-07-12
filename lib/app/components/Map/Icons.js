import L from 'leaflet';

var baseUrl = window.location.href + '/images/icons';
L.Icon.Default.imagePath = window.location.href + '/images/leaflet';

function airportIconUrl(airport) {
  // simple air strip
  if (airport.type === 1 &&
      airport.runways.length === 1 &&
      airport.runways[0].type > 2) {
    return '/airport_strip.png';
  }

  // big airport with more than 2 runways TODO: airport size should be defined by runway lengths
  if (airport.runways.length > 2) {
    return '/airport_big.png';
  }

  // seaport
  if (airport.type === 16) {
    return '/airport_sea.png';
  }

  // heliport
  if (airport.type === 17) {
    return '/airport_heli.png';
  }

  return '/airport_default.png';
}

function navaidIconUrl(navaid) {
  // NDB
  if (navaid.type === 2) {
    return '/navaid_ndb.png';
  }

  // VOR
  if (navaid.type === 3) {
    return '/navaid_vor.png';
  }

  // DME
  if (navaid.type === 12 ||
      navaid.type == 13) {
    return '/navaid_dme.png';
  }

  return '/navaid_dme.png';
}

function airwayIconUrl(airway) {
  if (airway.type === 2) {
    return '/airway_high.png';
  }

  return '/airway_low.png';
}

var defaultOptions = {
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [16, 32]
};

export default {
  airport: (airport) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: baseUrl + airportIconUrl(airport)
    }));
  },
  navaid: (navaid) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: baseUrl + navaidIconUrl(navaid)
    }));
  },
  fix: (fix) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: baseUrl + '/fix.png'
    }));
  },
  airway: (airway) => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: baseUrl + airwayIconUrl(airway)
    }));
  },
  aircraft: () => {
    return L.icon(Object.assign({}, defaultOptions, {
      iconUrl: baseUrl + '/aircraft.png'
    }));
  }
};
