import Search from '../search';

let navDataSearch = Search(window.location.href.split('#')[0]);
export default navDataSearch;
