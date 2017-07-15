'use strict';

/*!
 * Module dependencies
 */
const mongoose = require('mongoose');
const _ = require('lodash');
const uuid = require('uuid');
const {crypto} = require('./../../../framework').modules;
const activity = require('./activity');

let Schema = mongoose.Schema;

// Session Schema
let session = new Schema({
	_id: {
		type: String,
		default: uuid.v1,
		index: true
	},
	source: {
		type: Schema.Types.Mixed,
		required: true
	},
	metadata: Schema.Types.Mixed,
	site: String,
	user: Schema.Types.Mixed,
	course: Schema.Types.Mixed,
	user_agent: Schema.Types.Mixed,
	ip: String,
	location: Schema.Types.Mixed,
	referrer: String,
	created_at: {
		type: Date,
		default: Date.now,
		index: true
	}
}, {autoIndex: false, versionKey: false});

// encrypt user data and site
session.plugin((schema) => {
	schema.pre('save', function(next) {
		_.forEach(this.user, (value, key) => {
			this.user[key] = (value) ? crypto.encrypt(value) : null;
		});
		this.site = (this.site) ? crypto.encrypt(this.site) : null;
		next();
	});
	/*schema.post('save', function(doc) {
		activity.create([{
			sid: doc._id,
			uid: doc.user && doc.user.id ? doc.user.id : null,
			cid: doc.course && doc.course.id ? doc.course.id : null,
			site: doc.site,
			event: 'SESSION',
			payload: {
				status: 'start'
			}
		}]);
	});*/
});

module.exports = mongoose.model('session', session);