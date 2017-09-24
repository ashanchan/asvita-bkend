'use strict';
let secret = '';
let jwt = require('./../modules/jwt');

function configure(config, callback) {
    secret = config;
    callback();
}

function gateKeeper() {
    return (req, res, next) => {
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        let body = JSON.parse(req.body) || {};
        if (body.freeEntry && token === secret) {
            next();
        } else {
            console.log('validating token ', token);
            jwt.verify(token)
                .then(function(response) {
                    console.log('response', response);
                    next();
                })
                .catch(function(err) {
                    let response = { isSuccess: false, msg: 'Authentication Failed' }
                    return res.status(200).send({
                        response: response
                    });
                })
        }
    }
}

function oldgateKeeper() {
    return (req, res, next) => {
        let postmanQueryAllowed = false;
        let refUrl = String(req.headers.referer);
        let url = refUrl.substr(refUrl.lastIndexOf('/'), refUrl.length);
        console.log('#######################################', req.headers['x-access-token'])
            /*
        if (req.query.token || postmanQueryAllowed || (req.headers['x-access-token'] === secret && url === '/login')) {
            console.log('open gate.. secret key... hacking possible');
			next()
        } else {
			console.log('================= open gate.. token key..... hacking possible');
            //res.status(200).jsonp({ error_message: 'messages:errors:access_token' });
            next();
        }
		*/
        next();
    };
}
module.exports = {
    configure,
    gateKeeper
};