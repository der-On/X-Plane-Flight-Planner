var filter = require('lodash/filter');

module.exports = function waypointsForFlightPlan (flightPlanId, waypoints) {
  return filter(waypoints, function (waypoint, id) {
    return waypoint.flightPlanId === flightPlanId;
  }).sort(function (a, b) {
    if (a.index === b.index) return 0;
    return a.index < b.index ? -1 : 1;
  });
};
