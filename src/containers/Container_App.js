import React, { Component } from 'react'
import { connect } from 'react-redux'


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

render() {

  console.log('this.props', this.props);
  console.log('this.props.web3', this.props.web3);
  console.log('this.props.myContract', this.props.myContract);


  return(
    <CompApp storageValue={this.state.storageValue} />
  )
}


}

function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps, { fetchWeb3 })(App)
