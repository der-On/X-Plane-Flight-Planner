import L from 'leaflet';
import React from 'react';
import { connect } from 'react-redux'
import BaseLayers from './BaseLayers';
import Icons from './Icons';
import { requestGeoSearchResults } from '../../state/actions';

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
      airports: [],
      navaids: [],
      fixes: [],
      airways: []
    };
    this.waypointMarkers = [];
    this.waypointLines = [];

    this.map.zoomControl.setPosition('topright');

    // initially load nav items
    this.requestGeoSearch();

    this.updateNavItemMarkers();
    this.updateWaypoints();
    this.bindMapEvents();
  }

  bindMapEvents() {
    var self = this;
    var handler = this.requestGeoSearch.bind(this);
    var events = ['resize', 'dragend', 'moveend', 'zoomend'];
    events.forEach((event) => {
      self.map.on(event, handler);
    });
  }

  componentDidUpdate(prevProps) {
    const { activeNavItem, center, zoom, baseLayer } = this.props;
    var bounds;
    var centerLatLng = L.latLng(center);
    var prevCenterLatLng = L.latLng(prevProps.center);

    if (prevProps.baseLayer !== baseLayer) {
      this.map.removeLayer(this.baseLayers[prevProps.baseLayer]);
      this.map.addLayer(this.baseLayers[baseLayer || this.getDefaultProps().baseLayer]);
    }

    if (!centerLatLng.equals(prevCenterLatLng) || prevProps.zoom !== zoom) {
      this.map.setView(centerLatLng, zoom);
      this.requestGeoSearch();
    }
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

  clearNavItemMarkers() {
    this.navItemMarkers
      .airports
      .forEach(this.removeMarker.bind(this));
    this.navItemMarkers
      .airports = [];

    this.navItemMarkers
      .navaids
      .forEach(this.removeMarker.bind(this));
    this.navItemMarkers
      .navaids = [];

    this.navItemMarkers
      .fixes
      .forEach(this.removeMarker.bind(this));
    this.navItemMarkers
      .fixes = [];
  }

  updateNavItemMarkers() {
    this.clearNavItemMarkers();
    this.createNavItemMarkers();
  }

  updateWaypoints() {
    this.clearWaypointMarkers();
    this.clearWaypointLines();
  }

  removeMarker(marker) {
    this.map.removeLayer(marker);
  }

  createNavItemMarkers() {
    var self = this;
    const { navItems } = this.props;

    this.navItemMarkers.airports = navItems.airports.map((aiport) => {
      var marker = self.createNavItemMarker('airport', airport);
      marker.addTo(self.map);
      return marker;
    });

    this.navItemMarkers.navaids = navItems.navaids.map((navaid) => {
      var marker = self.createNavItemMarker('navaid', navaid);
      marker.addTo(self.map);
      return marker;
    });

    this.navItemMarkers.fixes = navItems.fixes.map((fix) => {
      var marker = self.createNavItemMarker('fix', fix);
      marker.addTo(self.map);
      return marker;
    });
  }

  createNavItemMarker(type, navItem) {
    var latLng = L.latLng(navItem.lat, navItem.lon);
    var marker = L.marker(latLng);

    return marker;
  }

  createWaypointMarker(waypoint) {
    var latLng = L.latLng(waypoint.lat, waypoint.lon);
    var marker = L.marker(latLng);

    return marker;
  }

  clearWaypointMarkers() {
    this.waypointMarkers
      .forEach(this.removeMarker.bind(this));
    this.waypointMarkers = [];
  }

  clearWaypointLines() {
    this.waypointLines
      .forEach(this.removeMarker.bind(this));
    this.waypointLines = [];
  }

  render() {
    const { activeNavItem, center, zoom, baseLayer } = this.props;

    return (
      <div
        ref="container"
        id="main-map"
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
