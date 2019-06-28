import {
    encryptContent,
    makeECPrivateKey,
    getPublicKeyFromPrivate,
    decryptContent,  
    listFiles,
    getFile,
    putFile,
    deleteFile,
    loadUserData
} from 'blockstack';

const watermark = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQkAAAEJCAYAAACHaNJkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoyNTM2M2FmZi05YjVkLTQxNTctYThmNy04ZGM2MWY1NjU2ZmUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0I3OEZDNEY4QTFCMTFFOThGMTM4MUI2NTQ2RkMxRDkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0I3OEZDNEU4QTFCMTFFOThGMTM4MUI2NTQ2RkMxRDkiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNTM2M2FmZi05YjVkLTQxNTctYThmNy04ZGM2MWY1NjU2ZmUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjUzNjNhZmYtOWI1ZC00MTU3LWE4ZjctOGRjNjFmNTY1NmZl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";
const maxWidthtForList = 640;
const maxHeightForList = 480;
const maxWidthtForDetail = 1024;
const maxHeightForDetail = 768;
const identityFile = "image_identity";
const metadataFilePrefix = "image_metadata_";
const listFilePartialName = "_list_image_";
const detailFilePartialName = "_detail_image_";
const filePartialName = "_image_";
const publicPrefix = "public";
const privatePrefix = "private";
const purchasePrefix = "purchase";

export default class ImageManager {
    static upload (imageMetadata, imageArrayBuffer) {
        imageMetadata["imageKey"] = makeECPrivateKey();
        imageMetadata["publicKey"] = getPublicKeyFromPrivate(imageMetadata["imageKey"]);
        return new Promise(function (resolve, reject) {
            var tempImage = new Image();
            tempImage.onload = function() {
                imageMetadata["height"] = tempImage.height;
                imageMetadata["width"] = tempImage.width;
                getFile(identityFile, { decrypt: false }).then((file) => 
                {
                    var identity = parseInt(file);
                    if (identity == null || isNaN(identity)) {
                        identity = 1;
                    } else {
                        identity++;
                    }
                    imageMetadata["id"] = identity;
                    putFile(identityFile, identity.toString(), { encrypt: false }).then(() => 
                    {
                        imageMetadata["createdAt"] = new Date();
                        ImageManager._saveNew(imageMetadata, imageArrayBuffer, tempImage).then(() => {
                            resolve(imageMetadata);
                        }).catch((err) => reject(err));
                    }).catch((err) => reject(err));
                }).catch((err) => reject(err));
            };
            tempImage.src = ImageManager.getFileUrl(imageArrayBuffer);
        });
    };

    static delete (id, username, serverDate) { 
        return new Promise(function (resolve, reject) {
            ImageManager.getMetadata(id, username).then((metadata) =>
            {
                if (metadata) {
                    metadata["deactivationDate"] = (serverDate ? new Date(serverDate) : new Date());
                    ImageManager._saveFile(metadataFilePrefix + id, JSON.stringify(metadata), null).then(() =>
                    {
                        var filesToDelete = [];
                        filesToDelete.push(publicPrefix + detailFilePartialName + id);
                        if (!metadata["isPublic"]) {
                            filesToDelete.push(publicPrefix + listFilePartialName + id);
                            filesToDelete.push(privatePrefix + detailFilePartialName + id);
                        }
                        for (var i = 0; i < filesToDelete.length; ++i) {
                            var fileName = filesToDelete[i];
                            setTimeout(() => ImageManager._deleteFile(fileName), 1000);
                        }
                        resolve();
                    }).catch((err) => reject(err));
                } else {
                    resolve();
                }
            }).catch((err) => reject(err));
        });
    };

