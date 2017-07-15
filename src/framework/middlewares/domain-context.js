'use strict';
const domain = require('domain');

module.exports = function() {
    return (req, res, next) => {
        // create context for every request
        let context = domain.create();

        // add request response in context
        context.add(req);
        context.add(res);

        res.on('close', () => {
            context.dispose();
        });

        res.on('finish', () => {
            context.exit();
        });

        context.on('error', (err) => {
            // Once a domain is disposed, further errors from the emitters in that set will be ignored.
            next(err);
        });

        // run request in context
        context.run(next);
    };
};