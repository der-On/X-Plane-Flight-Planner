import React from 'react';
import Search from './Search';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux'
import filter from 'lodash/filter';
import WaypointList from './WaypointList';
import FlightPlanList from './FlightPlanList';
import FlightPlanSettings from './FlightPlanSettings';
import {
  toggleSidebar,
  toggleMenu,
  setSidebarContext
} from '../state/actions';
import {
  SIDEBAR_CONTEXT_FLIGHT_PLAN,
  SIDEBAR_CONTEXT_FLIGHT_PLANS,
  SIDEBAR_CONTEXT_WAYPOINTS,
  SIDEBAR_CONTEXT_DEFAULT
} from '../constants';

export default class Sidebar extends React.Component {
  handleSidebarToggleClick() {
    const { dispatch } = this.props;
    dispatch(toggleSidebar());
  }

  handleMenuToggleClick() {
    const { dispatch } = this.props;
    dispatch(toggleMenu());
  }

  setContextHandler(context) {
    const { dispatch } = this.props;

    return function () {
      dispatch(setSidebarContext(context));
    };
  }

  render() {
    const { expanded, context, waypoints, flightPlans, activeFlightPlan } = this.props;

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
        <div className="main-sidebar__subheader">
          <RaisedButton
            className="main-sidebar__waypoints-button"
            label="Waypoints"
            primary={(context === SIDEBAR_CONTEXT_WAYPOINTS)}
            onClick={this.setContextHandler(SIDEBAR_CONTEXT_WAYPOINTS)} />
          <RaisedButton
            className="main-sidebar__flight-plans-button"
            label="Flight Plans"
            primary={(context === SIDEBAR_CONTEXT_FLIGHT_PLANS || context === SIDEBAR_CONTEXT_FLIGHT_PLAN)}
            onClick={this.setContextHandler(SIDEBAR_CONTEXT_FLIGHT_PLANS)} />
        </div>
        {context === SIDEBAR_CONTEXT_WAYPOINTS ?
          <WaypointList
            waypoints={waypoints}
            flightPlan={activeFlightPlan} />
        : null}
        {context === SIDEBAR_CONTEXT_FLIGHT_PLANS ?
          <FlightPlanList flightPlans={flightPlans} />
        : null}

        {context === SIDEBAR_CONTEXT_FLIGHT_PLAN ?
           activeFlightPlan ?
            <FlightPlanSettings flightPlan={activeFlightPlan} />
          : <FlightPlanList flightPlans={flightPlans} />
        : null}
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

function getFlightPlans(state) {
  return filter(state.flightPlans, function () {
    return true;
  });
}

const mapStateToProps = (state) => {
  return {
    expanded: state.sidebar.expanded,
    menuExpanded: state.menu.expanded,
    waypoints: getWaypoints(state),
    flightPlans: getFlightPlans(state),
    activeFlightPlan: state.flightPlans[state.activeFlightPlanId],
    activeFlightPlanId: state.activeFlightPlanId,
    context: state.sidebar.context || SIDEBAR_CONTEXT_DEFAULT
  };
};

export default connect(mapStateToProps)(Sidebar);
