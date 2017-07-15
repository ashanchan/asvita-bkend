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
    logger.info(data.url, data.mode, data.email, data.isSuccess);
    res.status(data.resCode).jsonp({ "success": data.isSuccess, "message": message[data.resCode], "response": data });
}

module.exports = {
    configure,
    send
}