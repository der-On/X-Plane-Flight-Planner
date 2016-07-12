import L from 'leaflet';
import React from 'react';
import { connect } from 'react-redux'
import BaseLayers from './BaseLayers';
import Icons from './Icons';
import { requestGeoSearchResults, setMapCenter, setMapZoom } from '../../state/actions';
import debounce from 'lodash/debounce';
import without from 'lodash/without';
import property from 'lodash/property';
import flow from 'lodash/flow';
import toString from 'lodash/toString';

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
      maxZoom: 20,
      minZoom: 2
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
      navaids: L.layerGroup(),
      fixes: L.layerGroup(),
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
    this.bindMapEvents();
  }

  bindMapEvents() {
    var self = this;
    var events = ['resize', 'dragend', 'moveend', 'zoomend'];

    function handler() {
      const { center, zoom } = self.props;
      var centerLatLng = L.latLng(center);

      self.requestGeoSearch();

      if (self.map.getZoom() !== zoom) {
        self.updateZoom();
      }

      if (!centerLatLng.equals(self.map.getCenter())) {
        self.updateCenter();
      }
    }

    var debouncedHandler = debounce(handler, 1000);

    function attach(event) {
      self.map.on(event, debouncedHandler);
    }

    events.forEach(attach);
  }

  componentDidUpdate(prevProps) {
    const { activeNavItem, center, zoom, baseLayer, navItems, waypoints, flightPlans } = this.props;
    var bounds;
    var centerLatLng = L.latLng(center);
    var prevCenterLatLng = L.latLng(prevProps.center);

    if (prevProps.baseLayer !== baseLayer) {
      this.map.removeLayer(this.baseLayers[prevProps.baseLayer]);
      this.map.addLayer(this.baseLayers[baseLayer || this.getDefaultProps().baseLayer]);
    }

    if (!centerLatLng.equals(prevCenterLatLng) ||
        prevProps.zoom !== zoom) {
      this.map.setView(centerLatLng, zoom, {
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
  }

  updateZoom() {
    const { dispatch } = this.props;
    dispatch(setMapZoom(this.map.getZoom()));
  }

  updateCenter() {
    const { dispatch } = this.props;
    var centerLatLng = this.map.getCenter();
    dispatch(setMapCenter(
      centerLatLng.lat,
      centerLatLng.lng
    ));
  }

  requestGeoSearch() {
    const { dispatch } = this.props;
    var bounds = this.map.getBounds();
    dispatch(requestGeoSearchResults([
      bounds.getNorth(),
      bounds.getEast(),
      bounds.getSouth(),
      bounds.getWest()]
    ));
  }

  updateNavItemMarkers() {
    this.createNavItemMarkers();
    this.clearNavItemMarkers();
  }

  clearNavItemMarkers() {
    const { navItems } = this.props;
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

    var airportIds = navItems.airports.map(getId);
    var navaidIds = navItems.navaids.map(getId);
    var fixIds = navItems.fixes.map(getId);

    var prevAirportIds = Object.keys(this.markers.airports);
    var prevNavaidIds = Object.keys(this.markers.navaids);
    var prevFixIds = Object.keys(this.markers.fixes);

    var airportsToDelete = without.apply(null, [prevAirportIds].concat(airportIds));
    airportsToDelete
      .forEach(deleteFrom(this.markers.airports, this.layerGroups.airports));

    var navaidsToDelete = without.apply(null, [prevNavaidIds].concat(navaidIds));
    navaidsToDelete
      .forEach(deleteFrom(this.markers.navaids, this.layerGroups.navaids));

    var fixesToDelete = without.apply(null, [prevFixIds].concat(fixIds));
    fixesToDelete
      .forEach(deleteFrom(this.markers.fixes, this.layerGroups.fixes));
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
  }

  createNavItemMarker(type, navItem) {
    var zIndexes = {
      airport: 3000,
      navaid: 2000,
      fix: 1000,
      airway: -1000
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
