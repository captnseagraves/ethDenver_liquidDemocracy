import Web3 from 'web3'

import TokenizedTicket from '../../build/contracts/TokenizedTicket.json'


export const GET_WEB3 = 'get_web3'
export const INSTANTIATE_CONTRACT = 'initiate_contract'

export function fetchWeb3() {

  let getWeb3 = new Promise(function(resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', function() {
      var results
      var web3 = window.web3

      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        web3 = new Web3(web3.currentProvider)

        results = web3

        console.log('Injected web3 detected.');

        resolve(results)
      } else {
        // Fallback to localhost if no web3 injection. We've configured this to
        // use the development console's port by default.
        var provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')

        web3 = new Web3(provider)

        results = web3

        console.log('No web3 instance injected, using Local web3.');

        resolve(results)
      }
    })
  })

  return {
    type: GET_WEB3,
    payload: getWeb3
  }
}

export function instantiateContract() {

  let myContract;

  const contract = require('truffle-contract')
  const tokenizedTicket = contract(TokenizedTicket)
  tokenizedTicket.setProvider(this.props.web3.currentProvider)

  // Declaring this for later so we can chain functions on SimpleStorage.
  // var simpleStorageInstance

  // Get accounts.
  this.props.web3.eth.getAccounts((error, accounts) => {
    tokenizedTicket.deployed().then((instance) => {
      // simpleStorageInstance = instance

      let myContract = instance;

    })
  })

  return {
    type: INSTANTIATE_CONTRACT,
    payload: myContract
  }

}
