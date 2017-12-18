import { combineReducers } from 'redux';
// import { reducer as formReducer } from 'redux-form'
import Web3Reducer from './reducer_web3'
import ContractReducer from './reducer_myContract'



const rootReducer = combineReducers({
  web3: Web3Reducer,
  myContract: ContractReducer
});

export default rootReducer;
