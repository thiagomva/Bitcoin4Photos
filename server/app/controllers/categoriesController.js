var Categories = require('../models/categories.js');

class CategoriesController {
    constructor() {}

    listCategories(cb) {
        new Categories().listAll(cb);
    }
}

module.exports = CategoriesController;