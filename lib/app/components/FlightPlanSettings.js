import React from 'react';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';
import { connect } from 'react-redux';
import FlightPlanTotals from './FlightPlanTotals';
import {
  setFlightPlanTitle,
  setFlightPlanColor,
  setFlightPlanAircraft,
  setFlightPlanFuelConsumption,
  setFlightPlanPayload,
  setFlightPlanCruiseSpeed,
  setFlightPlanVisibility,
  setSidebarContext,
  removeFlightPlan,
  setActiveFlightPlan
} from '../state/actions';
import {
  SIDEBAR_CONTEXT_FLIGHT_PLANS,
  FLIGHT_PLAN_COLORS,
  FLIGHT_PLAN_COLOR_DEFAULT
} from '../constants';
import last from 'lodash/last';

class FlightPlanSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleting: false
    };
  }

  handleTitleChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanTitle(flightPlan.id, event.target.value));
  }

  handleColorChange(event, index) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanColor(flightPlan.id, FLIGHT_PLAN_COLORS[index]));
  }

  handleAircraftChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanAircraft(flightPlan.id, event.target.value));
  }

  handleFuelConsumptionChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanFuelConsumption(flightPlan.id, parseInt(event.target.value)));
  }

  handlePayloadChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanPayload(flightPlan.id, parseInt(event.target.value)));
  }

  handleCruiseSpeedChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanCruiseSpeed(flightPlan.id, parseInt(event.target.value)));
  }

  handleVisibilityChange(event, visible) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanVisibility(flightPlan.id, visible));
  }

  handleBackClick() {
    const { dispatch } = this.props;
    dispatch(setSidebarContext(SIDEBAR_CONTEXT_FLIGHT_PLANS));
  }

  handleDeleteClick() {
    const { dispatch, flightPlan, flightPlans } = this.props;
    const { deleting } = this.state;

    if (!deleting) {
      this.setState({
        deleting: true
      });
    } else {
      dispatch(removeFlightPlan(flightPlan.id));
      dispatch(setActiveFlightPlan(last(Object.keys(flightPlans))));
      dispatch(setSidebarContext(SIDEBAR_CONTEXT_FLIGHT_PLANS));
    }
  }

  handleDeleteAbortClick() {
    this.setState({
      deleting: false
    });
  }

  renderDeleteConfirm() {
    const { deleting } = this.state;
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleDeleteAbortClick.bind(this)}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onTouchTap={this.handleDeleteClick.bind(this)}
      />,
    ];

    return (
      <Dialog
          actions={actions}
          modal={false}
          open={deleting}
          onRequestClose={this.handleDeleteAbortClick.bind(this)}
        >
          Delete flight plan?
        </Dialog>
    );
  }

  render() {
    const { flightPlan, flightPlans } = this.props;

    return (
      <div className="flight-plan-settings">
        <FlatButton
          label="Back to flight plans"
          icon={<FontIcon className="material-icons">arrow_back</FontIcon>}
          onClick={this.handleBackClick.bind(this)}>
        </FlatButton>
        <br />

        <TextField
          value={flightPlan.title}
          floatingLabelText="Title"
          onChange={this.handleTitleChange.bind(this)} />
        <br />

        <Toggle
          label="Visible"
          toggled={flightPlan.visible}
          onToggle={this.handleVisibilityChange.bind(this)} />
        <br />

        <SelectField
          floatingLabelText="Color"
          value={flightPlan.color || FLIGHT_PLAN_COLOR_DEFAULT}
          style={{display: 'inline-block'}}
          onChange={this.handleColorChange.bind(this)}>
          {FLIGHT_PLAN_COLORS.map(function (color) {
            return (
              <MenuItem
                value={color}
                primaryText={color}
                innerDivStyle={{background: color, color: '#fff'}} />
            );
          })}
        </SelectField>
        <Chip
          backgroundColor={flightPlan.color || FLIGHT_PLAN_COLOR_DEFAULT}
          style={{color: '#fff', display: 'inline-block', margin: '0 0 0 1rem'}}>
          &nbsp;&nbsp;&nbsp;
        </Chip>

        <br/>

        <TextField
          value={flightPlan.fuelConsumption}
          floatingLabelText="Fuel consumption"
          type="number"
          step="1"
          onChange={this.handleFuelConsumptionChange.bind(this)} /> gallons/hour
        <br />

        <TextField
          value={flightPlan.payload}
          floatingLabelText="Payload"
          type="number"
          step="1"
          onChange={this.handlePayloadChange.bind(this)} /> kg (+ Pax & Crew)
        <br />

        <TextField
          value={flightPlan.cruiseSpeed}
          floatingLabelText="Cruise Speed"
          type="number"
          step="1"
          onChange={this.handleCruiseSpeedChange.bind(this)} /> kts
        <br />

        <FlightPlanTotals flightPlan={flightPlan} />

        {Object.keys(flightPlans).length > 1 ?
          <RaisedButton
            className="flight-plan__delete-button"
            icon={<ActionDelete />}
            label="Delete"
            onClick={this.handleDeleteClick.bind(this)} />
        : null}

        {this.renderDeleteConfirm()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    flightPlans: state.flightPlans
  };
}

export default connect(mapStateToProps)(FlightPlanSettings);
