import React, { Component } from 'react';
import './CreateProposal.css';
import { connect } from 'react-redux';
import { addProposal } from '../../actions/index.js';
import { withRouter } from 'react-router-dom';
import '../../App.css';

export class CreateProposal extends Component {
  constructor(props) {
    super(props)

    this.state= {
      title: '',
      description: ''
    }
  }

    // state= {
    //   title: '',
    //   description: ''
    // }

  sendProposal = (e) => {
    e.preventDefault();
    const {title, description} = this.state;
    const proposal = { 
      title:this.state.title,
      description:this.state.description 
     };
    // this.props.addProposal(proposal)
  }

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }
  
  render() {
    return (
      <div className="CreateProposal">
        <h2>Create Proposal</h2>
        <form onSubmit = {this.sendProposal}>
          <input type='text' name='title' onChange={this.handleChange}/>
          <input type='text' name='description' onChange={this.handleChange}/>
          <input type='submit' className="cta-button"/>
        </form>
      </div>
    );
  }
}

// export const mapStateToProps = (store) => ({
//  proposal: store.proposal
// })

// export const mapDispatchToProps = (dispatch) => ({
//   addProposal: (proposal) => dispatch(addProposal(proposal))
// })

// export default connect(null, mapDispatchToProps)(CreateProposal)
