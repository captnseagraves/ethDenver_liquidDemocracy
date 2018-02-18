import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Proposal from '../containers/Proposal/Proposal';
import Register from '../containers/Register/Register';
import Vote from '../containers/Vote/Vote';
import VoteStatus from '../containers/VoteStatus/VoteStatus';
import FinalView from '../containers/FinalView/FinalView';
import Count from '../containers/Count/Count';

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

class CompApp extends Component {
  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">

        </nav>

        <main className="container">
          <Route exact path='/proposal' component={Proposal} />
          <Route exact path='/register' component={Register} />
          <Route exact path='/vote' component={Vote} />
          <Route exact path='/votestatus' component={VoteStatus} />
          <Route exact path='/count' component={Count} />
          <Route exact path='/finalview' component={FinalView} />
        </main>
      </div>
    );
  }
}

export default CompApp;
