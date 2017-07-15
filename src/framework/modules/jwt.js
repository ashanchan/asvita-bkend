'use strict';
const jwt = require('jsonwebtoken');
const nconf = require('nconf');

var getToken = function(token) {
    return new Promise(function(resolve, reject) {
        jwt.sign(token, nconf.get('secret_token'), { expiresIn: 18000 }, function(err, response) {
            if (err) reject(err)
            resolve(response)
        })
    })
}

var verify = function(token) {
    return new Promise(function(resolve, reject) {
        jwt.verify(token, nconf.get('secret_token'), function(err, response) {
            if (err) reject(err)
            resolve(response)
        })
    })
}


module.exports = {
    getToken,
    verify
}