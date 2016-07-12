import GeoSearch from '../geo_search';

let geoSearch = GeoSearch(window.location.href.split('#')[0]);
export default geoSearch;
