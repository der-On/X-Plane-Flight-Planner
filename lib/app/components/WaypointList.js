import React from 'react';
import {List} from 'material-ui/List';
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
      <List className="waypoints-list">
        {waypoints.map(this.renderItem)}
      </List>
    );
  }
};
