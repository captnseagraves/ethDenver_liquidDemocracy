import React, { Component } from 'react'
import './Register.css';
import '../../App.css';

class Register extends Component {

  componentDidMount() {
    
  }
  render() {
    return (
      <div className="delegateVoteView">
        <p>Register for this proposal here</p>
        <form className="delegateVoteView">
          <input type="text" className="input"/>
          <input type="text" className="input"/>
          <input type="submit" name="register" className="cta-button"/>
        </form>
      </div>
    );
  }
}

export default Register;