    static savePurchase (id, username, imageKey) {
        return new Promise(function (resolve, reject) {
            var metadataFileName = purchasePrefix + metadataFilePrefix + username + '_' + id;
            ImageManager._getUserFile(metadataFileName).then((file) => {
                if (!file) {
                    Promise.all([ImageManager.getMetadata(id, username),
                        ImageManager.getSmallFile(id, username, imageKey), 
                        ImageManager._getFile(privatePrefix + filePartialName + id, username, imageKey)]).then((result) =>
                    {
                        var listFileName = purchasePrefix + listFilePartialName + username + '_' + id;
                        var fileName = purchasePrefix + filePartialName + username + '_' + id;
                        Promise.all([ImageManager._saveUserFile(metadataFileName, JSON.stringify(result[0])),
                            ImageManager._saveUserFile(listFileName, result[1]), 
                            ImageManager._saveUserFile(fileName, result[2])]).then((result) =>
                        {
                            resolve();
                        }).catch((err) => 
                        {
                            setTimeout(() => ImageManager._deleteFile(metadataFileName), 1000);
                            setTimeout(() => ImageManager._deleteFile(listFileName), 1000);
                            setTimeout(() => ImageManager._deleteFile(fileName), 1000);
                            reject(err);
                        });
                    }).catch((err) => reject(err));
                } else {
                    resolve();
                }
            }).catch((err) => reject(err));
        });
    };

    static getMediumFile (id, username, imageKey) {
        var prefix = imageKey ? privatePrefix : publicPrefix;
        return ImageManager._getFile(prefix + detailFilePartialName + id, username, imageKey);
    };

    static getSmallFile (id, username, imageKey) {
        var prefix = imageKey ? privatePrefix : publicPrefix;
        return ImageManager._getFile(prefix + listFilePartialName + id, username, imageKey);
    };
    
    static getMediumFileUrl (id, username, imageKey) {
        var prefix = imageKey ? privatePrefix : publicPrefix;
        return ImageManager._getFileUrl(prefix + detailFilePartialName + id, username, imageKey);
    };

    static getLargeFileUrl (id, username, imageKey) {
        var prefix = imageKey ? privatePrefix : publicPrefix;
        return ImageManager._getFileUrl(prefix + filePartialName + id, username, imageKey);
    };

    static getSmallFileUrl (id, username, imageKey) {
        var prefix = imageKey ? privatePrefix : publicPrefix;
        return ImageManager._getFileUrl(prefix + listFilePartialName + id, username, imageKey);
    };

    static getFileUrl (fileByteArray) {
        return URL.createObjectURL(new Blob([new Uint8Array(fileByteArray)]));
    };

    static getMetadata (id, username) {
        return new Promise(function (resolve, reject) {
            ImageManager._getFile(metadataFilePrefix + id, username, null).then((file) =>
            {
                resolve(JSON.parse(file));
            }).catch((err) => reject(err));
        }); 
    };

    static listPurchaseMetadataFilesName () {
        return new Promise(function (resolve, reject) {
            var purchases = [];
            listFiles((fileName) =>
            {
                if (fileName.startsWith(purchasePrefix + metadataFilePrefix)) {
                    purchases.push(fileName);
                }
                return true;
            }).then(() => resolve(purchases)).catch((err) => reject(err));
        });
    };

    static getPurchaseData (purchaseMetadataFileName) {
        return new Promise(function (resolve, reject) {
            var splitData = purchaseMetadataFileName.split('_');
            var username = splitData[splitData.length - 2];
            var id = splitData[splitData.length - 1];
            var listFileName = purchasePrefix + listFilePartialName + username + '_' + id; 
            ImageManager._getUserFile(purchaseMetadataFileName).then((metadata) =>
            {
                if (metadata) {
                    var formattedMetadata = JSON.parse(metadata);
                    ImageManager._getUserFile(listFileName).then((file) =>
                    {
                        if (file) {
                            formattedMetadata["imageUrl"] = ImageManager.getFileUrl(file);
                        }
                        resolve(formattedMetadata);
                    }).catch((err) => reject(err));
                } else {
                    resolve();
                }
            }).catch((err) => reject(err));
        });
    };

