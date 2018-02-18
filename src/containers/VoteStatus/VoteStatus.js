import React, { Component } from 'react';
import './VoteStatus.css';
import { connect } from 'react-redux';

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
        <p>I'm the voteStatus Container!</p>
        <div className="voteCompleted">
          <p className="completionGreeting">Congrats! Thank you for contributing to the community</p>
          <p className="voteMessage">You voted VARIABLE on the VARIABLE Initiative</p>
        </div>
        <div className="delegateVoteView">
          <p>Your delegate voted...</p>
          <p>VARIABLE</p>
          <p>on the VARIABLE initiative</p>
          <button onClick={ this.acceptDelegation } type="submit" className="voteButton" name="accept">Accept</button>
          <button onClick={ this.revokeDelegation } type="submit" className="voteButton" name="revoke">Revoke</button>
        </div>
        <div className="delegateVoteCompleted">
          <p className="completionGreeting">Congrats! Thank you for contributing to the community</p>
          <p className="voteMessage">You voted VARIABLE via your delegate on the VARIABLE Initiative</p>
        </div>
      </div>
    );
  }
}

export default VoteStatus;