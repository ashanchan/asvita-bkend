'use strict';
let secret = '';
let jwt = require('./../modules/jwt');
let authData = {};
//=======================================================
function configure(config, callback) {
    secret = config;
    callback();
}
//=======================================================
function gateKeeper() {
    return (req, res, next) => {
        let token = req.body.token || req.query.token || req.headers['x-access-token'];
        let body = JSON.parse(req.body) || {};
        if (body.freeEntry && token === secret) {
            next();
        } else {
            jwt.verify(token)
                .then(function(response) {
                    authData = response;
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
//=======================================================
function getData() {
    return authData
}
//=======================================================
module.exports = {
    configure,
    gateKeeper,
    getData
};
//=======================================================