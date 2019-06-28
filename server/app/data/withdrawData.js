const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class WithdrawData {
    constructor(){
        this.Withdraw = DataAccess.define('Withdraw', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: Sequelize.STRING(50),
            externalId: Sequelize.CHAR(36),
            status: Sequelize.STRING(15),
            amount: Sequelize.FLOAT,
            fee:  Sequelize.FLOAT,
            processedDate: Sequelize.DATE,
            invoice: Sequelize.STRING(1700)
        });
    }
    insert(username, status, amount, invoice) {
        var query = "INSERT INTO [Withdraw] ([Username],[Status],[Amount],[Invoice],[CreatedAt],[UpdatedAt])";
        query += " VALUES ( :username, :status, :amount, :invoice, getDate(), getDate())";
        query += "; SELECT SCOPE_IDENTITY() AS id;";
        var replacements = {
            username: username,
            status: status,
            amount: amount,
            invoice: invoice
        };
        return DataAccess.query(query, { replacements: replacements, raw: true, plain: true, type: Sequelize.QueryTypes.INSERT });
    }
    update(id, externalId, status, invoice, amount, fee, processedDate, statusUpdateRestriction) {
        var query = "UPDATE [Withdraw] SET [ExternalId] = :externalId, [Status] = :status, [Invoice] = :invoice, [Amount] = :amount,";
        query += " [Fee] = :fee, [ProcessedDate] = :processedDate, [UpdatedAt] = getDate() WHERE Id = :id ";
        var replacements = {
            externalId: externalId,
            status: status,
            amount: amount,
            invoice: invoice,
            id: id,
            fee: fee,
            processedDate: processedDate
        };
        if (statusUpdateRestriction) {
            query += " AND Status = :statusUpdateRestriction ";
            replacements["statusUpdateRestriction"] = statusUpdateRestriction;
        }
        return DataAccess.query(query, { replacements: replacements, raw: true, plain: true, type: Sequelize.QueryTypes.RAW });
    }
    get(id) {
        return this.Withdraw.findByPk(id);
    }
    getByExternalsId(ids) {
        return this.Withdraw.findOne({ where: {externalId: {[Sequelize.Op.in]: ids}} });
    }
    getByInvoice(invoice) {
        return this.Withdraw.findAll({ where: {invoice: invoice} });
    }
    list(username) {
        return this.Withdraw.findAll({ where: {username: username} });
    }
}

module.exports = WithdrawData;