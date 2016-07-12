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

  getDefaultProps() {
    return {
      center: [0, 0],
      zoom: 10,
      baseLayer: 'osm'
    };
  }

  componentDidMount() {
    const { activeNavItem, center, zoom, baseLayer, dispatch } = this.props;

    this.map = L.map(this.refs.container, {
      center: center,
      zoom: zoom,
      maxZoom: 20,
      minZoom: 2
    });

    // add baselayers
    this.baseLayers = BaseLayers;
    this.baseLayers[baseLayer].addTo(this.map);
    this.navItemMarkers = {
      airports: {},
      navaids: {},
      fixes: {},
      airways: {}
    };
    this.waypointMarkers = {};
    this.waypointLines = {};

    this.map.zoomControl.setPosition('topright');

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

    function deleteFrom(collection) {
      return function (id) {
        var marker = collection[id] || null;
        if (marker) {
          self.map.removeLayer(marker);
        }
        delete collection[id];
      };
    }

    var airportIds = navItems.airports.map(getId);
    var navaidIds = navItems.navaids.map(getId);
    var fixIds = navItems.fixes.map(getId);

    var prevAirportIds = Object.keys(this.navItemMarkers.airports);
    var prevNavaidIds = Object.keys(this.navItemMarkers.navaids);
    var prevFixIds = Object.keys(this.navItemMarkers.fixes);
    
    without.apply(null, [prevAirportIds].concat(airportIds))
      .forEach(deleteFrom(this.navItemMarkers.airports));

    without.apply(null, [prevNavaidIds].concat(navaidIds))
      .forEach(deleteFrom(this.navItemMarkers.navaids));

    without.apply(null, [prevFixIds].concat(fixIds))
      .forEach(deleteFrom(this.navItemMarkers.fixes));
  }

  createNavItemMarkers() {
    var self = this;
    const { navItems } = this.props;

    navItems.airports.forEach((airport) => {
      var marker = self.navItemMarkers.airports[airport.id];
      if (!marker) {
        marker = self.createNavItemMarker('airport', airport);
        self.navItemMarkers.airports[airport.id] = marker;
        marker.addTo(self.map);
      }

      return marker;
    });

    navItems.navaids.forEach((navaid) => {
      var marker = self.navItemMarkers.navaids[navaid.id];
      if (!marker) {
        marker = self.createNavItemMarker('navaid', navaid);
        self.navItemMarkers.navaids[navaid.id] = marker;
        marker.addTo(self.map);
      }

      return marker;
    });

    navItems.fixes.forEach((fix) => {
      var marker = self.navItemMarkers.fixes[fix.id];
      if (!marker) {
        marker = self.createNavItemMarker('fix', fix);
        self.navItemMarkers.fixes[fix.id] = marker;
        marker.addTo(self.map);
      }

      return marker;
    });
  }

  createNavItemMarker(type, navItem) {
    var latLng = L.latLng(navItem.lat, navItem.lon);
    var marker = L.marker(latLng);

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
