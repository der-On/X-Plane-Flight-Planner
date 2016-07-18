import configureStore from './state/configureStore';
import InitialState from './state/initial';

let store = configureStore(InitialState());
export default store;
