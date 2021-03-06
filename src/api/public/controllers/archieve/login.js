'use strict';
const express = require('express');
const { bcrypt, crypto, jwt, communicator, nconf, logger, randomstring, mail } = require('./../../../framework').modules;
const collection = require('../models/collection');
const requestIp = require('request-ip');
const uniqid = require('uniqid');
let router = express.Router();
//=======================================================
function generatePwd() {
    return randomstring.generate({
        length: 8,
        readable: true,
        charset: 'hex',
        capitalization: 'uppercase'
    })
}
//=======================================================
var userExists = function(email) {
    return new Promise(function(resolve, reject) {
        collection.USER.findOne({ 'email': crypto.encrypt(email), 'validated': true }, function(err, response) {
            if (err) reject(err);
            resolve(response);
        })
    });
};
//=======================================================
var createUser = function(type, profile, ip) {
    return new Promise(function(resolve, reject) {
        //=== 6 month subscription
        let startFrom = new Date();
        let exipresOn = startFrom.setMonth(startFrom.getMonth() + 6);
        exipresOn = new Date(exipresOn);
        let newUser = new collection.USER({
            userId: profile.userId,
            email: crypto.encrypt(profile.email),
            pwd: bcrypt.encrypt(profile.pwd),
            registeredIP: ip,
            accessedIP: ip,
            registeredOn: Date.now(),
            subscription: { 'startFrom': new Date(), 'expiresOn': exipresOn, 'diskSpace': 1, 'addOn': '' }
        });
        //=== presave 
        newUser.save((err, response) => {
            if (err) reject(err);
            //=== create profile entry
            let newProfile = type === 'doc' ? new collection.DOCTOR_PROFILE() : new collection.PATIENT_PROFILE();
            newProfile.userId = profile.userId;
            newProfile.save((err, response) => {
                resolve(response);
            });
        });
    });
};
//=======================================================
var validateUser = function(email, newPwd, ip) {
    return new Promise(function(resolve, reject) {
        collection.USER.findOneAndUpdate({
                email: crypto.encrypt(email)
            }, {
                accessedIP: ip,
                accessedOn: Date.now(),
                validated: true,
                pwd: bcrypt.encrypt(newPwd)
            }, {},
            function(err, response) {
                if (err) reject(err);
                resolve(response);
            })
    });
};
//=======================================================
router.get('/', function(req, res) {
    let responseData = { 'isSuccess': true, 'mode': 'get', 'email': '-', 'resCode': 200, 'url': 'login' };
    communicator.send(res, responseData);
});
//=======================================================
router.post('/', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let isSuccess = false;
    let responseData = { 'mode': body.mode, 'email': body.email, 'resCode': 200, 'url': 'login' };
    let profile = { 'userId': '', 'email': body.email, 'pwd': body.password || '' };
    userExists(body.email)
        .then(function(response) {
            isSuccess = response !== null;
            profile.userId = isSuccess ? response.userId : '';
            switch (body.mode) {
                case 'register':
                    isSuccess = !isSuccess;
                    responseData.isSuccess = isSuccess;
                    if (isSuccess) {
                        //profile.userId = uniqid(body.type + '-');
                        profile.userId = String(body.type).toUpperCase() + '-' + generatePwd();
                        profile.pwd = generatePwd() + '$';
                        console.log('pass word ', profile.pwd);
                        jwt.getToken(profile)
                            .then(function(token) {
                                createUser(body.type, profile, requestIp.getClientIp(req))
                                    .then(function(response) {
                                        responseData.token = token;
                                        responseData.msg = 'Registration Successful.<br>Please click on Validate Link From The Mail you Received From Us.';
                                        responseData.resCode = 200;
                                        mail.send({ to: 'ashanchan@gmail.com', subject: 'testing mail from Asvita 2', link: token, pwd: profile.pwd, userId: profile.userId });
                                        communicator.send(res, responseData);
                                    })
                            })
                    } else {
                        responseData.resCode = 200;
                        responseData.msg = 'User Already Exists.. Unique email required';
                        communicator.send(res, responseData);
                    }
                    break;
                case 'login':
                    if (response) {
                        let isMatched = bcrypt.decrypt(body.password, response.pwd);
                        responseData.isSuccess = isMatched;
                        if (isMatched) {
                            jwt.getToken(profile)
                                .then(function(token) {
                                    responseData.token = token;
                                    responseData.userId = response.userId;
                                    responseData.msg = 'Login Successful';
                                    responseData.resCode = 200;
                                    communicator.send(res, responseData);
                                })
                        } else {
                            responseData.msg = 'Unauthorised Login';
                            responseData.resCode = 200;
                            communicator.send(res, responseData);
                        }
                    } else {
                        responseData.msg = 'Not a Valid User!!<br>Please click on Validate Link From The Mail you Received From Us.';
                        responseData.resCode = 200;
                        communicator.send(res, responseData);
                    }
                    break;
                case 'fyp':
                    if (isSuccess) {
                        profile.pwd = generatePwd() + '$';
                        jwt.getToken(profile)
                            .then(function(token) {
                                responseData.token = token;
                                responseData.isSuccess = true;
                                responseData.msg = 'Password Sent To Registered e-mail.<br>Please click on Validate Link From The Mail you Received From Us.';
                                responseData.resCode = 200;
                                mail.send({ to: 'ashanchan@gmail.com', subject: 'testing mail from Asvita 2', link: token, pwd: profile.pwd, userId: profile.userId });
                                communicator.send(res, responseData);
                            })
                    } else {
                        responseData.isSuccess = false;
                        responseData.msg = 'Registered email Entry Not Found.';
                        responseData.resCode = 200;
                        communicator.send(res, responseData);
                    }
                    break;
                case 'reset':
                    if (response) {
                        let isMatched = bcrypt.decrypt(body.password, response.pwd);
                        responseData.isSuccess = isMatched;
                        if (isMatched) {
                            validateUser(body.email, body.newPassword, requestIp.getClientIp(req))
                                .then(function(token) {
                                    responseData.msg = 'Password Reset Successful';
                                    responseData.resCode = 200;
                                    communicator.send(res, responseData);
                                })
                        } else {
                            responseData.msg = 'Not A Valid Existing Password';
                            responseData.resCode = 200;
                            communicator.send(res, responseData);
                        }
                    } else {
                        responseData.msg = 'Not a Valid User!!<br>Please click on Validate Link From The Mail you Received From Us.';
                        responseData.resCode = 200;
                        communicator.send(res, responseData);
                    }
                    break;
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
router.get('/validate', function(req, res) {
    let responseData = { 'mode': 'validate', 'resCode': 200, 'url': 'validate' };
    jwt.verify(req.query.token)
        .then(function(response) {
            validateUser(response.email, response.pwd, requestIp.getClientIp(req))
                .then(function(response) {
                    responseData.msg = 'validation successful';
                    responseData.resCode = 201;
                    responseData.isSuccess = true;
                    communicator.send(res, responseData);
                })
        })
        .catch(function(err) {
            responseData.msg = 'validation error';
            responseData.resCode = 403;
            responseData.isSuccess = false;
            communicator.send(res, responseData);
        })
});
//=======================================================
router.post('/subscription', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: false, 'resCode': 200, 'url': 'image' };
    collection.USER.findOne({ 'userId': body.userId }, function(err, response) {
        if (err) {
            responseData.isSuccess = false;
            responseData.data = {};
            communicator.send(res, responseData);

        } else {
            responseData.isSuccess = true;
            responseData.data = response.subscription;
            communicator.send(res, responseData);
        }
    })
});
//=======================================================
router.post('/getList', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { isSuccess: false, 'resCode': 200, 'url': 'image' };
    collection.USER.find({}, { userId: 1, _id: 0 }, function(err, response) {
        if (err) {
            responseData.isSuccess = false;
            responseData.data = {};
            communicator.send(res, responseData);

        } else {
            responseData.isSuccess = true;
            responseData.data = response;
            communicator.send(res, responseData);
        }
    })
});
//=======================================================
module.exports = router;