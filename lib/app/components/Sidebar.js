import React from 'react';
import Search from './Search';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { connect } from 'react-redux'
import filter from 'lodash/filter';
import WaypointList from './WaypointList';
import {
  toggleSidebar,
  toggleMenu
} from '../state/actions';

export default class Sidebar extends React.Component {
  handleSidebarToggleClick() {
    const { dispatch } = this.props;
    dispatch(toggleSidebar());
  }

  handleMenuToggleClick() {
    const { dispatch } = this.props;
    dispatch(toggleMenu());
  }

  render() {
    const { expanded, menuExpanded, waypoints } = this.props;

    return (
      <Paper
        className={'main-sidebar ' + (expanded ? 'expanded' : 'collapsed')}
        zDepth={2}>
        <header className="main-sidebar__header">
          <IconButton
            className="main-sidebar-toggle"
            tooltip={expanded ? 'collapse sidebar' : 'expand sidebar'}
            tooltipPosition="bottom-right"
            onClick={this.handleSidebarToggleClick.bind(this)}>
            <FontIcon
              className="material-icons">
              {expanded ? 'expand_less' : 'expand_more'}
            </FontIcon>
          </IconButton>
          <Search />
        </header>
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
    menuExpanded: state.menu.expanded,
    waypoints: getWaypoints(state),
    flightPlans: state.flightPlans || {}
  };
};

export default connect(mapStateToProps)(Sidebar);
