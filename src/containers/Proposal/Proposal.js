import React, { Component } from 'react';
import './Proposal.css';
import { CreateProposal } from '../CreateProposal/CreateProposal';
import '../../App.css';
import './Proposal.css';

class Proposal extends Component {
  render() {
    return (
      <div>
        <body>
        <div className="Proposal">
          <div className="proposal-card">
            <h2> Current Proposals</h2>
            <h3>Winner</h3>
            <p> Should the liquid democracy group win the bounty? </p>
            <div id="progressbar1">
              <div></div>
            </div>
          </div>
          <div className ="proposal-card">
            <h3>President</h3>
            <p> Should the Vitalik be the president? </p>
            <div id="progressbar2">
              <div></div>
            </div>
          </div>
          <div className ="proposal-card">
            <h3>Bufficorn</h3>
            <p> Should the Bufficorn become the new official state animal of Colorado? </p>
            <div id="progressbar3">
              <div></div>
            </div>
          </div>
          <CreateProposal />
        </div>
        </body>
      </div>
    );
  }
}

export default Proposal;