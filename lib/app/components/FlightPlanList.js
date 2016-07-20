import React from 'react';
import {List} from 'material-ui/List';
import FlightPlanListItem from './FlightPlanListItem';
import { connect } from 'react-redux'
import {
  setActiveFlightPlan
} from '../state/actions';

class FlightPlanList extends React.Component {
  renderItem(flightPlan) {
    const { activeFlightPlanId } = this.props;

    return (
      <FlightPlanListItem
        key={flightPlan.id}
        flightPlan={flightPlan}
        active={flightPlan.id === activeFlightPlanId} />
    );
  }

  render() {
    const { flightPlans } = this.props;

    return (
      <List className="flight-plans-list">
        {flightPlans.map(this.renderItem.bind(this))}
      </List>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    activeFlightPlanId: state.activeFlightPlanId
  };
}

export default connect(mapStateToProps)(FlightPlanList);
