import React, { Component } from 'react'
import { connect } from 'react-redux'

import SimpleStorageContract from '../../build/contracts/TokenizedTicket.json'
// import getWeb3 from '../utils/getWeb3'

import CompApp from '../components/Component_App'
import { fetchWeb3 } from '../actions'


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 11,
      web3: null
    }
  }

  // componentWillMount() {

    // this.props.fetchWeb3()
    // .then((result) => {
    //   console.log(result.payload.web3);
    //   this.setState({
    //     web3: result.payload.web3
    //   })
    // })

    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    // getWeb3
    // .then(results => {
    //   console.log(results.web3);
    //   this.setState({
    //     web3: results.web3
    //   })
    //
    //   // Instantiate contract once web3 provided.
      // this.instantiateContract()

    // })
    // .catch(() => {
    //   console.log('Error finding web3.')
    // })
  // }

  // instantiateContract() {
  //   /*
  //    * SMART CONTRACT EXAMPLE
  //    *
  //    * Normally these functions would be called in the context of a
  //    * state management library, but for convenience I've placed them here.
  //    */
  //
  //   const contract = require('truffle-contract')
  //   const simpleStorage = contract(SimpleStorageContract)
  //   simpleStorage.setProvider(this.props.web3.currentProvider)
  //
  //   // Declaring this for later so we can chain functions on SimpleStorage.
  //   // var simpleStorageInstance
  //
  //   // Get accounts.
  //   this.props.web3.eth.getAccounts((error, accounts) => {
  //     simpleStorage.deployed().then((instance) => {
  //       // simpleStorageInstance = instance
  //
  //       console.log('instance', instance);


        //
        //
        // instance.seeOwner({}, {fromBlock: 0, toBlock: 'latest'}, (error, result) => {
        //   console.log(result);
        // })
        //
        // instance.seePrice({}, {fromBlock: 0, toBlock: 'latest'}, (error, result) => {
        //   console.log(result);
        // })

        //
        // instance.ReadOwner('2B', { from: accounts[0], gas:900000 })
        // .then((result) => {
        //   console.log(result);
        // })

        // instance.individualSeatsAndPrices(
        //     [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
        //     ['1A', '2B', '3C', '4D', '5E', '6F', '7G', '8H', '9I', '10J', '11K', '12L', '13M', '14N', '15O', '16P', '17Q'],
        //     { from: accounts[0], gas:900000 }
        //   )
        // .then((result) => {
        //   console.log(result);
        // })

        // this.state.web3.eth.personal.sign('Hello World', accounts[0])
        // .then((results) => {
        //   this.setState({
        //     sig: results
        //   })
        // })
        // .then(() => {
        //   this.state.web3.eth.personal.ecRecover('Hello World', this.state.sig)
        //   .then((results) => {
        //     console.log(results);
        //   })
        // })


        // this.state.web3.eth.sign('hello world', accounts[0])
        // .then((result) => {
        //   console.log('sign', result);
        // })
//     })
//   })
// }

render() {

  console.log('this.props', this.props.web3);

  return(
    <CompApp storageValue={this.state.storageValue} />
  )
}


}

function mapStateToProps({ web3 }) {
  return { web3 }
}

export default connect(mapStateToProps, { fetchWeb3 })(App)
