import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from './reducers'

const loggerMiddleware = createLogger()

const middlewares = [
  thunkMiddleware/*,
  loggerMiddleware*/
];

export default function configureStore(initialState = {}) {
  return window.devToolsExtension ?
    compose(
      applyMiddleware.apply(null, middlewares),
      window.devToolsExtension()
    )(createStore)(
      rootReducer,
      initialState
    )
  : createStore(
    rootReducer,
    initialState,
    applyMiddleware.apply(null, middlewares)
  );
};
