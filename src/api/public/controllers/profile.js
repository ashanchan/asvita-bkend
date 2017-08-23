'use strict';
const express = require('express');
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
        let profile = body.userId.substr(0, 3) === 'DOC' ? 'DOCTOR_PROFILE' : 'PATIENT_PROFILE';
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
        if (body.userId.substr(0, 3) === 'DOC') {
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
                    specializationOther: body.specializationOther,
                    qualification: body.qualification
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
                    allergy: body.allergy,
                    notes: body.notes,
                    lifeStyle: body.lifeStyle
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

    if (body.mode === 'updateProfile') {
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
router.post('/getSearchList', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { isSuccess: false, 'resCode': 200, 'url': 'image' };
    let profile = body.userId.substr(0, 3) !== 'DOC' ? 'DOCTOR_PROFILE' : 'PATIENT_PROFILE';
	if(body.reqMode === 'search')
	{
		collection[profile].find({}, function(err, response) {
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
	}
	else{
		collection[profile].find({userId: {$in: body.connection}}, { _id:0, userId: 1, fullName: 1, address:1, dob:1, gender:1 },function(err, response) {
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
	}
});
//=======================================================
router.post('/updateProfileConnection', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { isSuccess: false, 'resCode': 200 };
    let profile = body.userId.substr(0, 3) === 'DOC' ? 'DOCTOR_PROFILE' : 'PATIENT_PROFILE';
    console.log(body.userId, body.reqId, body.reqMode);

    collection[profile].update({ userId: body.userId }, { $push: { 'connection': body.reqId } }, function(err, response) {
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