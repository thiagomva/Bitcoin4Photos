import React, { Component } from 'react';

export default class NavLink extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var isActive = window.location.pathname == this.props.to;
    var className = isActive ? 'nav-item mx-lg-2 active' : 'nav-item mx-lg-2';

    return (
      <li className={className}>
        <a className="nav-link clickable" href={this.props.to}>{this.props.title}</a>
      </li>
    );
  }
}