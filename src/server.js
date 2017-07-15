'use strict';
//=== declaring required variables
const { logger } = require('./framework').modules;

const app = require('./app');
const { publicAPI } = require('./api');

let env = (process.env.NODE_ENV || 'development').toLowerCase(),
    port = Number(process.env.PORT || 1616),
    server = (process.env.SERVER || 'local').toLowerCase();

let service = publicAPI,
    date = (new Date()).toUTCString();

app.init(env, server)
    .then(() => service.call(app))
    .then(() => {
        app.start(port);
        logger.info(`Server started successfully at ${port}`);

    })
    .catch((err) => {
        logger.info(`Failed to start server. ${err.message}`);
    });