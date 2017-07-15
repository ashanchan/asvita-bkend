'use strict';

const compression = require('compression');
const bodyParser = require('./body-parser');
const methodOverride = require('./method-override');
const cors = require('cors');
const helmet = require('helmet');
const domainContext = require('./domain-context');
const poweredBy = require('./powered-by');
const requestLogger = require('./request-logger');
const responseTime = require('./response-time');
const requestTimeout = require('./request-timeout');
const notFound = require('./not-found');
const errorHandler = require('./error-handler');

module.exports = {
    domainContext,
    compression,
    poweredBy,
    responseTime,
    cors,
    bodyParser,
    methodOverride,
    helmet,
    requestLogger,
    requestTimeout,
    notFound,
    errorHandler
};