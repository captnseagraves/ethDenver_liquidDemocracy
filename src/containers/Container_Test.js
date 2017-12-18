import React, { Component } from 'react'
import { connect } from 'react-redux'

import { fetchWeb3 } from '../actions'

class Test extends Component {

  render() {

    console.log('test', this.props.web3);
    console.log('props.myContract', this.props.myContract);

    return(
      <div>
        Hello World
      </div>
    )
  }
}

function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps)(Test)
