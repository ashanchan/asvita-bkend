'use strict';
const express = require('express');
const { communicator } = require('./../../../framework').modules;
const { authGuard } = require('./../../../framework').middlewares;
const collection = require('../models/collection');
let router = express.Router();
//=======================================================
var getGraphData = function(body) { 
    return new Promise(function(resolve, reject) {  
        let userId = authGuard.getData().userId;
        let pointer = String(body.graphType).toUpperCase();
        collection[pointer].find({ userId: userId }, { userId: 0, __v: 0 },
            function(err, response) {
                if (err) reject(err);
                resolve(response);
            }).sort({ recDate: 1 });
    });
};
//=======================================================
router.post('/getData', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { isSuccess: false, 'resCode': 200, 'url': 'image' };

    getGraphData(body)
        .then(function(response) {
            if (response) {
                responseData.isSuccess = true;
                responseData.graphType = body.graphType;
                responseData.msg = 'Graph Data Found.';
                responseData.resCode = 200;
                responseData.data = response;
                communicator.send(res, responseData);
            } else {
                responseData.isSuccess = false;
                responseData.msg = 'graph does not exist!!!';
                responseData.resCode = 200;
                communicator.send(res, responseData);
            }
        })
        .catch(function(err) {
            responseData.isSuccess = false;
            responseData.resCode = 500;
            responseData.redAlert = true;
            responseData.error = err.message;
            communicator.send(res, responseData);
        })
});
//=======================================================
router.post('/addData', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { isSuccess: false, 'resCode': 200, 'url': 'image' };
    let pointer = String(body.graphType).toUpperCase();

    body.userId = authGuard.getData().userId;
    //=== save 
    let newData = new collection[pointer](body);
    newData.save((err, response) => {
        if (err) {
            responseData.isSuccess = false;
            responseData.msg = err.message;
            communicator.send(res, responseData);
        } else {
            responseData.isSuccess = true;
            communicator.send(res, responseData);
        }
    });
});
//=======================================================
module.exports = router;