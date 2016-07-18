import L from 'leaflet';
window.L = L;
import { MAP_LOD_1_ZOOM, MAP_MAX_CLUSTER_RADIUS } from '../../state/constants';
require('leaflet.markercluster');

function Cluster(type) {
  return new L.MarkerClusterGroup({
    maxClusterRadius: MAP_MAX_CLUSTER_RADIUS,
    showCoverageOnHover: false,
    disableClusteringAtZoom: MAP_LOD_1_ZOOM,
    removeOutsideVisibleBounds: true
  });
}

export default Cluster;
