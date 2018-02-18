import React, { Component } from 'react';
import './FinalView.css';
import Complete from '../Complete/Complete';
import Counter from '../Counter/Counter';

class FinalView extends Component {
  render() {
    return (
      <div className="delegateVoteView">
          <p> 11 community members and 3 delegates voted</p>

          <p className="completeMessage"> Congrats! The proposal passed! Thank you for participating in our community!</p>
      </div>
    );
  }
}

export default FinalView;