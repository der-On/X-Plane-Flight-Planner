import React from 'react';
import {List} from 'material-ui/List';
import FlightPlanListItem from './FlightPlanListItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { connect } from 'react-redux'
import {
  setActiveFlightPlan,
  addFlightPlan,
  setSidebarContext
} from '../state/actions';
import {
  SIDEBAR_CONTEXT_FLIGHT_PLAN
} from '../state/constants';
import FlightPlan from '../../models/FlightPlan';

class FlightPlanList extends React.Component {
  handleAddClick() {
    const { dispatch, flightPlans } = this.props;
    var flightPlan = FlightPlan({
      title: 'route ' + (flightPlans.length + 1)
    });

    dispatch(addFlightPlan(flightPlan));
    dispatch(setActiveFlightPlan(flightPlan.id));
    dispatch(setSidebarContext(SIDEBAR_CONTEXT_FLIGHT_PLAN));
  }

  renderItem(flightPlan) {
    const { activeFlightPlanId } = this.props;

    return (
      <FlightPlanListItem
        key={flightPlan.id}
        flightPlan={flightPlan}
        active={flightPlan.id === activeFlightPlanId} />
    );
  }

  renderEmpty() {
    return (
      <p className="flight-plans-list__empty">
      There are now flight plans yet.<br />
      Add one using the "+" below.
      </p>
    );
  }

  render() {
    const { flightPlans } = this.props;

    return (
      <List className="flight-plans-list">
        {flightPlans.length ?
          flightPlans.map(this.renderItem.bind(this))
        : this.renderEmpty()
        }

        <FloatingActionButton
          className='flight-plans-list__add-button'
          mini={true}
          secondary={true}
          title="Create new flight plan"
          onClick={this.handleAddClick.bind(this)}>
          <ContentAdd />
        </FloatingActionButton>
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
