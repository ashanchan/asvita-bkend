'use strict';
const express = require('express');
const fs = require('fs');
const { communicator, thumbnail, mail, randomstring } = require('./../../../framework').modules;
const getFolderSize = require('get-folder-size');
const { authGuard } = require('./../../../framework').middlewares;
let reqData = {};
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
function initData(req) {
    let data = JSON.parse(req.body) || {};
    data.userId = authGuard.getData().userId;
    return data;
}
//=======================================================
router.post('/create', function(req, res, next) {});
//=======================================================
router.post('/read', function(req, res, next) {
    reqData = initData(req);
    console.log('who am i ? ', reqData.component)
    switch (reqData.component) {
        case "diskspace":
            getDiskSpace(req, res);
            break;
    }

});
//=======================================================
router.post('/update', function(req, res, next) {});
//=======================================================
router.post('/delete', function(req, res, next) {});
//=======================================================
function getDiskSpace(req, res) {
    let responseData = { success: false, responseCode: 200, data: {} };
    let dir = './src/public/uploads/' + reqData.userId;
    try {
        userFolderSize(dir)
            .then(function(response) {
                responseData.success = true;
                responseData.data['usedSpace'] = response;
                responseData.data['message'] = "Folder Processing Success";
                communicator.send(res, responseData);
            })
            .catch(function(err) {
                responseData.success = false;
                responseData.data['message'] = 'Folder Processing Error ' + err.message;
                communicator.send(res, responseData);
            });
    } catch (e) {
        responseData.success = false;
        responseData.data['message'] = 'Error Processing Files ' + err.message;
        communicator.send(res, responseData);
    }
}
//=======================================================
module.exports = router;
//=======================================================