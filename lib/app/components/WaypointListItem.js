import React from 'react';
import {ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import NavItemIcon from './NavItemIcon';
import WaypointTotals from './WaypointTotals';
import { connect } from 'react-redux'
import padStart from 'lodash/padStart';
import round from 'lodash/round';
import {
  locateNavItem,
  setWaypointElevation,
  setWaypointIndex,
  removeWaypoint,
  addWaypointAt
} from '../state/actions';
import waypointsForFlightPlan from '../../utils/waypoints_for_flight_plan';

class WaypointListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalsCollapsed: true
    };
  }

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

  handleSortUp() {
    const { waypoint, dispatch } = this.props;
    dispatch(setWaypointIndex(waypoint.id, waypoint.index - 1.5));
  }

  handleSortDown() {
    const { waypoint, dispatch } = this.props;
    dispatch(setWaypointIndex(waypoint.id, waypoint.index + 1.5));
  }

  handleTotalsToggle() {
    this.setState({
      totalsCollapsed: !this.state.totalsCollapsed
    });
  }

  render() {
    const { waypoint, waypoints } = this.props;

    return (
      <div className="waypoints-list__waypoint">
        <ListItem
          rightIcon={
            <ActionDelete
              title="Remove waypoint"
              onClick={this.handleDeleteClick.bind(this)} />
          } >
          <div className="waypoint__sort">
            {waypoint.index > 0 ?
              <IconButton
                className="waypoint__sort-up"
                style={{position: 'absolute'}}
                tooltip="move up"
                tooltipPosition="bottom-right"
                onClick={this.handleSortUp.bind(this)}>
                <FontIcon className="material-icons">arrow_drop_up</FontIcon>
              </IconButton>
            : null}

            {waypoint.index < waypointsForFlightPlan(waypoint.flightPlanId, waypoints).length - 1 ?
              <IconButton
                className="waypoint__sort-down"
                style={{position: 'absolute'}}
                tooltip="move down"
                tooltipPosition="top-right"
                onClick={this.handleSortDown.bind(this)}>
                <FontIcon className="material-icons">arrow_drop_down</FontIcon>
              </IconButton>
            : null}
          </div>
          <div
            className="waypoint__title"
            title="click to view on map"
            onClick={this.handleTitleClick.bind(this)}>
            {padStart((waypoint.index + 1).toString(), 2, '0')}
            <NavItemIcon className="waypoint__icon" navItem={waypoint.navItem || waypoint} />
            {this.title(waypoint)}
          </div>
          <div className="waypoint__details">
            lat: {round(waypoint.lat, 4)}, lon: {round(waypoint.lon, 4)}<br/>
            fly at: <TextField
              className='waypoint__elevation'
              id={`wapoint-${waypoint.id}-elevation`}
              type="number"
              step="1"
              value={waypoint.elevation}
              onChange={this.handleElevationChange.bind(this)}
            /> ft<br/>

            <FlatButton
              className="waypoint__totals-toggle"
              label="Details"
              icon={
                <FontIcon className="material-icons">
                  { !this.state.totalsCollapsed ? 'arrow_drop_up' : 'arrow_drop_down'}
                </FontIcon>
              }
              onClick={this.handleTotalsToggle.bind(this)} />
          </div>

          {!this.state.totalsCollapsed ?
            <WaypointTotals waypoint={waypoint} />
          : null}
        </ListItem>
        <Divider />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    waypoints: state.waypoints,
    flightPlans: state.flightPlans
  };
}

export default connect(mapStateToProps)(WaypointListItem);
