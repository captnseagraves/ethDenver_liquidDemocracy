import React, { Component } from 'react';
import '../../App.css';

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
            <button onClick={ this.handleVoteSubmission } type="submit" className="yes" name="yes">Yes</button>
            <button onClick={ this.handleVoteSubmission } type="submit" className="no" name="no">No</button>
          </form>
          <p>or</p>
          <button onClick={ this.showDelegationOptions }>Delegate Your Vote</button>
          <section className="delegateSection">
            <article className="delegateContainer">
                <img src="https://www.cryptokitties.co/images/kitty-love-2.svg" />
                <p>Amy</p>
                <p>Vote rejection rate: 5%</p>
                <button onClick={ this.selectDelegate } type="submit" className="yes" name="Amy">Select</button>
              </article>
              <article className="delegateContainer">
                <img src="https://www.cryptokitties.co/images/kitty-love-2.svg" />
                <p>Melissa</p>
                <p>Vote rejection rate: 10%</p>
                <button onClick={ this.selectDelegate } type="submit" className="yes" name="Melissa">Select</button>
              </article>
              <article className="delegateContainer">
                <img src="https://www.cryptokitties.co/images/kitty-love-2.svg" />
                <p>Kevin</p>
                <p>Vote rejection rate: 90%</p>
                <button onClick={ this.selectDelegate } type="submit" className="yes" name="Kevin">Select</button>
            </article>
          </section>
        </span>
      </div>
    );
  }
}

export default Vote;