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
    accessedOn: { type: Date, default: Date.now },
    subscription: { type: Object, required: false, unique: false }
});
//====================================================
//====================================================
let patientProfileSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: false, unique: true },
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
    lifeStyle: { type: String, required: false, unique: false },
    connection: { type: Array, required: false, unique: false },
    connectionReq: { type: Array, required: false, unique: false }
});
//====================================================
//====================================================
let doctorProfileSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: false, unique: true },
    fullName: { type: String, required: false, unique: false },
    mobile: { type: String, required: false, unique: false },
    clinic: { type: Array, required: false, unique: false },
    specialization: { type: Array, required: false, unique: false },
    specializationOther: { type: String, required: false, unique: false },
    qualification: { type: String, required: false, unique: false },
    connection: { type: Array, required: false, unique: false },
    connectionReq: { type: Array, required: false, unique: false }
});
//====================================================
//====================================================
let prescriptionSchema = new Schema({
    prescriptionId: { type: String, required: true, unique: true },
    patientId: { type: String, required: false, unique: false },
    doctorId: { type: String, required: false, unique: false },
    recordDate: { type: String, required: false, unique: false },
    referred: { type: String, required: false, unique: false },
    diagnosis: { type: String, required: false, unique: false },
    invAdvised: { type: String, required: false, unique: false },
    followUp: { type: String, required: false, unique: false },
    notes: { type: String, required: false, unique: false },
    medicine: { type: Array, required: false, unique: false }
});
//====================================================
//====================================================
let temperatureSchema = new Schema({
    userId: { type: String, required: true, index: true },
    recordDate: { type: Date, required: true, index: true },
    temperature: { type: Number, required: true, index: false }
});
//====================================================
//====================================================
let weightSchema = new Schema({
    userId: { type: String, required: true, index: true },
    recordDate: { type: Date, required: true, index: true },
    weight: { type: Number, required: true, index: false },
    height: { type: Number, required: true, index: false },
});
//====================================================
//====================================================
let sugarSchema = new Schema({
    userId: { type: String, required: true, index: true },
    recordDate: { type: Date, required: true, index: true },
    fasting: { type: Number, required: true, index: false },
    normal: { type: Number, required: true, index: false },
});
//====================================================
//====================================================
let bpSchema = new Schema({
    userId: { type: String, required: true, index: true },
    recordDate: { type: Date, required: true, index: true },
    systolic: { type: Number, required: true, index: false },
    diastolic: { type: Number, required: true, index: false },
    pulse: { type: Number, required: true, index: false },
});
//====================================================
//====================================================
module.exports = {
    USER: mongoose.model('user', userSchema, 'user'),
    DOCTOR_PROFILE: mongoose.model('doctor', doctorProfileSchema, 'doctor'),
    PATIENT_PROFILE: mongoose.model('patient', patientProfileSchema, 'patient'),
    PRESCRIPTION: mongoose.model('prescription', prescriptionSchema, 'prescription'),
    WEIGHT: mongoose.model('weight', weightSchema, 'weight'),
    SUGAR: mongoose.model('sugar', sugarSchema, 'sugar'),
    BP: mongoose.model('bp', bpSchema, 'bp'),
    TEMPERATURE: mongoose.model('temperature', temperatureSchema, 'temperature')
}