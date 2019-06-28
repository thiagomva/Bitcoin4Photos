const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class AccountData {
    constructor() {
        this.Account = DataAccess.define('Account', {
            username: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            email: Sequelize.STRING(100)
        });
    }
    get(username) {
        return this.Account.findByPk(username);
    }
    insert(account) {
        return this.Account.create(account);
    }
    update(username, email) {
        var query = "UPDATE [Account] SET [Email] = :email, [UpdatedAt] = getDate() WHERE [Username] = :username ";
        var replacements = {
            email: email,
            username: username
        };
        return DataAccess.query(query, { replacements: replacements, raw: true, plain: true, type: Sequelize.QueryTypes.RAW });
    }
}

module.exports = AccountData;