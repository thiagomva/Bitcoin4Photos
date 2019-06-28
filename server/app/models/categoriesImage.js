var CategoryImageData = require('../data/categoryImageData.js');

class CategoriesImage {
    constructor() {
    }

    delete(id, username, name, cb) {
        new CategoryImageData().delete(id, username, name).then(result => cb(null, null)).catch(err => cb(err));
    }

    add(id, username, name, cb) {
        var categoryImageData = new CategoryImageData();
        categoryImageData.id = id;
        categoryImageData.username = username;
        categoryImageData.name = name;
        categoryImageData.insert(categoryImageData).then(result => cb(null, null)).catch(err => cb(err));
    }
}

module.exports = CategoriesImage;