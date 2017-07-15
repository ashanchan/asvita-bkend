'use strict';

/*!
 * Module dependencies
 */
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

// Activity Document Schema
let activity = new Schema({
	_id: {
		type: String,
		index: false
	},
	sid: {
		type: String,
		ref: 'session',
		required: true
	},
	site: String,
	cid: String,
	uid: String,
	event: {
		type: String,
		required: true
	},
	payload: Schema.Types.Mixed,
	time: {
		type: Date,
		default: Date.now,
		index: true
	}
}, {autoIndex: false, versionKey: false});

module.exports = mongoose.model('activity', activity);