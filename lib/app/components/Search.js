import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';

import NavDataSearch from '../../search';
var navDataSearch = NavDataSearch(window.location.href);

import property from 'lodash/property';
import flow from 'lodash/flow';

function labelFor(prefix) {
  return flow(property('label'), function (label) {
    return prefix + ': ' + label;
  });
}

export default class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: []
    };
  }

  handleUpdateInput = (value) => {
    var self = this;

    navDataSearch.find(value)
      .then((results) => {
        console.log(self);
        self.setState({
          dataSource: [].concat(
            results.airports.map(labelFor('Airport')),
            results.navaids.map(labelFor('Navaid')),
            results.fixes.map(labelFor('Fix'))
          )
        });
      })
      .catch((error) => {
        console.error(error);
        self.setState({
          dataSource: []
        });
      });
  }

  render() {
    return (
      <div className="main-search">
        <AutoComplete
            hintText="ICAO, airport name, Fix, Navaid"
            dataSource={this.state.dataSource}
            onUpdateInput={this.handleUpdateInput}
          />
      </div>
    );
  }
};
