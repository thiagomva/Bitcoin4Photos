var Accounts = require('../models/accounts.js');
var Error = require('../util/error.js');
var Users = require("../helpers/users");

class AccountsController {
    constructor() {}

    save(authToken, cb) {
        if (!authToken) throw new Error(400, 'authToken is mandatory');
        var payload = Users.GetPayload(authToken);
        new Accounts().create(payload.username, payload.email, cb);
    }
}

module.exports = AccountsController;