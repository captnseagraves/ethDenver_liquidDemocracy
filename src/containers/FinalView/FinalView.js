import React, { Component } from 'react';
import './FinalView.css';
import Complete from '../Complete/Complete';
import Counter from '../Counter/Counter';

class FinalView extends Component {
  render() {
    return (
      <div className="FinalView">
        <div className="waiting">
          <Complete />
          <Counter />
        </div>
        <div className="final-view">
          <p className="completeMessage"> Congrats! The proposal passed! Thank you for participating in our community!</p>
        </div>
      </div>
    );
  }
}

export default FinalView;