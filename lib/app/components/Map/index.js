import L from 'leaflet';
import React from 'react';
import { connect } from 'react-redux'
import BaseLayers from './BaseLayers';
import Markers from './Markers';
import Cluster from './Cluster';
import {
  requestGeoSearchResults,
  setMapView,
  setMapZoom,
  setMapCenter,
  setMapBaseLayer,
  setMapOverlays,
  addNavItemAsWaypoint,
  addGpsWaypoint,
  setWaypointLatLon
} from '../../state/actions';
import debounce from 'lodash/debounce';
import without from 'lodash/without';
import property from 'lodash/property';
import flow from 'lodash/flow';
import negate from 'lodash/negate';
import toString from 'lodash/toString';
import filter from 'lodash/filter';
import partial from 'lodash/partial';
import mapKeys from 'lodash/mapKeys';
import * as c from '../../state/constants';

function waypointsForFlightPlan(flightPlanId, waypoints) {
  return filter(waypoints, function (waypoint, id) {
    return waypoint.flightPlanId === flightPlanId;
  });
}

function navItemLatLng(navItem) {
  return L.latLng(navItem.lat || 0, navItem.lon || 0);
}

function mapKeysFrom(src) {
  return function (value, key) {
    return src[key];
  };
}

const baseLayerLabels = {
  osm: 'OSM Mapnik',
  osmTransport: 'OSM Transport',
  osmTransportDark: 'OSM Transport dark',
  osmLandscape: 'OSM Landscape',
  osmOutdoors: 'OSM Outdoors',
  googleStreets: 'Google Streets',
  googleHybrid: 'Google Hybrid',
  googleSatellite: 'Google Satellite',
  googleTerrain: 'Google Terrain'
};

const overlayLabels = {
  airports: 'Airports',
  navaids: 'Navaids',
  fixes: 'Fixes',
  airways: 'Airways',
  flightPlans: 'Flight plan paths',
  waypoints: 'Flight plan Waypoints',
  aircraft: 'Aircraft'
};

