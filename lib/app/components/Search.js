import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import NavDataSearch from '../../search';
import property from 'lodash/property';
import flow from 'lodash/flow';
import debounce from "lodash/debounce";

function optionFor(prefix) {
  return function (item, index) {
    return prefix + ': ' + item.label;
  };
}

function attach(prop, value) {
  return function (item) {
    item[prop] = value;
    return item;
  };
}

export default class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      dataSource: [],
      results: []
    };

    this.navDataSearch = NavDataSearch(window.location.href);
  }

  componentDidMount() {
    var self = this;

    this.navDataSearch.loadIndex()
      .then(function () {
        self.setState({
          loading: false
        });
      })
      .catch(function (error) {
        console.error(error);
      });

    this.debouncedSearch = debounce(this.search.bind(this), 200);
  }

  search(q) {
    var self = this;

    this.navDataSearch.find(q)
      .then((results) => {
        self.setState({
          results: [].concat(
            results.airports.map(attach('type', 'airport')),
            results.navaids.map(attach('type', 'navaid')),
            results.fixes.map(attach('type', 'fix'))
          ),
          dataSource: [].concat(
            results.airports.map(optionFor('Airport')),
            results.navaids.map(optionFor('Navaid')),
            results.fixes.map(optionFor('Fix'))
          )
        });
      })
      .catch((error) => {
        console.error(error);

        self.setState({
          results: [],
          dataSource: []
        });
      });
  }

  handleUpdateInput(value) {
    this.debouncedSearch(value);
  }

  handleNewRequest(value, index) {
    // enter was pressed in input
    // use first matching item
    if (index === -1) {
      index = 0;
    }

    this.locate(this.state.results[index]);
  }

  locate(item) {
    console.log(item);
  }

  render() {
    return (
      <div className="main-search">
        <AutoComplete
            hintText = { this.state.loading ?
              "Loading data ..."
            : "ICAO, airport name, Fix, Navaid"
            }
            dataSource = { this.state.dataSource }
            onUpdateInput = { this.handleUpdateInput.bind(this) }
            onNewRequest = { this.handleNewRequest.bind(this) }
            filter = { AutoComplete.noFilter }
          />
      </div>
    );
  }
};
