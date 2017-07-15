'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
//====================================================
//====================================================
let userSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, index: true },
    pwd: { type: String, required: true },
    validated: { type: Boolean, required: true, default: false },
    admin: { type: Boolean, required: true, default: false },
    registeredIP: { type: String, required: true },
    registeredOn: { type: Date, required: true },
    accessedIP: { type: String, required: true },
    accessedOn: { type: Date, default: Date.now }
});

userSchema.pre('validate', function(next) {
    //  if (!this.registeredOn) this.registeredOn = this.accessedOn;
    //   if (!this.registeredIP) this.registeredIP = this.accessedIP;
    next();
});
//====================================================
//====================================================
let profileSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    role: { type: String, required: false, unique: false },
    name: { type: String, required: false, unique: false },
    address: { type: String, required: false, unique: false },
    pin: { type: Number, required: false, unique: false },
    email: { type: String, required: false, unique: false },
    phone: { type: String, required: false, unique: false },
    dob: { type: String, required: false, unique: false },
    imgUrl: { type: String, required: false, unique: false },
    notes: { type: String, required: false, unique: false },
    links: { type: String, required: false, unique: false }
});

//====================================================
//====================================================
module.exports = {
    USER: mongoose.model('user', userSchema, 'user'),
    PROFILE: mongoose.model('info', profileSchema, 'info')
}