'use strict';
const express = require('express');
const fs = require('fs');
const { communicator, thumbnail, mail } = require('./../../../framework').modules;
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
    let responseData = { 'userId': body.userId, isSuccess: false, 'resCode': 200, 'url': 'image' };
    let dir = './src/public/uploads/' + body.userId;
    let fname = dir + '/' + body.mode + '.jpg'
    let base64Data = body.filePath.replace(/^data:image\/jpeg;base64,/, "");

    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFile(fname, base64Data, 'base64', function(err) {
            if (err) {
                responseData.msg = 'Error Uploading Files ' + err.msg;
                communicator.send(res, responseData);
            } else {
                setTimeout(function() {
                    console.log("Hello");
                    thumbnail.createThumbnail(dir);
                }, 3000);


                responseData.isSuccess = true;
                responseData.msg = 'File Uploaded';
                communicator.send(res, responseData);
            }
        });
    } catch (e) {
        responseData.msg = 'Error Processing Files ' + err.msg;
        communicator.send(res, responseData);
    }
});
//=======================================================
router.post('/diskSpace', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: false, 'resCode': 200, 'url': 'image' };
    let dir = './src/public/uploads/' + body.userId;
    try {
        userFolderSize(dir)
            .then(function(response) {
                responseData.isSuccess = true;
                responseData.diskSpace = { usedSize: response };
                communicator.send(res, responseData);
            })
            .catch(function(err) {
                responseData.msg = 'Folder Processing Error ' + err.msg;
                communicator.send(res, responseData);
            });
    } catch (e) {
        responseData.msg = 'Error Processing Files ' + err.msg;
        communicator.send(res, responseData);
    }
});
//=======================================================
router.post('/fileList', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: false, 'resCode': 200, 'url': 'image' };
    let dir = './src/public/uploads/' + body.userId;
    let fileList = [];
    try {
        fs.readdirSync(dir).forEach(file => {
            fileList.push(file);
        })
        responseData.isSuccess = true;
        responseData.fileList = fileList;
        communicator.send(res, responseData);

    } catch (e) {
        responseData.msg = 'Error Processing Files List ' + err.msg;
        communicator.send(res, responseData);
    }
});
//=======================================================
router.post('/sendRequestMail', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: true, 'resCode': 200, 'url': 'request' };
	mail.send({ to: 'ashanchan@gmail.com', subject: 'Request Mail', link: body.requestType, pwd: body.requestName+ ' - '+body.requestNumber, userId: body.userId+' - '+body.fullName});
	communicator.send(res, responseData);
});
                          
//=======================================================
module.exports = router;