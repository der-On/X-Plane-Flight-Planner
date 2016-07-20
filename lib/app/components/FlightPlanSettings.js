import React from 'react';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import { connect } from 'react-redux'
import {
  setFlightPlanTitle,
  setFlightPlanColor,
  setFlightPlanAircraft,
  setFlightPlanFuelConsumption,
  setFlightPlanPayload,
  setFlightPlanCruiseSpeed,
  setFlightPlanVisibility
} from '../state/actions';

class FlightPlanSettings extends React.Component {
  handleTitleChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanTitle(flightPlan.id, event.target.value));
  }

  handleColorChange(event) {
    const { dispatch, flightPlan } = this.props;
    dispatch(setFlightPlanColor(flightPlan.id, event.target.value));
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

  render() {
    const { flightPlan } = this.props;

    return (
      <div className="flight-plan-settings">
        <TextField
          value={flightPlan.title}
          floatingLabelText="Title"
          onChange={this.handleTitleChange.bind(this)} />
        <br />
        <Toggle
          label="Visibile"
          toggled={flightPlan.visible}
          onToggle={this.handleVisibilityChange.bind(this)} />
        <br />
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
      </div>
    );
  }
}

export default connect()(FlightPlanSettings);
