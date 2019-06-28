import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './components/App.jsx';

// Require Font Awesome.
import 'font-awesome/css/font-awesome.css';

import 'bootstrap/dist/js/bootstrap.js';

// Require Sass file so webpack can build it
import 'bootstrap/dist/css/bootstrap.css';
import './styles/style.scss';

ReactDOM.render((
  <BrowserRouter>
    <div>
      <App />
    </div>
  </BrowserRouter>
), document.getElementById('root'));