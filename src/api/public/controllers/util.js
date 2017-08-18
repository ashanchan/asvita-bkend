'use strict';
const express = require('express');
const fs = require('fs');
const { communicator } = require('./../../../framework').modules;
const collection = require('../models/collection');
const getFolderSize = require('get-folder-size');
let router = express.Router();
//======================================================= 
//=======================================================
var userFolderSize = function(folder) {
    return new Promise(function(resolve, reject) {
        getFolderSize(folder, function(err, response) {
            if (err) reject(err);
            resolve((response / 1024 / 1024).toFixed(2));
        });
    });
};
//=======================================================
router.post('/uploadImg', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, 'resCode': 200, 'url': 'image' };
    let dir = './src/public/uploads/' + body.userId;
    let fname = dir + '/' + body.mode + '.jpg'
    let base64Data = body.filePath.replace(/^data:image\/jpg;base64,/, "");
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFile(fname, base64Data, 'base64', function(err) {
            if (err) {
                responseData.msg = 'Error Uploading Files ' + err.msg;
                communicator.send(res, responseData);
            } else {
                userFolderSize(dir)
                    .then(function(response) {
                        responseData.msg = 'File Uploaded';
                        responseData.size = response;
                        console.log('folder size hai ', response);
                        communicator.send(res, responseData);
                    })
                    .catch(function(err) {
                        responseData.msg = 'Folder Processing Error ' + err.msg;
                        communicator.send(res, responseData);
                    });
            }
        });
    } catch (e) {
        responseData.msg = 'Error Processing Files ' + err.msg;
        communicator.send(res, responseData);
    }
});
//=======================================================
module.exports = router;