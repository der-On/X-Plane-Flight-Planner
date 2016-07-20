import React from 'react';
import {ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import ActionEdit from 'material-ui/svg-icons/action/settings';
import { connect } from 'react-redux'
import {
  setSidebarContext,
  setActiveFlightPlan
} from '../state/actions';
import {
  SIDEBAR_CONTEXT_FLIGHT_PLAN
} from '../state/constants';

class FlightPlanListItem extends React.Component {
  handleEditClick() {
    const { flightPlan, dispatch } = this.props;

    dispatch(setActiveFlightPlan(flightPlan.id));
    dispatch(setSidebarContext(SIDEBAR_CONTEXT_FLIGHT_PLAN));
  }

  handleTitleClick() {

  }

  render() {
    const { flightPlan, active } = this.props;

    return (
      <div className="flight-plans-list__flight-plan">
        <ListItem
          value={flightPlan.id}
          rightIcon={
            <ActionEdit
              title="Edit flight plan"
              onClick={this.handleEditClick.bind(this)} />
          } >
          <div
            className="flight-plan__title"
            title="click to view on map"
            onClick={this.handleTitleClick.bind(this)}>
            <Checkbox
              checked={active}
              label={flightPlan.title || 'unnamed flight plan'} />
          </div>
          <div className="flight-plan__details">

          </div>
        </ListItem>
        <Divider />
      </div>
    );
  }
}

export default connect()(FlightPlanListItem);
