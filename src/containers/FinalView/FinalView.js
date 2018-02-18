import React, { Component } from 'react';
import './FinalView.css';
import Complete from '../Complete/Complete';
import Counter from '../Counter/Counter';
import '../../App.css';


class FinalView extends Component {
  render() {
    return (
      <div className="delegateSection3 ">
          <h3> 11 community members and 3 delegates voted.</h3>
          <h1>Congratulations!</h1>
          <h3 className="completeMessage">The proposal passed. Thank you for participating in our community!</h3>
          <p>Create a new proposal here</p>
          <button className="cta-button">Create</button>
      </div>
    );
  }
}

export default FinalView;