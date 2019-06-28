var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');

module.exports = function (app) {
  'use strict';

  var authentication = function (req, res, next) {
    var _ = require('underscore')
      , apiPrefix = '/api/v' + config.get('API_VERSION')
      , securePaths = [ 
        {path: apiPrefix+'/images', method:'POST'}, 
        {path: apiPrefix+'/images', method:'DELETE'}, 
        {path: apiPrefix+'/images', method:'PUT'},
        {path: apiPrefix+'/images/category', method:'POST'}, 
        {path: apiPrefix+'/images/category', method:'DELETE'},
        {path: apiPrefix+'/payments', method:'POST'}, 
        {path: apiPrefix+'/payments', method:'GET'},
        {path: apiPrefix+'/payments/check', method:'POST'},
        {path: apiPrefix+'/withdrawals', method:'POST'},
        {path: apiPrefix+'/withdrawals', method:'GET'}
      ];

    if ( _.any(securePaths, {path:req.path,method:req.method}) ){
      var token = req.headers["blockstack-auth-token"];
      if(!token){
        throw new Error(401, 'request unauthorized');
      }
      Blockstack.verifyAuthResponse(token,"https://core.blockstack.org/v1/names/").then(
        response => {
          if (response) {
            next();
          } else {
            throw new Error(401, 'request unauthorized');    
          }
        }
      ).catch(e => {
        next(e);
      })
    }
    else{
      next();
    }
  }

  app.use(authentication);
};

