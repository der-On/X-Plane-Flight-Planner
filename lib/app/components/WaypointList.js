import React from 'react';
import {List} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import WaypointListItem from './WaypointListItem';

export default class WaypointList extends React.Component {
  renderItem(waypoint) {
    return (
      <WaypointListItem
        key={waypoint.id}
        waypoint={waypoint} />
    );
  }

  render() {
    const { waypoints } = this.props;

    return (
      <div className="waypoints-list">
        <Subheader>Waypoints</Subheader>
        <List className="waypoints-list__items">
          {waypoints.map(this.renderItem)}
        </List>
      </div>
    );
  }
};
