import L from 'leaflet';

const year = (new Date()).getFullYear();

export default {
  osm: L.tileLayer(
    'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      atribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a','b','c']
    }
  ),
  osmTransport: L.tileLayer(
    'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="/copyright">OpenStreetMap-Mitwirkende</a>. Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>',
      subdomains: ['a','b','c']
    }
  ),
  osmTransportDark: L.tileLayer(
    'http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="/copyright">OpenStreetMap-Mitwirkende</a>. Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>',
      subdomains: ['a','b','c']
    }
  ),
  osmLandscape: L.tileLayer(
    'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="/copyright">OpenStreetMap-Mitwirkende</a>. Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>',
      subdomains: ['a','b','c']
    }
  ),
  osmOutdoors: L.tileLayer(
    'http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="/copyright">OpenStreetMap-Mitwirkende</a>. Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>',
      subdomains: ['a','b','c']
    }
  ),
  googleStreets: L.tileLayer(
    '//{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: 'Bilder © ' + year + ' Google,Kartendaten © ' + year + ' GeoBasis-DE/BKG (©2009),Google',
      subdomains: ['mt0','mt1','mt2','mt3']
    }
  ),
  googleHybrid: L.tileLayer(
    '//{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      attribution: 'Bilder © ' + year + ' Google,Kartendaten © ' + year + ' GeoBasis-DE/BKG (©2009),Google',
      subdomains: ['mt0','mt1','mt2','mt3']
    }
  ),
  googleSatellite: L.tileLayer(
    '//{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: 'Bilder © ' + year + ' Google,Kartendaten © ' + year + ' GeoBasis-DE/BKG (©2009),Google',
      subdomains: ['mt0','mt1','mt2','mt3']
    }
  ),
  googleTerrain: L.tileLayer(
    '//{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      attribution: 'Bilder © ' + year + ' Google,Kartendaten © ' + year + ' GeoBasis-DE/BKG (©2009),Google',
      subdomains: ['mt0','mt1','mt2','mt3']
    }
  )
};
