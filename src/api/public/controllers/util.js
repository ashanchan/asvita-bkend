'use strict';
const express = require('express');
const fs = require('fs');
const { communicator, thumbnail, mail, randomstring } = require('./../../../framework').modules;
const collection = require('../models/collection');
const getFolderSize = require('get-folder-size');
let router = express.Router();
//======================================================= 
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
var getPrescriptionRecord = function(patientId) {
    return new Promise(function(resolve, reject) {
        collection.PRESCRIPTION.find({ 'patientId': patientId }, function(err, response) {
            if (err) reject(err);
            resolve(response);
        }).sort({ $natural: -1 }).limit(5);
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
router.post('/deleteImg', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: false, 'resCode': 200, 'url': 'image' };
    let dir = './src/public/uploads/' + body.userId;
    let fname = dir + '/' + body.mode;
    console.log('deleting file now ' + fname);
    try {
        fs.unlink(fname, function(error) {
            if (error) {
                responseData.isSuccess = false;
                throw error;
            } else {
                responseData.isSuccess = true;
            }
            communicator.send(res, responseData);
        })
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
    mail.send({ to: 'ashanchan@gmail.com', subject: 'Request Mail', link: body.requestType, pwd: body.requestName + ' - ' + body.requestNumber, userId: body.userId + ' - ' + body.fullName });
    communicator.send(res, responseData);
});
//=======================================================
router.post('/addPrescription', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: true, 'resCode': 200, 'url': 'request' };
    let prescription = new collection.PRESCRIPTION({
        prescriptionId: generatePwd(),
        patientId: body.patientId,
        doctorId: body.doctorId,
        recordDate: body.recordDate,
        referred: body.referred,
        weight: body.weight,
        temprature: body.temprature,
        bp: body.bp,
        pulse: body.pulse,
        diagnosis: body.diagnosis,
        invAdvised: body.invAdvised,
        followUp: body.followUp,
        notes: body.notes,
        medicine: body.medicine
    });
    //=== presave 
    prescription.save((err, response) => {
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
router.post('/getPrescription', function(req, res, next) {
    let body = JSON.parse(req.body) || {};
    let responseData = { 'userId': body.userId, isSuccess: true, 'resCode': 200, 'url': 'request' };
    getPrescriptionRecord(body.patientId)
        .then(function(response) {
            responseData.isSuccess = true;
            responseData.data = response;
            communicator.send(res, responseData);
        })
        .catch(function(err) {
            responseData.isSuccess = false;
            responseData.resCode = 200;
            responseData.redAlert = true;
            responseData.error = err.message;
            communicator.send(res, responseData);
        })
});

//=======================================================
module.exports = router;