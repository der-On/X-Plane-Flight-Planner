import React from 'react';
import { connect } from 'react-redux';
import waypointsForFlightPlan from '../../utils/waypoints_for_flight_plan';
import distance from '../../utils/distance';
import duration from '../../utils/duration';
import fuel from '../../utils/fuel';
import bearing from '../../utils/bearing';
import formatDistance from '../../utils/format_distance';
import formatDuration from '../../utils/format_duration';
import formatFuel from '../../utils/format_fuel';
import formatHeading from '../../utils/format_heading';

function navItemLatLng(navItem) {
  return [navItem.lat, navItem.lon];
}

class WaypointTotals extends React.Component {
  render() {
    const { waypoint, waypoints, flightPlans } = this.props;
    const flightPlan = flightPlans[waypoint.flightPlanId];
    const _waypoints = waypointsForFlightPlan(flightPlan.id, waypoints);
    const nextWaypoint = _waypoints[waypoint.index + 1] || null;
    var _distance = 0;
    var _duration = 0;
    var _consumption = 0;
    var _bearing = 0;

    if (nextWaypoint) {
      const latLngs = [waypoint, nextWaypoint].map(navItemLatLng);
      _distance = distance(latLngs);
      _duration = duration(_distance, flightPlan.cruiseSpeed);
      _consumption = fuel(_duration, flightPlan.fuelConsumption);
      _bearing = bearing(latLngs[0], latLngs[1]);
    }

    return (
      <div className="waypoint__totals">
        Distance: {formatDistance(_distance)} |
        Duration: {formatDuration(_duration)}<br/>
        Fuel: {formatFuel(_consumption)}<br/>
        Bearing: {formatHeading(_bearing)}
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

export default connect(mapStateToProps)(WaypointTotals);
