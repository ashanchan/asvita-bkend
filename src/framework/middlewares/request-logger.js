'use strict';

module.exports = function(log) {
    log = log || console;
    return (req, res, next) => {
        res.on('finish', () => {
            try {
                log.info({
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || (req.ips.length ? req.ips : null) || req.ip || '0.0.0.0',
                    status: res.statusCode,
                    method: req.method,
                    url: req.originalUrl,
                    http: req.httpVersion,
                    size: req.socket.bytesWritten,
                    runtime: res._headers['x-runtime'],
                    referrer: req.headers.referer
                });
            } catch (e) {
                console.error('Error: %s \nDetails: %s', e.message, e.stack);
            }
        });
        next();
    };
};