class Map extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { activeNavItem, center, zoom, baseLayer, overlays, dispatch } = this.props;

    // create and configure map
    this.map = L.map(this.refs.container, {
      center: center,
      zoom: zoom,
      maxZoom: c.MAP_MAX_ZOOM,
      minZoom: c.MAP_MIN_ZOOM,
      doubleClickZoom: false
    });

    this.map.zoomControl.setPosition('topright');

    // add baselayers
    this.baseLayers = BaseLayers;
    this.baseLayers[baseLayer].addTo(this.map);

    // add markers and lines
    this.markers = {
      airports: {},
      navaids: {},
      fixes: {},
      airways: {},
      flightPlans: {},
      waypoints: {},
      aircraft: null
    };

    this.overlays = {
      airports: L.layerGroup(),
      navaids: Cluster('navaids'),
      fixes: Cluster('fixes'),
      airways: L.layerGroup(),
      flightPlans: L.layerGroup(),
      waypoints: L.layerGroup(),
      aircraft: L.layerGroup()
    };

    this.layerControl = L.control.layers(
      mapKeys(this.baseLayers, mapKeysFrom(baseLayerLabels)),
      mapKeys(this.overlays, mapKeysFrom(overlayLabels))
    );
    this.layerControl.addTo(this.map);

    this.updateOverlays();

    // initially load nav items
    this.requestGeoSearch();

    this.updateViewFromLocationHash();

    this.updateNavItemMarkers();
    this.updateFlightPlans();
    this.updateLocationHash();
    this.bindEvents();
    this.bindMapEvents();
  }

  bindEvents() {
    var self = this;

    window.addEventListener('hashchange', function () {
      self.updateViewFromLocationHash();
    });
  }

  bindMapEvents() {
    const { dispatch, activeFlightPlanId } = this.props;
    var self = this;
    var viewEvents = ['resize', 'moveend', 'moveend', 'zoomend'];
    var overlayEvents = ['overlayadd', 'overlayremove'];

    function attach(handler) {
      return function (event) {
        self.map.on(event, handler);
      };
    }

    function viewHandler() {
      self.updateView();
      self.requestGeoSearch();

      if (self.map.getZoom() < c.MAP_MIN_ZOOM_NAV_ITEMS_VISIBLE) {
        self.clearNavItemMarkers();
      }
    }

    var debouncedViewHandler = debounce(viewHandler, 250);

    function overlaysHandler() {
      var overlays = [];

      Object.keys(self.overlays)
        .forEach(function (overlay) {
          if (self.map.hasLayer(self.overlays[overlay])) {
            overlays.push(overlay);
          }
        });

      dispatch(setMapOverlays(overlays));
    }

    function baseLayerHandler() {
      var baseLayer = c.MAP_BASE_LAYER_DEFAULT;

      Object.keys(self.baseLayers)
        .forEach(function (layer) {
          if (self.map.hasLayer(self.baseLayers[layer])) {
            baseLayer = layer;
          }
        });

      dispatch(setMapBaseLayer(baseLayer));
    }

    function doubleClickHandler(event) {
      var latLng = event.latlng;
      dispatch(addGpsWaypoint(activeFlightPlanId, latLng.lat, latLng.lng));
    }

    viewEvents.forEach(attach(debouncedViewHandler));
    this.map.on('baselayerchange', baseLayerHandler);
    overlayEvents.forEach(attach(overlaysHandler));
    this.map.on('dblclick', doubleClickHandler);
  }

  componentDidUpdate(prevProps) {
    const { activeNavItem, center, zoom, baseLayer, overlays, navItems, waypoints, flightPlans } = this.props;
    var bounds;
    var centerLatLng = L.latLng(center);
    var prevCenterLatLng = this.map.getCenter();
    var prevZoom = this.map.getZoom();

    if (prevProps.baseLayer !== baseLayer) {
      this.map.removeLayer(this.baseLayers[prevProps.baseLayer]);
      this.map.addLayer(this.baseLayers[baseLayer || this.getDefaultProps().baseLayer]);
    }

    if (!centerLatLng.equals(prevCenterLatLng) &&
        prevZoom !== zoom) {
      this.map.setView(centerLatLng, zoom, {
        animate: true
      });
    }
    else if (!centerLatLng.equals(prevCenterLatLng)) {
      this.map.setView(centerLatLng, prevZoom, {
        animate: true
      });
    }
    else if (prevZoom !== zoom) {
      this.map.setZoom(zoom, {
        animate: true
      });
    }

    if (navItems !== prevProps.navItems) {
      this.updateNavItemMarkers();
    }

    if (waypoints !== prevProps.waypoints ||
        flightPlans !== prevProps.flightPlans) {
      this.updateFlightPlans();
    }

    if (overlays !== prevProps.overlays) {
      this.updateOverlays();
    }

    this.updateLocationHash();
  }

  updateOverlays() {
    const { overlays } = this.props;
    var self = this;

    Object.keys(this.overlays)
      .forEach(function (overlay) {
        overlays.indexOf(overlay) === -1 ?
          self.map.removeLayer(self.overlays[overlay])
        : self.overlays[overlay].addTo(self.map);
      });
  }

  updateView() {
    const { dispatch, center, zoom } = this.props;
    var centerLatLng = this.map.getCenter();
    var prevCenterLatLng = L.latLng(center);

    if (!prevCenterLatLng.equals(centerLatLng) && zoom !== this.map.getZoom()) {
      dispatch(setMapView(
        this.map.getZoom(),
        centerLatLng.lat,
        centerLatLng.lng
      ));
    }
    else if (!prevCenterLatLng.equals(centerLatLng)) {
      dispatch(setMapCenter(
        centerLatLng.lat,
        centerLatLng.lng
      ));
    }
    else if (zoom !== this.map.getZoom()) {
      dispatch(setMapZoom(
        this.map.getZoom()
      ));
    }
  }

  updateViewFromLocationHash() {
    const { zoom, center, dispatch } = this.props;
    const hash = window.location.hash.replace('#', '');

    if (!hash.length) return;

    var parts = hash.split('/');

    var _zoom = parseInt(parts[0] || zoom);
    var lat = parseFloat(parts[1] || center[0]);
    var lon = parseFloat(parts[2] || center[1]);

    dispatch(setMapView(_zoom, lat, lon));
  }

  updateLocationHash() {
    const { center, zoom } = this.props;
    window.location.hash = '#' + zoom + '/' + center.join('/');
  }

  requestGeoSearch() {
    const { dispatch } = this.props;

    if (this.map.getZoom() < c.MAP_MIN_ZOOM_NAV_ITEMS_VISIBLE) {
      return;
    }

    var bounds = this.map.getBounds();
    dispatch(requestGeoSearchResults([
      bounds.getNorth(),
      bounds.getEast(),
      bounds.getSouth(),
      bounds.getWest()]
    ));
  }

  updateNavItemMarkers() {
    if (this.map.getZoom() < c.MAP_MIN_ZOOM_NAV_ITEMS_VISIBLE) {
      this.clearNavItemMarkers();
      return;
    }

    this.createNavItemMarkers();
    this.cleanupNavItemMarkers();
  }

  clearNavItemMarkers() {
    var self = this;

    function deleteFrom(collection, layerGroup) {
      return function (id) {
        var marker = collection[id] || null;
        if (marker) {
          layerGroup.removeLayer(marker);
        }
        delete collection[id];
      };
    }

    Object.keys(this.markers.airports)
      .forEach(deleteFrom(this.markers.airports, this.overlays.airports));

    Object.keys(this.markers.navaids)
      .forEach(deleteFrom(this.markers.navaids, this.overlays.navaids));

    Object.keys(this.markers.fixes)
      .forEach(deleteFrom(this.markers.fixes, this.overlays.fixes));

    Object.keys(this.markers.airways)
      .forEach(deleteFrom(this.markers.airways, this.overlays.airways));
  }

  cleanupNavItemMarkers() {
    const { navItems } = this.props;
    var zoom = this.map.getZoom();
    var self = this;
    var getId = flow(property('id'), toString);

    function deleteFrom(collection, layerGroup) {
      return function (id) {
        var marker = collection[id] || null;
        if (marker) {
          layerGroup.removeLayer(marker);
        }
        delete collection[id];
      };
    }

    function filterBigAirport(airport) {
      return (zoom > c.MAP_MIN_ZOOM_NAV_ITEMS_VISIBLE);
    }

    function filterAirport(airport) {
      if (zoom <= c.MAP_LOD_2_ZOOM && zoom > c.MAP_LOD_3_ZOOM) {
        // hide Airstrips
        return !(airport.type === 1 &&
            airport.runways.length === 1 &&
            airport.runways[0].type > 2);
      }
      else if (zoom <= c.MAP_LOD_3_ZOOM) {
        // only show big airports
        return airport.runways.length > 2;
      }

      // hide everything below LOD 4
      return true;
    }

    function filterNavaid(navaid) {
      return zoom > c.MAP_LOD_3_ZOOM;
    }

    function filterFix(fix) {
      return zoom > c.MAP_LOD_3_ZOOM;
    }

    function filterLowAirway(airway) {
      if (zoom <= c.MAP_LOD_2_ZOOM) {
        return airway.type === 2;
      }

      return true;
    }

    function filterAirway(airway) {
      return zoom > c.MAP_LOD_3_ZOOM;
    }

    function hideMarkerIn(collection) {
      return function (id) {
        var marker = collection[id] || null;
        if (marker) {
          marker.setOpacity(0);
        }

        return id;
      };
    }

    function showMarkerIn(collection) {
      return function (id) {
        var marker = collection[id] || null;
        if (marker) {
          marker.setOpacity(1);
        }

        return id;
      }
    }

    var airportIds = navItems.airports
      .filter(filterBigAirport)
      .map(getId);

    var navaidIds = navItems.navaids
      .filter(filterNavaid)
      .map(getId);

    var fixIds = navItems.fixes
      .filter(filterFix)
      .map(getId);

    var airwayIds = navItems.airways
      .filter(filterAirway)
      .filter(filterLowAirway)
      .map(getId);

    var prevAirportIds = Object.keys(this.markers.airports);
    var prevNavaidIds = Object.keys(this.markers.navaids);
    var prevFixIds = Object.keys(this.markers.fixes);
    var prevAirwayIds = Object.keys(this.markers.airways);

    var airportsToDelete = without.apply(null, [prevAirportIds].concat(airportIds));
    airportsToDelete
      .forEach(deleteFrom(this.markers.airports, this.overlays.airports));

    var navaidsToDelete = without.apply(null, [prevNavaidIds].concat(navaidIds));
    navaidsToDelete
      .forEach(deleteFrom(this.markers.navaids, this.overlays.navaids));

    var fixesToDelete = without.apply(null, [prevFixIds].concat(fixIds));
    fixesToDelete
      .forEach(deleteFrom(this.markers.fixes, this.overlays.fixes));

    var airwaysToDelete = without.apply(null, [prevAirwayIds].concat(airwayIds));
    airwaysToDelete
      .forEach(deleteFrom(this.markers.airways, this.overlays.airways));

    navItems.airports
      .filter(negate(filterAirport))
      .map(getId)
      .forEach(hideMarkerIn(this.markers.airports));

    navItems.airports
      .filter(filterAirport)
      .map(getId)
      .forEach(showMarkerIn(this.markers.airports));
  }

  createNavItemMarkers() {
    var self = this;
    const { navItems } = this.props;

    function createIn(type, collection, layerGroup) {
      return function (item) {
        var marker = collection[item.id];
        if (!marker) {
          marker = Markers[type](item);
          collection[item.id] = marker;
          marker.addTo(layerGroup);
        }

        return marker;
      }
    }

    navItems.airports
      .forEach(createIn('airport', this.markers.airports, this.overlays.airports));

    navItems.navaids
      .forEach(createIn('navaid', this.markers.navaids, this.overlays.navaids));

    navItems.fixes
      .forEach(createIn('fix', this.markers.fixes, this.overlays.fixes));

    navItems.airways
      .forEach(createIn('airway', this.markers.airways, this.overlays.airways));
  }

  updateFlightPlans() {
    this.createFlightPlans();
    this.cleanupFlightPlans();
    this.createWaypoints();
    this.cleanupWaypoints();
  }

  createFlightPlans() {
    var self = this;
    const { flightPlans, waypoints } = this.props;

    function create(id) {
      var flightPlan = flightPlans[id];
      var marker = self.markers.flightPlans[id];
      var _waypoints = waypointsForFlightPlan(id, waypoints);

      // create if needed
      if (!marker) {
        marker = Markers.flightPlan(flightPlan, _waypoints);
        self.markers.flightPlans[id] = marker;
        marker.addTo(self.overlays.flightPlans);
      } // update latLngs
      else {
        marker.setLatLngs(_waypoints.map(navItemLatLng));
      }
    }

    Object.keys(flightPlans).forEach(create);
  }

  cleanupFlightPlans() {
    const { flightPlans } = this.props;
    var self = this;

    function remove(id) {
      var marker = self.markers.flightPlans[id] || null;
      if (marker) {
        self.overlays.flightPlans.removeLayer(marker);
      }
      delete self.markers.flightPlans[id];
    }

    var flightPlanIds = Object.keys(flightPlans);
    var prevFlightPlanIds = Object.keys(self.overlays.flightPlans);
    var flightPlansToDelete = without.apply(null, [prevFlightPlanIds].concat(flightPlanIds));
    flightPlansToDelete.forEach(remove);
  }

  clearFlightPlans() {
    var self = this;

    Object.keys(this.markers.flightPlans)
      .forEach(function (id) {
        var marker = self.markers.flightPlans[id];
        if (marker) {
          self.overlays.flightPlans.removeLayer(marker);
        }
        delete self.markers.flightPlans[id];
      });
  }

  createWaypoints() {
    const { waypoints, flightPlans } = this.props;
    var self = this;

    function create(id) {
      var waypoint = waypoints[id];
      var flightPlanId =  waypoint.flightPlanId;
      var flightPlan = flightPlans[flightPlanId];
      var latLng = L.latLng(waypoint.lat, waypoint.lon);

      var marker = self.markers.waypoints[id] || null;

      // create marker if needed
      if (!marker) {
        marker = Markers.waypoint(flightPlan, waypoint);
        marker.addTo(self.overlays.waypoints);
        self.markers.waypoints[id] = marker;

        // attach dragend handler to gps waypoints
        if (!marker.navItem) {
          marker.on('dragend', partial(self.handleWaypointDrag.bind(self), id));
        }
      } // update lat lng of marker it nessecary
      else if (!latLng.equals(marker.getLatLng())){
        marker.setLatLng(latLng);
      }
    }

    Object.keys(waypoints).forEach(create);
  }

  cleanupWaypoints() {
    const { waypoints } = this.props;
    var self = this;

    function remove(id) {
      var marker = self.markers.waypoints[id];
      if (marker) {
        self.overlays.waypoints.removeLayer(marker);
      }

      delete self.markers.waypoints[id];
    }

    var waypointIds = Object.keys(waypoints);
    var prevWaypointIds = Object.keys(this.markers.waypoints);
    var waypointsToDelete = without.apply(null, [prevWaypointIds].concat(waypointIds));
    waypointsToDelete.forEach(remove);
  }

  clearWaypoints(flightPlandId) {
    var self = this;

    Object.keys(this.markers.waypoints)
      .forEach(function (id) {
        var marker = self.markers.waypoints[id];
        if (marker) {
          self.overlays.waypoints.removeLayer(marker);
        }

        delete self.markers.waypoints[id];
      });
  }

  handleClick(event) {
    var target = event.target;
    if (!target || !target.dataset) return;

    if (typeof target.dataset.addAsWaypoint !== 'undefined') {
      this.addNavItemAsWaypoint(target.dataset.type, parseInt(target.dataset.id));
    }
  }

  handleWaypointDrag(id, event) {
    const { dispatch } = this.props;
    var latLng = event.target.getLatLng();

    dispatch(setWaypointLatLon(id, latLng.lat, latLng.lng));
  }

  navItemById(type, id) {
    const { navItems } = this.props;
    var items = [];

    switch(type) {
      case 'airport':
        items = navItems.airports;
        break;
      case 'navaid':
        items = navItems.navaids;
        break;
      case 'fix':
        items = navItems.fixes;
        break;
      case 'airway':
        items = navItems.airways;
        break;
    }

    var i = 0;
    while(i < items.length) {
      if (items[i].id === id) {
        return items[i];
      }
      i++;
    }
    return null;
  }

  addNavItemAsWaypoint(type, id) {
    const { activeFlightPlanId, dispatch } = this.props;
    const navItem = this.navItemById(type, id);
    if (!navItem) return;

    dispatch(addNavItemAsWaypoint(activeFlightPlanId, navItem));
  }

  render() {
    const { activeNavItem, center, zoom, baseLayer } = this.props;

    return (
      <div
        ref="container"
        className="main-map"
        onClick={this.handleClick.bind(this)} />
    );
  }
};

const mapStateToProps = (state) => {
  return {
    activeFlightPlanId: state.activeFlightPlanId,
    activeNavItem: state.activeNavItem,
    center: state.map.center || [0, 0],
    zoom: state.map.zoom || 10,
    baseLayer: state.map.baseLayer || c.MAP_BASE_LAYER_DEFAULT,
    overlays: state.map.overlays || c.MAP_OVERLAYS_DEFAULT,
    navItems: state.geoSearch.results || { airports: [], navaids: [], fixes: [] },
    waypoints: state.waypoints || {},
    flightPlans: state.flightPlans || {}
  };
};

export default connect(mapStateToProps)(Map);
