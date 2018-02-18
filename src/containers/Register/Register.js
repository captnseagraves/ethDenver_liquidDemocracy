import React, { Component } from 'react'
import './Register.css'

class Register extends Component {

  componentDidMount() {
    
  }
  render() {
    return (
      <div className="Register">
        <p>Register for this proposal here</p>
        <form>
          <input type="text"/>
          <input type="text"/>
          <input type="submit" name="register"/>
        </form>


      </div>
    );
  }
}

export default Register;