import React, { Component } from 'react';
import './CreateProposal.css';
import { connect } from 'react-redux';

export class CreateProposal extends Component {
  constructor() {
    super()
    this.state= {
      title: '',
      description: ''
    }
  }

  // sendProposal = (proposal) => {

  // }

  handleChange= (e) => {
    // console.log(e.target);
    const { name, value } = e.target;
    this.setState({ [name]: value });
    console.log(this.state)
  }
  
  render() {
    return (
      <div className="CreateProposal">
        <h2>Create Proposal</h2>
        <form>
          <input type='text' name='name' onChange={this.handleChange}/>
          <input type='text' name='description' onChange={this.handleChange}/>
          <input type='submit' />
        </form>
      </div>
    );
  }
}

// export const mapDispatchtoProps(dispatch) {
//   addProposal: dispatch(addProposal(proposal))
// }

// export default connect(mapStateToProps, mapDispatchtoProps)(CreateProposal)
