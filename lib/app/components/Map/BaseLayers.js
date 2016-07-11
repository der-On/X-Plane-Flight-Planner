import L from 'leaflet';

export default {
  osm: L.tileLayer(
    'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      atribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }
  )
};