    static getPurchaseLargeFileUrl (id, username) {
        return new Promise(function (resolve, reject) {
            ImageManager._getUserFile(purchasePrefix + filePartialName + username + '_' + id).then((file) => {
                if (file) {
                    resolve(ImageManager.getFileUrl(file));
                } else {
                    resolve();
                }
            }).catch((err) => reject(err));
        });
    };

    static _getFileUrl (fileName, username, imageKey) {
        return new Promise(function (resolve, reject) {
            ImageManager._getFile(fileName, username, imageKey).then((file) =>
            {
                if (file) {
                    resolve(ImageManager.getFileUrl(file));
                } else {
                    resolve();
                }
            }).catch((err) => reject(err));
        }); 
    };

    static _getFile (fileName, username, imageKey) {
        return new Promise(function (resolve, rejetc) {
            getFile(fileName, { username: username, decrypt: false }).then((file) =>
            {
                if (file) {
                    var content;
                    if (imageKey) {
                        try {
                            content = decryptContent(file, { privateKey: imageKey });
                        } catch (err) {
                            rejetc(err);
                        }
                    } else {
                        content = file;
                    }
                    resolve(content);
                } else {
                    resolve();
                }
            }).catch((err) => rejetc(err));  
        });
    };

    static _getUserFile (fileName) {
        return new Promise(function (resolve, rejetc) {
            getFile(fileName, { username: loadUserData().username, decrypt: true }).then((file) =>
            {
                resolve(file);
            }).catch((err) => rejetc(err));  
        });
    };

    static _deleteFile (fileName) {
        return new Promise(function (resolve, reject) {
            deleteFile(fileName).then(() => 
            {
                resolve();
            }).catch((err) => reject(err));
        });
    };

    static _getSizeForImage (height, width, maxWidth, maxHeight) {
        var resizedWidth = width;
        var resizedHeight = height;
        if (width > maxWidth) {
            resizedWidth = maxWidth;
            resizedHeight = (maxWidth / width) * height;
        }
        if (resizedHeight > maxHeight) {
            resizedWidth = maxHeight / resizedHeight * resizedWidth;
            resizedHeight = maxHeight;
        }
        return [resizedWidth, resizedHeight];
    };

    static _getCanvasDataForImage (image, height, width) {
        var canvas = Object.assign(document.createElement('canvas'), { width: width, height: height });
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        return [canvas, ctx];
    };

    static _getImageArrayBufferFromCanvas (canvas, type = "png") {
        return new Promise(function (resolve, reject) {
            var contentType;
            var quality;
            if (!type || type.toLowerCase() == "png") {
                contentType = "image/png";
                quality = null;
            } else {
                contentType = "image/jpeg";
                quality = 0.8;
            }
            try {
                canvas.toBlob(function (blob) {
                    fetch(URL.createObjectURL(blob)).then((res) => 
                    {
                        resolve(res.arrayBuffer());
                    }).catch((err) => reject(err));
                }, contentType, quality);
            } catch (err) {
                reject(err);
            }
        });
    };

    static _getResizedImageData (fileName, image, height, width, type, publicKey) {
        return new Promise(function (resolve, reject) {
            var data = ImageManager._getCanvasDataForImage(image, height, width);
            ImageManager._getImageArrayBufferFromCanvas(data[0], type).then((result) => 
            {
                resolve([fileName, result, publicKey]);
            }).catch((err) => reject(err));
        });
    };

    static _getWatermarkImageData (fileName, image, height, width) {
        return new Promise(function (resolve, reject) {
            var watermarkImage = new Image();
            watermarkImage.onload = function() {
                var data = ImageManager._getCanvasDataForImage(image, height, width);
                var watermarkWInterval = watermarkImage.width;
                var watermarkHInterval = watermarkImage.height;
                var drawW = 0;
                while (drawW < width) {
                    var drawH = 0;
                    while (drawH < height) {
                        data[1].drawImage(watermarkImage, drawW, drawH);
                        drawH += watermarkHInterval;
                    }
                    drawW += watermarkWInterval;
                }
                ImageManager._getImageArrayBufferFromCanvas(data[0]).then((res) => 
                {
                    resolve([fileName, res, null]);
                }).catch((err) => reject(err));
            };
            watermarkImage.src = watermark;
        });
    };

