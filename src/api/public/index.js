'use strict';
const { middlewares, modules } = require('./../../framework');
const routes = require('./routes');
const { nconf } = modules;


module.exports = function() {
    return new Promise((resolve, reject) => {
        try {
            this.enable('trust proxy');
            this.disable('x-powered-by');
            this.disable('case sensitive routing');
            this.disable('strict routing');
            this.setMaxListeners(0);

            this.use(
                middlewares.domainContext(),
                middlewares.helmet({
                    noCache: true
                }),
                middlewares.poweredBy(nconf.get('powered_by')),
                middlewares.responseTime(),
                middlewares.cors(nconf.get('cross_domain')),
                middlewares.bodyParser.json(), // parse application/json
                middlewares.bodyParser.text(), // parse text/plain
                middlewares.bodyParser.urlencoded({ extended: false }), // parse application/x-www-form-urlencoded
                middlewares.bodyParser.IE(),
                middlewares.bodyParser.textToHeaders(),
                middlewares.requestTimeout(Number(nconf.get('timeout')), nconf.get('messages')),
                middlewares.validator.gateKeeper()
            );

            routes.load(this);

            this.use(
                middlewares.notFound(nconf.get('messages')),
                middlewares.errorHandler(nconf.get('messages'))
            );
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};