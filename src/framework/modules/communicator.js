'use strict';
const logger = require('./logger');
let fs = require('fs');
let message = {};

function configure(config, callback) {
    try {
        fs.readFile('src/http-header.json', 'utf8', function(err, data) {
            if (err) {
                callback(err);
            } else {
                message = JSON.parse(data);
                callback();
            }
        });
    } catch (e) {
        callback();
    }

}

function send(res, data) {
    //logger.info(data.url, data.mode, data.email, data.resCode, data.isSuccess, (data.redAlert ? data.error : ''));
    //  logger.info(data.responseCode, data.success, data.data.message, data);
    res.status(data.responseCode).jsonp({ "response": data });
}

module.exports = {
    configure,
    send
}