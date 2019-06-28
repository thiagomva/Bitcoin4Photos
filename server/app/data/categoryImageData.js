const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class CategoryImageData {
    constructor() {
        this.CategoryImage = DataAccess.define('CategoryImage', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            username: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(50),
                primaryKey: true
            }
        });
    }
    insert(categoryImage) {
        return this.CategoryImage.create(categoryImage);
    }
    delete(id, username, name) {
        var where = { id: {[Sequelize.Op.eq]: id}, username: {[Sequelize.Op.eq]: username} };
        if (name) {
            where.name = {[Sequelize.Op.eq]: name};
        }
        return this.CategoryImage.destroy({where: where});
    }
}

module.exports = CategoryImageData;