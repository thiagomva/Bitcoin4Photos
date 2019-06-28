import React, { Component } from 'react';
import {
  isUserSignedIn,
  lookupProfile,
  loadUserData,
  Person
} from 'blockstack';
import NavLink from './NavLink.jsx';
import UploadImageModal from './UploadImageModal.jsx';

export default class TopBar extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      person: null
    };
  }

  render() {
    const { handleSignOut } = this.props;
    const { handleSignIn, allCategories } = this.props;
    var username = null;
    var userImage = null;
    var userName = null;
    if (isUserSignedIn()) {
      username = loadUserData().username;
      userImage = this.state.person && this.state.person.avatarUrl(); 
      userName = this.state.person && this.state.person.name() ? this.state.person.name() : username.split('.')[0]
    }

    return (
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <a href="/" className="navbar-brand d-flex align-items-center clickable">
            <img src="/images/Logo.png"></img>
          </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav mr-auto ml-lg-5">
              <NavLink to="/" title="HOME"></NavLink>
              <div className="nav-separator mx-lg-2"></div>
              <NavLink to="/faq" title="FAQ"></NavLink>
            </ul>
            <ul className="navbar-nav">
              {username && 
                <li className="nav-item">                  
                  <a className="nav-link clickable" href={"/profile"}>
                    <div>
                    { userImage ? <img src={userImage} className="user-avatar-top-bar" /> : <i className="user-noavatar-top-bar fa fa-user-circle mr-1"></i> }
                    <span>{userName}</span>
                    </div>
                  </a>
                </li>
              }
              {username && 
                <li className="nav-item mx-lg-2">
                  <a className="nav-link clickable" onClick={handleSignOut.bind(this)}>Logout</a>
                </li>
              }
              {!username && 
              <li className="nav-item mx-lg-2">
                <a className="nav-link clickable" onClick={handleSignIn.bind(this)}>Login/Register</a>
              </li>
              }
            </ul>
            <UploadImageModal handleSignIn={ handleSignIn } allCategories={allCategories}></UploadImageModal>
            <ul className="navbar-nav twitter-link-top">
              <div className="nav-separator mx-lg-2"></div>
              <li className="nav-item twitter-nav-item">
                <a className="nav-link clickable" href="https://twitter.com/Bitcoin4P" target="_blank"><i className="fa fa-twitter"></i></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  componentDidMount() {
    this.getProfile();
  }

  getProfile(){
    if (!this.state.person && isUserSignedIn()) {
        lookupProfile(loadUserData().username)
        .then((profile) => {
            var person = new Person(profile);
            this.setState({ person: person });
        });
    }
  }
}
