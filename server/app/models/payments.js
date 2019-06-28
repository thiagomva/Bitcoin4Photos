const axios = require('axios');
var config = require('nconf');
var PaymentData = require('../data/paymentData.js');
var ImageData = require('../data/imageData.js');
var AccountData = require('../data/accountData.js');
var Email = require("../helpers/email");

class Payments {
    constructor() {
    }

    getCallbackResult(callback, cb) {
        try {
            new PaymentData().get(callback.id).then(payment => 
                {
                    this.updatePaymentIfNecessary(payment, callback, cb);
                    if (callback.status == "paid") {
                        new ImageData().get(payment.imageUsername, payment.imageId).then(image =>
                            {
                                if (image) {
                                    this.sendBoughtImageEmail(image.title, payment.imageUsername, payment.amount);
                                }
                            });
                    }
                }).catch(e => cb(e));
        } catch(err) {
            cb(err);
        }
    }

    updatePaymentIfNecessary(payment, nodePaymentData, cb) {
        if (payment.status != nodePaymentData.status) {
            payment.status = nodePaymentData.status;
            payment.paymentDate = this.getPaymentDate(nodePaymentData);
            new PaymentData().update(payment).then(() => cb(null, payment)).catch(e => cb(e));
        } else {
            cb(null, false);
        }
    }

    getPaymentDate(nodePaymentData) {
        if (nodePaymentData.status == "paid") {
            if (nodePaymentData.chain_invoice && nodePaymentData.chain_invoice.settled_at) {
                return new Date(parseInt(nodePaymentData.chain_invoice.settled_at + "000"));
            } else if (nodePaymentData.lightning_invoice && nodePaymentData.lightning_invoice.settled_at) {
                return new Date(parseInt(nodePaymentData.lightning_invoice.settled_at + "000"));
            } else {
                return  new Date();
            }
        } else {
            return null;
        }
    }

    getCreateResult(json, username, cb) {
        new ImageData().get(json.imageUsername, json.imageId).then(image => {
            if (!image || image.isPublic || !image.price) {
                cb("Invalid image.");
            } else {
                var body = {
                    description: "Buying the photo '" + image.title + "'",
                    amount: image.price,
                    currency: 'USD',
                    callback_url: config.get('OPEN_NODE_PAYMENT_CALLBACK_URL'),
                    success_url: config.get('OPEN_NODE_SUCCESS_URL') + json.imageUsername + "/" + json.imageId +"?handler=openNode" 
                };
                var httpConfig = {
                    headers: {
                        Authorization: config.get('OPEN_NODE_API_KEY')
                    }
                };
                try {
                    var url = config.get('OPEN_NODE_API_URL') + "v1/charges";
                    axios.post(url, body, httpConfig).then(response => {
                        var data = response && response.data && response.data.data;
                        var payment = {
                            id: data.id, 
                            username: username, 
                            imageUsername: json.imageUsername, 
                            imageId: json.imageId, 
                            status: data.status, 
                            amount: (data.amount/100000000.0)
                        };
                        payment.paymentDate = this.getPaymentDate(data);
                        new PaymentData().insert(payment).then(() => cb(null, payment)).catch(error => cb(error));
                    }).catch(error => cb(error));
                } catch(err) { cb(err); }
            }
        }).catch(err => { cb(err); });
    }

    getCheckResult(json, username, cb) {
        new PaymentData().listPayments(username, json.imageUsername, [json.imageId], null, null).then(payments => {
            var httpConfig = {
                headers: {
                    Authorization: config.get('OPEN_NODE_API_KEY')
                }
            };
            var url = config.get('OPEN_NODE_API_URL') + "v1/charge/";
            var paid = false;
            var promises = [];
            var _this = this;
            payments.forEach((payment) => {
                promises.push(new Promise (function(resolve,reject) {
                    axios.get(url + payment.id, httpConfig).then(response => {
                        var data = response && response.data && response.data.data;
                        paid = paid || data.status == "paid" || data.status == "processing";
                        _this.updatePaymentIfNecessary(payment, data, (e, s) => {
                            if (e) reject(e);
                            else resolve();
                        });
                    }).catch(error => reject(error))})); 
            });
            Promise.all(promises).then(() =>
            {
                if (!paid) {
                    cb("Payment not found.");
                } else {
                    new ImageData().list(json.imageUsername, json.imageId, null, null, null, false).then(image => {
                        var response = image[0];
                        response["categories"] = [];
                        for (var i = 0; i < image.length; ++i) {
                            response["categories"].push(image[i].name);
                        }
                        response.name = undefined;
                        response["paid"] = true;
                        response["owner"] = false;
                        cb(null, response);
                    }).catch(e => cb(e));
                }
            }).catch(e => cb(e));
        }).catch(e => cb(e));
    }

    sendBoughtImageEmail(imageTitle, imageUsername, amount) {
        new AccountData().get(imageUsername).then(user => 
            {
                if (user) {
                    var message = "<p><b>Congratulations!</b></p>";
                    message += "<p>The photo '" + imageTitle + "' was bought for " + amount + "BTC.</p>";
                    message += "<p><a href='https://bitcoin4photos.net/profile#mySales' target='_blank'>Click here</a> to check.</p>";
                    message += "<p><i>Team Bitcoin4Photos :)</i></p>"
                    Email.SendEmail(user.email, 'You received a new payment', message);
                }
            });
    }

    listPaid(username, cb) {
        new PaymentData().listPayments(username, null, null, null, "unpaid").then(payments => cb(null, payments)).catch(e => cb(e));
    }

    listImagePayments(imageUsername, imagesId, cb) {
        new PaymentData().listPayments(null, imageUsername, imagesId, "paid", null).then(payments => cb(null, payments)).catch(e => cb(e));
    }

    listRelatedPayments(loggedUser, pairImagesId, cb) {
        new PaymentData().listRelatedPayments(loggedUser, pairImagesId).then(payments => cb(null, payments)).catch(e => cb(e));
    }
}

module.exports = Payments;