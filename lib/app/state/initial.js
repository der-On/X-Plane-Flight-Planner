import FlightPlan from '../../models/FlightPlan';

function InitialState() {
  // TODO: load state from localstorage
  var initalFlightPlan = FlightPlan();
  return {
    flightPlans: {
      [initalFlightPlan.id]: initalFlightPlan
    },
    activeFlightPlanId: initalFlightPlan.id
  };
}

export default InitialState;
