'use strict';
const express = require('express');
const router = express.Router();
const { bcrypt, crypto, jwt, nconf, logger, randomstring, mail, thumbnail, communicator, utils, medicineList } = require('./../../../framework').modules;
const { authGuard } = require('./../../../framework').middlewares;
const collection = require('../models/collection');
const requestIp = require('request-ip');
const fs = require('fs');
const getFolderSize = require('get-folder-size');

let reqData = {};
let defaultDbRequest = { db: '', queryField: {}, ignoreField: {}, sortOnField: { $natural: 1 }, recordLimit: 1 };

//=======================================================
router.post('/create', function(req, res, next) {
    reqData = initData(req);
    let responseData = { success: false, responseCode: 200, data: {} };
    switch (reqData.component) {
        case "prescription":
            reqData['prescriptionId'] = generatePwd();
            break;
    }

    addData()
        .then(function(response) {
            responseData.success = true;
            responseData.data['data'] = response;
            communicator.send(res, responseData);
        })
        .catch(function(err) {
            responseData.success = false;
            responseData.data['message'] = err.message;
            communicator.send(res, responseData);
        })
});
//=======================================================
router.post('/read', function(req, res, next) {
    reqData = initData(req);
    switch (reqData.component) {
        case "login":
            serveLogin(req, res);
            break;
        case 'rightPanel':
        case 'graph':
            readData(req, res);
            break;
        case 'utils':
            getDiskSpace(req, res);
            break;
    }
});
//=======================================================
router.post('/update', function(req, res, next) {
    reqData = initData(req);
    let responseData = { success: false, responseCode: 200, data: {} };
    updateData()
        .then(function(response) {
            responseData.success = true;
            responseData.data['data'] = response;
            communicator.send(res, responseData);
        })
        .catch(function(err) {
            responseData.success = false;
            responseData.data['message'] = err.message;
            communicator.send(res, responseData);
        })
});

//=======================================================
router.post('/delete', function(req, res, next) {});
//=======================================================
function initData(req) {
    let data = JSON.parse(req.body) || {};
    data.userId = authGuard.getData().userId;
    data.db = String(data.db).toLocaleUpperCase();

    for (var k in defaultDbRequest) {
        if (String(data[k]).trim().length === 0) {
            data[k] = defaultDbRequest[k];
        }
    }
    return data;
}
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
var userExists = function() {
    return new Promise(function(resolve, reject) {
        collection.USER.findOne({ 'email': crypto.encrypt(reqData.email), 'validated': true }, function(err, response) {
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
            if (err) {
                reject(err);
            } else {
                //=== create profile entry
                let newProfile = type === 'doc' ? new collection.DOCTOR_PROFILE() : new collection.PATIENT_PROFILE();
                newProfile.userId = profile.userId;
                newProfile.save((err, response) => {
                    resolve(response);
                });
            }
        });
    });
};
//=======================================================
var getData = function() {
    return new Promise(function(resolve, reject) {  
        collection[reqData.db].find(reqData.queryField, reqData.ignoreField,
            function(err, response) {
                if (err) {
                    reject(err)
                } else {
                    resolve(response);
                }
            }).sort(reqData.sortOnField).limit(Number(reqData.recordLimit));
    });
};
//=======================================================
var updateData = function() {
    return new Promise(function(resolve, reject) {  
        collection[reqData.db].findOneAndUpdate(reqData.queryField, reqData, { new: true },
            function(err, response) {
                if (err) {
                    reject(err)
                } else {
                    resolve(response);
                }
            })
    });
};
//=======================================================
var addData = function() {
    return new Promise(function(resolve, reject) {
        let newRecord = new collection[reqData.db](reqData);
        newRecord.save((err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
};
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
function serveLogin(req, res) {
    let responseData = { success: false, responseCode: 200, data: {} };
    let profile = { userId: '', email: '', pwd: '' };
    userExists()
        .then(function(response) {
            if (response) {
                profile.userId = response.userId;
                profile.email = response.email;
                switch (reqData.mode) {
                    case 'login':
                        let isMatched = bcrypt.decrypt(reqData.password, response.pwd);
                        responseData.success = isMatched;
                        //=== valid user
                        if (isMatched) {
                            //=== get profile data of the user
                            jwt.getToken(profile)
                                .then(function(token) {
                                    responseData.data['userId'] = response.userId;
                                    responseData.data['token'] = token;
                                    responseData.data['registeredOn'] = response.registeredOn;
                                    responseData.data['subscription'] = response.subscription;
                                    responseData.data['diskSpace'] = response.diskSpace;
                                    responseData.data['message'] = "Login Success";
                                    communicator.send(res, responseData);
                                })
                                .catch(function(err) {
                                    responseData.data['message'] = err.message;
                                    communicator.send(res, responseData);
                                })
                        } else {
                            responseData.data['message'] = "Unauthorised Login";
                            communicator.send(res, responseData);
                        }
                        break;

                    case 'fyp':
                        profile.pwd = generatePwd() + '$';
                        jwt.getToken(profile)
                            .then(function(token) {
                                responseData.success = true;
                                responseData.data['message'] = "Password Sent To Registered e-mail.<br>Please click on Validate Link From The Mail you Received From Us.";
                                mail.send({ to: 'ashanchan@gmail.com', subject: 'testing mail from Asvita 2', link: token, pwd: profile.pwd, userId: profile.userId });
                                communicator.send(res, responseData);
                            })
                        break;

                    case 'register':
                        responseData.success = false;
                        responseData.data['message'] = "User Already Exist!!!<br>";
                        communicator.send(res, responseData);
                }
            } else {
                if (reqData.mode === 'register') {
                    profile.userId = String(reqData.type).toUpperCase() + '-' + generatePwd();
                    profile.email = reqData.email;
                    profile.pwd = generatePwd() + '$';
                    jwt.getToken(profile)
                        .then(function(token) {
                            createUser(reqData.type, profile, requestIp.getClientIp(req))
                                .then(function(response) {
                                    responseData.success = true;
                                    responseData.data['message'] = 'Registration Successful.<br>Please click on Validate Link From The Mail you Received From Us.';
                                    mail.send({ to: 'ashanchan@gmail.com', subject: 'testing mail from Asvita 2', link: token, pwd: profile.pwd, userId: profile.userId });
                                    communicator.send(res, responseData);
                                })
                                .catch(function(err) {
                                    responseData.success = false;
                                    responseData.data['message'] = "User Already Exist!!<br>Click on Forgot link to get your password";
                                    communicator.send(res, responseData);
                                })
                        })
                } else {
                    responseData.success = false;
                    responseData.data['message'] = "Not a Valid User!!<br>Please click on Validate Link From The Mail you Received From Us.";
                    communicator.send(res, responseData);
                }
            }
        })
        .catch(function(err) {
            responseData.success = false;
            responseData.data['message'] = err.message;
            communicator.send(res, responseData);
        })
}
//=======================================================
function readData(req, res) {
    let responseData = { success: false, responseCode: 200, data: {} };
    getData()
        .then(function(response) {
            responseData.success = true;
            responseData.data['data'] = response;
            communicator.send(res, responseData);
        })
        .catch(function(err) {
            responseData.success = false;
            responseData.data['message'] = err.message;
            communicator.send(res, responseData);
        })
}
//=======================================================
function getDiskSpace(req, res) {
    let responseData = { success: false, responseCode: 200, data: {} };
    let dir = './src/public/uploads/' + reqData.userId;
    try {
        userFolderSize(dir)
            .then(function(response) {
                responseData.success = true;
                responseData.data['data'] = { diskSpace: response };
                console.log('disk space ', response);
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