var CategoriesController = require('../controllers/categoriesController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
      .get(function (req, res, next) {
        new CategoriesController().listCategories(baseResponse(res, next));
      });
  };