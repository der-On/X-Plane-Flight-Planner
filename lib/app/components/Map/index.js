import React from 'react';
import * as ReactLeaflet from 'react-leaflet';
import { connect } from 'react-redux'

class Map extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { activeNavItem, center, zoom, baseLayer } = this.props;

    return (
      <div className="main-map">
        <ReactLeaflet.Map center={center} zoom={zoom}>
          <ReactLeaflet.TileLayer
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </ReactLeaflet.Map>
      </div>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    activeNavItem: state.activeNavItem,
    center: state.map.center,
    zoom: state.map.zoom,
    baseLayer: state.map.baseLayer
  };
};

export default connect(mapStateToProps)(Map);
