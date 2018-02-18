import React, { Component } from 'react';
import './VoteStatus.css';
import { connect } from 'react-redux';
import '../../App.css';
import { Link } from 'react-router-dom';

// implement coniditional rendering for the store

class VoteStatus extends Component {

  revokeDelegation = (e) => {
    const { name } = e.target
    console.log(name, 'delegate selected')
  }

  acceptDelegation = (e) => {
    const { name } = e.target
    console.log(name, 'delegate selected')
  }

  render() {
    return (
      <div className="VoteStatus">
       <div className="delegateVoteView">
          <p>Your delegate voted...</p>
          <h2>YES</h2>
          <p>on the 'Should the liquid democracy group win the bounty?' community proposal</p>
          <div>
            <button onClick={ this.acceptDelegation } type="submit" className="yes" name="accept">Accept</button>
            <button type="submit" className="no" name="revoke">Revoke</button>
          </div>
        </div>
      </div>
    );
  }
}

export default VoteStatus;

 // <p>I'm the voteStatus Container!</p>
 //        <div className="voteCompleted">
 //          <p className="completionGreeting">Congrats! Thank you for contributing to the community</p>
 //          <p className="voteMessage">You voted VARIABLE on the VARIABLE Initiative</p>
 //        </div>

 // <div className="delegateVoteCompleted">
 //          <p className="completionGreeting">Congrats! Thank you for contributing to the community</p>
 //          <p className="voteMessage">You voted VARIABLE via your delegate on the VARIABLE Initiative</p>
 //        </div>