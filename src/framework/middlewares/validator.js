'use strict';
let secret = '';

function configure(config, callback) {
    secret = config;
    callback();
}

function gateKeeper() {
    return (req, res, next) => {
        let postmanQueryAllowed = false;
        let refUrl = String(req.headers.referer);
        let url = refUrl.substr(refUrl.lastIndexOf('/'), refUrl.length);
        if (req.query.token || postmanQueryAllowed || (req.headers['x-access-token'] === secret && url === '/login')) {
            next()
        } else {
            res.status(200).jsonp({ error_message: 'messages:errors:access_token' });
        }
    };
}
module.exports = {
    configure,
    gateKeeper

};