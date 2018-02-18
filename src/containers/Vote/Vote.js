import React, { Component } from 'react';
import './Vote.css';

// conditionally render the delegates

class Vote extends Component {

  handleVoteSubmission = (e) => {
    e.preventDefault();
    const { name } = e.target
    console.log('vote submitted!', name)
  }

  showDelegationOptions = (e) => {
    console.log('delegate clicked')
  }

  selectDelegate = (e) => {
    const { name } = e.target
    console.log(name, 'delegate selected')
  }

  render() {
    return (
      <div className="Vote">
        <p>Vote here:</p>
        <span className="voteOrDelegate">
          <form className="voteInput" onSubmit={ this.handleVoteSubmission }>
            <p>Should our community invest in new water filtration?</p>
            <button onClick={ this.handleVoteSubmission } type="submit" className="voteButton" name="yes">Yes</button>
            <button onClick={ this.handleVoteSubmission } type="submit" className="voteButton" name="no">No</button>
          </form>
          <p>or</p>
          <button onClick={ this.showDelegationOptions }>Delegate Your Vote</button>
          <section className="delegateContainer">
            <article>
              <img src="" />
              <p>Amy</p>
              <p>Vote rejection rate: 5%</p>
              <button onClick={ this.selectDelegate } type="submit" className="delegateButton" name="Amy">Select</button>
              <img src="" />
              <p>Melissa</p>
              <p>Vote rejection rate: 10%</p>
              <button onClick={ this.selectDelegate } type="submit" className="delegateButton" name="Melissa">Select</button>
              <img src="" />
              <p>Kevin</p>
              <p>Vote rejection rate: 90%</p>
              <button onClick={ this.selectDelegate } type="submit" className="delegateButton" name="Kevin">Select</button>
            </article>
          </section>
        </span>
      </div>
    );
  }
}

export default Vote;