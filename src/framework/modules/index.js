'use strict';
const nconf = require('nconf').file({ file: 'src/config.json' });
const async = require('async');
const bcrypt = require('./bcrypt');
const communicator = require('./communicator');
const crypto = require('./crypto');
const logger = require('./logger');
const randomstring = require("randomstring");
const db = require('./db');
const mail = require('./mail');
const jwt = require('./jwt');
const { validator } = require('./../middlewares');

function init(env, server) {
    return new Promise((resolve, reject) => {
        async.mapSeries([
            communicator.configure.bind(null, nconf.get('mail')),
            bcrypt.configure.bind(null, nconf.get('bcrypt')),
            crypto.configure.bind(null, nconf.get('crypto')),
            db.configure.bind(null, nconf.get('database')),
            mail.configure.bind(null, nconf.get('mail')),
            validator.configure.bind(null, nconf.get('access_token'))
        ], (module, callback) => {
            module.call(null, callback);
        }, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

module.exports = {
    init,
    nconf,
    communicator,
    db,
    mail,
    crypto,
    bcrypt,
    logger,
    randomstring,
    jwt
};