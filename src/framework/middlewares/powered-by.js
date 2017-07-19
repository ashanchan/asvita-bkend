'use strict';
const onHeaders = require('on-headers');

module.exports = function(poweredBy) {
    return (req, res, next) => {
        onHeaders(res, () => {
            res.setHeader('x-powered-by', poweredBy);
        });
        next();
    };
};