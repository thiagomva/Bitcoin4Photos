const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class PaymentData {
    constructor(){
        this.Payment = DataAccess.define('Payment', {
            id: {
                type: Sequelize.CHAR(36),
                primaryKey: true
            },
            username: Sequelize.STRING(50),
            imageUsername: Sequelize.STRING(50),
            imageId: Sequelize.INTEGER,
            status: Sequelize.STRING(15),
            amount: Sequelize.FLOAT,
            paymentDate: Sequelize.DATE
        });
    }
    insert(payment) {
        return this.Payment.create(payment);
    }
    update(payment) {
        return payment.update(payment, { where: { id: payment.id }, fields: payment.changed() });
    }
    get(id) {
        return this.Payment.findByPk(id);
    }
    listPayments(username, imageUsername, imagesId, status, notStatus) {
        var where = {};
        if (username) {
            where["username"] = username;
        }
        if (imageUsername) {
            where["imageUsername"] = imageUsername;
        }
        if (imagesId && imagesId.length > 0) {
            where["imageId"] = {[Sequelize.Op.in]: imagesId};
        }
        if (status) {
            where["status"] = status;
        }
        if (notStatus) {
            where["status"] = {[Sequelize.Op.ne]: notStatus};
        }
        return this.Payment.findAll({ where: where });
    }
    listRelatedPayments(username, pairImagesId) {
        var query = "SELECT Payment.Id as id, Payment.Username as username, Payment.ImageUsername as imageUsername, Payment.ImageId as imageId, Payment.Status as status, Payment.Amount as amount, Payment.PaymentDate as paymentDate FROM Payment with(nolock) WHERE ";
        var replacements = {};
        for (var i = 0; i < pairImagesId.length; ++i) {
            if (i > 0) query += " OR ";
            query += "(Payment.ImageId = :imageId" + i;
            query += " AND Payment.ImageUsername = :imageUsername" + i;
            replacements["imageId" + i] = pairImagesId[i]["imageId"];
            replacements["imageUsername" + i] = pairImagesId[i]["imageUsername"];
            if (pairImagesId[i]["imageUsername"] != username) {
                query += " AND Payment.Status <> :status" + i;
                query += " AND Payment.Username = :username" + i;
                query += " ) ";
                replacements["status" + i] = 'unpaid';
                replacements["username" + i] = username;
            } else {
                query += " AND Payment.Status = :status" + i;
                query += " ) ";
                replacements["status" + i] = 'paid';
            }
        }
        return DataAccess.query(query, { replacements: replacements, type: Sequelize.QueryTypes.SELECT});
    }
}

module.exports = PaymentData;