import React, { Component } from 'react'
import { connect } from 'react-redux'

import { fetchWeb3 } from '../actions'

class Test extends Component {

  render() {

    console.log('test', this.props.web3);

    return(
      <div>
        Hello World
      </div>
    )
  }
}

function mapStateToProps({ web3 }) {
  return { web3 }
}

export default connect(mapStateToProps, { fetchWeb3 })(Test)
