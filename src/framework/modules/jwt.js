'use strict';
const jwt = require('jsonwebtoken');
const nconf = require('nconf');
const userDetail = {};
//=======================================================
var getToken = function(token) {
    return new Promise(function(resolve, reject) {
        var nDate = '1h';
        jwt.sign(token, nconf.get('secret_token'), { expiresIn: nDate }, function(err, response) {
            if (err) reject(err)
            resolve(response)
        })
    })
};
//=======================================================
var verify = function(token) {
    return new Promise(function(resolve, reject) {
        jwt.verify(token, nconf.get('secret_token'), function(err, response) {
            if (err) {
                reject(err);
            } else {
                userDetail.userId = response.userId;
                userDetail.email = response.email;
                resolve(response)
            }
        })
    })
};
//=======================================================
function getDetail() {
    return userDetail;
};
//=======================================================
module.exports = {
    getToken,
    verify,
    getDetail
};
//=======================================================