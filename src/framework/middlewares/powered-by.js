'use strict';

/*!
 * Module dependencies
 */
const onHeaders = require('on-headers');

/**
 * set powered by in response header
 */
module.exports = function(poweredBy) {
	return (req, res, next) => {
		onHeaders(res, () => {
			res.setHeader('x-powered-by', poweredBy);
		});
		next();
	};
};