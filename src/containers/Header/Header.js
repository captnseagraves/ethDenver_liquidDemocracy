import React, { Component } from 'react'
import './Header.css'
import { NavLink, withRouter } from 'react-router-dom';

class Header extends Component {
  render() {
    return (
      <div className="Header">
       <nav className="nav-menu">
        <ul>
          <NavLink to='/proposals' className='nav'>Proposals</NavLink>
          <NavLink to='/vote' className='nav'>Vote</NavLink>
          <NavLink to='/votestatus' className='nav'>My Vote Status</NavLink>
          <NavLink to='/' className='nav'>My Delegates</NavLink>
        </ul>
        </nav>
        
      </div>
    );
  }
}

export default Header;