import React, { Component } from 'react';
import './Proposal.css';
import { CreateProposal } from '../CreateProposal/CreateProposal';
import '../../App.css';

class Proposal extends Component {
  render() {
    return (
      <div>
        <body>
        <div className="Proposal">
          <div className="proposal-card">
            <h3>Winner</h3>
            <p> Should the liquid democracy group win the bounty? </p>
            <button className='yes'>Yes</button>
            <button className='no'>No</button>
          </div>
          <div className ="proposal-card">
            <h3>President</h3>
            <p> Should the Vitalik be the president? </p>
            <button className='yes'>Yes</button>
            <button className='no'>No</button>
          </div>
          <div className ="proposal-card">
            <h3>Bufficorn</h3>
            <p> Should the Bufficorn become the new official state animal of Colorado? </p>
            <button className='yes'>Yes</button>
            <button className='no'>No</button>
          </div>
          <h2>Show Proposal Here</h2>
          <CreateProposal />
        </div>
        </body>
      </div>
    );
  }
}

export default Proposal;