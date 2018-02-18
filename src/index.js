import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import promise from 'redux-promise'
import logger from 'redux-logger'

import reducers from './reducers';
import Eth from './containers/Container_Eth'




const createStoreWithMiddleware = applyMiddleware(thunk, promise, logger)(createStore);


ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <Eth />
  </Provider>

  , document.getElementById('root')
);
