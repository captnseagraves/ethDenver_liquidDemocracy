import React, { Component } from 'react'
import '../../App.css';

class Count extends Component {
  render() {
    return (
      <div className="delegateVoteView">
        <h3>You have: 4 votes</h3>
        <p className="small">Time remaining: 4hr 2m</p>
        <p className="small">The count period is almost over!</p>
        <p>Submit your delegated votes now</p>
        <button className="cta-button">Submit</button>
      </div>
    );
  }
}

export default Count;