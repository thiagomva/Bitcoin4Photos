import React, { Component, Link } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import TopBar from './TopBar.jsx';
import Gallery from './Gallery.jsx';
import ImageDetails from './ImageDetails.jsx';
import Categories from './Categories.jsx';
import Profile from './Profile.jsx';
import Login from './Login.jsx';
import Axios from 'axios';
import Faq from './Faq.jsx';
import { server_url } from '../config.js';

import {
  isSignInPending,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
  verifyAuthResponse,
  loadUserData,
  isUserSignedIn
} from 'blockstack';

export default class App extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      accountSaved: false,
      allCategories:[]
    }

    this.loadCategories();
  }

  loadCategories(){
    var url = server_url + '/api/v1/categories';
    Axios.get(url).then(response => {
        var allCategories = [];
        if(response && response.data){
            allCategories = response.data.map(c => { 
                return {value:c.name, label:c.name}
            })
        }

        this.setState({allCategories:allCategories, isLoading:false});
    });
  }

  handleSignIn(e) {
    if(e && e.preventDefault){
      e.preventDefault();
    };
    window.location.href = "/login?p=" + encodeURI(window.location.href);
  }

  handleSignOut(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    signUserOut(window.location.origin);
  }

  render() {
    var showTopBar = true;
    if (window.location && window.location.pathname) {
      showTopBar = !window.location.pathname.startsWith("/login");
    }
    return (
      <div className="site-wrapper">
        {showTopBar && <TopBar handleSignOut={this.handleSignOut} handleSignIn={ this.handleSignIn } allCategories={this.state.allCategories}/>}
        <div className="site-wrapper-inner">
          {
            <Switch>
              <Route
                path='/login'
                render={
                  routeProps => <Login {...routeProps} />
                }
              />
              <Route
                path='/profile'
                render={
                  routeProps => <Profile handleSignIn={ this.handleSignIn } {...routeProps} />
                }
              />
               <Route
                path='/faq'
                render={
                  routeProps => <Faq {...routeProps} />
                }
              />
               <Route
                path='/search/:term'
                render={
                  routeProps => <Gallery handleSignIn={ this.handleSignIn } {...routeProps} allCategories={this.state.allCategories}/>
                }
              />
              <Route
                path='/:username/:imageId'
                render={
                  routeProps => <ImageDetails handleSignIn={ this.handleSignIn } {...routeProps} allCategories={this.state.allCategories} />
                }
              />
              <Route
                path='/:category'
                render={
                  routeProps => <Gallery handleSignIn={ this.handleSignIn } {...routeProps} allCategories={this.state.allCategories}/>
                }
              />
              <Route path='/' render={
                  routeProps => <Categories handleSignIn={ this.handleSignIn } {...routeProps} allCategories={this.state.allCategories}/>
                }
              />
             
            </Switch>
          }
        </div>
        {showTopBar && <footer className="text-muted">
            <div className="container footer-container">
              <div className="row">
                <div className="col-3">
                    <a className="clickable footer-link mr-1" href="/" target="_self">HOME</a>
                    <span className="vr"></span>
                    <a className="clickable footer-link ml-1" href="/faq" target="_self">FAQ</a>
                </div>
                <div className="col-6 footer-copyright">
                  <p>Bitcoin4Photos - 2019</p>
                </div>
                <div className="col-3">
                  <a className="clickable pull-right" href="https://twitter.com/Bitcoin4P" target="_blank"><i className="fa fa-twitter footer-twitter"></i></a>
                </div>
              </div>
            </div>
        </footer>}
      </div>
    );
  }

  setUserAccount() {
    var config={headers:{}};
    config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
    Axios.post(server_url + '/api/v1/accounts', {}, config).then(c => {});
  }

  componentWillMount() {
    if (document) document.title = "Bitcoin4Photos - Bitcoin Lightning Network marketplace to buy and sell stock photos and illustrations";
    if (!this.state.accountSaved && window.location && window.location.search && window.location.search.indexOf('blockstacklogged=true') > 0 && isUserSignedIn()) {
      this.setState({accountSaved: true}, () => this.setUserAccount());
    }
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        var baseUrl = window.location.href.split('?')[0];
        if (window.location.href.indexOf('?') >= 0) {
          if (window.location.search && window.location.search.indexOf('blockstacklogged=true') > 0) {
            baseUrl += '?blockstacklogged=true';
          }
          window.location = baseUrl;
        }
        else {
          window.location = window.location.href;
        }
      });
    } else {
      if (isUserSignedIn()) {
        verifyAuthResponse(loadUserData().authResponseToken,"https://core.blockstack.org/v1/names/").then(
          response => {
            if (!response) {
              this.handleSignOut();
            }
          }
        ).catch(e => {
          this.handleSignOut();
        })
      }
    }
  }
}
