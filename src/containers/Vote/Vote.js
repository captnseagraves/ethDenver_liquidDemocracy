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
        <span className="voteOrDelegate">
          <form className="voteInput" onSubmit={ this.handleVoteSubmission }>
            <p className="center">Should team liquidDemocracy win the smart contract bounty?</p>
            <div>
              <button onClick={ this.handleVoteSubmission } type="submit" className="yes" name="yes">Yes</button>
              <button onClick={ this.handleVoteSubmission } type="submit" className="no" name="no">No</button>
            </div>
          </form>
          <div className="delegateVoteView">
          <h3>or</h3>
          <button onClick={ this.showDelegationOptions }>Delegate Your Vote</button>
          <section className="delegateSection2">
            <article className="delegateContainer2">
                <img id="delegate" src="https://www.cryptokitties.co/images/kitty-love-2.svg" />
                <div>
                <p className="no-pad">Amy</p>
                <p className="small no-pad">Vote rejection rate: 5%</p>
                </div>
                <button onClick={ this.selectDelegate } type="submit" id="submit2" className="yes" name="Amy">Select</button>
              </article>
              <article className="delegateContainer2">
                <img id="delegate" src="https://www.cryptokitties.co/images/kitty-love-2.svg" />
                <div>
                <p className="no-pad">Melissa</p>
                <p className="small no-pad">Vote rejection rate: 10%</p>
                </div>
                <button onClick={ this.selectDelegate } type="submit" id="submit2" className="yes" name="Melissa">Select</button>
              </article>
              <article className="delegateContainer2">
                <img  id="delegate" src="https://www.cryptokitties.co/images/kitty-love-2.svg" />
                <div>
                <p className="no-pad">Kevin</p>
                <p className="small no-pad">Vote rejection rate: 90%</p>
                </div>
                <button onClick={ this.selectDelegate } type="submit" className="yes" id="submit2" name="Kevin">Select</button>
            </article>
          </section>
          </div>
        </span>
      </div>
    );
  }
}

export default Vote;