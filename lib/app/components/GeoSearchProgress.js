import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';
import { connect } from 'react-redux';

class GeoSearchProgress extends React.Component {
  render() {
    const { resultsLoading } = this.props;

    return (
      <div className="geo-search-progress">
        {resultsLoading ?
          (<LinearProgress />)
          : null
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    resultsLoading: state.geoSearch.resultsLoading
  };
}

export default connect(mapStateToProps)(GeoSearchProgress);
