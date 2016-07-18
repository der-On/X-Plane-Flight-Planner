import React from 'react';
import {ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import NavItemIcon from './NavItemIcon';
import { connect } from 'react-redux'
import padStart from 'lodash/padStart';
import round from 'lodash/round';
import {
  locateNavItem,
  setWaypointElevation,
  removeWaypoint,
  addWaypointAt
} from '../state/actions';

class WaypointListItem extends React.Component {
  title(waypoint) {
    return waypoint.navItem ?
      [waypoint.navItem.icao || '', waypoint.navItem.name || '', waypoint.navItem.identifier || '']
        .join(' ')
        .trim()
    : waypoint.name || 'GPS point';
  }

  handleTitleClick() {
    const { waypoint, dispatch } = this.props;
    dispatch(locateNavItem(waypoint.navItem || waypoint));
  }

  handleElevationChange(event) {
    const { waypoint, dispatch } = this.props;
    dispatch(setWaypointElevation(waypoint.id, parseInt(event.target.value)));
  }

  handleDeleteClick() {
    const { waypoint, dispatch } = this.props;
    const removedWaypoint = Object.assign({}, waypoint);

    function undo() {
      dispatch(addWaypointAt(removedWaypoint, removedWaypoint.index - 1));
    }

    dispatch(removeWaypoint(waypoint.id, undo));
  }


  render() {
    const { waypoint } = this.props;

    return (
      <div className="waypoints-list__waypoint">
        <ListItem
          rightIcon={<ActionDelete onClick={this.handleDeleteClick.bind(this)} />} >
          <div
            className="waypoint__title"
            onClick={this.handleTitleClick.bind(this)}>
            {padStart((waypoint.index + 1).toString(), 2, '0')}
            <NavItemIcon className="waypoint__icon" navItem={waypoint.navItem || waypoint} />
            {this.title(waypoint)}
          </div>
          <div className="waypoint__details">
            lat: {round(waypoint.lat, 4)}, lon: {round(waypoint.lon, 4)}<br/>
            fly at: <TextField
              className='waypoint__elevation'
              type="number"
              step="1"
              value={waypoint.elevation}
              onChange={this.handleElevationChange.bind(this)}
            /> ft
          </div>
        </ListItem>
        <Divider />
      </div>
    );
  }
}

export default connect()(WaypointListItem);
