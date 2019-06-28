var ImageData = require('../data/imageData.js');
var CategoryImageData = require('../data/categoryImageData.js');
var Payments = require('./payments');
var _ = require('underscore');

class Images {
    constructor() {
    }

    create(json, username, cb) {
        var imageData = new ImageData();
        imageData.id = json.id;
        imageData.username = username;
        imageData.title = json.title;
        imageData.isPublic = json.isPublic;
        imageData.featured = false;
        imageData.price = json.price;
        imageData.imageKey = json.imageKey;
        imageData.size = json.size;
        imageData.height = json.height;
        imageData.width = json.width;
        imageData.type = json.type;
        imageData.insert(imageData).then(result => {
            for (var i = 0; i < json.categories.length; ++i) {
                new CategoryImageData().insert(this.getCategoryImageData(imageData.id, imageData.username, json.categories[i]));
            }
            cb(null, null);
        }).catch(err => cb(err));
    }

    update(json, username, cb) {
        new ImageData().get(username, json.id).then(image => {
            if (json.title) image.title = json.title;
            if (json.price) image.price = json.price;
            if (json.imageKey) image.imageKey = json.imageKey;
            if (json.isPublic != null && json.isPublic != undefined) image.isPublic = json.isPublic;
            new ImageData().update(image).then(() => {
                if (json.categories && json.categories.length > 0) {
                    new CategoryImageData().delete(image.id, image.username, null).then(() => {
                        for (var i = 0; i < json.categories.length; ++i) {
                            new CategoryImageData().insert(this.getCategoryImageData(image.id, image.username, json.categories[i]));
                        }
                        cb(null, null);
                    }).catch(e => cb(e));
                } else {
                    cb(null, null);
                }
            }).catch(e => cb(e));
        }).catch(e => cb(e));
    }

    getCategoryImageData(id, username, name) {
        var categoryImageData = new CategoryImageData();
        categoryImageData.id = id;
        categoryImageData.username = username;
        categoryImageData.name = name;
        return categoryImageData;
    }

    delete(id, username, cb) {
        var deactivationDate = new Date();
        new ImageData().deactivation(username, id, deactivationDate).then(ret => cb(null, deactivationDate)).catch(err => cb(err));
    }

    list(loggedUser, username, imageId, lastCreationTime, isPublic, featured, includeDeactivated, cb) {
        new ImageData().list(username, imageId, lastCreationTime, isPublic, featured, includeDeactivated).then(result => 
        {
            this.getImageResult(loggedUser, isPublic, result, cb);
        }).catch(err => cb(err));
    }

    search(loggedUser, term, cb) {        
        new ImageData().search(term).then(result => {
            this.getImageResult(loggedUser, false, result, cb);
        }).catch(err => cb(err));
    }

    getImageResult(loggedUser, isPublic, result, cb){
        var response = [];
        var pairImagesId = [];
        result.forEach(element => {
            var image = _.where(response,{id:element.id,username:element.username});
            if (!image || image.length == 0) {
                element["categories"] = [];
                element["categories"].push(element.name);
                element.name = undefined;
                if (loggedUser == element.username) {
                    element["owner"] = true;
                    element["paymentsCount"] = 0;
                    element["paymentsAmount"] = 0;
                } else {
                    element["owner"] = false;
                }
                element["paid"] = false;
                response.push(element);
                pairImagesId.push({ imageId: element.id, imageUsername: element.username });
            } else {
                image[0]["categories"].push(element.name);
            }
        });
        if (pairImagesId.length > 0 && loggedUser && !isPublic) {
            new Payments().listRelatedPayments(loggedUser, pairImagesId, (e, r) =>
            {
                if (e) {
                    cb(e);
                } else {
                    if (r && r.length > 0) {
                        var payments = _.groupBy(r, (value) => value.imageUsername + '#' + value.imageId);
                        Object.keys(payments).forEach((image) => {
                            var splitPosition = image.lastIndexOf('#');
                            var currentImageId = parseInt(image.substring(splitPosition + 1));
                            var currentImageUsername = image.substring(0, splitPosition);
                            var result = _.where(response, {id: currentImageId, username: currentImageUsername});
                            if (result && result.length > 0) {
                                if (currentImageUsername == loggedUser) {
                                    result[0]["paymentsCount"] = payments[image].length;
                                    var amount = 0;
                                    payments[image].forEach(c => amount += c.amount);
                                    result[0]["paymentsAmount"] = amount;
                                } else { 
                                    result[0]["paid"] = true;
                                }
                            }
                        });
                    }
                    cb(null, this.removeImageKey(response));
                } 
            });
        } else {
            cb(null, this.removeImageKey(response));
        }
    }

    removeImageKey(response) {
        for (var i = 0; i < response.length; ++i) {
            if (response[i].isPublic || (!response[i].paid && !response[i].owner)) {
                response[i].imageKey = null;
            }
        }
        return response;
    }
}

module.exports = Images;