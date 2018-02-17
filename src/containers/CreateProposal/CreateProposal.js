import React, { Component } from 'react'
import './CreateProposal.css'

class CreateProposal extends Component {

  handleChange= (e) => {
    console.log(e.target.value)
  }
  
  render() {
    return (
      <div className="CreateProposal">
        <h2>Create Proposal</h2>
        <form>
          <input type='text' name='name' onChange={this.handleChange}/>
          <input type='text' name='description' onChange={this.handleChange}/>
          <input type='submit' />
        </form>
      </div>
    );
  }
}

export default CreateProposal;
