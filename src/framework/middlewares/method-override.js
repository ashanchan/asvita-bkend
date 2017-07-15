'use strict';

/*!
 * Module dependencies
 */
const methodOverride = require('method-override');
const _ = require('lodash');

/**
 * method override
 */

module.exports = function() {
	if(arguments.length) {
		// argument are passed to override the headers on preference and _method as query
		return methodOverride(arguments[0]);
	} else {
		return (req, res, next) => {
			if(req.body && typeof req.body === 'object' && '_method' in req.body) {
				// look in urlencoded POST bodies and delete it
				let method = req.body._method;
				req.method = method;
				_.unset(req.body, '_method');
				req.query = _.merge(req.query, req.body);
			}
			next();
		};
	}
};