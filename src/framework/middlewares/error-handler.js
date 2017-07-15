'use strict';

/**
 * error handler
 */
module.exports = function(message) {
    return (err, req, res, next) => {
        try {
            let status = (err.status || err.status_code || err.code || 500).toString(),
                data = { error_message: err.message || message('errors:internal_server') };

            switch (status) {
                case '400':
                    data.error_message = message('errors:malformed_body');
                    break;
            }

            if (status > 499) {
                console.error('Error: %s \nDetails: %s', err && err.message ? err.message : err, err && err.stack ? err.stack : '');
            }

            res.status(status).jsonp(data);

            // pretend like data was written out
            res.write = res.end = res.render = res.send = res.json = res.jsonp = () => true;

        } catch (e) {
            console.error('Error: %s \nDetails: %s', e.message, e.stack);
            res.status(500).jsonp({ message: 'Internal Server Error' });
        }
    };
};