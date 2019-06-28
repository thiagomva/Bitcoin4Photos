const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class CategoryData {
    constructor() {
        this.Category = DataAccess.define('Category', {
            name: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            isEnabled: Sequelize.BOOLEAN
        });
    }
    listAll() {
        return this.Category.findAll({where: {isEnabled: {[Sequelize.Op.eq]: true}}, order:[['name', 'ASC']]});
    }
}

module.exports = CategoryData;