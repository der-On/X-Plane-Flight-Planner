import React from 'react';
import {List} from 'material-ui/List';
import WaypointListItem from './WaypointListItem';
import FlightPlanTotals from './FlightPlanTotals';

export default class WaypointList extends React.Component {
  renderItem(waypoint) {
    return (
      <WaypointListItem
        key={waypoint.id}
        waypoint={waypoint} />
    );
  }

  renderEmpty() {
    return (
      <p className="waypoints-list__empty">
        This flight plan has no waypoints yet.<br />
        Add new waypoints by double clicking on the map or
        by clicking on a marker on the map and then hitting "add as waypoint".
      </p>
    );
  }

  render() {
    const { waypoints, flightPlan } = this.props;

    return (
      <List className="waypoints-list">
        {waypoints.length ?
          waypoints.map(this.renderItem)
        : this.renderEmpty()}

        <FlightPlanTotals flightPlan={flightPlan} />
      </List>
    );
  }
};
