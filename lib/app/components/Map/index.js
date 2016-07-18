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
  addNavItemAsWaypoint
} from '../../state/actions';
import debounce from 'lodash/debounce';
import without from 'lodash/without';
import property from 'lodash/property';
import flow from 'lodash/flow';
import negate from 'lodash/negate';
import toString from 'lodash/toString';
import * as c from '../../state/constants';

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
      flightPlans: {}
    };

    this.layerGroups = {
      airports: L.layerGroup(),
      navaids: Cluster('navaids'),
      fixes: Cluster('fixes'),
      airways: L.layerGroup(),
      flightPlans: L.layerGroup(),
      aircraft: L.layerGroup()
    };

    this.layerGroups.airways.addTo(this.map);
    this.layerGroups.fixes.addTo(this.map);
    this.layerGroups.navaids.addTo(this.map);
    this.layerGroups.airports.addTo(this.map);
    this.layerGroups.flightPlans.addTo(this.map);
    this.layerGroups.aircraft.addTo(this.map);

    // initially load nav items
    this.requestGeoSearch();

    this.updateNavItemMarkers();
    this.updateFlightPlans();
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
      .forEach(createIn('airport', this.markers.airports, this.layerGroups.airports));

    navItems.navaids
      .forEach(createIn('navaid', this.markers.navaids, this.layerGroups.navaids));

    navItems.fixes
      .forEach(createIn('fix', this.markers.fixes, this.layerGroups.fixes));

    navItems.airways
      .forEach(createIn('airway', this.markers.airways, this.layerGroups.airways));
  }

  updateFlightPlans() {

  }

  handleClick(event) {
    var target = event.target;
    if (!target || !target.dataset) return;

    if (typeof target.dataset.addAsWaypoint !== 'undefined') {
      this.addNavItemAsWaypoint(target.dataset.type, parseInt(target.dataset.id));
    }
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
    baseLayer: state.map.baseLayer || 'osm',
    navItems: state.geoSearch.results || { airports: [], navaids: [], fixes: [] },
    waypoints: state.waypoints || {},
    flightPlans: state.flightPlans || {}
  };
};

export default connect(mapStateToProps)(Map);
