var CategoryData = require('../data/categoryData.js');

class Categories {
    constructor() {
    }

    listAll(cb) {
        new CategoryData().listAll().then(result => cb(null, result)).catch(err => cb(err));
    }
}

module.exports = Categories;