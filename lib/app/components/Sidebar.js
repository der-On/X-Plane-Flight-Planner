import React from 'react';
import Search from './Search';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux'
import filter from 'lodash/filter';
import WaypointList from './WaypointList';

export default class Sidebar extends React.Component {
  render() {
    const { expanded, waypoints } = this.props;

    return (
      <Paper
        className={'main-sidebar ' + (expanded ? 'expanded' : 'collapsed')}
        zDepth={2}>
        <Search />
        <WaypointList waypoints={waypoints} />
      </Paper>
    );
  }
};

function getWaypoints(state) {
  return filter(state.waypoints, function (waypoint, id) {
    return waypoint.flightPlanId === state.activeFlightPlanId;
  }).sort(function (a, b) {
    if (a.index === b.index) return 0;
    return a.index < b.index ? -1 : 1;
  });
}

const mapStateToProps = (state) => {
  return {
    expanded: state.sidebar.expanded,
    waypoints: getWaypoints(state),
    flightPlans: state.flightPlans || {}
  };
};

export default connect(mapStateToProps)(Sidebar);
