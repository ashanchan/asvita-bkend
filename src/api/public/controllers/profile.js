'use strict';
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const { bcrypt, crypto, jwt, communicator, nconf, logger, randomstring, mail } = require('./../../../framework').modules;
const collection = require('../models/collection');
let router = express.Router();
//=======================================================
var renameFile = function(sourcePath, targetPath) { 
    return new Promise(function(resolve, reject) {  
        fs.rename(sourcePath, targetPath, function(err, res) {
            if (err) reject(err);
            else resolve(targetPath);;
        }); 
    }); 
};
//=======================================================
var findProfile = function(body) {
    return new Promise(function(resolve, reject) {
        let profile = body.userId.substr(0, 3) === 'doc' ? 'DOCTOR_PROFILE' : 'PATIENT_PROFILE';
        collection[profile].findOne({ userId: body.userId },
            function(err, response) {
                if (err) reject(err);
                resolve(response);
            })
    });
};
//=======================================================
var updateProfile = function(body) {
    return new Promise(function(resolve, reject) {
        if (body.userId.substr(0, 3) === 'doc') {
            collection.DOCTOR_PROFILE.findOneAndUpdate({
                    userId: body.userId
                }, {
                    fullName: body.fullName,
                    mobile: body.mobile,
                    clinic: body.clinic,
                    address: body.address,
                    city: body.city,
                    pin: body.pin,
                    state: body.state,
                    contact: body.contact,
                    openTime: body.openTime,
                    endTime: body.endTime,
                    openDay: body.openDay,
                    specialization: body.specialization,
                    specializationOther: body.specializationOther
                }, {},
                function(err, response) {
                    if (err) reject(err);
                    resolve(response);
                })
        } else {
            collection.PATIENT_PROFILE.findOneAndUpdate({
                    userId: body.userId
                }, {
                    fullName: body.fullName,
                    mobile: body.mobile,
                    gender: body.gender,
                    salutation: body.salutation,
                    address: body.address,
                    city: body.city,
                    pin: body.pin,
                    state: body.state,
                    sosPerson: body.sosPerson,
                    sosMobile: body.sosMobile,
                    dob: body.dob,
                    height: body.height,
                    weight: body.weight,
                    medicalHistory: body.medicalHistory,
                    medicalHistoryOther: body.medicalHistoryOther,
                    allergy: body.allergy
                }, {},
                function(err, response) {
                    if (err) reject(err);
                    resolve(response);
                })
        }
    });
};
//=======================================================
router.post('/', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let isSuccess = false;
    let responseData = { 'mode': body.mode, 'userId': body.userId, 'resCode': 200, 'url': 'profile' };
    console.log('routing required ', body.mode);

    if (body.mode === 'updateProfile') {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            console.log(files);
        });


        updateProfile(body)
            .then(function(response) {
                if (response) {
                    responseData.isSuccess = true;
                    responseData.msg = 'Profile Data Saved.';
                    responseData.resCode = 200;
                    communicator.send(res, responseData);
                } else {
                    responseData.isSuccess = false;
                    responseData.msg = 'User does not exist!!! Unable To Save Profile Data.';
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
    } else {
        findProfile(body)
            .then(function(response) {
                if (response) {
                    responseData.isSuccess = true;
                    responseData.msg = 'Profile Data Found.';
                    responseData.resCode = 200;
                    responseData.data = response;
                    communicator.send(res, responseData);
                } else {
                    responseData.isSuccess = false;
                    responseData.msg = 'Profile does not exist!!!';
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
    }
});
//=======================================================
module.exports = router;