var ImagesController = require('../controllers/imagesController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
      .post(function (req, res, next) {
        new ImagesController().saveImage(req.body, req.headers["blockstack-auth-token"], baseResponse(res, next));
      })
      .put(function (req, res, next) {
        new ImagesController().updatImage(req.body, req.headers["blockstack-auth-token"], baseResponse(res, next));
      })
      .get(function (req, res, next) {
        new ImagesController().listImages(req.headers["blockstack-auth-token"], req.query["username"], req.query["imageId"], req.query["lastCreationTime"], req.query["isPublic"], req.query["featured"], baseResponse(res, next));
      });
    
    router.route('/:id')
      .delete(function (req, res, next) {
        new ImagesController().deleteImage(req.params.id, req.headers["blockstack-auth-token"], baseResponse(res, next));
      });

    router.route('/my')
      .get(function (req, res, next) {
        new ImagesController().myImages(req.headers["blockstack-auth-token"], baseResponse(res, next));
      });

    router.route('/search')
      .get(function (req, res, next) {
        new ImagesController().searchImages(req.headers["blockstack-auth-token"], req.query["term"], baseResponse(res, next));
      });

    router.route('/category')
      .post(function(req, res, next) {
        new ImagesController().addCategory(req.body, req.headers["blockstack-auth-token"], baseResponse(res, next));
      })
      .delete(function(req, res, next) {
        new ImagesController().deleteCategory(req.body, req.headers["blockstack-auth-token"], baseResponse(res, next));
      });
  };