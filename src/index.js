import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import promise from 'redux-promise'

import reducers from './reducers';
import Eth from './containers/Container_Eth'




const createStoreWithMiddleware = applyMiddleware(promise, thunk)(createStore);


ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <Eth />
  </Provider>

  , document.getElementById('root')
);
