import L from 'leaflet';
import React from 'react';
import { connect } from 'react-redux'
import BaseLayers from './BaseLayers';
import Icons from './Icons';
import { requestGeoSearchResults, setMapView, setMapZoom, setMapCenter } from '../../state/actions';
import debounce from 'lodash/debounce';
import without from 'lodash/without';
import property from 'lodash/property';
import flow from 'lodash/flow';
import negate from 'lodash/negate';
import toString from 'lodash/toString';
import * as c from '../../state/constants';

window.L = L;
require('leaflet.markercluster');

function cluster(type) {
  return new L.MarkerClusterGroup({
    maxClusterRadius: 30,
    showCoverageOnHover: false,
    disableClusteringAtZoom: c.MAP_LOD_1_ZOOM,
    removeOutsideVisibleBounds: true
  });
}

class Map extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { activeNavItem, center, zoom, baseLayer, dispatch } = this.props;

    // create and configure map
    this.map = L.map(this.refs.container, {
      center: center,
      zoom: zoom,
      maxZoom: c.MAP_MAX_ZOOM,
      minZoom: c.MAP_MIN_ZOOM
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
      waypoints: {}
    };

    this.layerGroups = {
      airports: L.layerGroup(),
      navaids: cluster('navaids'),
      fixes: cluster('fixes'),
      airways: L.layerGroup(),
      waypoints: L.layerGroup(),
      aircraft: L.layerGroup()
    };

    this.layerGroups.airways.addTo(this.map);
    this.layerGroups.fixes.addTo(this.map);
    this.layerGroups.navaids.addTo(this.map);
    this.layerGroups.airports.addTo(this.map);
    this.layerGroups.waypoints.addTo(this.map);
    this.layerGroups.aircraft.addTo(this.map);

    // initially load nav items
    this.requestGeoSearch();

    this.updateNavItemMarkers();
    this.updateWaypoints();
    this.updateLocationHash();
    this.bindMapEvents();
  }

  bindMapEvents() {
    var self = this;
    var events = ['resize', 'dragend', 'moveend', 'zoomend'];

    function handler() {
      self.updateView();
      self.requestGeoSearch();
    }

    var debouncedHandler = debounce(handler, 250);

    function attach(event) {
      self.map.on(event, debouncedHandler);
    }

    events.forEach(attach);
  }

  componentDidUpdate(prevProps) {
    const { activeNavItem, center, zoom, baseLayer, navItems, waypoints, flightPlans } = this.props;
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
    else if (centerLatLng.equals(prevCenterLatLng)) {
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
      this.updateWaypointMarkers();
    }

    this.updateLocationHash();
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
      .forEach(deleteFrom(this.markers.airports, this.layerGroups.airports));

    Object.keys(this.markers.navaids)
      .forEach(deleteFrom(this.markers.navaids, this.layerGroups.navaids));

    Object.keys(this.markers.fixes)
      .forEach(deleteFrom(this.markers.fixes, this.layerGroups.fixes));

    Object.keys(this.markers.airways)
      .forEach(deleteFrom(this.markers.airways, this.layerGroups.airways));
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
      return zoom <= c.MAP_LOD_3_ZOOM;
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
      //.filter(filterAirport)
      .map(getId);

    var navaidIds = navItems.navaids
      .filter(filterNavaid)
      .map(getId);

    var fixIds = navItems.fixes
      .filter(filterFix)
      .map(getId);

    var airwayIds = navItems.airways
      .filter(filterAirway)
      .map(getId);

    var prevAirportIds = Object.keys(this.markers.airports);
    var prevNavaidIds = Object.keys(this.markers.navaids);
    var prevFixIds = Object.keys(this.markers.fixes);
    var prevAirwayIds = Object.keys(this.markers.airways);

    var airportsToDelete = without.apply(null, [prevAirportIds].concat(airportIds));
    airportsToDelete
      .forEach(deleteFrom(this.markers.airports, this.layerGroups.airports));

    var navaidsToDelete = without.apply(null, [prevNavaidIds].concat(navaidIds));
    navaidsToDelete
      .forEach(deleteFrom(this.markers.navaids, this.layerGroups.navaids));

    var fixesToDelete = without.apply(null, [prevFixIds].concat(fixIds));
    fixesToDelete
      .forEach(deleteFrom(this.markers.fixes, this.layerGroups.fixes));

    var airwaysToDelete = without.apply(null, [prevAirwayIds].concat(airwayIds));
    airwaysToDelete
      .forEach(deleteFrom(this.markers.airways, this.layerGroups.airways));

    navItems.airports
      .filter(negate(filterAirport))
      .map(getId)
      .forEach(hideMarkerIn(this.markers.airports));

    navItems.airports
      .filter(filterAirport)
      .map(getId)
      .forEach(showMarkerIn(this.markers.airports));

    navItems.airways
      .filter(negate(filterLowAirway))
      .map(getId)
      .forEach(hideMarkerIn(this.markers.airways));

    navItems.airways
      .filter(filterLowAirway)
      .map(getId)
      .forEach(showMarkerIn(this.markers.airways));
  }

  createNavItemMarkers() {
    var self = this;
    const { navItems } = this.props;

    function createIn(type, collection, layerGroup) {
      return function (item) {
        var marker = collection[item.id];
        if (!marker) {
          marker = self.createNavItemMarker(type, item);
          collection[item.id] = marker;
          marker.addTo(layerGroup);
        }

        return marker;
      }
    }

    navItems.airports
      .forEach(createIn('airport', this.markers.airports, this.layerGroups.airports));

    navItems.navaids
      .forEach(createIn('navaid', this.markers.navaids, this.layerGroups.navaids));

    navItems.fixes
      .forEach(createIn('fix', this.markers.fixes, this.layerGroups.fixes));

    /*navItems.airways
      .forEach((airway) => {
        var group = self.markers.airways[airway.id] || null;
        if (!group) {
          group = L.layerGroup([
            self.createAirwayMarker(airway, airway.fromLat, airway.fromLon),
            self.createAirwayMarker(airway, airway.toLat, airway.toLon),
            self.createAirwayLine(airway)
          ]);

          group.addTo(self.layerGroups.airways);
        }

        return group;
      });*/
  }

  createAirwayMarker(airway, lat, lon) {
    var latLng = L.latLng(lat, lon);
    var marker = L.marker(latLng, {
      icon: Icons.airway(airway),
      zIndexOffset: -1000
    });

    return marker;
  }

  createAirwayLine(airway) {
    var line = L.polyline([
      [airway.fromLat, airway.fromLon],
      [airway.toLat, airway.toLon]
    ], {
      //dashArray: '5, 5',
      clickable: false,
      color: airway.type === 2 ? '#4f6f3e' : '#3161a4'
    });

    return line;
  }

  createNavItemMarker(type, navItem) {
    var zIndexes = {
      airport: 3000,
      navaid: 2000,
      fix: 1000
    };
    var latLng = L.latLng(navItem.lat, navItem.lon);
    var marker = L.marker(latLng, {
      icon: Icons[type](navItem),
      zIndexOffset: zIndexes[type] || 0
    });

    return marker;
  }

  updateWaypoints() {
    this.clearWaypointMarkers();
    this.clearWaypointLines();
  }

  createWaypointMarker(waypoint) {
    var latLng = L.latLng(waypoint.lat, waypoint.lon);
    var marker = L.marker(latLng);

    return marker;
  }

  clearWaypointMarkers() {
    /*this.waypointMarkers
      .forEach(this.removeMarker.bind(this));
    this.waypointMarkers = [];*/
  }

  clearWaypointLines() {
    /*this.waypointLines
      .forEach(this.removeMarker.bind(this));
    this.waypointLines = [];*/
  }

  render() {
    const { activeNavItem, center, zoom, baseLayer } = this.props;

    return (
      <div
        ref="container"
        className="main-map">
      </div>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    activeNavItem: state.activeNavItem,
    center: state.map.center || [0, 0],
    zoom: state.map.zoom || 10,
    baseLayer: state.map.baseLayer || 'osm',
    navItems: state.geoSearch.results || { airports: [], navaids: [], fixes: [] },
    waypoints: state.waypoints || {},
    flightPlans: state.flightPlans || {}
  };
};

export default connect(mapStateToProps)(Map);
