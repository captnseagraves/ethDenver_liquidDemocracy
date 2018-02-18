import React, { Component } from 'react'
import './Header.css'
import { NavLink, withRouter, Link } from 'react-router-dom';

class Header extends Component {
  render() {
    return (
      <div className="Header">
       <nav role="navigation">
        <div id="menuToggle">

         <input type="checkbox" />
 
            <span></span>
            <span></span>
            <span></span>

          <ul id="menu">
              <li><NavLink to='/'>Proposals</NavLink></li>
              <li><NavLink to='/vote'>Vote</NavLink></li>
              <li><NavLink to='/votestatus'>My Vote Status</NavLink></li>
              <li><NavLink to='/votestatus'>Submit Delegate Votes</NavLink></li>
              <li><NavLink to='/votestatus'>Status</NavLink></li>
          </ul>
        </div>
        </nav>
  
      <div className="proposal-status">
      </div>
      <div className="counter">
      </div>
      </div>
    );
  }
}

export default Header;

          // <NavLink to='/' className='nav'>Proposals</NavLink>
          // <NavLink to='/vote' className='nav'>Vote</NavLink>
          // <NavLink to='/votestatus' className='nav'>My Vote Status</NavLink>

