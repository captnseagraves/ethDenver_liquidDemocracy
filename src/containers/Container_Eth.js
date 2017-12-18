import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import SimpleStorageContract from '../../build/contracts/TokenizedTicket.json'

import { fetchWeb3, instantiateContract } from '../actions'
import App from './Container_App'
import Test from './Container_Test'

class Eth extends Component {

componentWillMount() {
  this.props.fetchWeb3()
  .then(() => {
    this.props.instantiateContract()
  })

}

  render() {
    return(
      <BrowserRouter>
        <div>
          <Switch>
            <Route path="/test" component={Test} />
            <Route path="/" component={App} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

function mapStateToProps({ web3 }) {
  return { web3 }
}

export default connect(mapStateToProps, { fetchWeb3, instantiateContract })(Eth)
