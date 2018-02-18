import React, { Component } from 'react';
import './Proposal.css';
import { CreateProposal } from '../CreateProposal/CreateProposal';

class Proposal extends Component {
  render() {
    return (
      <div className="Proposal">
        <h2>Show Proposal Here</h2>
        <CreateProposal />
      </div>
    );
  }
}

export default Proposal;