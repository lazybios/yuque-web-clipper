import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import createRootReducer from './reducers';
import createSageMiddleWare from 'redux-saga';
import rootSaga from './saga';
import { createMemoryHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'remote-redux-devtools';

const sagaMiddleware = createSageMiddleWare();

export const history = createMemoryHistory();

export type HistoryType = typeof history;
const middleware = [routerMiddleware(history), sagaMiddleware];

if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger());
}

function configStore() {
  const store = createStore(
    createRootReducer(history),
    {},
    process.env.NODE_ENV === 'development'
      ? composeWithDevTools(applyMiddleware(...middleware))
      : applyMiddleware(...middleware)
  );
  sagaMiddleware.run(rootSaga);
  return store;
}

export { configStore };
