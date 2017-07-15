'use strict';
const mongoose = require('mongoose');
const logger = require('./logger');
mongoose.Promise = global.Promise;

exports.configure = function(config, callback) {
    try {
        console.log('keepAlive', Number(config.options.keepAlive));
        let dbURI = config.local.dbURI;
        let options = {
            server: { socketOptions: { keepAlive: Number(config.options.keepAlive), connectTimeoutMS: Number(config.options.connectTimeoutMS) } },
            replset: { socketOptions: { keepAlive: Number(config.options.keepAlive), connectTimeoutMS: Number(config.options.connectTimeoutMS) } }
        };

        logger.info('Initiating DB connection to ' + dbURI);

        mongoose.connect(dbURI, options).catch(err => {
            logger.info(err.message);
            process.exit(0);
        });

        mongoose.connection.once('connected', function() {
            logger.info('Mongoose default connection open to ' + dbURI);
        });

        mongoose.connection.on('error', function(err) {
            logger.info('Mongoose default connection error: ' + err);
        });

        mongoose.connection.on('disconnected', function() {
            logger.info('Mongoose default connection disconnected');
            process.exit(0);
        });

        process.once('SIGINT', function() {
            mongoose.connection.close(function() {
                logger.info('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });

        callback();

    } catch (e) {
        callback(e);
    }
}