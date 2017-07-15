'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');

// add buffer data into request body
bodyParser.IE = function() {
    return (req, res, next) => {
        if (!(_.isEmpty(req.body) && req.method == 'POST')) return next();
        req.body = '';
        req.on('data', (data) => req.body += data);
        req.on('end', next);
    };
};

// parse request body and if headers, merge with requested headers
bodyParser.textToHeaders = function() {
    return (req, res, next) => {
        if (_.isString(req.body)) {
            try {
                let body = JSON.parse(req.body);
                if (body.headers) {
                    body.headers = _.mapKeys(body.headers, (val, key) => key.toLowerCase());
                    req.headers = _.merge(req.headers, body.headers);
                    delete body.headers;
                    req.body = body;
                }
            } catch (e) {}
        }
        next();
    };
};

module.exports = bodyParser;