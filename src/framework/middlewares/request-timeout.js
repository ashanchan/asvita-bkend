'use strict';

/**
 * Set maximum execution time of each request
 */
module.exports = function(_timeout, message) {
    // set request execution time limit in milliseconds
    _timeout = _timeout || 60000;

    return (req, res, next) => {
        let destroy = req.socket.destroy;
        // set timeout for request execution
        let id = setTimeout(function() {
            req.emit('timeout', _timeout);
        }, _timeout);

        // on request timeout
        req.on('timeout', function(time) {
            // send response
            let err = new Error('timeout Error Occured.. Too much processing');
            err.code = 504;
            err.status = 504;
            err.timeout = time;
            next(err);
        });

        req.clearTimeout = function() {
            clearTimeout(id);
        };

        // destroy request socket
        req.socket.setTimeout(0);
        req.socket.destroy = function() {
            clearTimeout(id);
            destroy.call(this);
        };

        // clear timeout on response
        res.on('finish', function() {
            req.socket.destroy();
        });

        next();
    }
};