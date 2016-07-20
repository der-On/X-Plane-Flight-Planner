import React from 'react';
import { connect } from 'react-redux';
import waypointsForFlightPlan from '../../utils/waypoints_for_flight_plan';
import distance from '../../utils/distance';
import duration from '../../utils/duration';
import fuel from '../../utils/fuel';
import formatDistance from '../../utils/format_distance';
import formatDuration from '../../utils/format_duration';
import formatFuel from '../../utils/format_fuel';

function navItemLatLng(navItem) {
  return [navItem.lat, navItem.lon];
}

class FlightPlanTotals extends React.Component {
  render() {
    const { waypoints, flightPlan } = this.props;
    const _waypoints = waypointsForFlightPlan(flightPlan.id, waypoints);
    const _distance = distance(_waypoints.map(navItemLatLng));
    const _duration = duration(_distance, flightPlan.cruiseSpeed);
    const _consumption = fuel(_duration, flightPlan.fuelConsumption);
    
    return (
      <div className="flight-plan__totals">
        {_waypoints.length} Waypoints<br/>
        Distance: {formatDistance(_distance)} |
        Duration: {formatDuration(_duration)}<br/>
        Fuel: {formatFuel(_consumption)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    waypoints: state.waypoints
  };
}

export default connect(mapStateToProps)(FlightPlanTotals);
