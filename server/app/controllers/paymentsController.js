var Payments = require('../models/payments.js');
var Error = require('../util/error.js');
var crypto = require('crypto');
var nconf = require('nconf');
var Users = require("../helpers/users");
var config = require('nconf');

class PaymentsController {
    constructor() {}

    validCallback(json) {
        if (!json) throw new Error(400, 'no body in request');
        if (!json.id) throw new Error(400, 'id is mandatory');
        if (!json.status) throw new Error(400, 'status is mandatory');
        if (!json.hashed_order) throw new Error(400, 'hashed_order is mandatory');
        
        const received = json.hashed_order;
        const calculated = crypto.createHmac('sha256', config.get("OPEN_NODE_API_KEY")).update(json.id).digest('hex');

        if (received != calculated) {
            throw new Error(403, 'Forbidden');
        }
    }

    callback(json, cb) {
        this.validCallback(json);
        new Payments().getCallbackResult(json, cb);
    }

    validPayment(json, authToken) {
        if (!json) throw new Error(400, 'no body in request');
        if (!json.imageUsername) throw new Error(400, 'imageUsername is mandatory');
        if (!json.imageId) throw new Error(400, 'imageId is mandatory');
        if (!authToken) throw new Error(400, 'authToken is mandatory');
    }

    create(json, authToken, cb) {
        this.validPayment(json, authToken);
        var loggedUser = Users.GetUser(authToken);
        if (loggedUser == json.imageUsername) throw new Error(400, "User is the image's owner.");
        new Payments().getCreateResult(json, loggedUser, cb);
    }

    check(json, authToken, cb) {
        this.validPayment(json, authToken);
        new Payments().getCheckResult(json, Users.GetUser(authToken), cb);
    }

    listPaid(authToken, cb) {
        if (!authToken) throw new Error(400, 'authToken is mandatory');
        new Payments().listPaid(Users.GetUser(authToken), cb);
    }
}

module.exports = PaymentsController;