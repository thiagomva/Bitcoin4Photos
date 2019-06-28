const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class ImageData {
    constructor() {
        this.Image = DataAccess.define('Image', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            username: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            title: Sequelize.STRING(100),
            isPublic: Sequelize.BOOLEAN,
            featured: Sequelize.BOOLEAN,
            deactivationDate: Sequelize.DATE,
            imageKey: Sequelize.STRING(100),
            price: Sequelize.FLOAT,
            size: Sequelize.BIGINT,
            height: Sequelize.INTEGER,
            width: Sequelize.INTEGER,
            type: Sequelize.STRING(15)
        });
    }
    get(username, id) {
        return this.Image.findOne({ where: { username: username, id: id } });
    }
    insert(image) {
        return this.Image.create(image);
    }
    update(image) {
        return image.update(image, { where: { id: image.id, username: image.username }, fields: image.changed() });
    }
    deactivation(username, id, deactivationDate) {
        var query = "UPDATE [Image] SET [DeactivationDate] = :deactivationDate, [UpdatedAt] = getDate() WHERE [Id] = :id AND [Username] = :username ";
        var replacements = {
            deactivationDate: deactivationDate,
            username: username,
            id: id
        };
        return DataAccess.query(query, { replacements: replacements, raw: true, plain: true, type: Sequelize.QueryTypes.RAW });
    }
    search(term){
        var query = "SELECT Image.Id as id, Image.Username as username, Image.CreatedAt as createdAt, Image.UpdatedAt as updatedAt, Image.Title as title, Image.IsPublic as isPublic, Image.Featured as featured, Image.Price as price, Image.Size as size, Image.Height as height, Image.Width as width, Image.Type as type, Image.ImageKey as imageKey, CategoryImage.Name as name ";
        query += " FROM Image with(nolock) INNER JOIN CategoryImage with(nolock) ON Image.Id = CategoryImage.Id AND Image.Username = CategoryImage.Username ";
        query += " WHERE Image.DeactivationDate IS NULL ";
        query += " AND (Image.Title LIKE :term OR CategoryImage.Name LIKE :term)";
        query += " ORDER BY Image.Featured DESC, Image.CreatedAt DESC ";
        return DataAccess.query(query, { replacements: {term: '%'+term+'%'}, type: Sequelize.QueryTypes.SELECT});
    }
    list(username, imageId, lastCreationTime, isPublic, featured, includeDeactivated) {
        var query = "SELECT Image.Id as id, Image.Username as username, Image.CreatedAt as createdAt, Image.UpdatedAt as updatedAt, Image.Title as title, Image.IsPublic as isPublic, Image.Featured as featured, Image.Price as price, Image.Size as size, Image.Height as height, Image.Width as width, Image.Type as type, Image.ImageKey as imageKey, Image.DeactivationDate as deactivationDate, CategoryImage.Name as name ";
        query += " FROM Image with(nolock) INNER JOIN CategoryImage with(nolock) ON Image.Id = CategoryImage.Id AND Image.Username = CategoryImage.Username ";
        query += " WHERE ";
        if (!includeDeactivated) {
            query += " Image.DeactivationDate IS NULL ";
        } else {
            query += " 1 = 1 ";
        }
        var replacements = {};
        var restrictions = "";
        if (username || lastCreationTime || (featured != null && featured != undefined) || (isPublic != null && isPublic != undefined) || (imageId != null && imageId != undefined)) {
            if (lastCreationTime) {
                restrictions += " AND Image.CreatedAt >= :lastCreationTime";
                replacements["lastCreationTime"] = lastCreationTime;
            }
            if (username) {
                restrictions += " AND Image.Username = :username";
                replacements["username"] = username;
            }
            if (imageId != null && imageId != undefined) {
                restrictions += " AND Image.Id = :id";
                replacements["id"] = imageId;
            }
            if (featured != null && featured != undefined) {
                restrictions += " AND Image.Featured = :featured";
                replacements["featured"] = featured;
            }
            if (isPublic != null && isPublic != undefined) {
                restrictions += " AND Image.IsPublic = :isPublic";
                replacements["isPublic"] = isPublic;
            }
        }
        query += restrictions + " ORDER BY Image.Featured DESC, Image.CreatedAt DESC ";
        return DataAccess.query(query, { replacements: replacements, type: Sequelize.QueryTypes.SELECT});
    }
}

module.exports = ImageData;