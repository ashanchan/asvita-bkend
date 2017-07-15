'use strict';

/*!
 * Module dependencies
 */
const onHeaders = require('on-headers');

/**
 * calculate total response time in milliseconds of every request and response through header
 */
module.exports = function() {
	return (req, res, next) => {
		// check whether already started runtime calculation
		if(!res._runTime) {

			// set start time of request process
			let start = Date.now();
			res._runTime = true;

			onHeaders(res, () => {
				// calculate total runtime
				res.setHeader('x-runtime', Date.now() - start + 'ms');
			});
		}
		next();
	};
};
