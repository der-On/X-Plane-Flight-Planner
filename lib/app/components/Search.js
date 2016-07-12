import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import property from 'lodash/property';
import flow from 'lodash/flow';
import debounce from "lodash/debounce";
import { connect } from 'react-redux'
import { setSearchQuery, locateNavItem } from '../state/actions';

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

class Search extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.debouncedSearch = debounce(this.search.bind(this), 500);
  }

  search(q) {
    const { dispatch } = this.props;
    dispatch(setSearchQuery(q));
  }

  handleUpdateInput(value) {
    this.debouncedSearch(value);
  }

  handleNewRequest(value, index) {
    const { results } = this.props;

    // enter was pressed in input
    // use first matching item
    if (index === -1) {
      index = 0;
    }

    this.locate(
      results[index]
    );
  }

  locate(item) {
    const { dispatch } = this.props;
    dispatch(locateNavItem(item));
  }

  render() {
    const { results, dataSource, indexLoading } = this.props;

    return (
      <Paper
          className="main-search"
          zDepth={2}>
        <FontIcon className="material-icons main-menu-icon">menu</FontIcon>
        <AutoComplete
            className="main-search-input"
            hintText={indexLoading ?
              "Loading data ..."
            : "ICAO, airport name, Fix, Navaid"
            }
            dataSource={dataSource}
            onUpdateInput={this.handleUpdateInput.bind(this)}
            onNewRequest={this.handleNewRequest.bind(this)}
            filter={AutoComplete.noFilter}
          />
        <FontIcon className="material-icons main-search-icon">search</FontIcon>
      </Paper>
    );
  }
};

function getResults(results) {
  return [].concat(
    results.airports.map(attach('type', 'airport')),
    results.navaids.map(attach('type', 'navaid')),
    results.fixes.map(attach('type', 'fix'))
  );
}

function getDataSource(results) {
  return [].concat(
    results.airports.map(optionFor('Airport')),
    results.navaids.map(optionFor('Navaid')),
    results.fixes.map(optionFor('Fix'))
  );
}

const mapStateToProps = (state) => {
  return {
    results: getResults(state.search.results),
    dataSource: getDataSource(state.search.results),
    indexLoading: state.search.indexLoading
  };
}

export default connect(mapStateToProps)(Search);
