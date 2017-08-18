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
let patientProfileSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    profileUrl: { type: String, required: false, unique: false },
    fullName: { type: String, required: false, unique: false },
    mobile: { type: String, required: false, unique: false },
    gender: { type: String, required: false, unique: false },
    salutation: { type: String, required: false, unique: false },
    address: { type: String, required: false, unique: false },
    city: { type: String, required: false, unique: false },
    pin: { type: String, required: false, unique: false },
    state: { type: String, required: false, unique: false },
    sosPerson: { type: String, required: false, unique: false },
    sosMobile: { type: String, required: false, unique: false },
    dob: { type: String, required: false, unique: false },
    height: { type: String, required: false, unique: false },
    weight: { type: String, required: false, unique: false },
    medicalHistory: { type: Array, required: false, unique: false },
    medicalHistoryOther: { type: String, required: false, unique: false },
    allergy: { type: String, required: false, unique: false },
	notes: { type: String, required: false, unique: false },
    connection: { type: Array, required: false, unique: false }
});
//====================================================
//====================================================
let doctorProfileSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    profileUrl: { type: String, required: false, unique: false },
    fullName: { type: String, required: false, unique: false },
    mobile: { type: String, required: false, unique: false },
    clinic: { type: Array, required: false, unique: false },
    address: { type: Array, required: false, unique: false },
    city: { type: Array, required: false, unique: false },
    pin: { type: Array, required: false, unique: false },
    state: { type: Array, required: false, unique: false },
    contact: { type: Array, required: false, unique: false },
    openTime: { type: Array, required: false, unique: false },
    endTime: { type: Array, required: false, unique: false },
    openDay: { type: Array, required: false, unique: false },
    specialization: { type: Array, required: false, unique: false },
    specializationOther: { type: String, required: false, unique: false },
    qualification: { type: String, required: false, unique: false },
    connection: { type: Array, required: false, unique: false }
});
//====================================================
//====================================================
module.exports = {
    USER: mongoose.model('user', userSchema, 'user'),
    DOCTOR_PROFILE: mongoose.model('doctor', doctorProfileSchema, 'doctor'),
    PATIENT_PROFILE: mongoose.model('patient', patientProfileSchema, 'patient')
}