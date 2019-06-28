var AccountsController = require('../controllers/accountsController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
      .post(function (req, res, next) {
        new AccountsController().save(req.headers["blockstack-auth-token"], baseResponse(res, next));
      });
};