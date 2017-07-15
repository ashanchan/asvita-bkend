'use strict';

/**
 * throw error if page not found
 */
module.exports = function(message) {
    return (req, res, next) => {
        let err = new Error(message.errors.not_found);
        err.status = 404;
        next(err);
    };
};