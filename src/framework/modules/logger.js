'use strict';
const winston = require('winston');
let tsFormat = () => (new Date()).toUTCString();

const logger = new(winston.Logger)({
    transports: [
        // colorize the output to the console
        new(winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info',
            Console: true
        }),
        new(require('winston-daily-rotate-file'))({
            filename: `src/log/-results.log`,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: 'info'
        })
    ]
});
logger.level = 'debug';

module.exports = logger;