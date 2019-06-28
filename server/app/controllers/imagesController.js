var Images = require('../models/images.js');
var CategoriesImage = require('../models/categoriesImage.js');
var Error = require('../util/error.js');
var Users = require("../helpers/users");

class ImagesController {
    constructor() {}

    baseValidateJson(json, authToken) {
        if (!json) throw new Error(400, 'no body in request');
        if (!json.id) throw new Error(400, 'id is mandatory');
        if (!authToken) throw new Error(400, 'authToken is mandatory');
    }
    
    imageValidation(json) {
        if (json.isPublic && json.price) throw new Error(400, 'Invalid data for public image');
        if (!json.isPublic && (!json.price || !json.imageKey)) throw new Error(400, 'Invalid data for private image');
        if (!json.categories || json.categories.length == 0) throw new Error(400, 'categories is mandatory');
        if (json.categories.length > 3) throw new Error(400, 'Too many categories');
    }
    
    saveImage(json, authToken, cb) {
        this.baseValidateJson(json, authToken);
        this.imageValidation(json);
        new Images().create(json, Users.GetUser(authToken), cb);
    }

    updateImage(json, authToken, cb) {
        this.baseValidateJson(json, authToken);
        this.imageValidation(json);
        new Images().update(json, Users.GetUser(authToken), cb);
    }

    deleteImage(id, authToken, cb) {
        if (!id) throw new Error(400, 'id is mandatory');
        if (!authToken) throw new Error(400, 'authToken is mandatory');
        new Images().delete(id, Users.GetUser(authToken), cb);
    }

    myImages(authToken, cb) {
        if (!authToken) throw new Error(400, 'authToken is mandatory');
        var loggedUser = Users.GetUser(authToken);
        new Images().list(loggedUser, loggedUser, null, null, null, null, true, cb);
    }

    listImages(authToken, username, imageId, lastCreationTime, isPublic, featured, cb) {
        var loggedUser = null;
        if (authToken) loggedUser = Users.GetUser(authToken);
        new Images().list(loggedUser, username, imageId, lastCreationTime, isPublic, featured, false, cb);
    }

    searchImages(authToken, term, cb) {
        if (!term || !(term.trim && term.trim())) throw new Error(400, 'term is mandatory');
        var loggedUser = null;
        if (authToken) loggedUser = Users.GetUser(authToken);
        new Images().search(loggedUser, term, cb);
    }

    validateCategoryJson(json, authToken) {
        this.baseValidateJson(json, authToken);
        if (!json.name) throw new Error(400, 'name is mandatory');
    }

    deleteCategory(json, authToken, cb) {
        this.validateCategoryJson(json, authToken);
        new CategoriesImage().delete(json.id, Users.GetUser(authToken), json.name, cb);
    }

    addCategory(json, authToken, cb) {
        this.validateCategoryJson(json, authToken);
        new CategoriesImage().add(json.id, Users.GetUser(authToken), json.name, cb);
    }
}

module.exports = ImagesController;