    static _saveFile (fileName, fileContent, publicKey = null) {
        return new Promise(function (resolve, rejetc) {
            var fileTosave;
            if (publicKey) {
                fileTosave = encryptContent(fileContent, { publicKey: publicKey });
            } else {
                fileTosave = fileContent;
            }
            putFile(fileName, fileTosave, { encrypt: false }).then(() => 
            {
                resolve();
            }).catch((err) => rejetc(err));  
        });
    };

    static _saveUserFile (fileName, fileContent) {
        return new Promise(function (resolve, rejetc) {
            putFile(fileName, fileContent).then(() => 
            {
                resolve();
            }).catch((err) => rejetc(err));  
        });
    };

    static _saveMultipleFiles (data) {
        return new Promise(function (resolve, reject) {
            var promises = [];
            for (var i = 0; i < data.length; ++i) {
                promises.push(ImageManager._saveFile(data[i][0], data[i][1], data[i][2]));
            }
            Promise.all(promises).then(() => resolve()).catch((err) => 
            {
                for (var i = 0; i < data.length; ++i) {
                    var fileName = data[i][0];
                    setTimeout(() => ImageManager._deleteFile(fileName), 1000);
                }
                reject(err);
            });
        });
    };
    
    static _saveNew (imageMetadata, imageArrayBuffer, image) {
        return new Promise(function (resolve, reject) {
            var id = imageMetadata["id"];
            var isPublic = imageMetadata["isPublic"];
            var type = imageMetadata["type"];
            var height = imageMetadata["height"];
            var width = imageMetadata["width"];
            var publicKey = (isPublic ? null : imageMetadata["publicKey"]);
            var baseName = (isPublic ? publicPrefix : privatePrefix);  
            var imagesPromises = [];          
            var dataToSave = [];
            dataToSave.push([metadataFilePrefix + id, JSON.stringify(imageMetadata), null]);
            dataToSave.push([baseName + filePartialName + id, imageArrayBuffer, publicKey]);
            var listDimensions = ImageManager._getSizeForImage(height, width, maxWidthtForList, maxHeightForList);
            var detailDimensions = ImageManager._getSizeForImage(height, width, maxWidthtForDetail, maxHeightForDetail);
            if (height == listDimensions[1]) {
                dataToSave.push([baseName + listFilePartialName + id, imageArrayBuffer, publicKey]);
                dataToSave.push([baseName + detailFilePartialName + id, imageArrayBuffer, publicKey]);
            } else {
                imagesPromises.push(ImageManager._getResizedImageData(baseName + listFilePartialName + id, image, listDimensions[1], listDimensions[0], type, publicKey));
                if (height == detailDimensions[1]) {
                    dataToSave.push([baseName + detailFilePartialName + id, imageArrayBuffer, publicKey]);
                } else {
                    imagesPromises.push(ImageManager._getResizedImageData(baseName + detailFilePartialName + id, image, detailDimensions[1], detailDimensions[0], type, publicKey));
                }
            }
            if (!isPublic) {
                imagesPromises.push(ImageManager._getWatermarkImageData(publicPrefix + listFilePartialName + id, image, listDimensions[1], listDimensions[0]));
                imagesPromises.push(ImageManager._getWatermarkImageData(publicPrefix + detailFilePartialName + id, image, detailDimensions[1], detailDimensions[0]));
            }
            if (imagesPromises.length > 0) {
                Promise.all(imagesPromises).then((result) =>
                {
                    for (var i = 0; i < result.length; ++i) {
                        dataToSave.push(result[i]);
                    }
                    ImageManager._saveMultipleFiles(dataToSave).then(() => resolve()).catch((err) => reject(err));
                }).catch((err) => reject(err));
            } else {
                ImageManager._saveMultipleFiles(dataToSave).then(() => resolve()).catch((err) => reject(err));
            }
        });
    };
}
