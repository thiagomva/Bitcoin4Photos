var AccountData = require('../data/accountData.js');

class Accounts {
    constructor() {
    }

    create(username, email, cb) {
        if (!email) {
            cb(null, false);
        } else {
            new AccountData().get(username).then(account => 
                {
                    if (!account) {
                        var accountData = new AccountData();
                        accountData.username = username;
                        accountData.email = email;
                        accountData.insert(accountData).then(result => cb(null, true)).catch(err => cb(err));
                    } else {
                        if (account.email != email) {
                            new AccountData().update(account.username, email).then(result => cb(null, true)).catch(err => cb(err));
                        } else {
                            cb(null, null);
                        }
                    }
                }).catch(err => cb(err));
        }
    }
}

module.exports = Accounts;